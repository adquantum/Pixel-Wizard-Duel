
import React, { useState, useEffect } from 'react';
import { Unit, Card, GameState, Buff, School, Language } from './types';
import { 
    CARD_DATABASE, 
    MAX_HAND_SIZE, 
    MAX_PIPS, 
    ENEMY_DECK_TEMPLATE, 
    AVATAR_ASSETS,
    SCHOOL_COLORS,
    SCHOOL_ICONS,
    GET_STARTER_DECK,
    STORAGE_PREFIX,
    TRANSLATIONS,
    getFallbackSchoolIcon
} from './constants';
import { calculatePipCost, calculateDamage, getUsedBuffIds } from './utils/gameLogic';
import { UnitDisplay } from './components/UnitDisplay';
import { CardItem } from './components/CardItem';

const generateId = () => Math.random().toString(36).substr(2, 9);

const INITIAL_PLAYER_BASE: Unit = {
  id: 'player',
  name: 'Novice Wizard',
  maxHp: 1200,
  currentHp: 1200,
  pips: 1,
  powerPips: 0,
  school: 'FIRE',
  buffs: [],
  avatarUrl: AVATAR_ASSETS.PLAYER_DEFAULT,
};

const INITIAL_ENEMY: Unit = {
  id: 'enemy',
  name: 'Dark Boss',
  maxHp: 1800,
  currentHp: 1800,
  pips: 1,
  powerPips: 0,
  school: 'ICE',
  buffs: [],
  avatarUrl: AVATAR_ASSETS.ENEMY_BOSS,
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    player: { ...INITIAL_PLAYER_BASE },
    enemy: { ...INITIAL_ENEMY },
    deck: [], 
    hand: [],
    discard: [],
    turn: 1,
    phase: 'SCHOOL_SELECTION',
    messages: ['Welcome Wizard!'],
  });

  const [language, setLanguage] = useState<Language>('EN');
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [floatingText, setFloatingText] = useState<{target: string, text: string, color: string} | null>(null);
  const [animatingUnitId, setAnimatingUnitId] = useState<string | null>(null);
  const [flyingCard, setFlyingCard] = useState<{ card: Card, from: 'player' | 'enemy' } | null>(null);
  const [flyingCardError, setFlyingCardError] = useState(false); // NEW: Error state for flying card
  const [availableCollection, setAvailableCollection] = useState<Card[]>([]);
  const [editDeck, setEditDeck] = useState<Card[]>([]);

  const t = TRANSLATIONS[language];

  const handleSchoolSelect = (school: School) => {
      const savedDeckStr = localStorage.getItem(STORAGE_PREFIX + school);
      let startDeck: Card[] = [];

      if (savedDeckStr) {
          try {
              const savedIds = JSON.parse(savedDeckStr) as string[];
              startDeck = savedIds.map(id => CARD_DATABASE.find(c => c.id === id)).filter((c): c is Card => !!c);
          } catch (e) {
              startDeck = GET_STARTER_DECK(school);
          }
      } else {
          startDeck = GET_STARTER_DECK(school);
      }
      if (startDeck.length === 0) startDeck = GET_STARTER_DECK(school);

      // Map school to specific avatar asset
      const avatarKey = `${school}_WIZARD` as keyof typeof AVATAR_ASSETS;
      const playerWithSchool: Unit = {
          ...gameState.player,
          school: school,
          avatarUrl: AVATAR_ASSETS[avatarKey] || AVATAR_ASSETS.PLAYER_DEFAULT,
          maxHp: school === 'ICE' ? 1500 : school === 'STORM' ? 950 : 1200
      };

      setGameState(prev => ({
          ...prev,
          player: playerWithSchool,
          deck: [...startDeck],
          phase: 'LOBBY',
          messages: [`Welcome, ${school} Wizard!`]
      }));
  };

  const enterDeckBuilder = () => {
      const validCards = CARD_DATABASE.filter(c => 
        c.school === gameState.player.school || 
        c.id.startsWith('uni_') || 
        (c.school === 'LIFE' && c.type === 'HEAL') || 
        c.type === 'SHIELD' 
      );
      setAvailableCollection(validCards);
      setEditDeck([...gameState.deck]);
      setGameState(prev => ({ ...prev, phase: 'DECK_BUILDING' }));
  };

  const saveDeck = () => {
      if (editDeck.length < 5) {
          alert("Deck must have at least 5 cards!");
          return;
      }
      localStorage.setItem(STORAGE_PREFIX + gameState.player.school, JSON.stringify(editDeck.map(c => c.id)));
      setGameState(prev => ({ ...prev, deck: [...editDeck], phase: 'LOBBY' }));
  };

  const addToDeck = (card: Card) => {
      if (editDeck.filter(c => c.id === card.id).length >= 4) return;
      setEditDeck(prev => [...prev, card].sort((a,b) => a.pips - b.pips));
  };

  const removeFromDeck = (index: number) => {
      setEditDeck(prev => {
          const next = [...prev];
          next.splice(index, 1);
          return next;
      });
  };

  const startBattle = () => {
      setGameState(prev => ({
         ...prev,
         phase: 'PLAYER_INPUT',
         messages: ['Battle Start!'],
         hand: [],
         discard: [],
         turn: 1,
         player: { ...prev.player, currentHp: prev.player.maxHp, pips: 1, powerPips: 0, buffs: [] },
         enemy: { ...INITIAL_ENEMY, currentHp: INITIAL_ENEMY.maxHp, pips: 1, powerPips: 0, buffs: [] }
      }));
      setTimeout(() => drawCards(7, gameState.deck), 100);
  };

  const addLog = (msg: string) => setCombatLog(prev => [msg, ...prev].slice(0, 8));

  const showFloatingText = (targetId: string, text: string, color: string) => {
    setFloatingText({ target: targetId, text, color });
    setTimeout(() => setFloatingText(null), 2000);
  };

  const drawCards = (count: number, currentDeck?: Card[]) => {
    setGameState(prev => {
      const newHand = [...prev.hand];
      const sourceDeck = currentDeck ? [...currentDeck] : [...prev.deck];
      for (let i = 0; i < count; i++) {
        if (newHand.length < MAX_HAND_SIZE && sourceDeck.length > 0) {
          const idx = Math.floor(Math.random() * sourceDeck.length);
          const card = sourceDeck.splice(idx, 1)[0];
          if (card) newHand.push({ ...card, id: generateId() });
        }
      }
      return { ...prev, hand: newHand, deck: sourceDeck };
    });
  };

  const executeSpell = async (casterIsPlayer: boolean, card: Card | null) => {
    const casterId = casterIsPlayer ? 'player' : 'enemy';
    const targetId = casterIsPlayer ? 'enemy' : 'player';
    
    // Initial state reference for deduction, but we need live state for calculation in loops
    let currentCaster = casterIsPlayer ? gameState.player : gameState.enemy;
    let currentTarget = casterIsPlayer ? gameState.enemy : gameState.player;

    if (!card) {
        addLog(`${currentCaster.name} ${t.PASS.toLowerCase()}.`);
        return;
    }

    setFlyingCard({ card, from: casterIsPlayer ? 'player' : 'enemy' });
    setFlyingCardError(false); // Reset error on new card
    await new Promise(r => setTimeout(r, 600)); 
    setFlyingCard(null);

    // Deduct Pips
    const cost = calculatePipCost(currentCaster, card.pips, card.school);
    if (cost) {
        updateUnit(casterId, u => ({
            ...u,
            pips: u.pips - cost.regularPipsToUse,
            powerPips: u.powerPips - cost.powerPipsToUse
        }));
    }

    setGameState(prev => ({ ...prev, phase: 'ANIMATING' }));
    setAnimatingUnitId(casterId);
    addLog(`${currentCaster.name} casts ${language === 'CN' ? card.nameCN : card.name}!`);
    await new Promise(r => setTimeout(r, 800)); 

    // RE-FETCH latest state for effect application (in case pip update changed something, though unlikely to affect stats)
    setGameState(prev => {
       currentCaster = casterIsPlayer ? prev.player : prev.enemy;
       currentTarget = casterIsPlayer ? prev.enemy : prev.player;
       return prev;
    });

    // 1. HANDLE SELF DAMAGE (Immolate / Sacrifice)
    if (card.selfDamage) {
         const selfDmg = card.selfDamage;
         showFloatingText(casterId, `-${selfDmg}`, '#ef4444');
         // Simple HP reduction for prototype, ignoring own shields/traps for simplicity
         updateUnit(casterId, u => ({ ...u, currentHp: Math.max(0, u.currentHp - selfDmg) }));
         // Wait for visual
         await new Promise(r => setTimeout(r, 600));
         
         // Refresh Caster state after self damage
         setGameState(prev => {
             currentCaster = casterIsPlayer ? prev.player : prev.enemy;
             return prev;
         });
    }

    if (card.type === 'ATTACK') {
        if (card.multiHits && card.multiHits.length > 0) {
            // --- MULTI HIT LOGIC (HYDRA) ---
            // We need to process hits sequentially. 
            // Since we can't easily await state updates, we simulate the buff consumption locally for calculation
            // and fire updates to the UI.
            let tempCaster = { ...currentCaster };
            let tempTarget = { ...currentTarget };

            for (const hit of card.multiHits) {
                 // Calculate damage for this hit
                 const dmg = calculateDamage(hit.damage, tempCaster, tempTarget, hit.school);
                 const usedBuffIds = getUsedBuffIds(tempCaster, tempTarget, hit.school, true);
                 
                 // Apply to UI State
                 removeBuffs(usedBuffIds);
                 showFloatingText(targetId, `-${dmg}`, SCHOOL_COLORS[hit.school]);
                 updateUnit(targetId, u => ({ ...u, currentHp: Math.max(0, u.currentHp - dmg) }));
                 
                 // Update Local Temp State for next iteration logic (so shields don't get used twice)
                 tempTarget.buffs = tempTarget.buffs.filter(b => !usedBuffIds.includes(b.id));
                 tempCaster.buffs = tempCaster.buffs.filter(b => !usedBuffIds.includes(b.id));

                 await new Promise(r => setTimeout(r, 600));
            }
            setAnimatingUnitId(null);

        } else {
            // --- STANDARD HIT ---
            const damage = calculateDamage(card.damage || 0, currentCaster, currentTarget, card.school);
            const usedBuffIds = getUsedBuffIds(currentCaster, currentTarget, card.school, true);
            removeBuffs(usedBuffIds);
            setAnimatingUnitId(null);
            
            showFloatingText(targetId, `-${damage}`, '#ef4444');
            updateUnit(targetId, u => ({ ...u, currentHp: Math.max(0, u.currentHp - damage) }));

            if (card.drain) {
                const healAmount = Math.floor(damage * 0.5);
                setTimeout(() => {
                     showFloatingText(casterId, `+${healAmount}`, '#22c55e');
                     updateUnit(casterId, u => ({ ...u, currentHp: Math.min(u.maxHp, u.currentHp + healAmount) }));
                }, 500);
            }
        }
    } 
    
    else if (card.type === 'HEAL') {
        const heal = card.heal || 0;
        showFloatingText(casterId, `+${heal}`, '#22c55e');
        updateUnit(casterId, u => ({ ...u, currentHp: Math.min(u.maxHp, u.currentHp + heal) }));
        setAnimatingUnitId(null);
    } 
    
    else if (['BLADE', 'TRAP', 'SHIELD', 'WEAKNESS', 'GLOBAL'].includes(card.type)) {
        // Logic for Multi-Buffs (Tri-Blades) or Single Buff
        const schoolsToApply = card.multiBuffs || [card.buffSchool || (card.school === 'ICE' && card.type === 'SHIELD' ? 'UNIVERSAL' : card.school)];
        
        for (const buffSchool of schoolsToApply) {
             const buffTargetId = (card.type === 'TRAP' || card.type === 'WEAKNESS') ? targetId : casterId;
             const isOutgoing = (card.type === 'BLADE' || card.type === 'WEAKNESS');
             
             const buff: Buff = {
                id: generateId(), 
                name: card.name, 
                nameCN: card.nameCN,
                type: card.type as any, 
                value: card.buffValue || card.shieldValue || 0, 
                school: buffSchool as any, 
                duration: 1, 
                isOutgoing
            };
            updateUnit(buffTargetId, u => ({ ...u, buffs: [...u.buffs, buff] }));
            // Small stagger delay if multiple
            if (schoolsToApply.length > 1) await new Promise(r => setTimeout(r, 150));
        }

        const mainLabel = card.type; 
        showFloatingText((card.type === 'TRAP' || card.type === 'WEAKNESS') ? targetId : casterId, `${mainLabel}!`, SCHOOL_COLORS[card.school]);
        setAnimatingUnitId(null);
    }
    await new Promise(r => setTimeout(r, 1000));
  };

  const updateUnit = (id: string, updater: (u: Unit) => Unit) => {
    setGameState(prev => ({
        ...prev,
        player: id === 'player' ? updater(prev.player) : prev.player,
        enemy: id === 'enemy' ? updater(prev.enemy) : prev.enemy
    }));
  };

  const removeBuffs = (ids: string[]) => {
      if (ids.length === 0) return;
      setGameState(prev => ({
          ...prev,
          player: { ...prev.player, buffs: prev.player.buffs.filter(b => !ids.includes(b.id)) },
          enemy: { ...prev.enemy, buffs: prev.enemy.buffs.filter(b => !ids.includes(b.id)) }
      }));
  };

  const handlePlayerCardSelect = async (card: Card) => {
    if (gameState.phase !== 'PLAYER_INPUT') return;
    setGameState(prev => ({
        ...prev,
        hand: prev.hand.filter(c => c.id !== card.id),
        discard: [...prev.discard, card]
    }));
    await executeSpell(true, card);
    if (checkGameOver()) return;
    setGameState(prev => ({ ...prev, phase: 'ENEMY_THINKING' }));
    setTimeout(handleEnemyTurn, 1000);
  };

  const handlePass = async () => {
      if (gameState.phase !== 'PLAYER_INPUT') return;
      await executeSpell(true, null);
      setGameState(prev => ({ ...prev, phase: 'ENEMY_THINKING' }));
      setTimeout(handleEnemyTurn, 1000);
  };

  const handleEnemyTurn = async () => {
      setGameState(prev => ({ ...prev, phase: 'ENEMY_ACTING' }));
      const affordable = ENEMY_DECK_TEMPLATE.filter(c => {
          const cost = calculatePipCost(gameState.enemy, c.pips, c.school);
          return cost && cost.canAfford;
      });
      const card = affordable.length > 0 ? affordable[Math.floor(Math.random() * affordable.length)] : null;
      await executeSpell(false, card);
      if (checkGameOver()) return;
      endRound();
  };

  const checkGameOver = () => {
      setGameState(prev => {
          if (prev.enemy.currentHp <= 0) return { ...prev, phase: 'VICTORY' };
          if (prev.player.currentHp <= 0) return { ...prev, phase: 'DEFEAT' };
          return prev;
      });
      return false; 
  };

  useEffect(() => {
      if (gameState.enemy.currentHp <= 0 && !['SCHOOL_SELECTION','LOBBY'].includes(gameState.phase)) setGameState(p => ({ ...p, phase: 'VICTORY' }));
      else if (gameState.player.currentHp <= 0 && !['SCHOOL_SELECTION','LOBBY'].includes(gameState.phase)) setGameState(p => ({ ...p, phase: 'DEFEAT' }));
  }, [gameState.enemy.currentHp, gameState.player.currentHp]);


  const endRound = () => {
      addLog("--- Round End ---");
      const addPip = (u: Unit): Unit => {
          const ppChance = 0.4; 
          const getsPower = Math.random() < ppChance;
          const totalSlots = u.pips + u.powerPips;
          if (totalSlots >= MAX_PIPS) return u;
          return { ...u, powerPips: getsPower ? u.powerPips + 1 : u.powerPips, pips: !getsPower ? u.pips + 1 : u.pips };
      };
      setGameState(prev => ({
          ...prev,
          player: addPip(prev.player),
          enemy: addPip(prev.enemy),
          turn: prev.turn + 1,
          phase: 'PLAYER_INPUT'
      }));
      drawCards(1);
  };

  return (
    <div className="w-full h-screen bg-[#050505] text-white overflow-hidden flex flex-col relative font-[VT323]">
      <div className="absolute inset-0 pointer-events-none z-0">
         <div className="absolute bottom-0 w-full h-1/3 bg-[#0f172a] border-t-4 border-indigo-900">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[200px] rounded-[100%] border-[8px] border-indigo-500/20 animate-[spin_20s_linear_infinite]"></div>
         </div>
         <div className="absolute top-0 w-full h-2/3 bg-gradient-to-b from-black via-[#1e1b4b] to-[#0f172a]"></div>
      </div>

      <button 
        onClick={() => setLanguage(l => l === 'EN' ? 'CN' : 'EN')}
        className="absolute top-4 right-4 z-[60] px-3 py-1 border-2 border-gray-500 bg-black hover:bg-gray-800 pixel-font text-xs text-yellow-400"
      >
        LANG: {language}
      </button>

      {gameState.phase === 'SCHOOL_SELECTION' && (
          <div className="absolute inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center p-8 animate-fade-in">
              <h1 className="text-4xl text-yellow-400 pixel-font mb-8 drop-shadow-[4px_4px_0_#b45309]">{t.CHOOSE_SCHOOL}</h1>
              <div className="grid grid-cols-4 gap-6 max-w-4xl">
                  {(Object.keys(SCHOOL_COLORS) as School[]).map(school => (
                      <button 
                        key={school}
                        onClick={() => handleSchoolSelect(school)}
                        className="group relative p-6 border-4 border-gray-700 bg-gray-900 hover:border-white hover:bg-gray-800 hover:scale-105 transition-all duration-300 flex flex-col items-center gap-4"
                        style={{ borderColor: SCHOOL_COLORS[school] }}
                      >
                          <img src={SCHOOL_ICONS[school]} className="w-16 h-16 drop-shadow-lg" alt={school} />
                          <div className="font-bold pixel-font text-sm" style={{ color: SCHOOL_COLORS[school] }}>{school}</div>
                      </button>
                  ))}
              </div>
          </div>
      )}

      {gameState.phase === 'LOBBY' && (
          <div className="absolute inset-0 z-50 bg-[#1a1a1a] flex flex-col items-center justify-center p-8 animate-fade-in">
              <div className="flex flex-col items-center gap-8">
                  <div className="relative w-32 h-32 border-4 border-white rounded-full overflow-hidden bg-black mb-4">
                      <img src={gameState.player.avatarUrl} className="w-full h-full object-cover" />
                  </div>
                  <h1 className="text-4xl text-white pixel-font mb-4">{t.WELCOME}, Wizard</h1>
                  
                  <div className="flex gap-8">
                      <button onClick={startBattle} className="w-64 h-24 bg-red-800 border-4 border-red-600 hover:bg-red-700 text-2xl pixel-font shadow-[4px_4px_0_#000] active:translate-y-1 active:shadow-none">{t.ENTER_DUEL}</button>
                      <button onClick={enterDeckBuilder} className="w-64 h-24 bg-indigo-800 border-4 border-indigo-600 hover:bg-indigo-700 text-2xl pixel-font shadow-[4px_4px_0_#000] active:translate-y-1 active:shadow-none">{t.EDIT_DECK}</button>
                  </div>
                  <div className="text-gray-500 mt-4 font-mono text-sm">{t.DECK_SIZE}: {gameState.deck.length}</div>
              </div>
          </div>
      )}

      {gameState.phase === 'DECK_BUILDING' && (
          <div className="absolute inset-0 z-50 bg-[#0c0c0e] flex flex-col animate-fade-in">
              <div className="h-16 bg-[#18181b] border-b-2 border-gray-700 flex items-center justify-between px-8">
                  <h2 className="text-xl pixel-font text-yellow-500">SPELLBOOK</h2>
                  <div className="flex gap-4">
                      <span className="text-gray-400 font-mono flex items-center">{editDeck.length} Cards (Max 64)</span>
                      <button onClick={saveDeck} className="px-4 py-2 bg-green-700 border-2 border-green-500 hover:bg-green-600 pixel-font text-xs">{t.SAVE_EXIT}</button>
                  </div>
              </div>
              <div className="flex-1 flex overflow-hidden">
                  <div className="w-1/2 bg-[#050505] border-r-2 border-gray-700 flex flex-col">
                      <div className="p-2 bg-gray-900 text-center border-b border-gray-800 font-bold">{t.AVAILABLE_SPELLS}</div>
                      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 gap-4 content-start">
                          {availableCollection.map((card, i) => {
                               const inDeckCount = editDeck.filter(c => c.id === card.id).length;
                               const maxed = inDeckCount >= 4;
                               return (
                                  <div key={i} className={`transform scale-90 origin-top ${maxed ? 'opacity-30 grayscale' : ''}`}>
                                      <div className="relative">
                                          <CardItem card={card} canAfford={true} disabled={maxed} onClick={() => addToDeck(card)} language={language} />
                                          <div className="absolute -top-2 -right-2 bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center border border-white font-bold text-xs z-50">{inDeckCount}</div>
                                      </div>
                                  </div>
                               );
                          })}
                      </div>
                  </div>
                  <div className="w-1/2 bg-[#121214] flex flex-col">
                      <div className="p-2 bg-gray-800 text-center border-b border-gray-700 font-bold">{t.CURRENT_DECK}</div>
                      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 gap-4 content-start">
                          {editDeck.map((card, i) => (
                              <div key={i} className="transform scale-90 origin-top">
                                  <CardItem card={card} canAfford={true} disabled={false} onClick={() => removeFromDeck(i)} language={language} />
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {['PLAYER_INPUT', 'ANIMATING', 'ENEMY_THINKING', 'ENEMY_ACTING', 'VICTORY', 'DEFEAT'].includes(gameState.phase) && (
        <>
            <div className="relative z-10 p-4 flex justify-between items-start">
                <div className="bg-black/80 p-2 rounded border-2 border-gray-700 shadow-lg">
                    <h1 className="text-2xl text-yellow-500 pixel-font drop-shadow-md">DUEL ARENA</h1>
                    <div className="text-sm text-gray-400 font-mono">{t.ROUND} {gameState.turn}</div>
                </div>
                <div className="w-72 h-32 bg-black/80 rounded border-2 border-gray-700 p-2 overflow-y-auto font-[VT323] text-lg leading-tight shadow-xl scrollbar-thin">
                    {combatLog.map((log, i) => <div key={i} className="mb-1 text-green-300 border-b border-gray-800/50">{log}</div>)}
                </div>
            </div>

            <div className="flex-1 relative flex items-end justify-between px-20 pb-32 z-10 max-w-7xl mx-auto w-full">
                <UnitDisplay unit={gameState.player} isPlayer={true} animating={animatingUnitId === 'player'} floatingText={floatingText?.target === 'player' ? floatingText : null} language={language} />
                <div className="flex flex-col items-center justify-center mb-20">
                    {gameState.phase === 'PLAYER_INPUT' ? (
                        <button onClick={handlePass} className="px-8 py-3 bg-red-900 hover:bg-red-700 border-4 border-red-950 text-white font-[Press Start 2P] text-xs rounded shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none transition-all">{t.PASS}</button>
                    ) : (
                        <div className="text-yellow-500 animate-pulse font-[Press Start 2P] text-xs">{t.THINKING}</div>
                    )}
                </div>
                <UnitDisplay unit={gameState.enemy} isPlayer={false} animating={animatingUnitId === 'enemy'} floatingText={floatingText?.target === 'enemy' ? floatingText : null} language={language} />
            </div>

            {flyingCard && (
                <div className={`absolute top-1/2 -translate-y-1/2 z-50 transition-all duration-500 ease-in-out w-32 h-48 bg-gray-900 border-2 border-yellow-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(255,215,0,0.5)] ${flyingCard.from === 'player' ? 'left-32 opacity-0 animate-fly-right' : 'right-32 opacity-0 animate-fly-left'}`}>
                    <img 
                        src={!flyingCardError && flyingCard.card.assetUrl ? flyingCard.card.assetUrl : getFallbackSchoolIcon(flyingCard.card.school)} 
                        className={!flyingCardError && flyingCard.card.assetUrl ? "w-24 h-24" : "w-12 h-12"} 
                        onError={() => setFlyingCardError(true)}
                        alt="flying card"
                    />
                </div>
            )}

            <div className="relative z-20 h-64 w-full bg-[#0c0c0e] border-t-4 border-[#27272a] shadow-[0_-10px_20px_rgba(0,0,0,0.8)] flex items-center justify-center">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#27272a] px-6 py-1 rounded-t-lg border-t-2 border-x-2 border-gray-600">
                    <span className="text-xs font-bold text-gray-300">{t.HAND}: {gameState.hand.length} / 7</span>
                </div>
                <div className="flex gap-4 px-4 overflow-x-auto py-4 w-full justify-center">
                    {gameState.hand.map((card) => {
                        const cost = calculatePipCost(gameState.player, card.pips, card.school);
                        const canAfford = !!cost && cost.canAfford && gameState.phase === 'PLAYER_INPUT';
                        return <CardItem key={card.id} card={card} canAfford={canAfford} disabled={gameState.phase !== 'PLAYER_INPUT'} onClick={() => handlePlayerCardSelect(card)} language={language} />;
                    })}
                </div>
            </div>
        </>
      )}

      {(gameState.phase === 'VICTORY' || gameState.phase === 'DEFEAT') && (
        <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center flex-col animate-fade-in">
            <h1 className={`text-6xl pixel-font mb-8 ${gameState.phase === 'VICTORY' ? 'text-green-500' : 'text-red-600'}`}>{gameState.phase === 'VICTORY' ? t.VICTORY : t.DEFEAT}</h1>
            <div className="flex gap-4">
                <button onClick={() => setGameState(prev => ({ ...prev, phase: 'LOBBY' }))} className="px-6 py-4 bg-white text-black font-bold pixel-font text-sm hover:scale-110 transition-transform">{t.RETURN_LOBBY}</button>
                <button onClick={() => window.location.reload()} className="px-6 py-4 bg-gray-700 text-white font-bold pixel-font text-sm hover:scale-110 transition-transform">{t.RESET_GAME}</button>
            </div>
        </div>
      )}

      <style>{`
        @keyframes fly-right { 0% { transform: translate(0, 0) scale(0.5); opacity: 1; } 100% { transform: translate(60vw, -10vh) scale(1.2); opacity: 0; } }
        @keyframes fly-left { 0% { transform: translate(0, 0) scale(0.5); opacity: 1; } 100% { transform: translate(-60vw, -10vh) scale(1.2); opacity: 0; } }
        .animate-fly-right { animation: fly-right 0.6s forwards ease-in; }
        .animate-fly-left { animation: fly-left 0.6s forwards ease-in; }
        @keyframes float-up { 0% { transform: translateY(0) scale(1); opacity: 1; } 50% { transform: translateY(-40px) scale(1.2); opacity: 1; } 100% { transform: translateY(-60px) scale(1); opacity: 0; } }
        .animate-float-up { animation: float-up 1.5s ease-out forwards; }
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}
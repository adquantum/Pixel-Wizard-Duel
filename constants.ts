
import { Card, School, Language } from './types';

export const MAX_HAND_SIZE = 7;
export const MAX_PIPS = 7;
export const STORAGE_PREFIX = 'pixel_wizard_deck_';

export const SCHOOL_COLORS: Record<School, string> = {
  FIRE: '#ef4444', // red-500
  ICE: '#60a5fa', // blue-400
  STORM: '#a855f7', // purple-500
  LIFE: '#4ade80', // green-400
  DEATH: '#9ca3af', // gray-400 (lightened for visibility on dark)
  MYTH: '#facc15', // yellow-400
  BALANCE: '#b45309', // amber-700
};

// --- ASSET HELPERS ---
const svgToDataUri = (svg: string) => {
    try {
        return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
    } catch (e) {
        return '';
    }
};

// --- FALLBACK GENERATORS (Used if local file is missing) ---
const createPixelIcon = (color: string, path: string) => `
<svg width="64" height="64" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <path d="${path}" fill="${color}" stroke="black" stroke-width="1" />
</svg>`;

const SCHOOL_SVG_PATHS: Record<School, string> = {
    FIRE: `M16 2 L20 6 L20 10 L22 10 L22 14 L24 14 L24 20 L22 22 L22 26 L18 30 L14 30 L10 26 L10 22 L8 20 L8 14 L10 14 L10 10 L12 10 L12 6 Z M16 14 L18 18 L16 22 L14 18 Z`,
    ICE: `M15 2 L17 2 L17 10 L23 4 L25 6 L19 12 L28 12 L28 14 L19 14 L25 20 L23 22 L17 16 L17 30 L15 30 L15 16 L9 22 L7 20 L13 14 L4 14 L4 12 L13 12 L7 6 L9 4 L15 10 Z`,
    STORM: `M18 2 L26 2 L26 6 L22 10 L26 10 L26 14 L14 30 L14 20 L10 20 L10 16 L18 2 Z`,
    LIFE: `M16 2 L22 6 L26 10 L28 16 L28 20 L24 28 L16 30 L8 28 L4 20 L4 16 L6 10 L10 6 Z M16 8 L16 24 M16 12 L20 16 M16 18 L12 22`,
    DEATH: `M10 4 L22 4 L26 8 L26 20 L22 24 L22 28 L18 28 L18 24 L14 24 L14 28 L10 28 L10 24 L6 20 L6 8 Z M10 10 L14 10 L14 14 L10 14 Z M18 10 L22 10 L22 14 L18 14 Z`,
    MYTH: `M16 2 L28 26 L4 26 Z M16 12 L20 16 L16 20 L12 16 Z`,
    BALANCE: `M15 2 L17 2 L17 8 L27 8 L27 14 L23 14 L23 10 L17 10 L17 20 L21 22 L21 18 L25 18 L25 24 L19 24 L19 28 L13 28 L13 24 L7 24 L7 18 L11 18 L11 22 L15 20 L15 10 L9 10 L9 14 L5 14 L5 8 L15 8 Z`
};

export const getFallbackSchoolIcon = (school: School) => svgToDataUri(createPixelIcon(SCHOOL_COLORS[school], SCHOOL_SVG_PATHS[school]));

// --- ASSET PATH CONFIGURATION ---
// FIX: Uses absolute paths ('/assets/...') ensuring they resolve from the public root.
// FIX: Uses Capitalized filenames 'Icon_Fire.png' to match user's files.
export const SCHOOL_ICONS: Record<School, string> = {
    FIRE: '/assets/icons/Icon_Fire.png',
    ICE: '/assets/icons/Icon_Ice.png',
    STORM: '/assets/icons/Icon_Storm.png',
    LIFE: '/assets/icons/Icon_Life.png',
    DEATH: '/assets/icons/Icon_Death.png',
    MYTH: '/assets/icons/Icon_Myth.png',
    BALANCE: '/assets/icons/Icon_Balance.png',
};

// --- CARD TYPE ICONS ---
export const TYPE_ICONS: Record<string, string> = {
    ATTACK: '/assets/type/Type_Damage.png',
    HEAL: '/assets/type/Type_Heal.png',
    BLADE: '/assets/type/Type_Charm.png',
    TRAP: '/assets/type/Type_Trap.png',
    SHIELD: '/assets/type/Type_Ward.png',
    AURA: '/assets/type/Type_Aura.png',
    GLOBAL: '/assets/type/Type_Aura.png', // Bubbles are usually considered Auras in this context or specific global icons
    WEAKNESS: '/assets/type/Type_Charm.png', // Weakness is a Charm
    MANIPULATION: '/assets/type/Type_Charm.png',
};


export const SCHOOL_NAMES_CN: Record<School, string> = {
  FIRE: '火系',
  ICE: '冰系',
  STORM: '风暴',
  LIFE: '生命',
  DEATH: '死亡',
  MYTH: '神话',
  BALANCE: '平衡',
};

export const TRANSLATIONS = {
  EN: {
    PASS: "PASS",
    THINKING: "Thinking...",
    HAND: "HAND",
    DECK_SIZE: "Deck Size",
    WELCOME: "Welcome",
    ENTER_DUEL: "ENTER DUEL",
    EDIT_DECK: "EDIT DECK",
    SAVE_EXIT: "SAVE & EXIT",
    AVAILABLE_SPELLS: "AVAILABLE SPELLS",
    CURRENT_DECK: "CURRENT DECK",
    ROUND: "Round",
    VICTORY: "VICTORY",
    DEFEAT: "DEFEAT",
    RETURN_LOBBY: "RETURN TO LOBBY",
    RESET_GAME: "RESET GAME",
    CHOOSE_SCHOOL: "CHOOSE YOUR SCHOOL",
    DMG: "Dmg",
    HEAL: "Heal",
    TO_ALL: "to All",
    INCOMING: "Incoming",
    OUTGOING: "Outgoing",
    NEXT: "Next",
    DRAIN: "Drain",
    PIPS: "p",
    BACK: "BACK"
  },
  CN: {
    PASS: "跳过",
    THINKING: "思考中...",
    HAND: "手牌",
    DECK_SIZE: "牌库数量",
    WELCOME: "欢迎",
    ENTER_DUEL: "开始决斗",
    EDIT_DECK: "编辑卡组",
    SAVE_EXIT: "保存并退出",
    AVAILABLE_SPELLS: "可用法术",
    CURRENT_DECK: "当前卡组",
    ROUND: "回合",
    VICTORY: "胜利",
    DEFEAT: "失败",
    RETURN_LOBBY: "返回大厅",
    RESET_GAME: "重置游戏",
    CHOOSE_SCHOOL: "选择你的学院",
    DMG: "伤害",
    HEAL: "治疗",
    TO_ALL: "全体",
    INCOMING: "受到",
    OUTGOING: "造成",
    NEXT: "下一次",
    DRAIN: "吸血",
    PIPS: "费",
    BACK: "返回"
  }
};

export const SCHOOL_DESCRIPTIONS: Record<School, string> = {
  FIRE: "DoT & High Burst. The Pyromancer burns enemies over time.",
  ICE: "High HP & Defense. The Thaumaturge outlasts opponents.",
  STORM: "Extreme Damage. The Diviner strikes hard but has low accuracy.",
  LIFE: "Healing & Accuracy. The Theurgist keeps the team alive.",
  DEATH: "Drain Health. The Necromancer heals by dealing damage.",
  MYTH: "Minions & Shield Breaking. The Conjurer controls the field.",
  BALANCE: "Buffs & Flexibility. The Sorcerer maintains equilibrium.",
};

// --- AVATAR PATHS ---
// FIX: Updated to absolute paths
export const AVATAR_ASSETS: Record<string, string> = {
    PLAYER_DEFAULT: "/assets/avatars/player_default.png",
    ENEMY_BOSS: "/assets/avatars/enemy_boss.png",
    ENEMY_MINION: "/assets/avatars/enemy_minion.png",
    FIRE_WIZARD: "/assets/avatars/player_fire.png",
    ICE_WIZARD: "/assets/avatars/player_ice.png",
    STORM_WIZARD: "/assets/avatars/player_storm.png",
    LIFE_WIZARD: "/assets/avatars/player_life.png",
    DEATH_WIZARD: "/assets/avatars/player_death.png",
    MYTH_WIZARD: "/assets/avatars/player_myth.png",
    BALANCE_WIZARD: "/assets/avatars/player_balance.png",
};

// --- CARD DATABASE GENERATION ---
const createCard = (id: string, name: string, nameCN: string, school: School, type: any, pips: number, acc: number, desc: string, descCN: string, extras: Partial<Card> = {}): Card => {
    // Helper to format: FIRE -> Fire, ICE -> Ice
    const schoolCase = school.charAt(0) + school.slice(1).toLowerCase();
    return {
        id, 
        name, 
        nameCN,
        school, 
        type, 
        pips, 
        accuracy: acc, 
        description: desc, 
        descriptionCN: descCN,
        // FIX: Default icon path now uses absolute path + Capitalized filename (Icon_Fire.png)
        icon: `/assets/icons/Icon_${schoolCase}.png`, 
        assetUrl: `/assets/cards/${school.toLowerCase()}/${id}.png`, 
        ...extras
    };
};

const SCHOOLS: School[] = ['FIRE', 'ICE', 'STORM', 'LIFE', 'DEATH', 'MYTH', 'BALANCE'];
const BASE_CARDS: Card[] = [];

const getRankNameCN = (school: School, rank: number) => {
    const base = SCHOOL_NAMES_CN[school];
    const animals = ['蛇', '蝙蝠', '鲨鱼', '巨人', '海妖', '巨龙', '领主'];
    return `${base}${animals[rank-1] || '法术'}`;
};

SCHOOLS.forEach(sch => {
    const p = (n: number | string) => `${sch.toLowerCase()}_${n}`;
    let dmgMult = 1.0;
    let acc = 0.85;
    if (sch === 'STORM') { dmgMult = 1.4; acc = 0.70; }
    if (sch === 'FIRE') { dmgMult = 1.2; acc = 0.75; }
    if (sch === 'ICE') { dmgMult = 0.8; acc = 0.80; }
    if (sch === 'LIFE') { dmgMult = 0.9; acc = 0.90; }

    const animalsEN = ['Snake', 'Bat', 'Shark', 'Giant', 'Kraken', 'Dragon', 'Lord'];

    for (let i = 1; i <= 7; i++) {
        const dmg = Math.floor((i === 4 || i === 7 ? 85 : 80) * i * dmgMult);
        const isAoe = i === 4 || i === 7;
        const nameEN = `${sch} ${animalsEN[i-1]}`;
        const nameCN = getRankNameCN(sch, i);
        const descEN = `${dmg} Dmg${isAoe ? ' to All' : ''}`;
        const descCN = `造成 ${dmg} ${isAoe ? '全体' : ''}伤害`;
        
        BASE_CARDS.push(createCard(p(i), nameEN, nameCN, sch, 'ATTACK', i, acc, descEN, descCN, { damage: dmg, isAoe }));
    }

    // Utilities
    BASE_CARDS.push(createCard(p('blade'), `${sch} Blade`, `${SCHOOL_NAMES_CN[sch]}之刃`, sch, 'BLADE', 0, 1.0, `+35% Outgoing ${sch}`, `+35% ${SCHOOL_NAMES_CN[sch]}伤害`, { buffValue: 0.35, buffSchool: sch }));
    BASE_CARDS.push(createCard(p('trap'), `${sch} Trap`, `${SCHOOL_NAMES_CN[sch]}陷阱`, sch, 'TRAP', 0, 1.0, `+30% Incoming ${sch}`, `+30% 受到${SCHOOL_NAMES_CN[sch]}伤害`, { buffValue: 0.30, buffSchool: sch }));
    BASE_CARDS.push(createCard(p('shield'), `${sch} Shield`, `${SCHOOL_NAMES_CN[sch]}护盾`, sch, 'SHIELD', 0, 1.0, `-80% Next ${sch} Dmg`, `-80% 下一次${SCHOOL_NAMES_CN[sch]}伤害`, { shieldValue: 0.80, buffSchool: sch }));
    
    // Specials
    if (sch === 'LIFE') {
        BASE_CARDS.push(createCard(p('heal1'), 'Fairy', '小仙女', sch, 'HEAL', 2, 1.0, 'Heal 400', '回复 400 生命', { heal: 400 }));
        BASE_CARDS.push(createCard(p('heal2'), 'Satyr', '萨堤尔', sch, 'HEAL', 4, 1.0, 'Heal 860', '回复 860 生命', { heal: 860 }));
        BASE_CARDS.push(createCard(p('regen'), 'Sprite', '精灵', sch, 'HEAL', 1, 1.0, '30 + 270 Heal over 3 rnds', '3回合回复 30+270', { heal: 30, dotDamage: -270, dotDuration: 3 }));
    }
    if (sch === 'DEATH') {
        BASE_CARDS.push(createCard(p('drain1'), 'Ghoul', '食尸鬼', sch, 'ATTACK', 2, 0.85, '160 Drain', '160 吸血伤害', { damage: 160, drain: true }));
        BASE_CARDS.push(createCard(p('drain2'), 'Vampire', '吸血鬼', sch, 'ATTACK', 4, 0.85, '350 Drain', '350 吸血伤害', { damage: 350, drain: true }));
        BASE_CARDS.push(createCard(p('sacrifice'), 'Sacrifice', '牺牲', sch, 'HEAL', 3, 1.0, 'Take 250 Dmg, Heal 700', '受到250伤害, 回复700', { heal: 700, selfDamage: 250 }));
        BASE_CARDS.push(createCard(p('feint'), 'Feint', '佯攻', sch, 'TRAP', 1, 1.0, '+70% Trap (Target) / +30% Trap (Self)', '+70% 陷阱(目标) / +30% 陷阱(自身)', { buffValue: 0.70, buffSchool: 'UNIVERSAL' })); 
    }
    if (sch === 'BALANCE') {
        BASE_CARDS.push(createCard(p('weak'), 'Weakness', '虚弱', sch, 'TRAP', 0, 1.0, '-25% Dmg (Global)', '-25% 全局伤害', { buffValue: -0.25, type: 'WEAKNESS' }));
        BASE_CARDS.push(createCard(p('uni_blade'), 'Balanceblade', '平衡之刃', sch, 'BLADE', 0, 1.0, '+25% Dmg (Uni)', '+25% 通用伤害', { buffValue: 0.25, buffSchool: 'UNIVERSAL' }));
        BASE_CARDS.push(createCard(p('judge'), 'Judgement', '审判', sch, 'ATTACK', 4, 0.85, '100 Dmg per Pip', '每点Pip造成100伤害', { damage: 400 }));
        BASE_CARDS.push(createCard(p('hydra'), 'Hydra', '九头蛇', sch, 'ATTACK', 6, 0.85, '190 Fire, Ice, Storm Dmg', '190 火,冰,风暴 三段伤害', { damage: 190, multiHits: [{school: 'FIRE', damage: 190}, {school: 'ICE', damage: 190}, {school: 'STORM', damage: 190}] }));
        BASE_CARDS.push(createCard(p('ele_blade'), 'Elemental Blade', '元素之刃', sch, 'BLADE', 1, 1.0, '+35% Fire, Ice, Storm Blade', '+35% 火/冰/风暴之刃', { buffValue: 0.35, multiBuffs: ['FIRE', 'ICE', 'STORM'] }));
    }
    if (sch === 'FIRE') {
        BASE_CARDS.push(createCard(p('dot1'), 'Fire Elf', '火精灵', sch, 'ATTACK', 2, 0.75, '50 + 210 DoT', '50 + 210 持续伤害', { damage: 50, dotDamage: 210, dotDuration: 3 }));
        BASE_CARDS.push(createCard(p('immolate'), 'Immolate', '献祭', sch, 'ATTACK', 4, 1.0, 'Take 250 Fire, Deal 600 Fire', '受到250火伤, 造成600火伤', { damage: 600, selfDamage: 250 }));
    }
    if (sch === 'STORM') {
        BASE_CARDS.push(createCard(p('windstorm'), 'Windstorm', '风暴陷阱', sch, 'TRAP', 1, 1.0, '+20% Storm Dmg to All', '+20% 全体风暴伤害', { buffValue: 0.20, buffSchool: 'STORM', isAoe: true }));
    }
    
    BASE_CARDS.push(createCard(p('global'), `${sch} Bubble`, `${SCHOOL_NAMES_CN[sch]}领域`, sch, 'GLOBAL', 2, 1.0, `+25% ${sch} Dmg Global`, `+25% 全局${SCHOOL_NAMES_CN[sch]}伤害`, { buffValue: 0.25 }));
});

BASE_CARDS.push(createCard('uni_tower', 'Tower Shield', '塔盾', 'ICE', 'SHIELD', 0, 1.0, '-50% Next Dmg (Any)', '-50% 下一次任意伤害', { shieldValue: 0.50, buffSchool: 'UNIVERSAL', icon: '/assets/icons/Icon_Ice.png' }));
BASE_CARDS.push(createCard('uni_pixie', 'Pixie', '小精灵', 'LIFE', 'HEAL', 1, 1.0, 'Heal 400 (Self)', '回复 400 (自身)', { heal: 400, icon: '/assets/icons/Icon_Life.png' }));

export const CARD_DATABASE = BASE_CARDS;

export const GET_STARTER_DECK = (school: School): Card[] => {
  const deck: Card[] = [];
  const getCards = (s: School) => CARD_DATABASE.filter(c => c.school === s);
  const schoolCards = getCards(school);
  
  const rank1 = schoolCards.find(c => c.pips === 1 && c.type === 'ATTACK');
  const rank2 = schoolCards.find(c => c.pips === 2 && c.type === 'ATTACK');
  const rank3 = schoolCards.find(c => c.pips === 3 && c.type === 'ATTACK');
  const blade = schoolCards.find(c => c.type === 'BLADE');
  const trap = schoolCards.find(c => c.type === 'TRAP');
  
  if (rank1) deck.push(rank1, rank1, rank1);
  if (rank2) deck.push(rank2, rank2);
  if (rank3) deck.push(rank3, rank3);
  if (blade) deck.push(blade, blade, blade);
  if (trap) deck.push(trap, trap);
  
  const tower = CARD_DATABASE.find(c => c.id === 'uni_tower');
  if (tower) deck.push(tower, tower);
  
  const heal = CARD_DATABASE.find(c => c.id.includes('heal') || c.id === 'uni_pixie');
  if (heal) deck.push(heal, heal);

  return deck;
};

export const ENEMY_DECK_TEMPLATE: Card[] = [
   CARD_DATABASE.find(c => c.id === 'ice_1'),
   CARD_DATABASE.find(c => c.id === 'ice_2'),
   CARD_DATABASE.find(c => c.id === 'uni_tower'),
   CARD_DATABASE.find(c => c.id === 'ice_trap'),
   CARD_DATABASE.find(c => c.id === 'ice_blade'),
].filter((c): c is Card => !!c);
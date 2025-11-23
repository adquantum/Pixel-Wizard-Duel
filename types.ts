
export type School = 'FIRE' | 'ICE' | 'STORM' | 'LIFE' | 'DEATH' | 'MYTH' | 'BALANCE';
export type CardType = 'ATTACK' | 'HEAL' | 'BLADE' | 'TRAP' | 'SHIELD' | 'MANIPULATION' | 'AURA' | 'WEAKNESS' | 'GLOBAL';
export type Language = 'EN' | 'CN';

export interface Card {
  id: string;
  name: string;
  nameCN: string;
  school: School;
  type: CardType;
  pips: number;
  accuracy: number;
  description: string;
  descriptionCN: string;
  
  // Effect values
  damage?: number;
  heal?: number;
  drain?: boolean;
  buffValue?: number;
  shieldValue?: number;
  buffSchool?: School | 'UNIVERSAL';
  
  // DoT / HoT
  dotDamage?: number;
  dotDuration?: number;
  
  // Aura
  duration?: number;
  
  isAoe?: boolean;
  icon: string; // NOW A URL (SVG Data URI or Path)
  assetUrl?: string; // Card Main Illustration

  // Extended properties for special cards
  selfDamage?: number;
  multiHits?: { school: School; damage: number }[];
  multiBuffs?: School[];
}

export interface Buff {
  id: string;
  name: string;
  nameCN?: string;
  type: 'BLADE' | 'TRAP' | 'SHIELD' | 'WEAKNESS' | 'REGEN' | 'DOT' | 'AURA';
  value: number;
  school: School | 'UNIVERSAL';
  duration: number;
  isOutgoing: boolean;
  srcCardId?: string;
}

export interface Unit {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
  pips: number;
  powerPips: number;
  school: School;
  buffs: Buff[];
  avatarUrl: string;
}

export interface GameState {
  player: Unit;
  enemy: Unit;
  deck: Card[];
  hand: Card[];
  discard: Card[];
  turn: number;
  phase: 'SCHOOL_SELECTION' | 'LOBBY' | 'DECK_BUILDING' | 'ART_GENERATION' | 'PLAYER_INPUT' | 'ANIMATING' | 'ENEMY_THINKING' | 'ENEMY_ACTING' | 'VICTORY' | 'DEFEAT';
  messages: string[];
  lastAction?: {
    card: Card;
    casterId: string;
  };
}

export type AnimationType = 'IDLE' | 'CASTING' | 'HIT' | 'DYING';
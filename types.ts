
export enum Language {
  KO = 'ko',
  EN = 'en',
  ZH = 'zh',
  JA = 'ja'
}

export enum ClassType {
  SWORDSMAN = 'Swordsman',
  ARCHER = 'Archer',
  MAGE = 'Mage',
  SUPPORTER = 'Supporter'
}

export enum Tier {
  NORMAL = 'Normal',
  RARE = 'Rare',
  EPIC = 'Epic',
  LEGENDARY = 'Legendary',
  MYTHIC = 'Mythic',
  EGO = 'Ego',
  MANSION = 'Mansion',
  HIDDEN = 'Hidden'
}

export interface Stats {
  hp: number;
  maxHp: number;
  dmg: number;
  dex: number;
  int: number;
  spr: number;
}

export interface Weapon {
  id: string;
  name: string;
  tier: Tier;
  dmgBonus: number;
  description: string;
  price?: number;
  icon?: string;
  reinforceLevel?: number; // 무기 강화 수치 추가
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  multiplier: number;
  price: number;
  icon: string;
}

export interface Player {
  name: string;
  classType: ClassType;
  promotion: string;
  level: number;
  exp: number;
  stats: Stats;
  weapon: Weapon;
  gold: number;
  unlockedWorlds: number;
  isTutorialComplete: boolean;
  profileImage?: string;
  ownedWeaponIds: string[];
  ownedSkillIds: string[];
  usedCodes: string[];
}

export interface Monster {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  dmg: number;
  rewardExp: number;
  rewardGold: number;
  type: 'Normal' | 'Elite' | 'Boss';
  icon: string;
  turnCount: number;
  playerTurnCount: number; // 플레이어가 공격한 횟수 추적
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  rewardGold: number;
  rewardExp: number;
  type: 'Main' | 'Sub' | 'Repeat' | 'Special';
  isCompleted: boolean;
  targetMonsterName?: string;
  targetWeaponId?: string;
}

export interface GameState {
  player: Player;
  activeQuests: Quest[];
  inventory: Weapon[];
  currentWorld: number;
  combatLog: string[];
  language: Language;
  lastSaved: string;
  platform: 'mobile' | 'pc';
  completedQuestCountInPair: number;
}

export interface UserAccount {
  username: string;
  passwordHash: string;
}


import { ClassType, Tier, Weapon, Stats, Language, Skill } from './types';

// Fix: Add missing TIER_COLORS mapping for weapon tiers to provide consistent UI coloring
export const TIER_COLORS: Record<Tier, string> = {
  [Tier.NORMAL]: 'text-slate-400',
  [Tier.RARE]: 'text-blue-400',
  [Tier.EPIC]: 'text-purple-500',
  [Tier.LEGENDARY]: 'text-yellow-500',
  [Tier.MYTHIC]: 'text-red-500',
  [Tier.EGO]: 'text-emerald-500',
  [Tier.MANSION]: 'text-rose-500',
  [Tier.HIDDEN]: 'text-indigo-500',
};

// Fix: Add missing UPGRADE_BASE_PRICE constant for player stat upgrades
export const UPGRADE_BASE_PRICE = 500;

export const SKILL_ICONS: Record<string, string> = {
  '회전베기': '🌪️', '방패 강타': '🛡️', '검의 폭풍': '⚔️', '강력한 내려치기': '🔨',
  '연속 사격': '🏹', '관통 화살': '🎯', '폭우의 화살': '⛈️', '정밀 조준': '👁️',
  '파이어볼': '🔥', '아이스 필드': '❄️', '아케인 블래스트': '🔮', '라이트닝 볼트': '⚡',
  '치유의 빛': '✨', '방어력 증가': '🛡️', '천상의 보호': '👼', '성스러운 폭발': '☀️'
};

export const SKILLS: Record<ClassType, string[]> = {
  [ClassType.SWORDSMAN]: ['회전베기', '방패 강타', '검의 폭풍', '강력한 내려치기'],
  [ClassType.ARCHER]: ['연속 사격', '관통 화살', '폭우의 화살', '정밀 조준'],
  [ClassType.MAGE]: ['파이어볼', '아이스 필드', '아케인 블래스트', '라이트닝 볼트'],
  [ClassType.SUPPORTER]: ['치유의 빛', '방어력 증가', '천상의 보호', '성스러운 폭발'],
};

export const MONSTER_DB = [
  { name: '초록 슬라임', hp: 30, dmg: 5, spawnRate: 15, icon: '💧', type: 'Normal' },
  { name: '박쥐 떼', hp: 40, dmg: 8, spawnRate: 15, icon: '🦇', type: 'Normal' },
  { name: '독거미', hp: 60, dmg: 12, spawnRate: 10, icon: '🕷️', type: 'Normal' },
  { name: '해골 병사', hp: 80, dmg: 18, spawnRate: 10, icon: '💀', type: 'Normal' },
  { name: '부패 좀비', hp: 100, dmg: 15, spawnRate: 8, icon: '🧟', type: 'Normal' },
  { name: '유령', hp: 70, dmg: 22, spawnRate: 8, icon: '👻', type: 'Normal' },
  { name: '저택 경비견', hp: 130, dmg: 25, spawnRate: 7, icon: '🐕', type: 'Normal' },
  { name: '미믹', hp: 180, dmg: 30, spawnRate: 5, icon: '📦', type: 'Normal' },
  { name: '가고일', hp: 230, dmg: 35, spawnRate: 5, icon: '🗿', type: 'Normal' },
  { name: '그림자 살수', hp: 160, dmg: 45, spawnRate: 5, icon: '👤', type: 'Normal' },
  { name: '불의 정령', hp: 200, dmg: 40, spawnRate: 4, icon: '🔥', type: 'Normal' },
  { name: '얼음 골렘', hp: 330, dmg: 38, spawnRate: 4, icon: '❄️', type: 'Normal' },
  { name: '사악한 술사', hp: 180, dmg: 55, spawnRate: 3, icon: '🧙', type: 'Normal' },
  { name: '뱀파이어', hp: 380, dmg: 70, spawnRate: 2, icon: '🧛', type: 'Elite' },
  { name: '흑기사', hp: 500, dmg: 90, spawnRate: 2, icon: '🛡️', type: 'Elite' },
  { name: '맨션 로드', hp: 1200, dmg: 150, spawnRate: 1, icon: '🏰', type: 'Boss' },
];

export const TRANSLATIONS: Record<Language, any> = {
  [Language.KO]: {
    title: "13살이 만든 RPG",
    start: "모험을 시작합니다.",
    wielderName: "계승자 이름",
    password: "비밀번호 (영문+숫자 7자 이상)",
    login: "로그인",
    registerMsg: "회원가입",
    loginError: "정보가 틀렸습니다.",
    passError: "비밀번호는 영문과 숫자를 포함해 7자 이상이어야 합니다.",
    selectPath: "계승할 직업을 선택하세요",
    status: "정보",
    shop: "상점",
    rank: "랭킹",
    combat: "전투",
    inventory: "가방",
    quests: "퀘스트",
    equipped: "장착 중",
    attackLog: "{p}이(가) {m}에게 {d} 데미지를 입혔습니다.",
    killLog: "{m} 처치! +{g}G, +{e}EXP",
    questDone: "[퀘스트 완료] {t}!",
    levelUp: "레벨업! Lv.{l}",
    monsterAttack: "{m}의 공격! -{d} HP",
    defeat: "전투 불능...",
    classes: {
      [ClassType.SWORDSMAN]: "검사", [ClassType.ARCHER]: "궁수", [ClassType.MAGE]: "마법사", [ClassType.SUPPORTER]: "서포터",
    },
    classDescs: {
      [ClassType.SWORDSMAN]: "강인한 체력 (HP 150, ATK 60)", 
      [ClassType.ARCHER]: "빠른 공격 (HP 100, ATK 65)", 
      [ClassType.MAGE]: "강력한 마력 (HP 80, ATK 70)", 
      [ClassType.SUPPORTER]: "생존의 달인 (HP 120, ATK 60)",
    }
  },
  [Language.EN]: { title: "13yo's RPG", start: "Start!", wielderName: "Name", password: "PW (7+ Alpha-Num)", login: "Login", registerMsg: "Join", loginError: "Error", passError: "Min 7 chars Alpha-Num!", selectPath: "Select Class", status: "Info", shop: "Shop", rank: "Rank", combat: "Combat", inventory: "Inv", quests: "Quest", equipped: "Eqp", attackLog: "{p} hit {m}: {d}", killLog: "{m} Dead! +{g}G", questDone: "[Done] {t}", levelUp: "LV UP! {l}", monsterAttack: "{m} hit: {d}", defeat: "Defeat", classes: { [ClassType.SWORDSMAN]: "Warrior", [ClassType.ARCHER]: "Archer", [ClassType.MAGE]: "Mage", [ClassType.SUPPORTER]: "Healer" }, classDescs: { [ClassType.SWORDSMAN]: "HP 150, ATK 60", [ClassType.ARCHER]: "HP 100, ATK 65", [ClassType.MAGE]: "HP 80, ATK 70", [ClassType.SUPPORTER]: "HP 120, ATK 60" } },
  [Language.ZH]: { title: "13岁制作的RPG", start: "开始", wielderName: "名字", password: "密码 (7+ 字母数字)", login: "登录", registerMsg: "注册", loginError: "错误", passError: "最少7位字母数字!", selectPath: "选择职业", status: "信息", shop: "商店", rank: "排名", combat: "战斗", inventory: "背包", quests: "任务", equipped: "装备", attackLog: "{p} 伤害 {m}: {d}", killLog: "{m} 击败! +{g}G", questDone: "[完成] {t}", levelUp: "升级! {l}", monsterAttack: "{m} 攻击: {d}", defeat: "失败", classes: { [ClassType.SWORDSMAN]: "战士", [ClassType.ARCHER]: "射手", [ClassType.MAGE]: "法师", [ClassType.SUPPORTER]: "辅助" }, classDescs: { [ClassType.SWORDSMAN]: "HP 150, ATK 60", [ClassType.ARCHER]: "HP 100, ATK 65", [ClassType.MAGE]: "HP 80, ATK 70", [ClassType.SUPPORTER]: "HP 120, ATK 60" } },
  [Language.JA]: { title: "13歳が作ったRPG", start: "開始", wielderName: "名前", password: "パス (7+ 英数字)", login: "ログイン", registerMsg: "登録", loginError: "エラー", passError: "7文字 이상의 英数字!", selectPath: "職業選択", status: "情報", shop: "ショップ", rank: "ランク", combat: "戦闘", inventory: "バッグ", quests: "クエスト", equipped: "装備", attackLog: "{p}가{m}에{d}ダメージ", killLog: "{m}撃破! +{g}G", questDone: "[完了] {t}", levelUp: "レベルアップ! {l}", monsterAttack: "{m}の攻撃: {d}", defeat: "敗北", classes: { [ClassType.SWORDSMAN]: "戦士", [ClassType.ARCHER]: "弓使い", [ClassType.MAGE]: "魔術師", [ClassType.SUPPORTER]: "ヒー러ー" }, classDescs: { [ClassType.SWORDSMAN]: "HP 150, ATK 60", [ClassType.ARCHER]: "HP 100, ATK 65", [ClassType.MAGE]: "HP 80, ATK 70", [ClassType.SUPPORTER]: "HP 120, ATK 60" } }
};

export const INITIAL_STATS: Record<ClassType, Stats> = {
  [ClassType.SWORDSMAN]: { hp: 150, maxHp: 150, dmg: 60, dex: 10, int: 5, spr: 5 },
  [ClassType.ARCHER]: { hp: 100, maxHp: 100, dmg: 65, dex: 20, int: 5, spr: 5 },
  [ClassType.MAGE]: { hp: 80, maxHp: 80, dmg: 70, dex: 5, int: 25, spr: 10 },
  [ClassType.SUPPORTER]: { hp: 120, maxHp: 120, dmg: 60, dex: 10, int: 15, spr: 20 },
};

export const SHOP_WEAPONS: Weapon[] = [
  { id: 'sw1', name: '강화된 철검', tier: Tier.RARE, dmgBonus: 15, description: '기본에 충실한 철검.', price: 1000, icon: '⚔️' },
  { id: 'sw2', name: '바람의 장궁', tier: Tier.RARE, dmgBonus: 18, description: '바람을 가르는 화살.', price: 1200, icon: '🏹' },
  { id: 'sw3', name: '화염 스태프', tier: Tier.RARE, dmgBonus: 20, description: '뜨거운 불꽃의 마력.', price: 1500, icon: '🪄' },
  { id: 'sw4', name: '고대인의 망치', tier: Tier.RARE, dmgBonus: 25, description: '오래된 전사의 유산.', price: 1800, icon: '🔨' },
  { id: 'sw5', name: '그림자 단검', tier: Tier.EPIC, dmgBonus: 35, description: '어둠 속의 일격.', price: 3000, icon: '🗡️' },
  { id: 'sw6', name: '강철 대검', tier: Tier.EPIC, dmgBonus: 45, description: '묵직한 파괴력.', price: 4500, icon: '⚔️' },
  { id: 'sw7', name: '얼음 사슬낫', tier: Tier.EPIC, dmgBonus: 50, description: '차가운 사슬의 일격.', price: 6000, icon: '⛓️' },
  { id: 'sw8', name: '맹독의 발톱', tier: Tier.EPIC, dmgBonus: 55, description: '적을 마비시키는 독기.', price: 7500, icon: '🐾' },
  { id: 'sw10', name: '태양의 성검', tier: Tier.LEGENDARY, dmgBonus: 85, description: '태양빛의 정화.', price: 10000, icon: '☀️' },
  { id: 'sw11', name: '파멸의 도끼', tier: Tier.LEGENDARY, dmgBonus: 120, description: '모든 것을 가르는 도끼.', price: 15000, icon: '🪓' },
  { id: 'sw12', name: '심연의 지팡이', tier: Tier.LEGENDARY, dmgBonus: 110, description: '심연의 마력.', price: 20000, icon: '🌑' },
  { id: 'sw13', name: '제우스의 번개', tier: Tier.MYTHIC, dmgBonus: 250, description: '신들의 왕의 무기.', price: 50000, icon: '⚡' },
  { id: 'sw14', name: '드래곤 슬레이어', tier: Tier.MYTHIC, dmgBonus: 300, description: '용의 심장을 꿰뚫는 검.', price: 80000, icon: '🐉' },
  { id: 'sw15', name: '천공의 활', tier: Tier.MYTHIC, dmgBonus: 280, description: '하늘에서 쏟아지는 화살.', price: 70000, icon: '✨' },
  { id: 'sw16', name: '저택의 주인 (EGO)', tier: Tier.EGO, dmgBonus: 500, description: '저택의 영혼이 깃든 무구.', price: 150000, icon: '🏰' },
  { id: 'sw17', name: '심장 파괴자', tier: Tier.EGO, dmgBonus: 550, description: '적의 고동을 멈추는 무기.', price: 180000, icon: '💔' },
];

export const SHOP_SKILLS: Skill[] = [
  { id: 'sk1', name: '더블 스트라이크', description: '연속으로 두 번 공격합니다.', multiplier: 2.0, price: 2000, icon: '💥' },
  { id: 'sk2', name: '대지의 울림', description: '지면을 흔들어 적을 압박합니다.', multiplier: 1.5, price: 1500, icon: '⛰️' },
  { id: 'sk3', name: '정신의 집중', description: '공격력을 일시적으로 극대화합니다.', multiplier: 2.5, price: 5000, icon: '🧠' },
  { id: 'sk4', name: '섬광의 일격', description: '빛의 속도로 적을 벱니다.', multiplier: 1.8, price: 3000, icon: '✨' },
  { id: 'sk5', name: '파멸의 일격', description: '엄청난 위력으로 내리칩니다.', multiplier: 4.0, price: 12000, icon: '🔥' },
  { id: 'sk6', name: '영혼의 파동', description: '영혼의 힘을 방출합니다.', multiplier: 3.5, price: 8000, icon: '👻' },
  { id: 'sk7', name: '용의 분노', description: '용의 분노가 서린 공격.', multiplier: 5.0, price: 25000, icon: '🐲' },
  { id: 'sk8', name: '차원 가르기', description: '공간을 베어 적을 무너뜨립니다.', multiplier: 7.5, price: 60000, icon: '🌌' },
  { id: 'sk9', name: '신성한 심판', description: '하늘의 힘으로 적을 심판합니다.', multiplier: 10.0, price: 100000, icon: '⚖️' },
  { id: 'sk10', name: '저택의 권능', description: '저택 주인의 권능을 발휘합니다.', multiplier: 15.0, price: 200000, icon: '👑' },
  { id: 'sk11', name: '시간의 가속', description: '찰나의 순간에 폭풍 공격.', multiplier: 12.0, price: 150000, icon: '⏳' },
];

export const STARTING_WEAPONS: Record<Language, Record<ClassType, Weapon>> = {
  [Language.KO]: {
    [ClassType.SWORDSMAN]: { id: 'w1', name: '녹슨 경비검', tier: Tier.NORMAL, dmgBonus: 5, description: '기본 훈련용 검.', icon: '⚔️' },
    [ClassType.ARCHER]: { id: 'w2', name: '사냥꾼의 장궁', tier: Tier.NORMAL, dmgBonus: 5, description: '기본 나무 활.', icon: '🏹' },
    [ClassType.MAGE]: { id: 'w3', name: '마나 스태프', tier: Tier.NORMAL, dmgBonus: 5, description: '기본 마법 지팡이.', icon: '🪄' },
    [ClassType.SUPPORTER]: { id: 'w4', name: '치유자의 로드', tier: Tier.NORMAL, dmgBonus: 5, description: '단순한 치유봉.', icon: '💉' },
  },
  [Language.EN]: {
    [ClassType.SWORDSMAN]: { id: 'w1e', name: 'Rusty Guard Sword', tier: Tier.NORMAL, dmgBonus: 5, description: 'Basic training sword.', icon: '⚔️' },
    [ClassType.ARCHER]: { id: 'w2e', name: 'Hunter\'s Longbow', tier: Tier.NORMAL, dmgBonus: 5, description: 'Basic wooden bow.', icon: '🏹' },
    [ClassType.MAGE]: { id: 'w3e', name: 'Mana Staff', tier: Tier.NORMAL, dmgBonus: 5, description: 'Basic magic staff.', icon: '🪄' },
    [ClassType.SUPPORTER]: { id: 'w4e', name: 'Healer\'s Rod', tier: Tier.NORMAL, dmgBonus: 5, description: 'Simple healing rod.', icon: '💉' },
  },
  [Language.ZH]: {
    [ClassType.SWORDSMAN]: { id: 'w1z', name: '守卫剑', tier: Tier.NORMAL, dmgBonus: 5, description: '基础剑。', icon: '⚔️' },
    [ClassType.ARCHER]: { id: 'w2z', name: '猎人之弓', tier: Tier.NORMAL, dmgBonus: 5, description: '基础木弓。', icon: '🏹' },
    [ClassType.MAGE]: { id: 'w3z', name: '法杖', tier: Tier.NORMAL, dmgBonus: 5, description: '基础魔法杖。', icon: '🪄' },
    [ClassType.SUPPORTER]: { id: 'w4z', name: '治愈杖', tier: Tier.NORMAL, dmgBonus: 5, description: '简单的治疗杖。', icon: '💉' },
  },
  [Language.JA]: {
    [ClassType.SWORDSMAN]: { id: 'w1j', name: '守備剣', tier: Tier.NORMAL, dmgBonus: 5, description: '基本訓練用の剣.', icon: '⚔️' },
    [ClassType.ARCHER]: { id: 'w2j', name: '長弓', tier: Tier.NORMAL, dmgBonus: 5, description: '基本의木製の弓.', icon: '🏹' },
    [ClassType.MAGE]: { id: 'w3j', name: 'スタッフ', tier: Tier.NORMAL, dmgBonus: 5, description: '基本의魔法의杖.', icon: '🪄' },
    [ClassType.SUPPORTER]: { id: 'w4j', name: '로ッド', tier: Tier.NORMAL, dmgBonus: 5, description: '治療의杖.', icon: '💉' },
  }
};

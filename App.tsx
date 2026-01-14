
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  ClassType, 
  Tier, 
  Player, 
  Weapon, 
  Skill,
  Quest, 
  Monster, 
  GameState,
  Language,
  UserAccount
} from './types';
import { 
  INITIAL_STATS, 
  STARTING_WEAPONS, 
  TIER_COLORS, 
  TRANSLATIONS,
  SKILLS,
  SKILL_ICONS,
  UPGRADE_BASE_PRICE,
  SHOP_WEAPONS,
  SHOP_SKILLS,
  MONSTER_DB
} from './constants';
import { StatBar } from './components/StatBar';
import { generateGameImage } from './services/geminiService';

const STORAGE_USERS_KEY = 'THE_MANSION_ROAD_USERS_V2';
const STORAGE_SAVES_PREFIX = 'THE_MANSION_ROAD_SAVE_V2_';
const STORAGE_RANK_KEY = 'THE_MANSION_ROAD_GLOBAL_RANK_V2';

const FIXED_CLASS_IMAGES: Record<ClassType, string> = {
  [ClassType.SWORDSMAN]: '⚔️',
  [ClassType.ARCHER]: '🏹',
  [ClassType.MAGE]: '🔮',
  [ClassType.SUPPORTER]: '💉'
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [splashFinished, setSplashFinished] = useState(false);
  const [isSplashOut, setIsSplashOut] = useState(false);
  const [language, setLanguage] = useState<Language>(Language.KO);
  const [platform, setPlatform] = useState<'mobile' | 'pc'>('mobile');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<'status' | 'inventory' | 'shop' | 'combat' | 'quests' | 'reinforce' | 'rank' | 'boss'>('combat');
  const [currentMonster, setCurrentMonster] = useState<Monster | null>(null);
  const [isFighting, setIsFighting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [codeInput, setCodeInput] = useState('');

  const [gameNotification, setGameNotification] = useState<{message: string, type: string} | null>(null);
  const [worldBackgrounds, setWorldBackgrounds] = useState<Record<number, string>>({});
  const [isBeingHit, setIsBeingHit] = useState(false);
  const [tutorialStep, setTutorialStep] = useState<number>(-1);
  const [activeSkillName, setActiveSkillName] = useState<string | null>(null);
  const [isMonsterTurn, setIsMonsterTurn] = useState(false);
  
  const [skillCooldowns, setSkillCooldowns] = useState<Record<string, number>>({});
  const [tick, setTick] = useState(0);
  const [showBossConfirm, setShowBossConfirm] = useState(false);

  const t = (key: string) => TRANSLATIONS[language][key] || key;

  const showNotify = (message: string, type: 'success' | 'error' | 'level' | 'death' | 'info' = 'info') => {
    setGameNotification({ message, type });
    setTimeout(() => setGameNotification(null), 3000);
  };

  const playSound = (type: 'hit' | 'hurt' | 'levelUp' | 'click' | 'victory' | 'buy' | 'skill') => {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    if (type === 'hit') { osc.type = 'square'; osc.frequency.setValueAtTime(200, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1); gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1); osc.start(); osc.stop(ctx.currentTime + 0.1); }
    else if (type === 'buy') { osc.type = 'sine'; osc.frequency.setValueAtTime(600, ctx.currentTime); osc.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 0.1); gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2); osc.start(); osc.stop(ctx.currentTime + 0.2); }
    else if (type === 'hurt') { osc.type = 'sawtooth'; osc.frequency.setValueAtTime(120, ctx.currentTime); osc.frequency.linearRampToValueAtTime(30, ctx.currentTime + 0.2); gain.gain.setValueAtTime(0.4, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2); osc.start(); osc.stop(ctx.currentTime + 0.2); }
    else if (type === 'levelUp') { osc.type = 'sine'; osc.frequency.setValueAtTime(440, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5); osc.start(); osc.stop(ctx.currentTime + 0.5); }
    else if (type === 'click') { osc.type = 'sine'; osc.frequency.setValueAtTime(800, ctx.currentTime); gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05); osc.start(); osc.stop(ctx.currentTime + 0.05); }
    else if (type === 'skill') { osc.type = 'sine'; osc.frequency.setValueAtTime(300, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3); gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4); osc.start(); osc.stop(ctx.currentTime + 0.4); }
    else if (type === 'victory') { [440, 554, 659].forEach((f, i) => { const o = ctx.createOscillator(); const g = ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.frequency.setValueAtTime(f, ctx.currentTime + i * 0.1); g.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1); g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.4); o.start(ctx.currentTime + i * 0.1); o.stop(ctx.currentTime + i * 0.1 + 0.4); }); }
  };

  const updateGlobalRanking = useCallback((player: Player) => {
    const raw = localStorage.getItem(STORAGE_RANK_KEY);
    const rankings: any[] = raw ? JSON.parse(raw) : [];
    const existingIdx = rankings.findIndex(r => r.name.toLowerCase() === player.name.toLowerCase());
    const entry = { name: player.name, level: player.level, gold: player.gold, classType: player.classType };
    if (existingIdx > -1) rankings[existingIdx] = entry;
    else rankings.push(entry);
    rankings.sort((a, b) => b.level !== a.level ? b.level - a.level : b.gold - a.gold);
    localStorage.setItem(STORAGE_RANK_KEY, JSON.stringify(rankings.slice(0, 100)));
  }, []);

  const saveGame = useCallback((state: GameState, username: string) => {
    localStorage.setItem(STORAGE_SAVES_PREFIX + username.toLowerCase(), JSON.stringify({...state, lastSaved: new Date().toISOString()}));
    updateGlobalRanking(state.player);
  }, [updateGlobalRanking]);

  const createQuestPair = useCallback((): Quest[] => {
    const quests: Quest[] = [];
    for (let i = 0; i < 2; i++) {
      const amount = Math.floor(Math.random() * 5) + 3;
      quests.push({
        id: Math.random().toString(),
        title: `몬스터 ${amount}마리 처치`,
        description: `저택의 위협인 몬스터들을 ${amount}마리 소탕하세요.`,
        targetCount: amount,
        currentCount: 0,
        rewardGold: 150 * amount,
        rewardExp: 1,
        type: 'Repeat',
        isCompleted: false
      });
    }
    return quests;
  }, []);

  const handleAuth = (username: string, passwordHash: string) => {
    setAuthError(null); setAuthSuccess(null);
    if (!username || !passwordHash) return;
    const passRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{7,}$/;
    if (authMode === 'register' && !passRegex.test(passwordHash)) {
      setAuthError(t('passError'));
      return;
    }
    const lowerUser = username.toLowerCase();
    const usersRaw = localStorage.getItem(STORAGE_USERS_KEY);
    const users: UserAccount[] = usersRaw ? JSON.parse(usersRaw) : [];
    const existingUser = users.find(u => u.username.toLowerCase() === lowerUser);
    if (authMode === 'login') {
      if (existingUser && existingUser.passwordHash === passwordHash) {
        setCurrentUser(existingUser.username);
        const savedData = localStorage.getItem(STORAGE_SAVES_PREFIX + lowerUser);
        if (savedData) {
          const state = JSON.parse(savedData);
          setGameState({ ...state, platform }); 
          setLanguage(state.language || language);
        } else {
          setGameState(null);
        }
      } else setAuthError(t('loginError'));
    } else {
      if (existingUser) { setAuthError("이미 존재하는 아이디입니다."); return; }
      users.push({ username, passwordHash });
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
      setAuthMode('login'); setAuthSuccess("가입 성공! 로그인 하세요.");
      showNotify("가입 성공!", "success");
    }
  };

  const createPlayer = async (classType: ClassType) => {
    if (!currentUser) return;
    const player: Player = {
      name: currentUser, classType, promotion: TRANSLATIONS[language].classes[classType],
      level: 1, exp: 0, stats: { ...INITIAL_STATS[classType] },
      weapon: { ...STARTING_WEAPONS[language][classType], reinforceLevel: 0 },
      gold: 500, unlockedWorlds: 1, isTutorialComplete: false,
      ownedWeaponIds: [STARTING_WEAPONS[language][classType].id],
      ownedSkillIds: [], usedCodes: []
    };
    const newState: GameState = {
      player, activeQuests: createQuestPair(),
      inventory: [player.weapon], currentWorld: 1, combatLog: [t('start')], language, lastSaved: new Date().toISOString(),
      platform, completedQuestCountInPair: 0
    };
    setGameState(newState); saveGame(newState, currentUser);
  };

  const spawnMonster = useCallback(async (isBoss: boolean = false) => {
    if (!gameState) return;
    let chosen;
    if (isBoss) {
      chosen = MONSTER_DB.find(m => m.type === 'Boss') || MONSTER_DB[MONSTER_DB.length - 1];
    } else {
      const rand = Math.random() * 100;
      let acc = 0;
      chosen = MONSTER_DB[0];
      for (const m of MONSTER_DB) {
        acc += m.spawnRate;
        if (rand <= acc) { chosen = m; break; }
      }
    }
    const levelScale = isBoss ? 4 + (gameState.player.level * 0.3) : 1 + (gameState.player.level * 0.1);
    const newMonster: Monster = { 
      id: Math.random().toString(), name: chosen.name, level: gameState.player.level, hp: Math.floor(chosen.hp * levelScale), 
      maxHp: Math.floor(chosen.hp * levelScale), dmg: Math.floor(chosen.dmg * levelScale), rewardExp: isBoss ? 20 : 1, rewardGold: isBoss ? 1000 : 50, type: chosen.type as any,
      icon: chosen.icon, turnCount: 0, playerTurnCount: 0 
    };
    setCurrentMonster(newMonster); setIsFighting(true); setIsMonsterTurn(false);
  }, [gameState]);

  const handleAttackClick = () => {
    if (!gameState || !currentMonster || !isFighting || isMonsterTurn) return;
    const player = { ...gameState.player }; 
    const monster = { ...currentMonster }; 
    const newLog = [...gameState.combatLog].slice(-10);
    playSound('hit');
    
    let finalDmg = player.stats.dmg + player.weapon.dmgBonus + (player.stats.dex * 0.5);
    const now = Date.now();
    const availableSkills = SHOP_SKILLS.filter(s => 
      player.ownedSkillIds.includes(s.id) && (!skillCooldowns[s.id] || now >= skillCooldowns[s.id])
    );
    
    if (availableSkills.length > 0 && Math.random() < 0.45) {
      const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
      finalDmg *= skill.multiplier;
      setActiveSkillName(`[${skill.name}] x${skill.multiplier}`);
      playSound('skill');
      newLog.push(`[${skill.name}] ${monster.name}에게 치명타!`);
      setSkillCooldowns(prev => ({...prev, [skill.id]: now + 10000}));
    } else {
      const baseSkills = SKILLS[player.classType];
      const skillName = baseSkills[Math.floor(Math.random() * baseSkills.length)];
      setActiveSkillName(skillName);
      playSound('skill');
    }

    monster.hp = Math.max(0, monster.hp - Math.floor(finalDmg));
    newLog.push(t('attackLog').replace('{p}', player.name).replace('{m}', monster.name).replace('{d}', Math.floor(finalDmg).toString()));
    setTimeout(() => setActiveSkillName(null), 800);

    if (monster.hp <= 0) {
      playSound('victory'); 
      player.gold += monster.rewardGold; player.exp += monster.rewardExp; player.stats.hp = player.stats.maxHp;
      newLog.push(t('killLog').replace('{m}', monster.name).replace('{g}', monster.rewardGold.toString()).replace('{e}', monster.rewardExp.toString()));
      
      const newQuests = gameState.activeQuests.map(q => {
        if (!q.isCompleted) {
          q.currentCount++;
          if (q.currentCount >= q.targetCount) {
            q.isCompleted = true; player.gold += q.rewardGold; player.exp += q.rewardExp;
            newLog.push(t('questDone').replace('{t}', q.title));
            showNotify(`[퀘스트 보상] ${q.rewardGold}G / ${q.rewardExp}EXP`, 'success');
          }
        }
        return q;
      });

      if (player.exp >= 4) { 
        player.exp -= 4; player.level++; 
        player.stats.maxHp += 20; player.stats.dmg += 5; player.stats.dex += 2;
        player.stats.hp = player.stats.maxHp;
        playSound('levelUp'); showNotify(`레벨업! Lv.${player.level}`, 'level');
      }
      
      const ns = {...gameState, player, combatLog: newLog, activeQuests: newQuests.every(q=>q.isCompleted) ? createQuestPair() : newQuests};
      setGameState(ns); saveGame(ns, player.name); setCurrentMonster(null); 
      if (activeTab === 'boss') setActiveTab('combat'); 
      spawnMonster(activeTab === 'boss');
    } else {
      setCurrentMonster(monster); setIsMonsterTurn(true);
      setTimeout(() => {
        if (!monster) return;
        playSound('hurt'); setIsBeingHit(true); setTimeout(() => setIsBeingHit(false), 400);
        player.stats.hp = Math.max(0, player.stats.hp - monster.dmg);
        newLog.push(t('monsterAttack').replace('{m}', monster.name).replace('{d}', monster.dmg.toString()));
        
        if (player.stats.hp <= 0) {
          if (activeTab === 'boss') {
            player.level = Math.max(1, player.level - 5);
            player.stats.maxHp = INITIAL_STATS[player.classType].maxHp + (player.level - 1) * 20;
            player.stats.dmg = INITIAL_STATS[player.classType].dmg + (player.level - 1) * 5;
            showNotify("보스에게 패배하여 5레벨을 잃었습니다!", "error");
            setActiveTab('combat');
          } else {
            showNotify("전투 불능... 마을로 귀환합니다.", "error");
          }
          player.stats.hp = player.stats.maxHp; 
          spawnMonster(false); 
        }
        setIsMonsterTurn(false); setGameState({...gameState, player, combatLog: newLog});
      }, 800);
    }
  };

  const buyUpgrade = (type: 'hp' | 'dmg') => {
    if (!gameState) return;
    const player = { ...gameState.player };
    if (player.gold >= UPGRADE_BASE_PRICE) {
      playSound('buy'); player.gold -= UPGRADE_BASE_PRICE;
      if (type === 'hp') { player.stats.maxHp += 50; player.stats.hp = player.stats.maxHp; showNotify("체력 강화 성공!", "success"); }
      else { player.stats.dmg += 10; showNotify("데미지 강화 성공!", "success"); }
      setGameState({...gameState, player}); saveGame({...gameState, player}, player.name);
    } else showNotify("골드가 부족합니다!", "error");
  };

  const usePotion = () => {
    if (!gameState) return;
    const player = { ...gameState.player };
    if (player.gold >= 200) {
      playSound('buy'); player.gold -= 200; player.stats.hp = player.stats.maxHp;
      setGameState({...gameState, player}); saveGame({...gameState, player}, player.name);
      showNotify("체력을 모두 회복했습니다!", "success");
    } else showNotify("골드가 부족합니다!", "error");
  };

  const handleClassChange = (newClass: ClassType) => {
    if (!gameState) return;
    const player = { ...gameState.player };
    if (player.gold < 10000) { showNotify("10,000 골드가 부족합니다.", 'error'); return; }
    player.gold -= 10000;
    player.classType = newClass;
    player.promotion = TRANSLATIONS[language].classes[newClass];
    const initial = INITIAL_STATS[newClass];
    player.stats = { ...initial, maxHp: initial.maxHp + (player.level - 1) * 20, dmg: initial.dmg + (player.level - 1) * 5, dex: initial.dex + (player.level - 1) * 2 };
    player.stats.hp = player.stats.maxHp;
    setGameState({ ...gameState, player }); saveGame({ ...gameState, player }, player.name);
    showNotify(`${player.promotion} 계승 완료!`, 'success');
  };

  const handleReinforce = (weapon: Weapon) => {
    if (!gameState) return;
    const player = { ...gameState.player };
    const level = weapon.reinforceLevel || 0;
    const cost = (level + 1) * 1000;
    if (player.gold < cost) { showNotify(`강화 비용(${cost}G)이 부족합니다.`, 'error'); return; }
    playSound('buy'); player.gold -= cost;
    const successRate = Math.max(0.1, 1 - level * 0.1);
    if (Math.random() < successRate) {
      const updatedInv = gameState.inventory.map(i => i.id === weapon.id ? {...i, reinforceLevel: level + 1, dmgBonus: i.dmgBonus + 5} : i);
      const updatedWep = updatedInv.find(i=>i.id === weapon.id)!;
      const ns = {...gameState, player: {...player, weapon: player.weapon.id === weapon.id ? updatedWep : player.weapon}, inventory: updatedInv};
      setGameState(ns); saveGame(ns, player.name); showNotify("강화 성공! +1", 'success');
    } else { showNotify("강화 실패...", 'error'); playSound('hurt'); }
  };

  const handleCodeSubmit = () => {
    if (!gameState) return;
    const player = { ...gameState.player };
    const code = codeInput.toLowerCase();
    if (player.usedCodes.includes(code)) { showNotify("이미 사용한 코드입니다.", 'error'); return; }
    if (code === 'suyingyi') {
      player.level = 40; player.gold += 1000000;
      player.ownedWeaponIds = SHOP_WEAPONS.map(w => w.id);
      player.ownedSkillIds = SHOP_SKILLS.map(s => s.id);
      player.stats = { ...player.stats, maxHp: 5000, dmg: 1000, dex: 500, hp: 5000 };
      player.usedCodes.push(code);
      setGameState({ ...gameState, player, inventory: SHOP_WEAPONS.map(w=>({...w, reinforceLevel:0, price:undefined})) });
      showNotify("치트 활성화! 전설 장비를 얻었습니다.", 'level'); 
      setCodeInput(''); return;
    }
    let prize = 0; let msg = "";
    if (code === 'get1111') { prize = 10000; msg = "10,000골드 획득!"; }
    else if (code === 'happyday') { prize = 300; msg = "300골드 획득!"; }
    else if (code === '골드') { prize = 20000; msg = "20,000골드 획득!"; }
    else { showNotify("잘못된 코드입니다.", 'error'); return; }
    player.gold += prize; player.usedCodes.push(code); setCodeInput('');
    setGameState({ ...gameState, player }); saveGame({ ...gameState, player }, player.name);
    showNotify(msg, 'success');
  };

  const handleLogout = () => { setCurrentUser(null); setGameState(null); setAuthMode('login'); };

  useEffect(() => {
    if (gameState && !worldBackgrounds[gameState.currentWorld]) {
      generateGameImage(`dark fantasy mansion hallway cinematic pixel art`).then(img => img && setWorldBackgrounds(p => ({...p, [gameState.currentWorld]: img})));
    }
  }, [gameState, worldBackgrounds]);

  useEffect(() => {
    if (gameState && (activeTab === 'combat' || (activeTab === 'boss' && !showBossConfirm)) && !currentMonster) spawnMonster(activeTab === 'boss');
  }, [gameState, activeTab, currentMonster, spawnMonster, showBossConfirm]);

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const rawRank = localStorage.getItem(STORAGE_RANK_KEY);
    if (!rawRank || JSON.parse(rawRank).length === 0) {
      const dummyRankings = [];
      const names = ["Shadow", "김전사", "李大侠", "宮本", "Ghost", "Storm", "박궁수", "张三", "佐藤", "Fire", "Ice", "Stone", "이마법", "王五", "渡辺", "Moon", "최힐러", "张敏", "伊藤", "Void", "Star", "강민준", "刘洋", "山本", "King", "Lord", "정우성", "赵丽", "中村"];
      for (let i = 0; i < 30; i++) {
        dummyRankings.push({ name: names[i % names.length] + Math.floor(Math.random() * 99), level: Math.floor(Math.random() * 50) + 1, gold: Math.floor(Math.random() * 10000), classType: Object.values(ClassType)[Math.floor(Math.random() * 4)] });
      }
      localStorage.setItem(STORAGE_RANK_KEY, JSON.stringify(dummyRankings.sort((a,b) => b.level - a.level)));
    }
    const timer = setTimeout(() => { setIsSplashOut(true); setTimeout(() => { setSplashFinished(true); setShowSplash(false); }, 800); }, 2200);
    return () => clearTimeout(timer);
  }, []);

  const renderTabIcon = (id: string, icon: string, label: string) => (
    <button key={id} onClick={() => { setActiveTab(id as any); playSound('click'); setCurrentMonster(null); setShowBossConfirm(id === 'boss'); }} className={`flex flex-col items-center justify-center py-2 transition-all ${activeTab === id ? 'bg-red-700/20 border-t-2 border-red-500 text-white' : 'text-slate-500'}`}>
      <span className="text-xl">{icon}</span>
      <span className="text-[8px] font-black uppercase mt-1">{label}</span>
    </button>
  );

  if (showSplash) return (
    <div className={`fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center ${isSplashOut ? 'animate-splashOut' : ''}`}>
      <div className="text-slate-500 text-[8px] font-black mb-4 uppercase tracking-[0.4em]">WASD Games Presents</div>
      <h1 className="text-6xl font-black text-white text-glow-red tracking-widest animate-splashIn">WASD GAMES</h1>
    </div>
  );

  if (!currentUser) return (
    <div className={`h-screen flex flex-col items-center justify-center p-8 bg-[#050507] overflow-hidden ${platform === 'mobile' ? 'max-w-[420px] mx-auto border-x-4 border-slate-900' : 'w-full'}`}>
      <h1 className="text-5xl mansion-title-blue font-black tracking-widest text-center mb-8">{t('title')}</h1>
      <div className="pixel-card w-full p-6 space-y-4">
        <div className="flex bg-black p-1 border-2 border-slate-800">
          <button onClick={() => setAuthMode('login')} className={`flex-1 py-3 text-sm font-black ${authMode === 'login' ? 'bg-red-700 text-white' : 'text-slate-500'}`}>로그인</button>
          <button onClick={() => setAuthMode('register')} className={`flex-1 py-3 text-sm font-black ${authMode === 'register' ? 'bg-red-700 text-white' : 'text-slate-500'}`}>회원가입</button>
        </div>
        <input type="text" placeholder="아이디" className="w-full bg-black border-4 border-slate-800 p-4 text-white font-black outline-none focus:border-red-500" id="user_in" />
        <div className="relative">
          <input type={showPassword ? "text" : "password"} placeholder="비밀번호" className="w-full bg-black border-4 border-slate-800 p-4 text-white font-black outline-none focus:border-red-500" id="pass_in" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 uppercase font-black">비밀번호 확인</button>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {[{l: Language.KO, n: '🇰🇷'}, {l: Language.EN, n: '🇺🇸'}, {l: Language.ZH, n: '🇨🇳'}, {l: Language.JA, n: '🇯🇵'}].map(item => (
            <button key={item.l} onClick={() => setLanguage(item.l)} className={`pixel-btn py-2 text-xs font-black ${language === item.l ? 'bg-red-700 border-red-500 text-white' : 'text-slate-500'}`}>{item.n}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setPlatform('mobile')} className={`pixel-btn py-3 text-[10px] font-black ${platform === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>모바일</button>
          <button onClick={() => setPlatform('pc')} className={`pixel-btn py-3 text-[10px] font-black ${platform === 'pc' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>PC</button>
        </div>
        <button onClick={() => { playSound('click'); handleAuth((document.getElementById('user_in') as any).value, (document.getElementById('pass_in') as any).value); }} className="pixel-btn w-full py-4 text-lg text-white bg-red-700 uppercase">계승 시작</button>
        {authError && <div className="text-red-500 text-[10px] text-center font-black animate-pulse leading-tight">{authError}</div>}
      </div>
    </div>
  );

  if (!gameState) return (
    <div className={`h-screen flex flex-col items-center justify-start p-8 bg-slate-950 overflow-y-auto ${platform === 'mobile' ? 'max-w-[420px] mx-auto border-x-4 border-slate-900' : 'w-full'}`}>
      <h1 className="text-4xl mansion-title-blue font-black mb-8 mt-4 uppercase tracking-widest">{t('title')}</h1>
      <h2 className="text-xl text-red-500 font-black mb-6 uppercase tracking-wider">{t('selectPath')}</h2>
      <div className="grid grid-cols-1 gap-4 w-full">
        {Object.values(ClassType).map(ct => (
          <button key={ct} onClick={() => { playSound('click'); createPlayer(ct); }} className="pixel-card flex items-center p-4 hover:border-red-500 transition-all bg-slate-900/40 group active:scale-95">
            <span className="text-5xl mr-4 group-hover:scale-110 transition-transform">{FIXED_CLASS_IMAGES[ct]}</span>
            <div className="text-left flex-1">
              <span className="text-lg text-red-500 font-black block uppercase">{TRANSLATIONS[language].classes[ct]}</span>
              <p className="text-[10px] text-slate-400 font-bold leading-tight">{TRANSLATIONS[language].classDescs[ct]}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const { player } = gameState;

  return (
    <div className={`${platform === 'mobile' ? 'max-w-[420px]' : 'w-full'} h-screen relative bg-[#0c0c14] overflow-hidden flex flex-col shadow-2xl border-x-4 border-black mx-auto`}>
      {gameNotification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[150] w-[85%] max-w-[320px] animate-splashIn">
          <div className={`pixel-card p-5 ${gameNotification.type==='success'?'bg-green-600 border-green-400':gameNotification.type==='error'?'bg-red-800 border-red-500':'bg-slate-800 border-slate-600'} text-white font-black text-center text-sm border-4 shadow-xl`}>
            {gameNotification.message}
          </div>
        </div>
      )}
      
      <header className="p-4 border-b-4 border-black flex justify-between items-center bg-[#1a1a24] z-20 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 border-2 border-red-500 bg-black flex items-center justify-center text-xl shadow-[inset_0_0_5px_rgba(239,68,68,0.5)]">{FIXED_CLASS_IMAGES[player.classType]}</div>
          <div><div className="text-[10px] text-red-500 font-black">Lv.{player.level}</div><div className="text-sm font-black text-white">{player.name}</div></div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-right"><div className="text-[8px] text-slate-500 uppercase font-black">골드</div><div className="text-sm font-black text-yellow-500">{player.gold.toLocaleString()}</div></div>
          <button onClick={() => { playSound('click'); handleLogout(); }} className="pixel-btn text-[8px] border-2 border-slate-800 px-2 py-1 bg-black/40 hover:bg-red-900 transition-colors uppercase font-black">종료</button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 p-4 custom-scrollbar bg-[#0c0c14]">
        {activeTab === 'status' && (
          <div className="space-y-6 animate-splashIn">
            <h3 className="text-xl font-black text-white text-center border-b-2 border-red-500/30 pb-2 uppercase tracking-widest">계승자 정보</h3>
            <div className="pixel-card p-6 flex flex-col items-center space-y-4 bg-slate-900/40">
              <div className="text-center font-black"><div className="text-red-500 text-xs uppercase">{player.promotion} 계승자</div><div className="text-2xl text-white tracking-widest">{player.name}</div></div>
              
              <div className="w-full bg-black/60 p-3 border-2 border-slate-800 rounded">
                <div className="text-[10px] text-red-400 font-black uppercase mb-2 border-b border-slate-800 pb-1">직업 기본 능력치</div>
                <div className="grid grid-cols-1 gap-2 text-[10px] text-slate-300 font-black">
                  {Object.values(ClassType).map(ct => (
                    <div key={ct} className={`flex justify-between border-b border-slate-800/50 pb-1 ${player.classType === ct ? 'text-red-400' : ''}`}>
                      <span>{TRANSLATIONS[language].classes[ct]}</span>
                      <span>HP {INITIAL_STATS[ct].maxHp} / ATK {INITIAL_STATS[ct].dmg}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-2 mt-2">
                <div className="bg-black/60 p-3 border border-slate-800 shadow-[inset_0_0_10px_#ef444455]">
                  <span className="text-[8px] text-slate-500 block uppercase font-black">전체 공격력</span>
                  <span className="text-sm text-white font-black">{player.stats.dmg + player.weapon.dmgBonus}</span>
                </div>
                <div className="bg-black/60 p-3 border border-slate-800 shadow-[inset_0_0_10px_#22c55e55]">
                  <span className="text-[8px] text-slate-500 block uppercase font-black">최대 체력</span>
                  <span className="text-sm text-white font-black">{player.stats.maxHp}</span>
                </div>
              </div>

              <div className="w-full pt-4 border-t-2 border-slate-800">
                <div className="text-[10px] text-yellow-500 font-black mb-2 uppercase">비밀 코드 입력</div>
                <div className="flex space-x-2">
                  <input type="text" value={codeInput} onChange={(e)=>setCodeInput(e.target.value)} placeholder="코드를 입력하세요" className="flex-1 bg-black border-2 border-slate-800 p-2 text-xs text-white font-black outline-none focus:border-red-500"/>
                  <button onClick={() => { playSound('click'); handleCodeSubmit(); }} className="pixel-btn bg-red-700 text-white px-4 text-xs font-black uppercase">확인</button>
                </div>
              </div>

              <div className="w-full pt-4 border-t-2 border-slate-800">
                <div className="text-[10px] text-red-500 font-black mb-2 uppercase">직업 변경 (10,000골드)</div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(ClassType).map(ct => (
                    <button key={ct} onClick={() => { playSound('click'); handleClassChange(ct); }} className={`pixel-btn text-[10px] py-2 font-black ${player.classType === ct ? 'bg-slate-800 border-slate-700 opacity-50':'bg-red-900 hover:bg-red-800'} text-white uppercase`}>{TRANSLATIONS[language].classes[ct]}</button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="pixel-card p-4 space-y-4 border-slate-800 bg-black/70">
              <div className="text-[12px] text-red-500 font-black border-b-4 border-red-900 pb-2 flex justify-between uppercase tracking-widest"><span>몬스터 정보 도감</span><span>출현율</span></div>
              {MONSTER_DB.map((m, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs font-black border-b-2 border-slate-900 pb-4 pt-2 last:border-0 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-6">
                    <span className="text-5xl bg-slate-900 p-2 border-2 border-slate-700 shadow-lg">{m.icon}</span> 
                    <div>
                      <div className="text-white text-lg font-black">{m.name}</div>
                      <div className="text-[10px] text-slate-500 font-black uppercase">체력: {m.hp} | 데미지: {m.dmg}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-blue-500 font-black text-lg">{m.spawnRate}%</span>
                    <span className={`text-[10px] font-black uppercase ${m.type==='Boss'?'text-red-500':m.type==='Elite'?'text-purple-400':'text-slate-600'}`}>{m.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(activeTab === 'combat' || activeTab === 'boss') && (
          <div className="space-y-4 animate-splashIn">
            {activeTab === 'boss' && showBossConfirm ? (
              <div className="pixel-card p-10 bg-red-950/20 border-red-900 flex flex-col items-center space-y-8 h-full min-h-[400px] justify-center text-center">
                 <div className="text-8xl animate-bounce">👹</div>
                 <div className="space-y-4">
                   <div className="text-white font-black text-xl uppercase tracking-widest">보스전 진입 주의</div>
                   <div className="text-red-500 font-black text-sm leading-relaxed uppercase">보스전에서 패배할 경우<br/> 레벨이 5 감소합니다.<br/>도전하시겠습니까?</div>
                 </div>
                 <div className="flex gap-4 w-full max-w-[280px]">
                   <button onClick={() => { setActiveTab('combat'); setShowBossConfirm(false); }} className="pixel-btn flex-1 py-4 bg-slate-800 text-white font-black uppercase">아니오</button>
                   <button onClick={() => { setShowBossConfirm(false); spawnMonster(true); }} className="pixel-btn flex-1 py-4 bg-red-700 text-white font-black uppercase">네</button>
                 </div>
              </div>
            ) : (
              <>
                <div className="pixel-card w-full h-56 relative overflow-hidden bg-black flex items-center justify-center border-4 border-slate-900 shadow-inner">
                  {worldBackgrounds[gameState.currentWorld] && <img src={worldBackgrounds[gameState.currentWorld]} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="battle-bg" />}
                  {activeTab === 'boss' && player.level < 30 ? (
                    <div className="text-center z-10 px-6">
                      <div className="text-5xl mb-4">👹</div>
                      <div className="text-red-500 font-black text-xl mb-2">입장 불가</div>
                      <div className="text-white text-[10px] font-black uppercase">Lv.30 이상 계승자만 보스전에 참여할 수 있습니다.</div>
                    </div>
                  ) : currentMonster ? (
                    <div className={`relative z-10 flex flex-col items-center ${isBeingHit ? 'animate-shake' : ''}`}>
                      <div className="text-7xl mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-transform hover:scale-110">{currentMonster.icon}</div>
                      <div className="text-xl font-black text-white text-outline tracking-widest uppercase mb-2">{currentMonster.name} {activeTab === 'boss' ? '(RAID)' : ''}</div>
                      <div className="w-48"><StatBar current={currentMonster.hp} max={currentMonster.maxHp} color="bg-red-600" label="" /></div>
                    </div>
                  ) : <div className="text-white font-black animate-pulse text-lg tracking-[0.3em]">적 탐색 중...</div>}
                  {activeSkillName && (
                    <div className="absolute inset-0 bg-red-900/60 flex items-center justify-center z-20 backdrop-blur-[2px]">
                      <span className="text-white text-3xl font-black animate-bounce text-outline uppercase text-center px-4 tracking-widest drop-shadow-[0_0_15px_#fff]">{activeSkillName}</span>
                    </div>
                  )}
                </div>
                
                <div className="pixel-card p-4 bg-black/60 space-y-3">
                  <StatBar current={player.stats.hp} max={player.stats.maxHp} color="bg-green-600" label="내 체력" borderColor="border-green-500" />
                  <StatBar current={player.exp} max={4} color="bg-blue-600" label="경험치 (EXP)" borderColor="border-blue-500" />
                  
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="flex flex-col gap-1">
                      <div className="text-[10px] text-red-500 font-black uppercase border-b border-red-900/30 pb-1">장착 무기 (Weapon)</div>
                      <div className="bg-slate-900/80 p-2 border-2 border-red-500 flex items-center gap-2 rounded shadow-[0_0_10px_#ef444455]">
                        <span className="text-3xl">{player.weapon.icon}</span> 
                        <span className="text-[10px] uppercase text-white font-black truncate">{player.weapon.name}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="text-[10px] text-blue-500 font-black uppercase border-b border-blue-900/30 pb-1">보유 스킬 (Skills)</div>
                      <div className="bg-slate-900/80 p-2 border-2 border-blue-500 flex gap-2 rounded items-center overflow-x-auto h-[52px] shadow-[0_0_10px_#3b82f655]">
                        {SHOP_SKILLS.filter(s=>player.ownedSkillIds.includes(s.id)).map(sk=>{
                          const cdEnd = skillCooldowns[sk.id] || 0;
                          const isOnCD = Date.now() < cdEnd;
                          return (
                            <div key={sk.id} className="relative group shrink-0" title={sk.name}>
                              <span className={`text-2xl drop-shadow-lg ${isOnCD ? 'opacity-30' : 'group-hover:scale-110'} transition-all`}>{sk.icon}</span>
                              {isOnCD && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-sm">
                                  <span className="text-[7px] text-white font-black animate-pulse">대기</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {player.ownedSkillIds.length === 0 && <span className="text-[8px] text-slate-600 uppercase font-black">스킬 없음</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => { playSound('click'); handleAttackClick(); }} 
                  disabled={isMonsterTurn || !currentMonster || (activeTab === 'boss' && player.level < 30)} 
                  className={`pixel-btn w-full py-6 text-2xl font-black tracking-[0.2em] shadow-xl active:scale-[0.98] ${(isMonsterTurn || (activeTab === 'boss' && player.level < 30)) ? 'opacity-30 cursor-not-allowed' : 'bg-red-700 text-white hover:bg-red-600 border-red-500'} uppercase`}
                >
                  공격하기
                </button>
                
                <div className="pixel-card p-3 h-32 overflow-y-auto bg-black/80 text-[10px] font-black text-slate-400 border-2 border-slate-900 custom-scrollbar leading-relaxed">
                  {gameState.combatLog.slice().reverse().map((l, i) => (
                    <div key={i} className={`mb-1 border-l-2 pl-2 ${l.includes('처치') ? 'text-yellow-400 border-yellow-400' : l.includes('스킬') ? 'text-blue-400 border-blue-400' : 'border-slate-800'}`}>
                      # {l}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-splashIn">
            <h3 className="text-xl font-black text-white text-center border-b-2 border-red-500/30 pb-2 uppercase tracking-widest">계승자 가방</h3>
            <div className="space-y-4">
              <div className="text-[10px] text-red-500 font-black uppercase border-l-4 border-red-500 pl-2">장비 목록</div>
              <div className="grid grid-cols-1 gap-3">
                {gameState.inventory.map((item, idx) => (
                  <div key={idx} className={`pixel-card p-4 flex justify-between items-center transition-all group ${player.weapon.id === item.id ? 'border-red-500 bg-red-900/20 shadow-[inset_0_0_10px_#ef444455]' : 'border-slate-800 bg-black/40'}`}>
                    <div className="flex items-center space-x-4">
                      <span className="text-4xl group-hover:scale-110 transition-transform">{item.icon}</span>
                      <div>
                        <div className={`font-black text-sm uppercase ${TIER_COLORS[item.tier]}`}>{item.name} {item.reinforceLevel ? `(+${item.reinforceLevel})` : ''}</div>
                        <div className="text-[10px] text-slate-500 font-black">추가 공격력: +{item.dmgBonus}</div>
                      </div>
                    </div>
                    {player.weapon.id === item.id ? <span className="text-[10px] text-red-500 font-black border-2 border-red-500 px-2 py-1 uppercase">장착 중</span> : <button onClick={() => { playSound('click'); setGameState({...gameState, player: {...player, weapon: item}}); }} className="pixel-btn px-4 py-1 text-[10px] font-black bg-slate-700 text-white hover:bg-slate-600 uppercase">장착</button>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shop' && (
          <div className="space-y-6 animate-splashIn">
            <h3 className="text-xl font-black text-white text-center border-b-2 border-red-500/30 pb-2 uppercase tracking-widest">저택 상점</h3>
            
            <div className="space-y-4">
              <div className="text-[10px] text-green-400 font-black uppercase border-l-4 border-green-400 pl-2">특수 소모품</div>
              <div className="grid grid-cols-1 gap-3">
                <div className="pixel-card p-4 flex justify-between items-center border-green-800 bg-green-900/10">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">🧪</span>
                    <div><div className="font-black text-sm text-white uppercase">완치 물약</div><div className="text-[8px] text-slate-500 font-black uppercase">HP를 즉시 최대치로 회복합니다.</div></div>
                  </div>
                  <button onClick={usePotion} className="pixel-btn px-4 py-2 bg-slate-800 text-yellow-500 font-black text-[10px] hover:bg-slate-700 uppercase">구매 (200골드)</button>
                </div>
                <div className="pixel-card p-4 flex justify-between items-center border-red-800 bg-red-900/10">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">❤️</span>
                    <div><div className="font-black text-sm text-white uppercase">체력 강화의 정수</div><div className="text-[8px] text-slate-500 font-black uppercase">영구적으로 최대 체력을 50 증가시킵니다.</div></div>
                  </div>
                  <button onClick={()=>buyUpgrade('hp')} className="pixel-btn px-4 py-2 bg-slate-800 text-yellow-500 font-black text-[10px] hover:bg-slate-700 uppercase">구매 ({UPGRADE_BASE_PRICE}골드)</button>
                </div>
                <div className="pixel-card p-4 flex justify-between items-center border-orange-800 bg-orange-900/10">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">⚔️</span>
                    <div><div className="font-black text-sm text-white uppercase">힘의 강화 포션</div><div className="text-[8px] text-slate-500 font-black uppercase">기본 공격력을 10 증가시킵니다.</div></div>
                  </div>
                  <button onClick={()=>buyUpgrade('dmg')} className="pixel-btn px-4 py-2 bg-slate-800 text-yellow-500 font-black text-[10px] hover:bg-slate-700 uppercase">구매 ({UPGRADE_BASE_PRICE}골드)</button>
                </div>
              </div>

              <div className="text-[10px] text-blue-400 font-black uppercase border-l-4 border-blue-400 pl-2 mt-8">스킬 습득</div>
              {SHOP_SKILLS.map(skill => (
                <div key={skill.id} className={`pixel-card p-4 flex justify-between items-center ${player.ownedSkillIds.includes(skill.id) ? 'opacity-40 grayscale' : 'hover:border-blue-500 transition-colors'}`}>
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{skill.icon}</span>
                    <div><div className="font-black text-sm text-white uppercase">{skill.name}</div><div className="text-[8px] text-slate-500 font-black uppercase">위력 배율: x{skill.multiplier}</div></div>
                  </div>
                  {player.ownedSkillIds.includes(skill.id) ? <span className="text-[10px] text-slate-500 font-black border-2 border-slate-700 px-3 py-1 uppercase">습득함</span> : <button onClick={() => { if(player.gold>=skill.price){ playSound('buy'); setGameState({...gameState, player: {...player, gold: player.gold-skill.price, ownedSkillIds: [...player.ownedSkillIds, skill.id]}}); showNotify(`${skill.name}을(를) 배웠습니다!`, "success"); } }} className="pixel-btn px-4 py-2 bg-slate-800 text-yellow-500 font-black text-[10px] hover:bg-slate-700 uppercase">구매 ({skill.price}G)</button>}
                </div>
              ))}
              
              <div className="text-[10px] text-amber-500 font-black mt-8 uppercase border-l-4 border-amber-500 pl-2">명품 무기 상점</div>
              {SHOP_WEAPONS.map(weapon => (
                <div key={weapon.id} className={`pixel-card p-4 flex justify-between items-center ${player.ownedWeaponIds.includes(weapon.id) ? 'opacity-40 grayscale' : 'hover:border-amber-500 transition-colors'}`}>
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{weapon.icon}</span>
                    <div><div className={`font-black text-sm uppercase ${TIER_COLORS[weapon.tier]}`}>{weapon.name}</div><div className="text-[8px] text-slate-500 font-black uppercase">공격력: +{weapon.dmgBonus}</div></div>
                  </div>
                  {player.ownedWeaponIds.includes(weapon.id) ? <span className="text-[10px] text-slate-500 font-black border-2 border-slate-700 px-3 py-1 uppercase">보유함</span> : <button onClick={() => { if(player.gold>=weapon.price!){ playSound('buy'); setGameState({...gameState, player: {...player, gold: player.gold-weapon.price!, ownedWeaponIds: [...player.ownedWeaponIds, weapon.id]}, inventory: [...gameState.inventory, {...weapon, reinforceLevel:0, price:undefined}]}); showNotify(`${weapon.name}을(를) 획득했습니다!`, "success"); } }} className="pixel-btn px-4 py-2 bg-slate-800 text-yellow-500 font-black text-[10px] hover:bg-slate-700 uppercase">구매 ({weapon.price}G)</button>}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reinforce' && (
          <div className="space-y-6 animate-splashIn">
            <h3 className="text-xl font-black text-white text-center border-b-2 border-blue-500/30 pb-2 uppercase tracking-widest">저택 대장간</h3>
            <div className="pixel-card p-8 bg-slate-900/40 flex flex-col items-center border-blue-900/60 shadow-[inset_0_0_20px_rgba(59,130,246,0.2)]">
                <div className="text-8xl mb-6 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-pulse">{player.weapon.icon}</div>
                <div className={`text-2xl font-black ${TIER_COLORS[player.weapon.tier]} mb-1 tracking-widest uppercase`}>{player.weapon.name}</div>
                <div className="text-sm text-slate-400 font-black mb-6 uppercase">현재 강화: <span className="text-blue-400">+{player.weapon.reinforceLevel || 0}</span></div>
                <div className="w-full bg-black/80 p-5 border-2 border-slate-800 mb-8 rounded shadow-inner space-y-3 text-xs">
                    <div className="flex justify-between items-center font-black"><span className="text-slate-500 uppercase">성공 확률</span><span className="text-yellow-500">{Math.floor(Math.max(10, 100 - (player.weapon.reinforceLevel || 0) * 10))}%</span></div>
                    <div className="flex justify-between items-center border-t border-slate-900 pt-2 font-black"><span className="text-slate-500 uppercase">강화 비용</span><span className="text-green-500">{((player.weapon.reinforceLevel || 0) + 1) * 1000}G</span></div>
                    <div className="flex justify-between items-center border-t border-slate-900 pt-2 font-black"><span className="text-slate-500 uppercase">추가 데미지</span><span className="text-white">+{player.weapon.dmgBonus} → <span className="text-green-400">+{player.weapon.dmgBonus + 5}</span></span></div>
                </div>
                <button onClick={() => { playSound('click'); handleReinforce(player.weapon); }} className="pixel-btn w-full py-5 bg-blue-700 text-white font-black text-xl hover:bg-blue-600 border-blue-500 uppercase tracking-[0.2em] shadow-lg active:scale-95">강화하기</button>
            </div>
          </div>
        )}

        {activeTab === 'quests' && (
          <div className="space-y-6 animate-splashIn">
            <h3 className="text-xl font-black text-white text-center border-b-2 border-red-500/30 pb-2 uppercase tracking-widest">수행 퀘스트</h3>
            <div className="grid grid-cols-1 gap-4">
              {gameState.activeQuests.map(q => (
                <div key={q.id} className={`pixel-card p-5 border-4 transition-all group ${q.isCompleted ? 'border-green-500 bg-green-950/20 shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'border-slate-800 bg-black/40 hover:border-slate-600'}`}>
                  <div className="flex justify-between text-[11px] font-black mb-2 uppercase tracking-widest">
                    <span className={q.isCompleted ? 'text-green-400' : 'text-slate-500'}>{q.type} 퀘스트</span>
                    <span className={`px-2 py-0.5 rounded ${q.isCompleted ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'}`}>{q.currentCount} / {q.targetCount}</span>
                  </div>
                  <div className={`text-lg font-black tracking-tight uppercase ${q.isCompleted ? 'text-green-400' : 'text-white'}`}>{q.title}</div>
                  <div className={`text-[10px] italic font-black mt-2 leading-relaxed ${q.isCompleted ? 'text-green-500' : 'text-slate-400'}`}>"{q.description}"</div>
                  <div className="mt-4 flex gap-3">
                    <div className="text-[8px] bg-yellow-900/30 border border-yellow-700/50 px-2 py-1 text-yellow-500 font-black uppercase">보상: {q.rewardGold}골드</div>
                    <div className="text-[8px] bg-blue-900/30 border border-blue-700/50 px-2 py-1 text-blue-500 font-black uppercase">경험치: {q.rewardExp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'rank' && (
          <div className="space-y-6 animate-splashIn">
            <h3 className="text-xl font-black text-white text-center border-b-2 border-red-500/30 pb-2 uppercase tracking-widest">명예의 전당</h3>
            <div className="pixel-card overflow-hidden text-[10px] font-black border-4 border-black bg-black/40 shadow-xl">
              <table className="w-full text-left">
                <thead className="bg-[#1a1a24] text-red-500 uppercase border-b-4 border-black">
                  <tr>
                    <th className="p-4 border-r-2 border-black/20">순위</th>
                    <th className="p-4 border-r-2 border-black/20">계승자</th>
                    <th className="p-4 text-center border-r-2 border-black/20">레벨</th>
                    <th className="p-4 text-right">골드</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black/10">
                  {JSON.parse(localStorage.getItem(STORAGE_RANK_KEY)||'[]').map((r: any, i: number) => (
                    <tr key={i} className={`transition-colors ${r.name.toLowerCase() === player.name.toLowerCase() ? 'bg-red-900/30' : 'hover:bg-white/5'}`}>
                      <td className="p-4 text-slate-600 border-r-2 border-black/10">{i + 1}</td>
                      <td className="p-4 text-white uppercase tracking-tighter truncate max-w-[100px] border-r-2 border-black/10">{r.name}</td>
                      <td className="p-4 text-red-500 text-center font-black border-r-2 border-black/10">{r.level}</td>
                      <td className="p-4 text-yellow-500 text-right font-black">{r.gold.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <nav className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full ${platform === 'mobile' ? 'max-w-[420px]' : ''} bg-[#1a1a24] border-t-4 border-black grid grid-cols-8 gap-0 z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]`}>
        {renderTabIcon('status', '👤', '정보')}
        {renderTabIcon('inventory', '🎒', '가방')}
        {renderTabIcon('shop', '🛒', '상점')}
        {renderTabIcon('combat', '⚔️', '전투')}
        {renderTabIcon('quests', '📋', '퀘스트')}
        {renderTabIcon('reinforce', '🔨', '강화')}
        {renderTabIcon('rank', '🏆', '랭킹')}
        {renderTabIcon('boss', '👹', '보스')}
      </nav>
    </div>
  );
};

export default App;

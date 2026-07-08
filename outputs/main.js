(() => {
  "use strict";

  const CONFIG = {
    RUN_DURATION: 270,
    RETURN_WARNING_TIME: 60,
    EVENT_INTERVAL: 25,
    MAP_W: 1800,
    MAP_H: 2400,
    SPEED_SCALE: 72,
    HAZARD_DPS: 10,
    ENEMY_DAMAGE: 10,
    ENEMY_CAP: 3,
    ENDGAME_ENEMY_CAP: 4,
    RETURN_BONUS_RATE: 0.2,
    BONUS_TICKET_PRICE: 50,
    BONUS_TICKET_MAX: 3,
    BONUS_DURATION: 90,
    BONUS_BOX_COUNT: 10,
    BONUS_SUPPLY_COUNT: 3,
    BONUS_HAZARD_COUNT: 2,
    BONUS_ENEMY_CAP: 2,
    BONUS_FAIL_KEEP_RATE: 0.5,
    STORAGE_KEY: "ash-city-messenger-save-v1",
    DEBUG_STORAGE_KEY: "ash-city-messenger-debug-config-v1"
  };

  const DEFAULT_DEBUG_CONFIG = {
    runDuration: 270,
    eventInterval: 25,
    returnWarningTime: 60,
    enemyCap: 3,
    endgameEnemyCap: 4,
    hazardDps: 10,
    rewardMultiplier: 1,
    materialMultiplier: 1,
    survivorSignalRate: 1,
    supplyDropRate: 1,
    interferenceUnitRate: 1
  };

  const DEBUG_CONTROLS = [
    { key: "runDuration", label: "制限時間", min: 180, max: 300, step: 10, unit: "秒" },
    { key: "eventInterval", label: "危険イベント間隔", min: 15, max: 40, step: 1, unit: "秒" },
    { key: "returnWarningTime", label: "帰還警告時間", min: 30, max: 90, step: 5, unit: "秒" },
    { key: "enemyCap", label: "通常敵上限", min: 0, max: 6, step: 1, unit: "体" },
    { key: "endgameEnemyCap", label: "終盤敵上限", min: 0, max: 8, step: 1, unit: "体" },
    { key: "hazardDps", label: "危険区域損傷", min: 3, max: 20, step: 1, unit: "" },
    { key: "rewardMultiplier", label: "配達報酬倍率", min: 0.5, max: 2, step: 0.1, unit: "倍" },
    { key: "materialMultiplier", label: "獲得資材倍率", min: 0.5, max: 3, step: 0.1, unit: "倍" },
    { key: "survivorSignalRate", label: "生存者信号出現率", min: 0, max: 3, step: 0.1, unit: "倍" },
    { key: "supplyDropRate", label: "支援物資出現率", min: 0, max: 3, step: 0.1, unit: "倍" },
    { key: "interferenceUnitRate", label: "妨害ユニット出現率", min: 0, max: 3, step: 0.1, unit: "倍" }
  ];

  const DEBUG_PRESETS = {
    standard: {
      name: "標準",
      values: { runDuration: 270, eventInterval: 25, returnWarningTime: 60, enemyCap: 3, endgameEnemyCap: 4, hazardDps: 10, rewardMultiplier: 1, materialMultiplier: 1 }
    },
    short: {
      name: "短時間テスト",
      values: { runDuration: 180, eventInterval: 18, returnWarningTime: 45, rewardMultiplier: 1.4, materialMultiplier: 1.5 }
    },
    easy: {
      name: "ゆるめ",
      values: { runDuration: 270, eventInterval: 32, enemyCap: 2, endgameEnemyCap: 3, hazardDps: 7, rewardMultiplier: 1 }
    },
    hard: {
      name: "高難度",
      values: { runDuration: 240, eventInterval: 18, enemyCap: 4, endgameEnemyCap: 6, hazardDps: 13, rewardMultiplier: 1.2, materialMultiplier: 1.2 }
    }
  };

  const VEHICLES = {
    alpha: {
      id: "alpha",
      name: "ドローンα",
      role: "高速配送型",
      description: "高速配送型。軽量フレームにより移動速度が高いが、耐久と積載量は低い。冷却品を素早く届ける単発高効率配送に向いた上級者向けの機体。",
      hp: 80,
      speed: 3.6,
      capacity: 1,
      skillName: "オーバーブースト",
      skillText: "2秒間、推進出力を上げて移動速度が大きく上がる",
      skillCooldown: 10,
      skillDuration: 2,
      attackName: "指向性パルス",
      attackText: "前方の妨害機を短い到達距離でまとめて弾く",
      attackCooldown: 0.85
    },
    beta: {
      id: "beta",
      name: "ドローンβ",
      role: "重量輸送型",
      description: "重量輸送型。大型コンテナを搭載でき、耐久も高い。速度は低いが、重量貨物や複数依頼を抱えやすい安定型の機体。",
      hp: 120,
      speed: 2.8,
      capacity: 3,
      skillName: "装甲展開",
      skillText: "3秒間、防護装甲を展開して受ける損傷を大きく減らす",
      skillCooldown: 12,
      skillDuration: 3,
      attackName: "広域ショック",
      attackText: "周囲の妨害機を押し返す近距離パルス",
      attackCooldown: 1.35
    },
    gamma: {
      id: "gamma",
      name: "ドローンγ",
      role: "高機動偵察型",
      description: "高機動偵察型。危険区域への対応力が高く、短時間の高度回避が可能。安全ルートを取りやすく、壊れ物の価値を守りやすい機体。",
      hp: 100,
      speed: 3.3,
      capacity: 2,
      skillName: "高度回避",
      skillText: "2.5秒間、高度を上げて危険区域の影響を大きく抑える",
      skillCooldown: 9,
      skillDuration: 2.5,
      attackName: "直進パルス",
      attackText: "前方へ到達距離の長いパルス弾を放つ",
      attackCooldown: 0.75
    }
  };

  const JOB_TYPES = {
    normal: {
      key: "normal",
      name: "通常荷物",
      reward: 100,
      color: "#f2d45c",
      speedPenalty: 1,
      timeLimit: 0,
      cargoSlots: 1
    },
    medical: {
      key: "medical",
      name: "医療品",
      reward: 180,
      color: "#ff9f6e",
      speedPenalty: 0.96,
      timeLimit: 70,
      cargoSlots: 1
    },
    data: {
      key: "data",
      name: "データ端末",
      reward: 80,
      color: "#77d8ff",
      speedPenalty: 1,
      timeLimit: 0,
      cargoSlots: 1
    },
    fragile: {
      key: "fragile",
      name: "壊れ物",
      reward: 220,
      color: "#ffd36e",
      speedPenalty: 1,
      timeLimit: 0,
      cargoSlots: 1,
      special: "fragile"
    },
    cooling: {
      key: "cooling",
      name: "冷却品",
      reward: 260,
      color: "#9eeaff",
      speedPenalty: 0.96,
      timeLimit: 0,
      cargoSlots: 1,
      special: "cooling"
    },
    heavy: {
      key: "heavy",
      name: "重量貨物",
      reward: 320,
      color: "#c9a15a",
      speedPenalty: 0.78,
      timeLimit: 0,
      cargoSlots: 2,
      special: "heavy"
    }
  };

  const JOB_SPAWN_WEIGHTS = [
    { key: "normal", weight: 28 },
    { key: "medical", weight: 18 },
    { key: "data", weight: 18 },
    { key: "fragile", weight: 14 },
    { key: "cooling", weight: 12 },
    { key: "heavy", weight: 10 }
  ];

  const STAGE_THEMES = {
    central: {
      key: "central",
      name: "灰雨中央区",
      mood: "標準的な灰街",
      buildingSkip: 0.2,
      buildingWidth: [78, 0.62],
      buildingHeight: [82, 0.62],
      hazardCount: 5,
      hazardRadius: [52, 82],
      roadWidth: 84,
      roadEmphasis: "balanced",
      eventWeights: {},
      enemyBias: {},
      colors: {
        ground: "#181b20",
        road: "#343a40",
        roadAlt: "#383f46",
        building: "#080a0d",
        buildingStroke: "#20262d"
      }
    },
    commercial: {
      key: "commercial",
      name: "旧商業区",
      mood: "密集したビル街、狭い道路、通信が乱れやすい",
      buildingSkip: 0.08,
      buildingWidth: [62, 0.5],
      buildingHeight: [66, 0.5],
      hazardCount: 5,
      hazardRadius: [46, 74],
      roadWidth: 68,
      roadEmphasis: "balanced",
      eventWeights: { comms: 1.8, blackout: 1.55 },
      enemyBias: { jammer: 1.8 },
      colors: {
        ground: "#16191f",
        road: "#2d333b",
        roadAlt: "#333a42",
        building: "#05070a",
        buildingStroke: "#26313a"
      }
    },
    flooded: {
      key: "flooded",
      name: "浸水住宅街",
      mood: "低層住宅と水没した道路",
      buildingSkip: 0.24,
      buildingWidth: [58, 0.44],
      buildingHeight: [58, 0.42],
      hazardCount: 6,
      hazardRadius: [54, 86],
      roadWidth: 88,
      roadEmphasis: "balanced",
      eventWeights: { collapse: 1.65, closureWarning: 1.45 },
      enemyBias: { chaser: 1.55 },
      colors: {
        ground: "#152027",
        road: "#2c4751",
        roadAlt: "#34515b",
        building: "#091114",
        buildingStroke: "#22404a"
      }
    },
    industrial: {
      key: "industrial",
      name: "焼却工業地帯",
      mood: "倉庫、煙、火災跡",
      buildingSkip: 0.32,
      buildingWidth: [118, 0.82],
      buildingHeight: [116, 0.78],
      hazardCount: 6,
      hazardRadius: [58, 92],
      roadWidth: 96,
      roadEmphasis: "balanced",
      eventWeights: { fireSpread: 1.8, collapse: 1.45 },
      enemyBias: { patrol: 1.8 },
      colors: {
        ground: "#1c1917",
        road: "#3b3730",
        roadAlt: "#443d34",
        building: "#0d0907",
        buildingStroke: "#3b2f29"
      }
    },
    elevated: {
      key: "elevated",
      name: "第七高架跡",
      mood: "長い直線道路と分断された市街地",
      buildingSkip: 0.18,
      buildingWidth: [78, 0.55],
      buildingHeight: [88, 0.64],
      hazardCount: 4,
      hazardRadius: [50, 78],
      roadWidth: 78,
      roadEmphasis: "axis",
      eventWeights: { wind: 1.75, emergency: 1.45, cargoHack: 1.65 },
      enemyBias: { hacker: 1.85 },
      colors: {
        ground: "#171b20",
        road: "#3b424a",
        roadAlt: "#464d55",
        building: "#090b0e",
        buildingStroke: "#2c343b"
      }
    }
  };

  const STAGE_THEME_KEYS = Object.keys(STAGE_THEMES);

  const AREA_STATUSES = {
    normal: {
      key: "normal",
      name: "通常区域",
      timeRange: [270, 270],
      rewardMultiplier: 1,
      materialMultiplier: 1,
      eventIntervalMultiplier: 1,
      survivorSignalMultiplier: 1,
      recoveryInterrupterMultiplier: 1,
      destinationDistanceMultiplier: 1,
      shortText: "標準的なラン",
      description: "標準的な配送区域です。配達、救助、帰還の判断をいつも通り組み立てられます。"
    },
    emergencyLockdown: {
      key: "emergencyLockdown",
      name: "緊急封鎖区域",
      timeRange: [230, 240],
      rewardMultiplier: 1.2,
      materialMultiplier: 1,
      eventIntervalMultiplier: 0.82,
      survivorSignalMultiplier: 1,
      recoveryInterrupterMultiplier: 1,
      destinationDistanceMultiplier: 1,
      shortText: "短時間 / 報酬+20%",
      description: "封鎖が早まっています。短時間で高報酬を狙い、早めの帰還を判断してください。"
    },
    longHaul: {
      key: "longHaul",
      name: "長距離配送区域",
      timeRange: [300, 310],
      rewardMultiplier: 1.12,
      materialMultiplier: 1,
      eventIntervalMultiplier: 1,
      survivorSignalMultiplier: 1,
      recoveryInterrupterMultiplier: 1,
      destinationDistanceMultiplier: 1.35,
      shortText: "長め / 遠距離配送",
      description: "配送先が広域に分散しています。時間は長めですが、移動計画が重要です。"
    },
    rescuePriority: {
      key: "rescuePriority",
      name: "救助優先区域",
      timeRange: [300, 300],
      rewardMultiplier: 1,
      materialMultiplier: 1,
      eventIntervalMultiplier: 1,
      survivorSignalMultiplier: 1.7,
      recoveryInterrupterMultiplier: 1.35,
      destinationDistanceMultiplier: 1,
      shortText: "長め / 生存者信号増加",
      description: "生存者信号が多く検知されています。配送と救助の優先順位を判断してください。"
    },
    collapseProgress: {
      key: "collapseProgress",
      name: "崩壊進行区域",
      timeRange: [250, 250],
      rewardMultiplier: 1,
      materialMultiplier: 1.2,
      eventIntervalMultiplier: 0.72,
      survivorSignalMultiplier: 1,
      recoveryInterrupterMultiplier: 1,
      destinationDistanceMultiplier: 1,
      shortText: "危険多め / 資材+20%",
      description: "区域の崩壊が進行しています。危険は大きいですが、得られる資材も増えます。"
    }
  };

  const AREA_STATUS_KEYS = Object.keys(AREA_STATUSES);

  const FACILITIES = [
    {
      key: "garage",
      name: "整備工場",
      effect: "機体の最大HPが上がる",
      detail: level => `最大HP +${level * 8}`
    },
    {
      key: "depot",
      name: "配達局",
      effect: "配達報酬が上がる",
      detail: level => `報酬 +${level * 5}%`
    },
    {
      key: "control",
      name: "管制塔",
      effect: "パルス出力と到達距離が少し上がる",
      detail: level => level === 0 ? "パルス補正なし" : `パルス出力 +${level * 15}% / 到達距離 +${level * 12}%`
    },
    {
      key: "medical",
      name: "医療区画",
      effect: "修理地点の回復量が上がる",
      detail: level => level === 0 ? "回復補正なし" : `修理回復 +${level * 6}`
    },
    {
      key: "comms",
      name: "通信設備",
      effect: "通信障害の効果時間が短くなる",
      detail: level => level === 0 ? "通信補正なし" : `通信障害 -${(level * 1.2).toFixed(1)}秒`
    },
    {
      key: "analysis",
      name: "解析室",
      effect: "ラン中強化の候補が良くなりやすい",
      detail: level => level === 0 ? "解析補正なし" : `強化候補 +${level}`
    },
    {
      key: "warehouse",
      name: "倉庫",
      effect: "開始時に積載枠が増える可能性がある",
      detail: level => level === 0 ? "積載ボーナスなし" : `積載+1の確率 ${level * 25}%`
    }
  ];

  const PERSONNEL_FACILITIES = [
    { key: "garage", name: "整備工場" },
    { key: "depot", name: "配達局" },
    { key: "control", name: "管制塔" },
    { key: "medical", name: "医療区画" },
    { key: "comms", name: "通信設備" },
    { key: "analysis", name: "解析室" },
    { key: "warehouse", name: "倉庫" }
  ];

  const SURVIVOR_ROLES = [
    { key: "mechanic", name: "整備士", facility: "garage", effect: "ドローン最大HP上昇" },
    { key: "logistics", name: "物流係", facility: "depot", effect: "配送報酬上昇" },
    { key: "controller", name: "管制士", facility: "control", effect: "危険イベントの予告時間延長" },
    { key: "medic", name: "医療士", facility: "medical", effect: "修理地点の回復量上昇" },
    { key: "operator", name: "通信士", facility: "comms", effect: "通信障害の効果時間短縮" },
    { key: "analyst", name: "解析員", facility: "analysis", effect: "ラン中強化の候補改善" },
    { key: "quartermaster", name: "倉庫番", facility: "warehouse", effect: "積載ボーナス発生率上昇" },
    { key: "scout", name: "偵察員", facility: "control", effect: "依頼地点・危険区域の表示範囲上昇" }
  ];

  const SURVIVOR_TRAITS = ["熟練", "慎重", "器用", "胆力", "地元民", "技師肌"];

  const SURVIVOR_RARITIES = [
    { key: "C", weight: 54, min: 20, max: 45 },
    { key: "B", weight: 30, min: 40, max: 65 },
    { key: "A", weight: 13, min: 60, max: 85 },
    { key: "S", weight: 3, min: 80, max: 100 }
  ];

  const SURVIVOR_NAMES = [
    "灰野ミナト", "煤原ユイ", "朝霧レン", "黒瀬ナギ", "白峰アキ",
    "港町ソラ", "灯屋ミツ", "鉄橋カイ", "雨宮リツ", "桐生ハル",
    "御影セナ", "鳴海トウヤ", "千景マコ", "有坂ノア", "月城イオ",
    "風間サク", "遠野メイ", "神代ルイ", "久遠アヤ", "真壁ジン"
  ];

  const UPGRADE_POOL = [
    {
      key: "lightFrame",
      name: "軽量フレーム",
      text: "速度+10%",
      apply: state => {
        state.player.speedBonus *= 1.1;
      }
    },
    {
      key: "armor",
      name: "補強装甲",
      text: "最大HP+20、現在HPも20回復",
      apply: state => {
        state.player.maxHp += 20;
        state.player.heal(20);
      }
    },
    {
      key: "bag",
      name: "追加バッグ",
      text: "積載枠+1",
      apply: state => {
        state.player.capacity += 1;
      }
    },
    {
      key: "repairKit",
      name: "緊急修理キット",
      text: "HPを30回復",
      apply: state => {
        state.player.heal(30);
      }
    },
    {
      key: "hazardAi",
      name: "危険予測AI",
      text: "危険区域の損傷を35%軽減",
      apply: state => {
        state.player.hazardDamageMultiplier *= 0.65;
      }
    },
    {
      key: "motor",
      name: "高性能モーター",
      text: "加速力アップ",
      apply: state => {
        state.player.accelBonus *= 1.25;
      }
    },
    {
      key: "negotiation",
      name: "報酬交渉術",
      text: "配達報酬+20%",
      apply: state => {
        state.rewardMultiplier *= 1.2;
      }
    },
    {
      key: "cooling",
      name: "冷却システム",
      text: "スキルクールタイム15%短縮",
      apply: state => {
        state.player.cooldownMultiplier *= 0.85;
      }
    }
  ];

  const $ = selector => document.querySelector(selector);

  const dom = {
    screens: [...document.querySelectorAll(".screen")],
    titleScreen: $("#titleScreen"),
    vehicleScreen: $("#vehicleScreen"),
    baseScreen: $("#baseScreen"),
    helpScreen: $("#helpScreen"),
    recordsScreen: $("#recordsScreen"),
    debugScreen: $("#debugScreen"),
    resultScreen: $("#resultScreen"),
    gameScreen: $("#gameScreen"),
    titleSaveSummary: $("#titleSaveSummary"),
    titleNotices: $("#titleNotices"),
    startButton: $("#startButton"),
    bonusButton: $("#bonusButton"),
    baseButton: $("#baseButton"),
    helpButton: $("#helpButton"),
    helpCanvas: $("#helpCanvas"),
    recordsButton: $("#recordsButton"),
    debugButton: $("#debugButton"),
    vehicleModeNote: $("#vehicleModeNote"),
    vehicleList: $("#vehicleList"),
    selectedVehicleLabel: $("#selectedVehicleLabel"),
    vehicleSortieButton: $("#vehicleSortieButton"),
    baseMaterial: $("#baseMaterial"),
    bonusPassPanel: $("#bonusPassPanel"),
    facilityList: $("#facilityList"),
    personnelSummary: $("#personnelSummary"),
    personnelList: $("#personnelList"),
    recordsPanel: $("#recordsPanel"),
    debugPanel: $("#debugPanel"),
    resultPanel: $("#resultPanel"),
    retryButton: $("#retryButton"),
    selectVehicleButton: $("#selectVehicleButton"),
    resultBaseButton: $("#resultBaseButton"),
    resultTitleButton: $("#resultTitleButton"),
    canvasWrap: $("#canvasWrap"),
    canvas: $("#gameCanvas"),
    virtualStick: $("#virtualStick"),
    virtualStickKnob: $("#virtualStickKnob"),
    eventToast: $("#eventToast"),
    floatingPrompt: $("#floatingPrompt"),
    hudTime: $("#hudTime"),
    hudMoney: $("#hudMoney"),
    hudDeliveries: $("#hudDeliveries"),
    hudHp: $("#hudHp"),
    hudCargo: $("#hudCargo"),
    jobPanel: $("#jobPanel"),
    attackButton: $("#attackButton"),
    skillButton: $("#skillButton"),
    returnButton: $("#returnButton"),
    upgradeOverlay: $("#upgradeOverlay"),
    upgradeChoices: $("#upgradeChoices")
  };

  const ctx = dom.canvas.getContext("2d");

  const app = {
    save: loadSave(),
    debugConfig: loadDebugConfig(),
    input: null,
    state: null,
    mode: "title",
    lastFrame: performance.now(),
    lastVehicleId: "alpha",
    selectedVehicleId: "alpha",
    pendingRunMode: "normal",
    result: null
  };

  class InputManager {
    constructor(canvas) {
      this.canvas = canvas;
      this.keys = new Set();
      this.keyCodes = new Set();
      this.pointerActive = false;
      this.pointerId = null;
      this.pointer = { x: 0, y: 0 };
      this.joystickStart = { x: 0, y: 0 };
      this.joystickVector = { x: 0, y: 0 };
      this.joystickMax = 46;
      this.activeGamepadIndex = null;
      this.lastPadAttack = false;
      this.lastPadSkill = false;

      window.addEventListener("keydown", event => {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "w", "a", "s", "d", "j", "W", "A", "S", "D", "J"].includes(event.key)) {
          event.preventDefault();
        }
        this.keys.add(event.key.toLowerCase());
        this.keyCodes.add(event.code);
        if (event.repeat) return;
        if (event.code === "Space" && app.mode === "playing") {
          activateSkill();
        }
        if (event.code === "KeyJ" && app.mode === "playing") {
          activateAttack();
        }
      });

      window.addEventListener("keyup", event => {
        this.keys.delete(event.key.toLowerCase());
        this.keyCodes.delete(event.code);
      });

      canvas.addEventListener("pointerdown", event => {
        if (app.mode !== "playing") return;
        if (event.pointerType === "mouse") {
          if (event.button === 0) {
            event.preventDefault();
            activateAttack();
          }
          return;
        }
        event.preventDefault();
        this.pointerActive = true;
        this.pointerId = event.pointerId;
        this.startJoystick(event);
        canvas.setPointerCapture(event.pointerId);
      });

      canvas.addEventListener("pointermove", event => {
        if (!this.pointerActive || event.pointerId !== this.pointerId) return;
        event.preventDefault();
        this.updatePointer(event);
      });

      canvas.addEventListener("pointerup", event => {
        if (event.pointerId !== this.pointerId) return;
        event.preventDefault();
        this.pointerActive = false;
        this.pointerId = null;
        this.joystickVector = { x: 0, y: 0 };
        this.hideJoystick();
      });

      canvas.addEventListener("pointercancel", () => {
        this.pointerActive = false;
        this.pointerId = null;
        this.joystickVector = { x: 0, y: 0 };
        this.hideJoystick();
      });

      window.addEventListener("gamepadconnected", event => {
        this.activeGamepadIndex = event.gamepad.index;
        if (app.state && app.mode === "playing") {
          app.state.pushMessage("ゲームパッド接続");
        }
      });

      window.addEventListener("gamepaddisconnected", event => {
        if (this.activeGamepadIndex === event.gamepad.index) {
          this.activeGamepadIndex = null;
        }
      });
    }

    pollGamepadActions() {
      const pad = this.getActiveGamepad();
      if (!pad) {
        this.lastPadAttack = false;
        this.lastPadSkill = false;
        return;
      }

      const attackPressed = [0, 2, 5, 7].some(index => this.isButtonPressed(pad, index));
      const skillPressed = [1, 3, 4, 6].some(index => this.isButtonPressed(pad, index));

      if (attackPressed && !this.lastPadAttack && app.mode === "playing") {
        activateAttack();
      }
      if (skillPressed && !this.lastPadSkill && app.mode === "playing") {
        activateSkill();
      }

      this.lastPadAttack = attackPressed;
      this.lastPadSkill = skillPressed;
    }

    updatePointer(event) {
      const rect = this.canvas.getBoundingClientRect();
      this.pointer.x = event.clientX - rect.left;
      this.pointer.y = event.clientY - rect.top;
      const dx = this.pointer.x - this.joystickStart.x;
      const dy = this.pointer.y - this.joystickStart.y;
      const len = Math.hypot(dx, dy);
      if (len < 10) {
        this.joystickVector = { x: 0, y: 0 };
      } else {
        this.joystickVector = { x: dx / len, y: dy / len };
      }
      this.moveJoystickKnob(dx, dy, len);
    }

    startJoystick(event) {
      const rect = this.canvas.getBoundingClientRect();
      this.pointer.x = event.clientX - rect.left;
      this.pointer.y = event.clientY - rect.top;
      this.joystickStart = { ...this.pointer };
      this.joystickVector = { x: 0, y: 0 };
      dom.virtualStick.hidden = false;
      dom.virtualStick.style.left = `${this.joystickStart.x}px`;
      dom.virtualStick.style.top = `${this.joystickStart.y}px`;
      this.moveJoystickKnob(0, 0, 0);
    }

    moveJoystickKnob(dx, dy, len) {
      const scale = len > this.joystickMax ? this.joystickMax / len : 1;
      dom.virtualStickKnob.style.transform = `translate(${dx * scale}px, ${dy * scale}px)`;
    }

    hideJoystick() {
      dom.virtualStick.hidden = true;
      dom.virtualStickKnob.style.transform = "translate(0, 0)";
    }

    getVector() {
      let x = 0;
      let y = 0;
      if (this.keyCodes.has("ArrowLeft") || this.keyCodes.has("KeyA") || this.keys.has("arrowleft") || this.keys.has("a")) x -= 1;
      if (this.keyCodes.has("ArrowRight") || this.keyCodes.has("KeyD") || this.keys.has("arrowright") || this.keys.has("d")) x += 1;
      if (this.keyCodes.has("ArrowUp") || this.keyCodes.has("KeyW") || this.keys.has("arrowup") || this.keys.has("w")) y -= 1;
      if (this.keyCodes.has("ArrowDown") || this.keyCodes.has("KeyS") || this.keys.has("arrowdown") || this.keys.has("s")) y += 1;

      if (x !== 0 || y !== 0) {
        return normalize({ x, y });
      }

      if (this.pointerActive) return this.joystickVector;

      return this.getGamepadVector();
    }

    getActiveGamepad() {
      if (!navigator.getGamepads) return null;
      const pads = navigator.getGamepads();
      if (this.activeGamepadIndex != null && pads[this.activeGamepadIndex]?.connected) {
        return pads[this.activeGamepadIndex];
      }

      let best = null;
      let bestSignal = 0;
      for (const pad of pads) {
        if (!pad || !pad.connected) continue;
        const stick = this.readPadStick(pad);
        const buttonSignal = pad.buttons.some(button => button.pressed) ? 1 : 0;
        const signal = Math.hypot(stick.x, stick.y) + buttonSignal;
        if (signal > bestSignal) {
          best = pad;
          bestSignal = signal;
        } else if (!best) {
          best = pad;
        }
      }
      if (best) this.activeGamepadIndex = best.index;
      return best;
    }

    isButtonPressed(pad, index) {
      const button = pad.buttons[index];
      return Boolean(button && button.pressed);
    }

    getGamepadVector() {
      const pad = this.getActiveGamepad();
      if (!pad) return { x: 0, y: 0 };

      const stick = this.readPadStick(pad);
      let x = stick.x;
      let y = stick.y;
      if (this.isButtonPressed(pad, 14)) x -= 1;
      if (this.isButtonPressed(pad, 15)) x += 1;
      if (this.isButtonPressed(pad, 12)) y -= 1;
      if (this.isButtonPressed(pad, 13)) y += 1;

      if (x === 0 && y === 0) return { x: 0, y: 0 };
      return normalize({ x, y });
    }

    readPadStick(pad) {
      const candidates = [
        [pad.axes[0] || 0, pad.axes[1] || 0],
        [pad.axes[2] || 0, pad.axes[3] || 0],
        [pad.axes[6] || 0, pad.axes[7] || 0]
      ];
      let best = { x: 0, y: 0, power: 0 };
      for (const [rawX, rawY] of candidates) {
        const x = Math.abs(rawX) > 0.16 ? rawX : 0;
        const y = Math.abs(rawY) > 0.16 ? rawY : 0;
        const power = Math.hypot(x, y);
        if (power > best.power) best = { x, y, power };
      }
      return best.power > 0 ? { x: best.x, y: best.y } : { x: 0, y: 0 };
    }
  }

  class Player {
    constructor(vehicleId, save) {
      vehicleId = normalizeVehicleId(vehicleId);
      this.vehicle = VEHICLES[vehicleId];
      this.vehicleId = vehicleId;
      const warehouseLevel = save.facilities.warehouse || 0;
      this.personnelEffects = getPersonnelEffects(save);
      const warehouseChance = warehouseLevel * 0.25 + this.personnelEffects.warehouseChanceBonus;
      this.warehouseBonus = warehouseChance > 0 && Math.random() < warehouseChance ? 1 : 0;
      this.x = CONFIG.MAP_W / 2;
      this.y = CONFIG.MAP_H - 190;
      this.radius = 16;
      this.vx = 0;
      this.vy = 0;
      this.maxHp = this.vehicle.hp + (save.facilities.garage || 0) * 8 + this.personnelEffects.maxHpBonus;
      this.hp = this.maxHp;
      this.baseSpeed = this.vehicle.speed * CONFIG.SPEED_SCALE;
      this.capacity = this.vehicle.capacity + this.warehouseBonus;
      this.skillCooldown = 0;
      this.skillActive = 0;
      this.attackCooldown = 0;
      this.tempSpeedTimer = 0;
      this.tempSpeedMultiplier = 1;
      this.speedBonus = 1;
      this.accelBonus = 1;
      this.hazardDamageMultiplier = 1;
      this.cooldownMultiplier = 1;
      const controlLevel = save.facilities.control || 0;
      this.attackDamageBonus = 1 + controlLevel * 0.15;
      this.attackRangeBonus = 1 + controlLevel * 0.12;
      this.facing = { x: 0, y: -1 };
    }

    getCargo(state) {
      return state.jobs.filter(job => job.status === "carried");
    }

    getSpeedMultiplier(state) {
      let mult = this.speedBonus;
      if (this.tempSpeedTimer > 0) mult *= this.tempSpeedMultiplier;
      for (const job of this.getCargo(state)) {
        mult *= job.type.speedPenalty;
      }
      if (state.protectedSurvivors.length > 0) {
        mult *= Math.pow(state.getProtectedSurvivorSpeedMultiplier(), state.protectedSurvivors.length);
      }
      if (state.liftProgress) mult *= 0.18;
      if (this.vehicleId === "alpha" && this.skillActive > 0) mult *= 1.75;
      return mult;
    }

    getDamageMultiplier(kind) {
      let mult = 1;
      if (this.vehicleId === "beta" && this.skillActive > 0) mult *= 0.25;
      if (kind === "hazard") {
        if (this.vehicleId === "gamma") mult *= 0.75;
        if (this.vehicleId === "gamma" && this.skillActive > 0) mult = 0;
        mult *= this.hazardDamageMultiplier;
      }
      return mult;
    }

    update(dt, state, input) {
      this.skillCooldown = Math.max(0, this.skillCooldown - dt);
      this.skillActive = Math.max(0, this.skillActive - dt);
      this.attackCooldown = Math.max(0, this.attackCooldown - dt);
      this.tempSpeedTimer = Math.max(0, this.tempSpeedTimer - dt);

      const move = input.getVector();
      if (move.x !== 0 || move.y !== 0) {
        this.facing = move;
      }

      const maxSpeed = this.baseSpeed * this.getSpeedMultiplier(state);
      let targetVx = move.x * maxSpeed;
      let targetVy = move.y * maxSpeed;
      let accel = 8.5 * this.accelBonus;
      if (this.getCargo(state).some(job => job.type.special === "heavy")) {
        accel *= 0.82;
      }

      if (state.windTimer > 0) {
        targetVx += state.windVector.x;
        targetVy += state.windVector.y;
        accel *= 0.55;
      }

      this.vx += (targetVx - this.vx) * clamp(dt * accel, 0, 1);
      this.vy += (targetVy - this.vy) * clamp(dt * accel, 0, 1);

      const nextX = clamp(this.x + this.vx * dt, this.radius, CONFIG.MAP_W - this.radius);
      if (!state.collidesWithBuilding(nextX, this.y, this.radiusForCollision())) {
        this.x = nextX;
      } else {
        this.vx *= -0.12;
      }

      const nextY = clamp(this.y + this.vy * dt, this.radius, CONFIG.MAP_H - this.radius);
      if (!state.collidesWithBuilding(this.x, nextY, this.radiusForCollision())) {
        this.y = nextY;
      } else {
        this.vy *= -0.12;
      }
    }

    radiusForCollision() {
      return this.vehicleId === "gamma" ? this.radius * (this.skillActive > 0 ? 0.55 : 0.74) : this.radius;
    }

    activateSkill(state) {
      if (this.skillCooldown > 0) return false;
      this.skillActive = this.vehicle.skillDuration;
      this.skillCooldown = this.vehicle.skillCooldown * this.cooldownMultiplier;
      state.runLog.skillUsed += 1;
      state.pushMessage(`${this.vehicle.skillName} 発動`);
      return true;
    }

    attack(state) {
      if (this.attackCooldown > 0) return false;
      const heavyCooldown = this.getCargo(state).some(job => job.type.special === "heavy") ? 1.12 : 1;
      this.attackCooldown = this.vehicle.attackCooldown * heavyCooldown;
      state.runLog.pulseUsed += 1;
      const dir = normalize(this.facing);

      if (this.vehicleId === "alpha") {
        const range = 138 * this.attackRangeBonus;
        const damage = 24 * this.attackDamageBonus;
        const count = state.hitEnemiesInCone(this.x, this.y, dir, range, Math.PI / 3, damage);
        state.attackEffects.push({ type: "cone", x: this.x, y: this.y, dir, range, ttl: 0.16, color: "#48d6ee" });
        state.pushPrompt(count > 0 ? `指向性パルス ${count}機命中` : "指向性パルス");
      } else if (this.vehicleId === "beta") {
        const radius = 92 * this.attackRangeBonus;
        const damage = 20 * this.attackDamageBonus;
        const count = state.hitEnemiesInRadius(this.x, this.y, radius, damage);
        state.attackEffects.push({ type: "ring", x: this.x, y: this.y, radius, ttl: 0.18, color: "#ffd36d" });
        state.pushPrompt(count > 0 ? `広域ショック ${count}機命中` : "広域ショック");
      } else {
        const range = 290 * this.attackRangeBonus;
        const damage = 28 * this.attackDamageBonus;
        state.projectiles.push(new Projectile(this.x, this.y, dir, range, damage));
        state.attackEffects.push({ type: "flash", x: this.x, y: this.y, dir, range: 42, ttl: 0.12, color: "#9ee7ff" });
        state.pushPrompt("直進パルス");
      }
      return true;
    }

    damage(amount, kind, state) {
      const applied = amount * this.getDamageMultiplier(kind);
      if (applied <= 0) return 0;
      this.hp = Math.max(0, this.hp - applied);
      state.damageTaken += applied;
      if (state && typeof state.onPlayerDamaged === "function") {
        state.onPlayerDamaged(applied, kind);
      }
      return applied;
    }

    heal(amount) {
      this.hp = Math.min(this.maxHp, this.hp + amount);
    }
  }

  class DeliveryJob {
    constructor(typeKey, pickup, destination, urgent = false) {
      this.id = cryptoId();
      this.type = { ...JOB_TYPES[typeKey] };
      this.pickup = pickup;
      this.destination = destination;
      this.status = "available";
      this.urgent = urgent;
      this.expire = urgent ? (this.type.pickupExpire || 48) : 0;
      this.remaining = this.type.timeLimit;
      if (urgent && !this.type.eventOnly) {
        this.type.reward = Math.round(this.type.reward * 1.45);
        this.type.name = `緊急${this.type.name}`;
      }
      this.baseReward = this.type.reward;
      this.currentReward = this.baseReward;
      this.rewardMultiplier = 1;
      this.damageCount = 0;
      this.age = 0;
      this.coolingStep = 0;
      this.cargoSlots = this.type.cargoSlots || 1;
    }

    update(dt, state = null) {
      if (this.status === "available" && this.expire > 0) {
        this.expire -= dt;
      }
      if (this.status === "carried" && this.remaining > 0) {
        this.remaining -= dt;
      }
      if (this.status === "carried" && this.type.special === "cooling") {
        const before = this.currentReward;
        this.age += dt;
        const nextStep = Math.floor(this.age / 10);
        this.rewardMultiplier = Math.max(0.35, Math.pow(0.92, nextStep));
        this.currentReward = Math.floor(this.baseReward * this.rewardMultiplier);
        if (nextStep > this.coolingStep && this.currentReward < before && state) {
          state.pushMessage("冷却品の価値が低下");
        }
        this.coolingStep = nextStep;
      }
    }

    isExpired() {
      return this.status === "available" && this.expire <= 0 && this.urgent;
    }

    take() {
      this.status = "carried";
      if (this.type.timeLimit > 0) {
        this.remaining = this.type.timeLimit;
      }
      if (this.type.special === "cooling") {
        this.age = 0;
        this.coolingStep = 0;
        this.rewardMultiplier = 1;
        this.currentReward = this.baseReward;
      }
    }

    getReward(state) {
      const depotBonus = 1 + (state.save.facilities.depot || 0) * 0.05;
      const personnelBonus = 1 + state.personnelEffects.rewardBonus;
      const latePenalty = this.type.timeLimit > 0 && this.remaining <= 0 ? 0.7 : 1;
      const hackPenalty = this.hacked ? 0.85 : 1;
      const rewardBase = this.currentReward ?? this.type.reward;
      return Math.round(rewardBase * state.rewardMultiplier * getBalanceValue("rewardMultiplier") * depotBonus * personnelBonus * latePenalty * hackPenalty);
    }

    applyFragileDamage() {
      if (this.status !== "carried" || this.type.special !== "fragile") return false;
      const before = this.currentReward;
      this.damageCount += 1;
      this.rewardMultiplier = Math.max(0.4, this.rewardMultiplier * 0.8);
      this.currentReward = Math.floor(this.baseReward * this.rewardMultiplier);
      return this.currentReward < before;
    }

    getValuePercent() {
      return Math.round(((this.currentReward ?? this.baseReward) / this.baseReward) * 100);
    }
  }

  class Hazard {
    constructor(x, y, radius, ttl = 0) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.ttl = ttl;
      this.pulse = Math.random() * Math.PI * 2;
    }

    update(dt) {
      if (this.ttl > 0) this.ttl -= dt;
      this.pulse += dt * 2.5;
    }

    isDead() {
      return this.ttl < 0;
    }
  }

  class WarningZone {
    constructor(x, y, radius, timer = 8, finalTtl = 45) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.timer = timer;
      this.finalTtl = finalTtl;
      this.pulse = 0;
      this.dead = false;
      this.spawnGuard = false;
    }

    update(dt, state) {
      this.timer -= dt;
      this.pulse += dt * 5;
      if (this.timer <= 0 && !this.dead) {
        this.dead = true;
        state.hazards.push(new Hazard(this.x, this.y, this.radius, this.finalTtl));
        if (this.spawnGuard) {
          state.spawnEnemy("patrol", { origin: this, message: true });
        }
        state.pushMessage("封鎖開始: 迂回推奨");
      }
    }

    isDead() {
      return this.dead;
    }
  }

  class SpreadHazard {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.startRadius = 35;
      this.maxRadius = 110;
      this.radius = this.startRadius;
      this.growTime = 14;
      this.ttl = 45;
      this.elapsed = 0;
      this.pulse = Math.random() * Math.PI * 2;
      this.maxMessageSent = false;
    }

    update(dt, state) {
      this.elapsed += dt;
      this.ttl -= dt;
      this.pulse += dt * 4;
      const t = clamp(this.elapsed / this.growTime, 0, 1);
      this.radius = this.startRadius + (this.maxRadius - this.startRadius) * t;
      if (t >= 1 && !this.maxMessageSent) {
        this.maxMessageSent = true;
        state.pushMessage("火災拡大: 迂回推奨");
      }
    }

    isDead() {
      return this.ttl <= 0;
    }
  }

  class SupplyDrop {
    constructor(point, ttl = 28) {
      this.x = point.x;
      this.y = point.y;
      this.radius = 24;
      this.ttl = ttl;
      this.pulse = 0;
      this.dead = false;
    }

    update(dt, state) {
      this.ttl -= dt;
      this.pulse += dt * 5;
      if (dist(this.x, this.y, state.player.x, state.player.y) < this.radius + state.player.radius) {
        this.collect(state);
      }
      if (this.ttl <= 0 && !this.dead) {
        this.dead = true;
        state.pushMessage("支援物資が消失");
      }
    }

    collect(state) {
      if (this.dead) return;
      this.dead = true;
      state.supplyDropsCollected += 1;
      state.runLog.supplyCollected += 1;
      const effect = pick(["heal", "money", "speed", "cooldown"]);
      if (effect === "heal") {
        state.player.heal(25);
        state.pushMessage("支援物資を回収: HP+25");
      }
      if (effect === "money") {
        state.money += 120;
        state.pushMessage("支援物資を回収: 所持金+120");
      }
      if (effect === "speed") {
        state.player.tempSpeedMultiplier = 1.15;
        state.player.tempSpeedTimer = 10;
        state.pushMessage("支援物資を回収: 速度上昇");
      }
      if (effect === "cooldown") {
        state.player.skillCooldown = 0;
        state.pushMessage("支援物資を回収: スキル冷却完了");
      }
      const reactionChance = state.runMode === "bonus" ? 0.12 : 0.28;
      if (chanceByMultiplier(reactionChance, "interferenceUnitRate")) {
        state.spawnEnemy("chaser", { origin: this, message: true });
      }
    }

    isDead() {
      return this.dead;
    }
  }

  class MaterialBox {
    constructor(point) {
      this.x = point.x;
      this.y = point.y;
      this.radius = 20;
      this.value = Math.round(rand(5, 15));
      this.dead = false;
      this.pulse = Math.random() * Math.PI * 2;
    }

    update(dt, state) {
      this.pulse += dt * 4;
      if (dist(this.x, this.y, state.player.x, state.player.y) < this.radius + state.player.radius) {
        this.collect(state);
      }
    }

    collect(state) {
      if (this.dead) return;
      this.dead = true;
      state.bonusMaterials += this.value;
      state.bonusBoxesCollected += 1;
      state.pushMessage(`資材箱を回収 +${this.value}`);
    }

    isDead() {
      return this.dead;
    }
  }

  class SurvivorSignal {
    constructor(point) {
      this.id = cryptoId();
      this.x = point.x;
      this.y = point.y;
      this.radius = 26;
      this.pulse = Math.random() * Math.PI * 2;
      this.dead = false;
      this.survivor = generateSurvivor();
    }

    update(dt) {
      this.pulse += dt * 4;
    }

    isDead() {
      return this.dead;
    }
  }

  class Projectile {
    constructor(x, y, dir, range, damage) {
      this.x = x;
      this.y = y;
      this.dir = dir;
      this.range = range;
      this.damage = damage;
      this.speed = 430;
      this.radius = 7;
      this.traveled = 0;
      this.dead = false;
    }

    update(dt, state) {
      const move = this.speed * dt;
      this.x += this.dir.x * move;
      this.y += this.dir.y * move;
      this.traveled += move;
      if (this.traveled >= this.range) this.dead = true;

      for (const enemy of state.enemies) {
        if (enemy.dead || enemy.isDead()) continue;
        if (dist(this.x, this.y, enemy.x, enemy.y) < this.radius + enemy.radius) {
          enemy.damage(this.damage, state);
          this.dead = true;
          break;
        }
      }
    }

    isDead() {
      return this.dead;
    }
  }

  class ChaserDrone {
    constructor(point, life = rand(40, 60)) {
      this.type = "chaser";
      this.displayName = "追跡妨害機";
      this.x = point.x;
      this.y = point.y;
      this.radius = 13;
      this.hitCooldown = 0;
      this.life = life;
      this.hp = 34;
      this.dead = false;
      this.disabled = false;
    }

    update(dt, state) {
      this.life -= dt;
      this.hitCooldown = Math.max(0, this.hitCooldown - dt);
      const dx = state.player.x - this.x;
      const dy = state.player.y - this.y;
      const len = Math.hypot(dx, dy) || 1;
      const speed = len < 520 ? 92 : 42;
      this.x += (dx / len) * speed * dt;
      this.y += (dy / len) * speed * dt;

      if (len < this.radius + state.player.radius && this.hitCooldown <= 0) {
        state.player.damage(CONFIG.ENEMY_DAMAGE, "enemy", state);
        state.pushPrompt("接触ショック");
        this.hitCooldown = 1.2;
      }
    }

    damage(amount, state) {
      if (this.dead) return;
      this.hp -= amount;
      if (this.hp <= 0) {
        this.dead = true;
        this.disabled = true;
        state.onEnemyDisabled();
        state.pushMessage("追跡妨害機を無力化");
      }
    }

    isDead() {
      return this.life <= 0 || this.dead;
    }
  }

  class JammerDrone {
    constructor(point) {
      this.type = "jammer";
      this.displayName = "ジャマー";
      this.x = point.x;
      this.y = point.y;
      this.radius = 14;
      this.effectRadius = 180;
      this.life = 45;
      this.hp = 20;
      this.dead = false;
      this.disabled = false;
      this.drift = rand(0, Math.PI * 2);
    }

    update(dt, state) {
      this.life -= dt;
      this.drift += dt * 0.8;
      this.x = clamp(this.x + Math.cos(this.drift) * 18 * dt, this.radius, CONFIG.MAP_W - this.radius);
      this.y = clamp(this.y + Math.sin(this.drift * 0.7) * 18 * dt, this.radius, CONFIG.MAP_H - this.radius);
      if (state.collidesWithBuilding(this.x, this.y, this.radius)) {
        this.drift += Math.PI * 0.7;
      }
      if (dist(this.x, this.y, state.player.x, state.player.y) < this.effectRadius) {
        state.pushPrompt("信号妨害");
      }
    }

    damage(amount, state) {
      if (this.dead) return;
      this.hp -= amount;
      if (this.hp <= 0) {
        this.dead = true;
        this.disabled = true;
        state.onEnemyDisabled();
        state.pushMessage("ジャマーを無力化");
      }
    }

    isDead() {
      return this.life <= 0 || this.dead;
    }
  }

  class RecoveryInterrupter {
    constructor(point, targetSignal = null) {
      this.type = "recovery";
      this.displayName = "回収妨害機";
      this.x = point.x;
      this.y = point.y;
      this.radius = 12;
      this.hitCooldown = 0;
      this.life = 45;
      this.hp = 24;
      this.dead = false;
      this.disabled = false;
      this.targetSignal = targetSignal;
    }

    update(dt, state) {
      this.life -= dt;
      this.hitCooldown = Math.max(0, this.hitCooldown - dt);
      const target = state.liftProgress?.signal || (state.protectedSurvivors.length > 0 ? state.player : this.targetSignal) || state.player;
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const len = Math.hypot(dx, dy) || 1;
      const speed = target === state.player ? 78 : 62;
      this.x += (dx / len) * speed * dt;
      this.y += (dy / len) * speed * dt;

      const playerDistance = dist(this.x, this.y, state.player.x, state.player.y);
      if (playerDistance < this.radius + state.player.radius && this.hitCooldown <= 0) {
        if (state.liftProgress) {
          state.interruptLift("リフト回収が妨害された");
        }
        state.player.damage(6, "enemy", state);
        state.pushPrompt("接触ショック");
        this.hitCooldown = 1.2;
      }
    }

    damage(amount, state) {
      if (this.dead) return;
      this.hp -= amount;
      if (this.hp <= 0) {
        this.dead = true;
        this.disabled = true;
        state.onEnemyDisabled();
        state.pushMessage("回収妨害機を無力化");
      }
    }

    isDead() {
      return this.life <= 0 || this.dead;
    }
  }

  class PatrolDrone {
    constructor(point, anchor = null) {
      this.type = "patrol";
      this.displayName = "警備ドローン";
      this.x = point.x;
      this.y = point.y;
      this.anchor = anchor || { x: point.x, y: point.y };
      const angle = rand(0, Math.PI * 2);
      this.patrolA = {
        x: clamp(this.anchor.x + Math.cos(angle) * 90, 80, CONFIG.MAP_W - 80),
        y: clamp(this.anchor.y + Math.sin(angle) * 90, 80, CONFIG.MAP_H - 80)
      };
      this.patrolB = {
        x: clamp(this.anchor.x - Math.cos(angle) * 90, 80, CONFIG.MAP_W - 80),
        y: clamp(this.anchor.y - Math.sin(angle) * 90, 80, CONFIG.MAP_H - 80)
      };
      this.targetPatrol = this.patrolA;
      this.radius = 14;
      this.alertRadius = 155;
      this.alertTimer = 0;
      this.dashTimer = 0;
      this.dashVector = { x: 0, y: 0 };
      this.hitCooldown = 0;
      this.life = 60;
      this.hp = 40;
      this.dead = false;
      this.disabled = false;
    }

    update(dt, state) {
      this.life -= dt;
      this.hitCooldown = Math.max(0, this.hitCooldown - dt);
      const playerDistance = dist(this.x, this.y, state.player.x, state.player.y);

      if (this.dashTimer > 0) {
        this.dashTimer -= dt;
        this.x = clamp(this.x + this.dashVector.x * 250 * dt, this.radius, CONFIG.MAP_W - this.radius);
        this.y = clamp(this.y + this.dashVector.y * 250 * dt, this.radius, CONFIG.MAP_H - this.radius);
      } else if (playerDistance < this.alertRadius) {
        this.alertTimer += dt;
        if (this.alertTimer > 0.12 && this.alertTimer - dt <= 0.12) {
          state.pushMessage("警備ドローンに捕捉された");
        }
        if (this.alertTimer >= 0.8) {
          this.dashVector = normalize({ x: state.player.x - this.x, y: state.player.y - this.y });
          this.dashTimer = 0.55;
          this.alertTimer = 0;
        }
      } else {
        this.alertTimer = 0;
        const dx = this.targetPatrol.x - this.x;
        const dy = this.targetPatrol.y - this.y;
        const len = Math.hypot(dx, dy) || 1;
        this.x += (dx / len) * 54 * dt;
        this.y += (dy / len) * 54 * dt;
        if (len < 18) {
          this.targetPatrol = this.targetPatrol === this.patrolA ? this.patrolB : this.patrolA;
        }
      }

      if (dist(this.x, this.y, state.player.x, state.player.y) < this.radius + state.player.radius && this.hitCooldown <= 0) {
        state.player.damage(12, "enemy", state);
        state.pushPrompt("接触ショック");
        this.hitCooldown = 1.2;
      }
    }

    damage(amount, state) {
      if (this.dead) return;
      this.hp -= amount;
      if (this.hp <= 0) {
        this.dead = true;
        this.disabled = true;
        state.onEnemyDisabled();
        state.pushMessage("警備ドローンを無力化");
      }
    }

    isDead() {
      return this.life <= 0 || this.dead;
    }
  }

  class CargoHacker {
    constructor(point) {
      this.type = "hacker";
      this.displayName = "カーゴハッカー";
      this.x = point.x;
      this.y = point.y;
      this.radius = 12;
      this.hitCooldown = 0;
      this.life = 45;
      this.hp = 22;
      this.dead = false;
      this.disabled = false;
      this.drift = rand(0, Math.PI * 2);
    }

    update(dt, state) {
      this.life -= dt;
      this.hitCooldown = Math.max(0, this.hitCooldown - dt);
      const dx = state.player.x - this.x;
      const dy = state.player.y - this.y;
      const len = Math.hypot(dx, dy) || 1;
      const wobble = { x: Math.cos(this.drift) * 0.22, y: Math.sin(this.drift) * 0.22 };
      this.drift += dt * 2.2;
      const dir = normalize({ x: dx / len + wobble.x, y: dy / len + wobble.y });
      this.x += dir.x * 58 * dt;
      this.y += dir.y * 58 * dt;

      if (len < this.radius + state.player.radius && this.hitCooldown <= 0) {
        this.contaminateCargo(state);
        this.hitCooldown = 2;
      }
    }

    contaminateCargo(state) {
      if (state.money > 0) {
        state.money = Math.max(0, state.money - 30);
      } else {
        const cargo = state.player.getCargo(state).find(job => !job.hacked);
        if (cargo) cargo.hacked = true;
      }
      state.pushMessage("配送データが汚染された");
    }

    damage(amount, state) {
      if (this.dead) return;
      this.hp -= amount;
      if (this.hp <= 0) {
        this.dead = true;
        this.disabled = true;
        state.onEnemyDisabled();
        state.pushMessage("カーゴハッカーを無力化");
      }
    }

    isDead() {
      return this.life <= 0 || this.dead;
    }
  }

  class GameState {
    constructor(vehicleId, save, runMode = "normal") {
      this.save = save;
      this.runMode = runMode;
      this.stageTheme = runMode === "bonus" ? STAGE_THEMES.central : pickStageTheme();
      this.areaStatus = runMode === "bonus" ? AREA_STATUSES.normal : pickAreaStatus();
      this.personnelEffects = getPersonnelEffects(save);
      this.player = new Player(vehicleId, save);
      this.time = runMode === "bonus" ? CONFIG.BONUS_DURATION : getAreaRunDuration(this.areaStatus);
      this.money = 0;
      this.deliveries = 0;
      this.damageTaken = 0;
      this.supplyDropsCollected = 0;
      this.bonusBoxesCollected = 0;
      this.bonusMaterials = 0;
      this.runLog = createRunLog();
      this.wasInHazard = false;
      this.fragileDamageCooldown = 0;
      this.rewardMultiplier = this.areaStatus.rewardMultiplier || 1;
      this.materialMultiplier = this.areaStatus.materialMultiplier || 1;
      this.over = false;
      this.buildings = [];
      this.roads = [];
      this.hazards = [];
      this.warningZones = [];
      this.supplyDrops = [];
      this.materialBoxes = [];
      this.survivorSignals = [];
      this.protectedSurvivors = [];
      this.liftProgress = null;
      this.jobs = [];
      this.enemies = [];
      this.projectiles = [];
      this.attackEffects = [];
      this.repairSites = [];
      this.upgradeSites = [];
      this.returnPoint = { x: this.player.x, y: this.player.y };
      this.blackoutTimer = 0;
      this.windTimer = 0;
      this.commsTimer = 0;
      this.windVector = { x: 0, y: 0 };
      this.eventTimer = runMode === "bonus" ? 16 : Math.max(8, 13 * (this.areaStatus.eventIntervalMultiplier || 1));
      this.messages = [];
      this.prompt = "";
      this.promptTimer = 0;
      this.tutorialActive = runMode === "normal" && !save.tutorialSeen;
      this.tutorialStep = 0;
      this.camera = { x: 0, y: 0 };
      this.generateMap();
      if (runMode === "bonus") {
        this.pushMessage("廃棄区画回収: 資材箱を回収して帰還");
      } else {
        this.pushMessage(`配送区域: ${this.stageTheme.name}`);
        this.pushMessage(`区域状況: ${this.areaStatus.name}`);
        this.pushMessage(this.areaStatus.description);
        this.showTutorialStep(0, "黄色の受取地点で荷物を受け取ろう");
      }
    }

    generateMap() {
      const columnW = CONFIG.MAP_W / 6;
      const rowH = CONFIG.MAP_H / 8;
      const theme = this.stageTheme || STAGE_THEMES.central;
      const roadW = theme.roadWidth || 84;
      const axis = theme.roadEmphasis === "axis" ? pick(["vertical", "horizontal"]) : null;

      for (let x = 0; x <= CONFIG.MAP_W; x += columnW) {
        const major = axis === "vertical" && Math.abs(x - CONFIG.MAP_W / 2) < columnW;
        const width = major ? roadW + 32 : roadW;
        this.roads.push({ x: x - width / 2, y: 0, w: width, h: CONFIG.MAP_H, vertical: true, major });
      }
      for (let y = 0; y <= CONFIG.MAP_H; y += rowH) {
        const major = axis === "horizontal" && Math.abs(y - CONFIG.MAP_H / 2) < rowH;
        const height = major ? roadW + 32 : roadW;
        this.roads.push({ x: 0, y: y - height / 2, w: CONFIG.MAP_W, h: height, vertical: false, major });
      }

      for (let col = 0; col < 6; col += 1) {
        for (let row = 0; row < 8; row += 1) {
          if (Math.random() < theme.buildingSkip) continue;
          const cx = col * columnW + columnW / 2 + rand(-24, 24);
          const cy = row * rowH + rowH / 2 + rand(-24, 24);
          if (dist(cx, cy, this.returnPoint.x, this.returnPoint.y) < 260) continue;
          const maxW = Math.max(theme.buildingWidth[0] + 16, columnW * theme.buildingWidth[1]);
          const maxH = Math.max(theme.buildingHeight[0] + 16, rowH * theme.buildingHeight[1]);
          const w = rand(theme.buildingWidth[0], maxW);
          const h = rand(theme.buildingHeight[0], maxH);
          const rect = {
            x: clamp(cx - w / 2, 55, CONFIG.MAP_W - w - 55),
            y: clamp(cy - h / 2, 55, CONFIG.MAP_H - h - 55),
            w,
            h
          };
          if (!circleRect(this.returnPoint.x, this.returnPoint.y, 120, rect)) {
            this.buildings.push(rect);
          }
        }
      }

      if (this.runMode === "bonus") {
        this.generateBonusStage();
        return;
      }

      for (let i = 0; i < theme.hazardCount; i += 1) {
        const p = this.randomFreePoint(180);
        this.hazards.push(new Hazard(p.x, p.y, rand(theme.hazardRadius[0], theme.hazardRadius[1])));
      }

      for (let i = 0; i < 4; i += 1) {
        this.repairSites.push({ ...this.randomFreePoint(220), used: false });
      }

      for (let i = 0; i < 4; i += 1) {
        this.upgradeSites.push({ ...this.randomFreePoint(240), used: false });
      }

      for (let i = 0; i < 4; i += 1) {
        this.spawnJob(false);
      }

      this.spawnSurvivorSignal(false);
      if (this.areaStatus.key === "rescuePriority") {
        this.spawnSurvivorSignal(false);
      }
    }

    generateBonusStage() {
      for (let i = 0; i < CONFIG.BONUS_HAZARD_COUNT; i += 1) {
        const p = this.randomFreePoint(180);
        this.hazards.push(new Hazard(p.x, p.y, rand(46, 72)));
      }

      for (let i = 0; i < CONFIG.BONUS_BOX_COUNT; i += 1) {
        this.materialBoxes.push(new MaterialBox(this.randomFreePoint(180)));
      }

      for (let i = 0; i < CONFIG.BONUS_SUPPLY_COUNT; i += 1) {
        this.supplyDrops.push(new SupplyDrop(this.randomFreePoint(220), CONFIG.BONUS_DURATION));
      }

      for (let i = 0; i < 2; i += 1) {
        if (Math.random() < 0.65) this.spawnEnemy("chaser", { message: i === 0 });
      }
    }

    randomFreePoint(minFromPlayer = 0) {
      for (let i = 0; i < 900; i += 1) {
        const p = {
          x: rand(80, CONFIG.MAP_W - 80),
          y: rand(80, CONFIG.MAP_H - 80)
        };
        if (minFromPlayer > 0 && dist(p.x, p.y, this.player.x, this.player.y) < minFromPlayer) continue;
        if (dist(p.x, p.y, this.returnPoint.x, this.returnPoint.y) < 110) continue;
        if (this.collidesWithBuilding(p.x, p.y, 28)) continue;
        return p;
      }
      return { x: CONFIG.MAP_W / 2, y: CONFIG.MAP_H / 2 };
    }

    randomFreePointNear(origin, minRadius = 70, maxRadius = 160) {
      for (let i = 0; i < 120; i += 1) {
        const angle = rand(0, Math.PI * 2);
        const radius = rand(minRadius, maxRadius);
        const p = {
          x: clamp(origin.x + Math.cos(angle) * radius, 80, CONFIG.MAP_W - 80),
          y: clamp(origin.y + Math.sin(angle) * radius, 80, CONFIG.MAP_H - 80)
        };
        if (dist(p.x, p.y, this.player.x, this.player.y) < 220) continue;
        if (this.collidesWithBuilding(p.x, p.y, 28)) continue;
        return p;
      }
      return this.randomFreePoint(260);
    }

    collidesWithBuilding(x, y, radius) {
      return this.buildings.some(rect => circleRect(x, y, radius, rect));
    }

    spawnJob(urgent, forcedType = null) {
      const typeKey = forcedType || (urgent ? pick(["medical", "normal", "data"]) : weightedPick(JOB_SPAWN_WEIGHTS));
      const pickup = this.randomFreePoint(urgent ? 260 : 180);
      let destination = this.randomFreePoint(260);
      const minDistance = this.getDeliveryMinDistance();
      for (let i = 0; i < 24 && dist(pickup.x, pickup.y, destination.x, destination.y) < minDistance; i += 1) {
        destination = this.randomFreePoint(260);
      }
      this.recordTargetDistance(pickup);
      this.recordTargetDistance(destination);
      this.jobs.push(new DeliveryJob(typeKey, pickup, destination, urgent));
    }

    spawnSurvivorSignal(showMessage = true) {
      if (this.survivorSignals.length >= 3) {
        if (showMessage) this.pushMessage("生存者信号: 既存信号を追跡中");
        return null;
      }
      let point = this.randomFreePoint(300);
      for (let i = 0; i < 30 && this.isPointInHazard(point.x, point.y, 44); i += 1) {
        point = this.randomFreePoint(300);
      }
      const signal = new SurvivorSignal(point);
      this.survivorSignals.push(signal);
      this.runLog.survivorSignals += 1;
      this.recordTargetDistance(signal);
      if (showMessage) this.pushMessage("生存者信号: リフト回収対象を検知");
      if (showMessage) {
        if (this.tutorialActive && this.tutorialStep < 4) this.tutorialStep = 4;
        this.showTutorialStep(4, "ピンクの生存者信号では、近くに留まるとリフト回収できる");
      }
      return signal;
    }

    getEnemyCap() {
      if (this.runMode === "bonus") return CONFIG.BONUS_ENEMY_CAP;
      return this.time <= getReturnWarningTime() ? getBalanceValue("endgameEnemyCap") : getBalanceValue("enemyCap");
    }

    getDeliveryMinDistance() {
      return 360 * (this.areaStatus?.destinationDistanceMultiplier || 1);
    }

    getEventInterval() {
      return Math.max(8, getEventInterval() * (this.areaStatus?.eventIntervalMultiplier || 1));
    }

    getSurvivorSignalRate() {
      return getBalanceValue("survivorSignalRate") * (this.areaStatus?.survivorSignalMultiplier || 1);
    }

    canSpawnEnemy(count = 1) {
      return this.enemies.filter(enemy => !enemy.dead && !enemy.isDead()).length + count <= this.getEnemyCap();
    }

    spawnEnemy(type, options = {}) {
      type = this.applyEnemyBias(type, options);
      if (!this.canSpawnEnemy()) return null;
      const origin = options.origin || null;
      let point = options.point || null;
      if (!point && origin) point = this.randomFreePointNear(origin, 90, 210);
      if (!point) point = this.randomFreePoint(options.minFromPlayer || 360);
      if (dist(point.x, point.y, this.player.x, this.player.y) < 260) {
        point = this.randomFreePoint(320);
      }

      let unit = null;
      if (type === "chaser") unit = new ChaserDrone(point);
      if (type === "jammer") unit = new JammerDrone(point);
      if (type === "recovery") unit = new RecoveryInterrupter(point, options.targetSignal || null);
      if (type === "patrol") unit = new PatrolDrone(point, origin || point);
      if (type === "hacker") unit = new CargoHacker(point);
      if (!unit) return null;

      this.enemies.push(unit);
      this.runLog.enemiesSpawned += 1;
      if (this.tutorialActive && this.tutorialStep < 3) this.tutorialStep = 3;
      this.showTutorialStep(3, "妨害ユニットはパルスで無力化できる");
      if (options.message !== false) {
        const messages = {
          chaser: "追跡妨害機を検知",
          jammer: "ジャマー発生: 信号が乱れている",
          recovery: "回収妨害機を検知",
          patrol: "警備ドローンが巡回中",
          hacker: "カーゴハッカーを検知"
        };
        this.pushMessage(messages[type] || "妨害ユニットを検知");
      }
      return unit;
    }

    applyEnemyBias(type, options = {}) {
      if (this.runMode === "bonus" || options.ignoreThemeBias) return type;
      if (type === "recovery") return type;
      const bias = this.stageTheme?.enemyBias || {};
      const entries = Object.entries(bias).filter(([, weight]) => weight > 1);
      if (entries.length === 0) return type;
      const favorite = weightedPick(entries.map(([key, weight]) => ({ key, weight: weight - 1 })));
      const chance = clamp(((bias[favorite] || 1) - 1) * 0.34, 0, 0.34);
      if (Math.random() >= chance) return type;
      return favorite;
    }

    spawnEnemyGroup(type, count, options = {}) {
      let spawned = 0;
      for (let i = 0; i < count; i += 1) {
        if (this.spawnEnemy(type, { ...options, message: i === 0 ? options.message : false })) spawned += 1;
      }
      return spawned;
    }

    spawnSupplyDrop() {
      let point = null;
      if (this.hazards.length > 0 && Math.random() < 0.7) {
        point = this.randomFreePointNear(pick(this.hazards), 80, 180);
      } else {
        point = this.randomFreePoint(360);
      }
      this.supplyDrops.push(new SupplyDrop(point));
      this.recordTargetDistance(point);
    }

    update(dt) {
      if (this.over) return;
      this.time = Math.max(0, this.time - dt);
      this.promptTimer = Math.max(0, this.promptTimer - dt);
      this.fragileDamageCooldown = Math.max(0, this.fragileDamageCooldown - dt);
      if (this.promptTimer <= 0) this.prompt = "";

      this.player.update(dt, this, app.input);
      this.updateHazards(dt);
      this.updateWarningZones(dt);
      this.updateSupplyDrops(dt);
      this.updateMaterialBoxes(dt);
      this.updateSurvivorSignals(dt);
      this.updateJobs(dt);
      this.updateSites();
      this.updateEvents(dt);
      this.updateProjectiles(dt);
      this.updateEnemies(dt);
      this.updateAttackEffects(dt);
      this.updateMessages(dt);
      this.updateCamera();
      this.updateTutorial();

      if (this.player.hp <= 0) {
        finishRun(false, "breakdown");
        return;
      }

      const returnDistance = dist(this.player.x, this.player.y, this.returnPoint.x, this.returnPoint.y);
      if (returnDistance < 48 && this.canReturnNow()) {
        finishRun(true, "return");
        return;
      }

      if (this.time <= 0) {
        if (this.runMode === "bonus") {
          finishRun(false, "timeout");
          return;
        }
        const returned = returnDistance < 58;
        finishRun(returned, returned ? "return" : "timeout");
      }
    }

    canReturnNow() {
      if (this.runMode === "bonus") return true;
      return this.time <= getReturnWarningTime() || this.deliveries > 0 || this.protectedSurvivors.length > 0;
    }

    updateHazards(dt) {
      let inHazardNow = false;
      for (const hazard of this.hazards) {
        hazard.update(dt, this);
        if (dist(this.player.x, this.player.y, hazard.x, hazard.y) < this.player.radius + hazard.radius) {
          inHazardNow = true;
          const damaged = this.player.damage(getHazardDps() * dt, "hazard", this);
          if (damaged > 0) this.pushPrompt("危険区域");
        }
      }
      if (inHazardNow && !this.wasInHazard) this.runLog.hazardEntries += 1;
      this.wasInHazard = inHazardNow;
      this.hazards = this.hazards.filter(hazard => !hazard.isDead());
    }

    updateWarningZones(dt) {
      for (const zone of this.warningZones) {
        zone.update(dt, this);
      }
      this.warningZones = this.warningZones.filter(zone => !zone.isDead());
    }

    updateSupplyDrops(dt) {
      for (const drop of this.supplyDrops) {
        drop.update(dt, this);
      }
      this.supplyDrops = this.supplyDrops.filter(drop => !drop.isDead());
    }

    updateMaterialBoxes(dt) {
      for (const box of this.materialBoxes) {
        box.update(dt, this);
      }
      this.materialBoxes = this.materialBoxes.filter(box => !box.isDead());
    }

    updateSurvivorSignals(dt) {
      if (this.runMode === "bonus") return;
      for (const signal of this.survivorSignals) {
        signal.update(dt, this);
      }
      this.survivorSignals = this.survivorSignals.filter(signal => !signal.isDead());

      const activeSignal = this.liftProgress?.signal;
      if (activeSignal && !this.survivorSignals.includes(activeSignal)) {
        this.liftProgress = null;
        return;
      }

      const nearest = activeSignal || this.getNearestSurvivorSignal();
      if (!nearest) {
        this.liftProgress = null;
        return;
      }

      const distance = dist(this.player.x, this.player.y, nearest.x, nearest.y);
      const inStartRange = distance < 48;
      const inHoldRange = distance < 62;

      if (this.liftProgress) {
        if (!inHoldRange) {
          this.interruptLift("リフト回収中断: 距離が離れた");
          return;
        }
        if (this.damageTaken > this.liftProgress.damageAtStart + 0.01) {
          this.interruptLift("リフト回収中断: 損傷");
          return;
        }
        if (this.isPlayerInDangerZone()) {
          this.interruptLift("リフト回収中断: 危険区域");
          return;
        }
        if (!this.hasFreeCapacity()) {
          this.interruptLift("リフト回収中断: 積載枠上限");
          return;
        }

        this.liftProgress.timer += dt;
        const percent = Math.floor((this.liftProgress.timer / this.liftProgress.duration) * 100);
        this.pushPrompt(`リフト回収 ${clamp(percent, 0, 100)}%`);
        if (this.liftProgress.timer >= this.liftProgress.duration) {
          const survivor = {
            ...nearest.survivor,
            assignedFacility: null
          };
          this.protectedSurvivors.push(survivor);
          this.runLog.liftSuccess += 1;
          this.runLog.survivorsProtected = this.protectedSurvivors.length;
          if (getRarityRank(survivor.rarity) > getRarityRank(this.runLog.bestSurvivorRarity)) {
            this.runLog.bestSurvivorRarity = survivor.rarity;
          }
          nearest.dead = true;
          this.survivorSignals = this.survivorSignals.filter(signal => !signal.isDead());
          this.liftProgress = null;
          this.pushMessage(`${survivor.name}を保護中`);
        }
        return;
      }

      if (!inStartRange) return;
      if (this.player.hp <= 0) return;
      if (!this.hasFreeCapacity()) {
        this.pushPrompt("積載枠上限: 生存者保護不可");
        return;
      }
      if (this.isPlayerInDangerZone()) {
        this.pushPrompt("危険区域内ではリフト回収不可");
        return;
      }

      this.liftProgress = {
        signal: nearest,
        timer: 0,
        duration: 2.5,
        damageAtStart: this.damageTaken
      };
      this.pushMessage("リフト回収開始");
    }

    updateJobs(dt) {
      if (this.runMode === "bonus") return;
      for (const job of this.jobs) {
        job.update(dt, this);
        if (job.status === "available") {
          const d = dist(this.player.x, this.player.y, job.pickup.x, job.pickup.y);
          if (d < 42) {
            if (!this.hasFreeCapacity(job.cargoSlots)) {
              this.pushPrompt(job.type.special === "heavy" ? "積載枠が足りません" : "積載枠上限");
            } else {
              job.take();
              this.pushMessage(getJobPickupMessage(job));
              this.showTutorialStep(1, "緑の目的地へ届けると報酬が入る");
            }
          }
        } else if (job.status === "carried") {
          const d = dist(this.player.x, this.player.y, job.destination.x, job.destination.y);
          if (d < 44) {
            const reward = job.getReward(this);
            this.money += reward;
            this.deliveries += 1;
            this.runLog.deliveries += 1;
            this.runLog.money += reward;
            this.recordSpecialDelivery(job, reward);
            job.status = "delivered";
            this.pushMessage(`${getJobDeliveryMessage(job)} +${reward}`);
            this.spawnJob(false);
          }
        }
      }

      this.jobs = this.jobs.filter(job => job.status !== "delivered" && !job.isExpired());
      const available = this.jobs.filter(job => job.status === "available").length;
      for (let i = available; i < 4; i += 1) {
        this.spawnJob(false);
      }
    }

    updateSites() {
      if (this.runMode === "bonus") return;
      for (const site of this.repairSites) {
        if (site.used) continue;
        if (dist(this.player.x, this.player.y, site.x, site.y) < 40) {
          site.used = true;
          this.player.heal(26 + (this.save.facilities.medical || 0) * 6 + this.personnelEffects.repairBonus);
          this.runLog.repairsUsed += 1;
          this.pushMessage("修理地点でHP回復");
        }
      }

      for (const site of this.upgradeSites) {
        if (site.used) continue;
        if (dist(this.player.x, this.player.y, site.x, site.y) < 42) {
          site.used = true;
          openUpgradeSelection(this);
          break;
        }
      }
    }

    updateEvents(dt) {
      this.blackoutTimer = Math.max(0, this.blackoutTimer - dt);
      this.windTimer = Math.max(0, this.windTimer - dt);
      const commsWasActive = this.commsTimer > 0;
      this.commsTimer = Math.max(0, this.commsTimer - dt);
      if (commsWasActive && this.commsTimer <= 0) {
        this.pushMessage("通信回復");
      }
      this.eventTimer -= dt;
      if (this.eventTimer > 0) return;
      if (this.runMode === "bonus") {
        this.triggerBonusEvent();
        this.eventTimer = rand(18, 26);
      } else {
        this.triggerEvent();
        this.eventTimer = this.getEventInterval() + rand(0, 6);
      }
    }

    triggerBonusEvent() {
      const event = weightedPick([
        { key: "collapse", weight: 1 },
        { key: "fireSpread", weight: 0.85 },
        { key: "chaser", weight: 0.7 * getInterferenceRate() },
        { key: "supplyDrop", weight: 0.75 * getBalanceValue("supplyDropRate") }
      ]);
      this.logEvent(event);
      if (event === "collapse") {
        const point = this.randomFreePoint(160);
        this.hazards.push(new Hazard(point.x, point.y, rand(48, 76), 42));
        this.pushMessage("道路崩落: 廃棄区画に危険区域");
      }
      if (event === "fireSpread") {
        const point = this.randomFreePoint(170);
        this.hazards.push(new SpreadHazard(point.x, point.y));
        this.pushMessage("火災発生: 回収ルート注意");
      }
      if (event === "chaser") {
        this.spawnEnemy("chaser", { message: true });
      }
      if (event === "supplyDrop") {
        this.spawnSupplyDrop();
        this.pushMessage("支援物資落下: 回収可能");
      }
    }

    getThemedEventWeights(items) {
      const multipliers = this.stageTheme?.eventWeights || {};
      return items.map(item => ({
        ...item,
        weight: item.weight * (multipliers[item.key] || 1)
      }));
    }

    triggerEvent() {
      const event = weightedPick(this.getThemedEventWeights([
        { key: "collapse", weight: 1 },
        { key: "blackout", weight: 0.8 },
        { key: "wind", weight: 0.8 },
        { key: "chaser", weight: 0.8 * getInterferenceRate() },
        { key: "emergency", weight: 0.9 },
        { key: "closureWarning", weight: 1 },
        { key: "survivorSignal", weight: 0.9 * this.getSurvivorSignalRate() },
        { key: "comms", weight: 0.8 },
        { key: "fireSpread", weight: 0.9 },
        { key: "supplyDrop", weight: 0.8 * getBalanceValue("supplyDropRate") },
        { key: "cargoHack", weight: 0.55 * getInterferenceRate() }
      ]));
      this.logEvent(event);
      if (event === "collapse") {
        const point = this.randomFreePoint(160);
        this.hazards.push(new Hazard(point.x, point.y, rand(62, 96), 95));
        this.pushMessage("道路崩落: 危険区域が拡大");
      }
      if (event === "blackout") {
        this.blackoutTimer = 7.5;
        this.pushMessage("停電: 視界が狭まった");
      }
      if (event === "wind") {
        this.windTimer = 7;
        const angle = rand(0, Math.PI * 2);
        this.windVector = { x: Math.cos(angle) * 80, y: Math.sin(angle) * 80 };
        this.pushMessage("突風: 操作に慣性がかかる");
      }
      if (event === "chaser") {
        const count = Math.random() < 0.45 ? 2 : 1;
        this.spawnEnemyGroup("chaser", count, { message: true });
      }
      if (event === "emergency") {
        this.spawnJob(true);
        this.pushMessage("緊急依頼が出現");
      }
      if (event === "closureWarning") {
        const point = this.randomFreePoint(180);
        const zone = new WarningZone(point.x, point.y, rand(70, 96), 8 + this.personnelEffects.warningBonus, rand(40, 50));
        zone.spawnGuard = chanceByMultiplier(0.35, "interferenceUnitRate");
        this.warningZones.push(zone);
        this.pushMessage("封鎖予告: 指定区域がまもなく危険化");
      }
      if (event === "survivorSignal") {
        const signal = this.spawnSurvivorSignal(true);
        const recoveryChance = 0.42 * getInterferenceRate() * (this.areaStatus?.recoveryInterrupterMultiplier || 1);
        if (signal && Math.random() < Math.min(1, recoveryChance)) {
          this.spawnEnemy("recovery", { origin: signal, targetSignal: signal, message: true });
        }
      }
      if (event === "comms") {
        this.commsTimer = Math.max(4, 9 - (this.save.facilities.comms || 0) * 1.2 - this.personnelEffects.commsReduction);
        this.pushMessage("通信障害: 目的地信号が乱れている");
        if (chanceByMultiplier(1, "interferenceUnitRate")) this.spawnEnemy("jammer", { message: true });
      }
      if (event === "fireSpread") {
        const point = this.randomFreePoint(170);
        this.hazards.push(new SpreadHazard(point.x, point.y));
        this.pushMessage("火災発生: 延焼中");
      }
      if (event === "supplyDrop") {
        this.spawnSupplyDrop();
        this.pushMessage("支援物資落下: 回収可能");
      }
      if (event === "cargoHack") {
        this.spawnEnemy("hacker", { message: true });
      }
      if (this.time <= getReturnWarningTime() && chanceByMultiplier(0.18, "interferenceUnitRate")) {
        this.spawnEnemy("patrol", { message: true });
      }
    }

    updateProjectiles(dt) {
      for (const projectile of this.projectiles) {
        projectile.update(dt, this);
      }
      this.projectiles = this.projectiles.filter(projectile => !projectile.isDead());
    }

    updateEnemies(dt) {
      for (const enemy of this.enemies) {
        if (enemy.dead || enemy.isDead()) continue;
        enemy.update(dt, this);
      }
      this.enemies = this.enemies.filter(enemy => !enemy.isDead());
    }

    updateAttackEffects(dt) {
      for (const effect of this.attackEffects) {
        effect.ttl -= dt;
      }
      this.attackEffects = this.attackEffects.filter(effect => effect.ttl > 0);
    }

    hitEnemiesInRadius(x, y, radius, damage) {
      let hit = 0;
      for (const enemy of this.enemies) {
        if (enemy.dead || enemy.isDead()) continue;
        if (dist(x, y, enemy.x, enemy.y) <= radius + enemy.radius) {
          enemy.damage(damage, this);
          hit += 1;
        }
      }
      return hit;
    }

    hitEnemiesInCone(x, y, dir, range, angle, damage) {
      let hit = 0;
      for (const enemy of this.enemies) {
        if (enemy.dead || enemy.isDead()) continue;
        const dx = enemy.x - x;
        const dy = enemy.y - y;
        const len = Math.hypot(dx, dy) || 1;
        if (len > range + enemy.radius) continue;
        const dot = (dx / len) * dir.x + (dy / len) * dir.y;
        if (dot >= Math.cos(angle)) {
          enemy.damage(damage, this);
          hit += 1;
        }
      }
      return hit;
    }

    getNearestSurvivorSignal() {
      let best = null;
      for (const signal of this.survivorSignals) {
        const distance = dist(this.player.x, this.player.y, signal.x, signal.y);
        if (!best || distance < best.distance) best = { signal, distance };
      }
      return best?.signal || null;
    }

    getUsedCapacity() {
      const cargoSlots = this.player.getCargo(this).reduce((sum, job) => sum + (job.cargoSlots || 1), 0);
      return cargoSlots + this.protectedSurvivors.length;
    }

    hasFreeCapacity(requiredSlots = 1) {
      return this.getUsedCapacity() + requiredSlots <= this.player.capacity;
    }

    getProtectedSurvivorSpeedMultiplier() {
      if (this.protectedSurvivors.some(survivor => survivor.trait === "胆力")) return 0.93;
      return 0.88;
    }

    isPointInHazard(x, y, margin = 0) {
      return this.hazards.some(hazard => dist(x, y, hazard.x, hazard.y) < hazard.radius + margin);
    }

    isPlayerInDangerZone() {
      return this.hazards.some(hazard => dist(this.player.x, this.player.y, hazard.x, hazard.y) < hazard.radius + this.player.radius);
    }

    isJammedByUnit() {
      return this.enemies.some(enemy => enemy.type === "jammer" && !enemy.dead && dist(enemy.x, enemy.y, this.player.x, this.player.y) < enemy.effectRadius);
    }

    getMarkerAlpha() {
      return this.commsTimer > 0 || this.isJammedByUnit() ? 0.34 : 1;
    }

    interruptLift(message) {
      if (!this.liftProgress) return;
      this.liftProgress = null;
      this.runLog.liftInterrupted += 1;
      this.pushMessage(message);
    }

    logEvent(eventKey) {
      const label = getEventLabel(eventKey);
      this.runLog.eventsTotal += 1;
      this.runLog.eventsByType[label] = (this.runLog.eventsByType[label] || 0) + 1;
    }

    recordTargetDistance(point) {
      if (!point) return;
      this.runLog.farthestTargetDistance = Math.max(
        this.runLog.farthestTargetDistance,
        Math.round(dist(this.player.x, this.player.y, point.x, point.y))
      );
    }

    onEnemyDisabled() {
      this.runLog.enemiesDisabled += 1;
    }

    onPlayerDamaged(amount) {
      if (amount <= 0 || this.fragileDamageCooldown > 0) return;
      const fragileCargo = this.player.getCargo(this).filter(job => job.type.special === "fragile");
      if (fragileCargo.length === 0) return;
      let lowered = false;
      for (const job of fragileCargo) {
        if (job.applyFragileDamage()) lowered = true;
      }
      if (!lowered) return;
      this.fragileDamageCooldown = 0.85;
      this.runLog.fragileDamage += 1;
      this.pushMessage("壊れ物が損傷。報酬低下");
    }

    recordSpecialDelivery(job, reward) {
      if (!job.type.special) return;
      this.runLog.specialDelivered += 1;
      if (job.type.special === "fragile") {
        this.runLog.fragileDelivered += 1;
        if (job.damageCount === 0) this.runLog.fragilePerfect += 1;
      }
      if (job.type.special === "cooling") {
        const value = job.getValuePercent();
        this.runLog.coolingDelivered += 1;
        this.runLog.coolingValueTotal += value;
        if (value >= 80) this.runLog.coolingHighValue += 1;
      }
      if (job.type.special === "heavy") {
        this.runLog.heavyDelivered += 1;
        this.runLog.heavyMoney += reward;
      }
    }

    updateMessages(dt) {
      for (const message of this.messages) {
        message.ttl -= dt;
      }
      this.messages = this.messages.filter(message => message.ttl > 0);
    }

    updateCamera() {
      const viewW = dom.canvas.clientWidth;
      const viewH = dom.canvas.clientHeight;
      this.camera.x = clamp(this.player.x - viewW / 2, 0, CONFIG.MAP_W - viewW);
      this.camera.y = clamp(this.player.y - viewH / 2, 0, CONFIG.MAP_H - viewH);
    }

    pushMessage(text) {
      this.messages.unshift({ text, ttl: 3.2 });
      this.messages = this.messages.slice(0, 4);
    }

    pushPrompt(text) {
      this.prompt = text;
      this.promptTimer = 0.7;
    }

    showTutorialStep(step, text) {
      if (!this.tutorialActive || this.tutorialStep !== step) return;
      this.prompt = text;
      this.promptTimer = 4.2;
      this.tutorialStep += 1;
    }

    updateTutorial() {
      if (!this.tutorialActive) return;
      if (this.tutorialStep <= 2) {
        const nearHazard = this.hazards.some(hazard => dist(this.player.x, this.player.y, hazard.x, hazard.y) < hazard.radius + 130);
        if (nearHazard) {
          this.tutorialStep = 2;
          this.showTutorialStep(2, "赤い危険区域は損傷を受ける。避けて進もう");
        }
      }
      if (this.time <= getReturnWarningTime()) {
        if (this.tutorialStep < 5) this.tutorialStep = 5;
        this.showTutorialStep(5, "帰還地点へ戻ると報酬と保護中の生存者を持ち帰れる");
      }
    }
  }

  function loadSave() {
    const fallback = createDefaultSave();
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      const facilities = { ...fallback.facilities, ...(parsed.facilities || {}) };
      if (parsed.facilities?.weather != null && parsed.facilities?.control == null) {
        facilities.control = parsed.facilities.weather;
      }
      delete facilities.weather;
      const unlockedVehicles = Array.isArray(parsed.unlockedVehicles)
        ? [...new Set(parsed.unlockedVehicles.map(normalizeVehicleId))]
        : fallback.unlockedVehicles;
      const personnel = Array.isArray(parsed.personnel)
        ? parsed.personnel.map(normalizeSurvivor).filter(Boolean)
        : fallback.personnel;
      const assignmentCounts = {};
      for (const person of personnel) {
        if (!person.assignedFacility) continue;
        const capacity = clamp(facilities[person.assignedFacility] || 0, 0, 3);
        const used = assignmentCounts[person.assignedFacility] || 0;
        if (used >= capacity) {
          person.assignedFacility = null;
        } else {
          assignmentCounts[person.assignedFacility] = used + 1;
        }
      }
      const totalSurvivorsRecovered = Number.isFinite(parsed.totalSurvivorsRecovered)
        ? parsed.totalSurvivorsRecovered
        : personnel.length;
      const bestSurvivorRarity = getRarityRank(parsed.bestSurvivorRarity) > getRarityRank(getBestSurvivorRarity(personnel))
        ? parsed.bestSurvivorRarity
        : getBestSurvivorRarity(personnel);
      const vehicleStats = normalizeVehicleStats(parsed.vehicleStats);
      const specialDeliveryStats = normalizeSpecialDeliveryStats(parsed.specialDeliveryStats);
      const bonusTickets = clamp(Number(parsed.bonusTickets) || 0, 0, CONFIG.BONUS_TICKET_MAX);
      return {
        ...fallback,
        ...parsed,
        unlockedVehicles,
        facilities,
        personnel,
        totalSurvivorsRecovered,
        bestSurvivorRarity,
        bestRank: parsed.bestRank || fallback.bestRank,
        bestSurvivorsInRun: Number.isFinite(parsed.bestSurvivorsInRun) ? parsed.bestSurvivorsInRun : fallback.bestSurvivorsInRun,
        totalMaterialsEarned: Number.isFinite(parsed.totalMaterialsEarned)
          ? parsed.totalMaterialsEarned
          : Math.max(parsed.materials || 0, fallback.totalMaterialsEarned),
        vehicleStats,
        specialDeliveryStats,
        bonusTickets,
        tutorialSeen: Boolean(parsed.tutorialSeen)
      };
    } catch (error) {
      console.warn("Save load failed", error);
      return fallback;
    }
  }

  function createDefaultSave() {
    return {
      materials: 0,
      totalMaterialsEarned: 0,
      bestDeliveries: 0,
      bestMoney: 0,
      bestRank: "D",
      bestSurvivorsInRun: 0,
      plays: 0,
      tutorialSeen: false,
      unlockedVehicles: ["alpha", "beta", "gamma"],
      facilities: {
        garage: 0,
        depot: 0,
        control: 0,
        medical: 0,
        comms: 0,
        analysis: 0,
        warehouse: 0
      },
      personnel: [],
      totalSurvivorsRecovered: 0,
      bestSurvivorRarity: "",
      bonusTickets: 0,
      vehicleStats: createDefaultVehicleStats(),
      specialDeliveryStats: createDefaultSpecialDeliveryStats()
    };
  }

  function saveData() {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(app.save));
    } catch (error) {
      console.warn("Save write failed", error);
    }
  }

  function loadDebugConfig() {
    try {
      const raw = localStorage.getItem(CONFIG.DEBUG_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return sanitizeDebugConfig({ ...DEFAULT_DEBUG_CONFIG, ...parsed });
    } catch (error) {
      console.warn("Debug config load failed", error);
      return { ...DEFAULT_DEBUG_CONFIG };
    }
  }

  function saveDebugConfig() {
    try {
      localStorage.setItem(CONFIG.DEBUG_STORAGE_KEY, JSON.stringify(app.debugConfig));
    } catch (error) {
      console.warn("Debug config write failed", error);
    }
  }

  function sanitizeDebugConfig(config) {
    const safe = { ...DEFAULT_DEBUG_CONFIG };
    for (const control of DEBUG_CONTROLS) {
      const value = Number(config[control.key]);
      const stepped = Number.isFinite(value) ? value : DEFAULT_DEBUG_CONFIG[control.key];
      safe[control.key] = clamp(stepped, control.min, control.max);
    }
    return safe;
  }

  function setDebugConfig(nextConfig) {
    app.debugConfig = sanitizeDebugConfig({ ...app.debugConfig, ...nextConfig });
    saveDebugConfig();
  }

  function getBalanceValue(key) {
    return app.debugConfig?.[key] ?? DEFAULT_DEBUG_CONFIG[key];
  }

  function getRunDuration() {
    return getBalanceValue("runDuration");
  }

  function getEventInterval() {
    return getBalanceValue("eventInterval");
  }

  function getReturnWarningTime() {
    return getBalanceValue("returnWarningTime");
  }

  function getHazardDps() {
    return getBalanceValue("hazardDps");
  }

  function getInterferenceRate() {
    return getBalanceValue("interferenceUnitRate");
  }

  function chanceByMultiplier(baseChance, multiplierKey) {
    return Math.random() < Math.min(1, baseChance * getBalanceValue(multiplierKey));
  }

  function pickStageTheme() {
    return STAGE_THEMES[pick(STAGE_THEME_KEYS)] || STAGE_THEMES.central;
  }

  function pickAreaStatus() {
    return AREA_STATUSES[pick(AREA_STATUS_KEYS)] || AREA_STATUSES.normal;
  }

  function getAreaRunDuration(areaStatus) {
    const [minTime, maxTime] = areaStatus?.timeRange || AREA_STATUSES.normal.timeRange;
    const target = Math.round(rand(minTime, maxTime));
    const deltaFromStandard = target - AREA_STATUSES.normal.timeRange[0];
    return Math.max(120, getRunDuration() + deltaFromStandard);
  }

  function normalizeVehicleId(id) {
    if (id === "bike") return "alpha";
    if (id === "truck") return "beta";
    if (id === "helicopter") return "gamma";
    if (id === "drone") return "gamma";
    if (["alpha", "beta", "gamma"].includes(id)) return id;
    return "alpha";
  }

  function createDefaultVehicleStats() {
    const stats = {};
    for (const id of Object.keys(VEHICLES)) {
      stats[id] = {
        runs: 0,
        bestDeliveries: 0,
        bestMoney: 0,
        returns: 0,
        failures: 0,
        totalDeliveries: 0,
        totalMoney: 0,
        survivorsJoined: 0,
        bestRank: "D"
      };
    }
    return stats;
  }

  function normalizeVehicleStats(rawStats) {
    const stats = createDefaultVehicleStats();
    for (const id of Object.keys(stats)) {
      const raw = rawStats?.[id] || rawStats?.[normalizeVehicleId(id)] || {};
      stats[id] = {
        ...stats[id],
        ...raw,
        runs: Number(raw.runs) || 0,
        bestDeliveries: Number(raw.bestDeliveries) || 0,
        bestMoney: Number(raw.bestMoney) || 0,
        returns: Number(raw.returns) || 0,
        failures: Number(raw.failures) || 0,
        totalDeliveries: Number(raw.totalDeliveries) || 0,
        totalMoney: Number(raw.totalMoney) || 0,
        survivorsJoined: Number(raw.survivorsJoined) || 0,
        bestRank: raw.bestRank || "D"
      };
    }
    return stats;
  }

  function updateVehicleStats(vehicleId, result) {
    const id = normalizeVehicleId(vehicleId);
    app.save.vehicleStats = normalizeVehicleStats(app.save.vehicleStats);
    const stats = app.save.vehicleStats[id];
    stats.runs += 1;
    stats.bestDeliveries = Math.max(stats.bestDeliveries, result.deliveries);
    stats.bestMoney = Math.max(stats.bestMoney, result.finalMoney);
    stats.totalDeliveries += result.deliveries;
    stats.totalMoney += result.finalMoney;
    stats.survivorsJoined += result.joinedSurvivors.length;
    if (result.returned) stats.returns += 1;
    else stats.failures += 1;
    if (getRankScore(result.rank) > getRankScore(stats.bestRank)) stats.bestRank = result.rank;
  }

  function createDefaultSpecialDeliveryStats() {
    return {
      fragileDelivered: 0,
      fragilePerfect: 0,
      fragileDamage: 0,
      coolingDelivered: 0,
      coolingHighValue: 0,
      coolingValueTotal: 0,
      heavyDelivered: 0,
      heavyMoney: 0,
      specialDelivered: 0
    };
  }

  function normalizeSpecialDeliveryStats(rawStats) {
    const stats = createDefaultSpecialDeliveryStats();
    const raw = rawStats && typeof rawStats === "object" ? rawStats : {};
    for (const key of Object.keys(stats)) {
      stats[key] = Number(raw[key]) || 0;
    }
    if (!Number(raw.specialDelivered)) {
      stats.specialDelivered = stats.fragileDelivered + stats.coolingDelivered + stats.heavyDelivered;
    }
    return stats;
  }

  function updateSpecialDeliveryStats(log) {
    app.save.specialDeliveryStats = normalizeSpecialDeliveryStats(app.save.specialDeliveryStats);
    const stats = app.save.specialDeliveryStats;
    stats.fragileDelivered += log.fragileDelivered || 0;
    stats.fragilePerfect += log.fragilePerfect || 0;
    stats.fragileDamage += log.fragileDamage || 0;
    stats.coolingDelivered += log.coolingDelivered || 0;
    stats.coolingHighValue += log.coolingHighValue || 0;
    stats.coolingValueTotal += log.coolingValueTotal || 0;
    stats.heavyDelivered += log.heavyDelivered || 0;
    stats.heavyMoney += log.heavyMoney || 0;
    stats.specialDelivered += log.specialDelivered || 0;
  }

  function normalizeSurvivor(survivor) {
    if (!survivor || typeof survivor !== "object") return null;
    const rarity = getRarityByKey(survivor.rarity) ? survivor.rarity : "C";
    const range = getRarityByKey(rarity);
    const role = getSurvivorRole(survivor.role) || SURVIVOR_ROLES.find(item => item.name === survivor.role) || SURVIVOR_ROLES[0];
    const trait = SURVIVOR_TRAITS.includes(survivor.trait) ? survivor.trait : pick(SURVIVOR_TRAITS);
    const assignedFacility = PERSONNEL_FACILITIES.some(facility => facility.key === survivor.assignedFacility)
      ? survivor.assignedFacility
      : null;
    return {
      id: survivor.id || cryptoId(),
      name: survivor.name || generateSurvivorName(),
      rarity,
      role: role.key,
      aptitude: Math.round(clamp(Number(survivor.aptitude) || range.min, range.min, range.max)),
      trait,
      assignedFacility
    };
  }

  function generateSurvivor() {
    const rarityKey = weightedPick(SURVIVOR_RARITIES.map(rarity => ({ key: rarity.key, weight: rarity.weight })));
    const rarity = getRarityByKey(rarityKey);
    const role = pick(SURVIVOR_ROLES);
    return {
      id: cryptoId(),
      name: generateSurvivorName(),
      rarity: rarity.key,
      role: role.key,
      aptitude: Math.floor(rand(rarity.min, rarity.max + 1)),
      trait: pick(SURVIVOR_TRAITS),
      assignedFacility: null
    };
  }

  function generateSurvivorName() {
    return pick(SURVIVOR_NAMES);
  }

  function getRarityByKey(key) {
    return SURVIVOR_RARITIES.find(rarity => rarity.key === key);
  }

  function getRarityRank(key) {
    return { C: 1, B: 2, A: 3, S: 4 }[key] || 0;
  }

  function getBestSurvivorRarity(personnel) {
    let best = "";
    for (const survivor of personnel || []) {
      if (getRarityRank(survivor.rarity) > getRarityRank(best)) best = survivor.rarity;
    }
    return best;
  }

  function getSurvivorRole(key) {
    return SURVIVOR_ROLES.find(role => role.key === key);
  }

  function getFacilityName(key) {
    return PERSONNEL_FACILITIES.find(facility => facility.key === key)?.name || "未配置";
  }

  function getFacilityAssignmentCapacity(save, facilityKey) {
    return clamp(save.facilities?.[facilityKey] || 0, 0, 3);
  }

  function getAssignedCount(save, facilityKey, ignoreId = null) {
    return (save.personnel || []).filter(person => person.assignedFacility === facilityKey && person.id !== ignoreId).length;
  }

  function getPersonnelEffects(save) {
    const effects = {
      maxHpBonus: 0,
      rewardBonus: 0,
      warningBonus: 0,
      repairBonus: 0,
      commsReduction: 0,
      analysisBonus: (save.facilities?.analysis || 0) * 0.45,
      warehouseChanceBonus: 0,
      radarBonus: 0,
      hazardClarity: 0
    };

    for (const person of save.personnel || []) {
      if (!person.assignedFacility) continue;
      const role = getSurvivorRole(person.role);
      if (!role) continue;
      const matched = person.assignedFacility === role.facility;
      if (!matched && person.trait !== "器用") continue;
      let scale = matched ? 1 : 0.25;
      if (person.trait === "熟練") scale *= 1.2;
      if (person.trait === "技師肌" && ["mechanic", "controller", "scout"].includes(role.key)) scale *= 1.1;
      const value = clamp((person.aptitude || 0) / 100, 0, 1) * scale;

      if (role.key === "mechanic") effects.maxHpBonus += Math.round(value * 24);
      if (role.key === "logistics") effects.rewardBonus += value * 0.12;
      if (role.key === "controller") effects.warningBonus += value * 2.4;
      if (role.key === "medic") effects.repairBonus += Math.round(value * 18);
      if (role.key === "operator") effects.commsReduction += value * 3;
      if (role.key === "analyst") effects.analysisBonus += value * 2;
      if (role.key === "quartermaster") effects.warehouseChanceBonus += value * 0.18;
      if (role.key === "scout") effects.radarBonus += value * 220;
      if (person.trait === "慎重") effects.warningBonus += 1 * scale;
      if (person.trait === "地元民") effects.hazardClarity += 0.1 * scale;
    }

    effects.rewardBonus = Math.min(effects.rewardBonus, 0.4);
    effects.warningBonus = Math.min(effects.warningBonus, 5);
    effects.commsReduction = Math.min(effects.commsReduction, 4);
    effects.warehouseChanceBonus = Math.min(effects.warehouseChanceBonus, 0.45);
    effects.radarBonus = Math.min(effects.radarBonus, 360);
    effects.hazardClarity = Math.min(effects.hazardClarity, 0.3);
    return effects;
  }

  function describeSurvivor(survivor) {
    const role = getSurvivorRole(survivor.role);
    return `${role?.name || "人員"} / 適性${survivor.aptitude} / 特性:${survivor.trait}`;
  }

  function describeSurvivorPlacement(survivor) {
    const role = getSurvivorRole(survivor.role);
    if (!role) return "灰街拠点で配置すると支援効果を発揮します。";
    return `${getFacilityName(role.facility)}に配置すると、${role.effect}します。`;
  }

  function getUpgradeableFacilities(save) {
    return FACILITIES.filter(facility => {
      const level = save.facilities?.[facility.key] || 0;
      const cost = getFacilityCost(level);
      return cost !== null && save.materials >= cost;
    });
  }

  function getUnassignedPersonnel(save) {
    return (save.personnel || []).filter(person => !person.assignedFacility);
  }

  function getAssignedPersonnelCount(save) {
    return (save.personnel || []).filter(person => person.assignedFacility).length;
  }

  function autoAssignPersonnel() {
    let moved = 0;
    for (const person of app.save.personnel || []) {
      if (person.assignedFacility) continue;
      const role = getSurvivorRole(person.role);
      if (!role) continue;
      const capacity = getFacilityAssignmentCapacity(app.save, role.facility);
      const used = getAssignedCount(app.save, role.facility, person.id);
      if (capacity > 0 && used < capacity) {
        person.assignedFacility = role.facility;
        moved += 1;
      }
    }
    return moved;
  }

  function getRankScore(rank) {
    return { D: 0, C: 1, B: 2, A: 3, S: 4 }[rank] || 0;
  }

  function getRunTitle(result) {
    if (!result.returned) return "通信途絶";
    if (result.joinedSurvivors.length > 0) return "救助成功";
    if (result.hpRatio <= 0.2) return "満身創痍の帰投";
    if (result.deliveries >= 8) return "灰街最速便";
    if (result.finalMoney >= 900) return "高収益ルート";
    if (result.supplyDropsCollected > 0) return "物資回収者";
    if (result.deliveries >= 5) return "熟練メッセンジャー";
    if (result.deliveries >= 3) return "灰街配達員";
    if (result.deliveries >= 1) return "慎重な配送機";
    return "空荷帰還";
  }

  function getNextGoal(save, result = null) {
    const unassigned = getUnassignedPersonnel(save);
    if (unassigned.length > 0) return `未配置の人員が${unassigned.length}名います`;
    const upgradeable = getUpgradeableFacilities(save);
    if (upgradeable.length > 0) return `${upgradeable[0].name}を強化できます`;
    const garage = FACILITIES.find(facility => facility.key === "garage");
    const garageLevel = save.facilities.garage || 0;
    const garageCost = getFacilityCost(garageLevel);
    if (garageCost !== null) return `${garage.name}Lv${garageLevel + 1}まであと資材${Math.max(0, garageCost - save.materials)}`;
    if (!save.totalSurvivorsRecovered) return "次は生存者を1名保護して帰還しよう";
    if (result && result.deliveries <= save.bestDeliveries) return `最高配達数まであと${Math.max(1, save.bestDeliveries + 1 - result.deliveries)}件`;
    return "配達局を強化すると報酬が上がります";
  }

  function getFacilityLevelText(save) {
    return FACILITIES.map(facility => `${facility.name}Lv${save.facilities[facility.key] || 0}`).join(" / ");
  }

  function createRunLog() {
    return {
      deliveries: 0,
      money: 0,
      material: 0,
      returned: false,
      secondsLeft: 0,
      damageTaken: 0,
      eventsTotal: 0,
      eventsByType: {},
      enemiesSpawned: 0,
      enemiesDisabled: 0,
      pulseUsed: 0,
      skillUsed: 0,
      hazardEntries: 0,
      supplyCollected: 0,
      upgradesTaken: 0,
      repairsUsed: 0,
      survivorSignals: 0,
      liftSuccess: 0,
      liftInterrupted: 0,
      survivorsProtected: 0,
      survivorsJoined: 0,
      bestSurvivorRarity: null,
      returnSecondsLeft: null,
      farthestTargetDistance: 0,
      specialDelivered: 0,
      fragileDelivered: 0,
      fragilePerfect: 0,
      fragileDamage: 0,
      coolingDelivered: 0,
      coolingHighValue: 0,
      coolingValueTotal: 0,
      heavyDelivered: 0,
      heavyMoney: 0
    };
  }

  function getEventLabel(key) {
    return {
      collapse: "道路崩落",
      blackout: "停電",
      wind: "突風",
      chaser: "追跡妨害機",
      emergency: "緊急依頼",
      closureWarning: "封鎖予告",
      survivorSignal: "生存者信号",
      comms: "通信障害",
      fireSpread: "火災延焼",
      supplyDrop: "支援物資落下",
      cargoHack: "カーゴハッカー"
    }[key] || key;
  }

  function getFragileCondition(job) {
    const value = job.getValuePercent();
    if (value >= 100) return "無傷";
    if (value >= 80) return "軽微損傷";
    if (value >= 60) return "損傷";
    return "大きく損傷";
  }

  function getJobPickupMessage(job) {
    if (job.type.special === "cooling") return "冷却品を受領。早期配送推奨";
    if (job.type.special === "heavy") return "重量貨物を積載。機動力低下";
    return `${job.type.name}を受け取り`;
  }

  function getJobDeliveryMessage(job) {
    if (job.type.special === "fragile") return "壊れ物を納品";
    if (job.type.special === "cooling") return "冷却品を納品";
    if (job.type.special === "heavy") return "重量貨物を納品";
    return `${job.type.name} 配達完了`;
  }

  function getJobMarkerGlyph(job) {
    if (job.type.special === "fragile") return "壊";
    if (job.type.special === "cooling") return "冷";
    if (job.type.special === "heavy") return "重";
    if (job.type.key === "medical") return "医";
    if (job.type.key === "data") return "D";
    return "受";
  }

  function setupEvents() {
    app.input = new InputManager(dom.canvas);

    dom.startButton.addEventListener("click", () => {
      app.pendingRunMode = "normal";
      showScreen("vehicle");
    });
    dom.bonusButton.addEventListener("click", () => {
      if ((app.save.bonusTickets || 0) <= 0) return;
      app.pendingRunMode = "bonus";
      showScreen("vehicle");
    });
    dom.baseButton.addEventListener("click", () => showScreen("base"));
    dom.helpButton.addEventListener("click", () => showScreen("help"));
    dom.recordsButton.addEventListener("click", () => showScreen("records"));
    dom.debugButton.addEventListener("click", () => showScreen("debug"));

    document.querySelectorAll("[data-back-title]").forEach(button => {
      button.addEventListener("click", () => showScreen("title"));
    });

    dom.attackButton.addEventListener("click", () => {
      activateAttack();
      dom.attackButton.blur?.();
    });
    dom.skillButton.addEventListener("click", activateSkill);
    dom.returnButton.addEventListener("click", () => {
      if (!app.state || app.mode !== "playing") return;
      const d = dist(app.state.player.x, app.state.player.y, app.state.returnPoint.x, app.state.returnPoint.y);
      if (d < 58 && app.state.canReturnNow()) {
        finishRun(true, "return");
      } else if (!app.state.canReturnNow()) {
        app.state.pushPrompt("1件届けるか生存者保護、または残り60秒で帰還可能");
      } else {
        app.state.pushPrompt(`帰還地点まで ${Math.round(d)}m`);
      }
    });

    dom.vehicleSortieButton.addEventListener("click", launchSelectedRun);
    dom.retryButton.addEventListener("click", () => {
      if (app.result?.mode === "bonus") startBonusRun(app.lastVehicleId);
      else startRun(app.lastVehicleId);
    });
    dom.selectVehicleButton.addEventListener("click", () => {
      app.pendingRunMode = "normal";
      showScreen("vehicle");
    });
    dom.resultBaseButton.addEventListener("click", () => showScreen("base"));
    dom.resultTitleButton.addEventListener("click", () => showScreen("title"));

    window.addEventListener("resize", () => {
      resizeCanvas();
      if (app.mode === "help") drawHelpCanvas();
    });
  }

  function showScreen(name) {
    app.mode = name;
    dom.gameScreen.hidden = true;
    dom.upgradeOverlay.hidden = true;
    dom.screens.forEach(screen => screen.classList.remove("active"));

    const screenMap = {
      title: dom.titleScreen,
      vehicle: dom.vehicleScreen,
      base: dom.baseScreen,
      help: dom.helpScreen,
      records: dom.recordsScreen,
      debug: dom.debugScreen,
      result: dom.resultScreen
    };

    if (screenMap[name]) {
      screenMap[name].classList.add("active");
    }

    if (name === "title") renderTitle();
    if (name === "vehicle") renderVehicleSelect();
    if (name === "base") renderBase();
    if (name === "help") drawHelpCanvas();
    if (name === "records") renderRecords();
    if (name === "debug") renderDebug();
  }

  function showGame() {
    app.mode = "playing";
    dom.screens.forEach(screen => screen.classList.remove("active"));
    dom.gameScreen.hidden = false;
    dom.upgradeOverlay.hidden = true;
    resizeCanvas();
  }

  function renderTitle() {
    const upgradeable = getUpgradeableFacilities(app.save);
    const unassigned = getUnassignedPersonnel(app.save);
    dom.baseButton.textContent = upgradeable.length > 0 ? "灰街拠点（強化可）" : "灰街拠点";
    dom.titleSaveSummary.textContent = `所持資材 ${app.save.materials} / 廃棄区画パス ${app.save.bonusTickets || 0}/${CONFIG.BONUS_TICKET_MAX} / 最高配達 ${app.save.bestDeliveries}件 / 人員 ${(app.save.personnel || []).length}名`;
    dom.bonusButton.disabled = (app.save.bonusTickets || 0) <= 0;
    dom.bonusButton.textContent = (app.save.bonusTickets || 0) > 0
      ? `廃棄区画回収（パス${app.save.bonusTickets}/${CONFIG.BONUS_TICKET_MAX}）`
      : "廃棄区画回収（パスなし）";
    dom.titleNotices.innerHTML = [
      upgradeable.length > 0 ? `<span class="notice-chip good">強化可能: ${upgradeable[0].name}</span>` : "",
      unassigned.length > 0 ? `<span class="notice-chip warn">未配置の人員が${unassigned.length}名います</span>` : "",
      (app.save.bonusTickets || 0) > 0 ? `<span class="notice-chip">廃棄区画回収に出撃できます</span>` : ""
    ].filter(Boolean).join("");
  }

  function renderVehicleSelect() {
    dom.vehicleList.innerHTML = "";
    const effects = getPersonnelEffects(app.save);
    app.selectedVehicleId = normalizeVehicleId(app.selectedVehicleId || app.lastVehicleId);
    if (!app.save.unlockedVehicles.includes(app.selectedVehicleId)) app.selectedVehicleId = "alpha";
    dom.vehicleModeNote.textContent = app.pendingRunMode === "bonus"
      ? `廃棄区画回収: パスを1枚消費して90秒の資材回収へ出撃します。所持 ${app.save.bonusTickets || 0}/${CONFIG.BONUS_TICKET_MAX}`
      : "通常ラン: 配送依頼をこなし、帰還地点へ戻ります。";
    for (const vehicle of Object.values(VEHICLES)) {
      const unlocked = app.save.unlockedVehicles.includes(vehicle.id);
      const card = document.createElement("button");
      card.className = `vehicle-card${app.selectedVehicleId === vehicle.id ? " selected" : ""}`;
      card.disabled = !unlocked;
      const warehouseText = app.save.facilities.warehouse > 0 ? "倉庫Lvにより開始時に積載+1の可能性あり" : "拠点の倉庫で積載ボーナスを狙える";
      const roleHint = {
        alpha: "冷却品向き。高速単発配送。",
        beta: "重量貨物向き。積載と耐久で安定。",
        gamma: "壊れ物向き。危険回避が得意。"
      }[vehicle.id];
      card.innerHTML = `
        <div class="vehicle-card-head">
          ${renderDroneMini(vehicle.id)}
          <div>
            <strong>${vehicle.name}</strong>
            <span>${vehicle.role} / ${roleHint}</span>
          </div>
        </div>
        ${renderVehicleStatBars(vehicle, effects)}
        <span>${vehicle.skillName}: ${shortenSkillText(vehicle.skillText)}</span>
        <span>${vehicle.attackName}: ${shortenSkillText(vehicle.attackText)}</span>
        <span>${warehouseText}</span>
      `;
      card.addEventListener("click", () => {
        app.selectedVehicleId = vehicle.id;
        renderVehicleSelect();
      });
      dom.vehicleList.appendChild(card);
    }
    updateVehicleSortieBar();
  }

  function renderDroneMini(vehicleId) {
    return `
      <div class="drone-mini drone-${vehicleId}" aria-hidden="true">
        <span class="drone-arm arm-a"></span>
        <span class="drone-arm arm-b"></span>
        <span class="rotor r1"></span>
        <span class="rotor r2"></span>
        <span class="rotor r3"></span>
        <span class="rotor r4"></span>
        <span class="drone-body"></span>
        <span class="drone-nose"></span>
      </div>
    `;
  }

  function renderVehicleStatBars(vehicle, effects) {
    const hp = vehicle.hp + app.save.facilities.garage * 8 + effects.maxHpBonus;
    const stats = [
      { label: "耐久", value: hp, max: 140 },
      { label: "速度", value: vehicle.speed, max: 4 },
      { label: "積載", value: vehicle.capacity, max: 3 }
    ];
    return `
      <div class="vehicle-stat-bars">
        ${stats.map(stat => {
          const width = clamp((stat.value / stat.max) * 100, 8, 100);
          const valueText = stat.label === "速度" ? stat.value.toFixed(1) : Math.round(stat.value);
          return `
            <div class="vehicle-stat-row">
              <span>${stat.label}</span>
              <div class="vehicle-stat-track"><i style="width:${width}%"></i></div>
              <b>${valueText}</b>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function shortenSkillText(text) {
    return text
      .replace("2秒間、", "")
      .replace("2.5秒間、", "")
      .replace("3秒間、", "")
      .replace("移動速度が大きく上がる", "高速移動")
      .replace("危険区域の影響を大きく抑える", "危険軽減")
      .replace("周囲の妨害機を押し返す近距離パルス", "周囲を押し返す")
      .replace("前方へ到達距離の長いパルス弾を放つ", "長距離弾")
      .replace("前方の妨害機を短い到達距離でまとめて弾く", "前方短射程");
  }

  function updateVehicleSortieBar() {
    const vehicle = VEHICLES[app.selectedVehicleId] || VEHICLES.alpha;
    const isBonus = app.pendingRunMode === "bonus";
    const hasTicket = (app.save.bonusTickets || 0) > 0;
    dom.selectedVehicleLabel.textContent = `${vehicle.name}を選択中`;
    dom.vehicleSortieButton.textContent = isBonus ? "廃棄区画へ出動" : "出動";
    dom.vehicleSortieButton.disabled = isBonus && !hasTicket;
  }

  function launchSelectedRun() {
    const vehicleId = normalizeVehicleId(app.selectedVehicleId || app.lastVehicleId);
    if (app.pendingRunMode === "bonus") startBonusRun(vehicleId);
    else startRun(vehicleId);
  }

  function renderBase() {
    dom.baseMaterial.textContent = `灰街拠点 / 所持資材: ${app.save.materials}`;
    renderBonusPassPanel();
    dom.facilityList.innerHTML = "";
    for (const facility of FACILITIES) {
      const level = app.save.facilities[facility.key] || 0;
      const cost = getFacilityCost(level);
      const card = document.createElement("div");
      const canUpgrade = cost !== null && app.save.materials >= cost;
      card.className = `facility-card${canUpgrade ? " upgrade-ready" : ""}`;
      card.innerHTML = `
        <strong>${facility.name} Lv${level}${canUpgrade ? `<span class="status-badge">強化可能</span>` : ""}</strong>
        <span>${facility.effect}</span>
        <span>${facility.detail(level)}</span>
        <div class="facility-footer">
          <span>${cost === null ? "最大レベル" : `次の費用: 資材${cost}`}</span>
          <button ${canUpgrade ? "" : "disabled"}>${cost === null ? "完了" : "強化"}</button>
        </div>
      `;
      const button = card.querySelector("button");
      button.addEventListener("click", () => {
        if (!canUpgrade) return;
        app.save.materials -= cost;
        app.save.facilities[facility.key] = level + 1;
        saveData();
        renderBase();
        renderTitle();
      });
      dom.facilityList.appendChild(card);
    }
    renderPersonnel();
  }

  function renderBonusPassPanel() {
    const tickets = app.save.bonusTickets || 0;
    const canBuy = tickets < CONFIG.BONUS_TICKET_MAX && app.save.materials >= CONFIG.BONUS_TICKET_PRICE;
    const canLaunch = tickets > 0;
    dom.bonusPassPanel.innerHTML = `
      <strong>廃棄区画パス</strong>
      <span>廃棄区画パス: ${tickets}/${CONFIG.BONUS_TICKET_MAX}</span>
      <span>購入価格: 資材${CONFIG.BONUS_TICKET_PRICE}</span>
      <div class="facility-footer">
        <button data-buy-pass ${canBuy ? "" : "disabled"}>パスを購入</button>
        <button data-launch-bonus ${canLaunch ? "" : "disabled"}>廃棄区画回収</button>
      </div>
    `;
    dom.bonusPassPanel.querySelector("[data-buy-pass]").addEventListener("click", () => {
      if (!canBuy) return;
      app.save.materials -= CONFIG.BONUS_TICKET_PRICE;
      app.save.bonusTickets = Math.min(CONFIG.BONUS_TICKET_MAX, tickets + 1);
      saveData();
      renderBase();
      renderTitle();
    });
    dom.bonusPassPanel.querySelector("[data-launch-bonus]").addEventListener("click", () => {
      if ((app.save.bonusTickets || 0) <= 0) return;
      app.pendingRunMode = "bonus";
      showScreen("vehicle");
    });
  }

  function renderPersonnel() {
    if (!dom.personnelList || !dom.personnelSummary) return;
    const personnel = app.save.personnel || [];
    const assigned = personnel.filter(person => person.assignedFacility).length;
    const unassigned = getUnassignedPersonnel(app.save);
    const best = app.save.bestSurvivorRarity || getBestSurvivorRarity(personnel) || "なし";
    dom.personnelSummary.textContent = `回収総数: ${app.save.totalSurvivorsRecovered}名 / 所持人員: ${personnel.length}名 / 配置中: ${assigned}名 / 最高レアリティ: ${best}`;
    dom.personnelList.innerHTML = "";

    if (personnel.length === 0) {
      const empty = document.createElement("div");
      empty.className = "facility-card";
      empty.innerHTML = `
        <strong>人員なし</strong>
        <span>ラン中に生存者信号を見つけ、リフト回収して帰還すると人員が加入します。</span>
      `;
      dom.personnelList.appendChild(empty);
      return;
    }

    if (unassigned.length > 0) {
      const notice = document.createElement("div");
      notice.className = "facility-card notice-card";
      notice.innerHTML = `
        <strong>未配置の人員が${unassigned.length}名います</strong>
        <span>人員を施設に配置すると次回ランが有利になります。</span>
        <div class="facility-footer">
          <span>職能に合った施設へ配置します</span>
          <button data-auto-assign>おすすめ自動配置</button>
        </div>
      `;
      notice.querySelector("[data-auto-assign]").addEventListener("click", () => {
        const moved = autoAssignPersonnel();
        if (moved > 0) {
          saveData();
          renderBase();
          renderTitle();
        }
      });
      dom.personnelList.appendChild(notice);
    }

    for (const survivor of personnel) {
      const role = getSurvivorRole(survivor.role);
      const assignedFacility = survivor.assignedFacility ? getFacilityName(survivor.assignedFacility) : "未配置";
      const recommended = role ? getFacilityName(role.facility) : "灰街拠点";
      const card = document.createElement("div");
      card.className = `facility-card personnel-card${survivor.assignedFacility ? "" : " unassigned-person"}`;
      const assignmentButtons = PERSONNEL_FACILITIES.map(facility => {
        const capacity = getFacilityAssignmentCapacity(app.save, facility.key);
        const used = getAssignedCount(app.save, facility.key, survivor.id);
        const active = survivor.assignedFacility === facility.key;
        const canAssign = capacity > 0 && (active || used < capacity);
        const label = active ? `${facility.name} 配置中` : `${facility.name} ${used}/${capacity}`;
        return `<button class="mini-button" data-assign="${facility.key}" ${canAssign ? "" : "disabled"}>${label}</button>`;
      }).join("");

      card.innerHTML = `
        <strong>${survivor.name} <span class="rarity rarity-${survivor.rarity}">${survivor.rarity}</span>${survivor.assignedFacility ? "" : `<span class="status-badge warn">未配置</span>`}</strong>
        <span>${role?.name || "人員"} / 適性 ${survivor.aptitude} / 特性 ${survivor.trait}</span>
        <span>現在の配置先: ${assignedFacility}</span>
        <span>推奨: ${recommended}</span>
        <span>${describeSurvivorPlacement(survivor)}</span>
        <div class="personnel-actions">
          ${assignmentButtons}
          <button class="mini-button" data-release ${survivor.assignedFacility ? "" : "disabled"}>解除</button>
        </div>
      `;

      card.querySelectorAll("[data-assign]").forEach(button => {
        button.addEventListener("click", () => {
          const facilityKey = button.getAttribute("data-assign");
          const capacity = getFacilityAssignmentCapacity(app.save, facilityKey);
          const used = getAssignedCount(app.save, facilityKey, survivor.id);
          if (capacity <= 0 || used >= capacity) return;
          survivor.assignedFacility = facilityKey;
          saveData();
          renderBase();
        });
      });

      card.querySelector("[data-release]").addEventListener("click", () => {
        survivor.assignedFacility = null;
        saveData();
        renderBase();
      });

      dom.personnelList.appendChild(card);
    }
  }

  function renderRecords() {
    const upgradeable = getUpgradeableFacilities(app.save);
    const personnel = app.save.personnel || [];
    const specialStats = normalizeSpecialDeliveryStats(app.save.specialDeliveryStats);
    const coolingAverage = specialStats.coolingDelivered > 0
      ? Math.round(specialStats.coolingValueTotal / specialStats.coolingDelivered)
      : 0;
    dom.recordsPanel.innerHTML = `
      <div class="record-section">
        <h3>配送記録</h3>
        <div class="stat-grid">
          <div><span>プレイ回数</span><strong>${app.save.plays}</strong></div>
          <div><span>最高配達数</span><strong>${app.save.bestDeliveries}</strong></div>
          <div><span>最高獲得金額</span><strong>${app.save.bestMoney}</strong></div>
          <div><span>最高評価ランク</span><strong>${app.save.bestRank || "D"}</strong></div>
        </div>
      </div>
      <div class="record-section">
        <h3>特殊配送累計</h3>
        <div class="stat-grid">
          <div><span>特殊配送総数</span><strong>${specialStats.specialDelivered}</strong></div>
          <div><span>壊れ物納品</span><strong>${specialStats.fragileDelivered}</strong></div>
          <div><span>壊れ物無傷納品</span><strong>${specialStats.fragilePerfect}</strong></div>
          <div><span>壊れ物損傷</span><strong>${specialStats.fragileDamage}</strong></div>
          <div><span>冷却品納品</span><strong>${specialStats.coolingDelivered}</strong></div>
          <div><span>冷却品80%以上</span><strong>${specialStats.coolingHighValue}</strong></div>
          <div><span>冷却品平均価値</span><strong>${coolingAverage || "-"}%</strong></div>
          <div><span>重量貨物納品</span><strong>${specialStats.heavyDelivered}</strong></div>
          <div><span>重量貨物収益</span><strong>${specialStats.heavyMoney}</strong></div>
        </div>
      </div>
      <div class="record-section">
        <h3>灰街拠点</h3>
        <div class="stat-grid">
          <div><span>総獲得資材</span><strong>${app.save.totalMaterialsEarned || app.save.materials}</strong></div>
          <div><span>強化可能施設</span><strong>${upgradeable.length}</strong></div>
        </div>
        <p>施設レベル: ${getFacilityLevelText(app.save)}</p>
        <p>解放済み機体: ${app.save.unlockedVehicles.map(id => VEHICLES[normalizeVehicleId(id)]?.name || id).join(" / ")}</p>
      </div>
      <div class="record-section">
        <h3>人員記録</h3>
        <div class="stat-grid">
          <div><span>総保護生存者数</span><strong>${app.save.totalSurvivorsRecovered}</strong></div>
          <div><span>所持人員数</span><strong>${personnel.length}</strong></div>
          <div><span>配置中人員数</span><strong>${getAssignedPersonnelCount(app.save)}</strong></div>
          <div><span>最高レアリティ人員</span><strong>${app.save.bestSurvivorRarity || "なし"}</strong></div>
        </div>
      </div>
      <div class="record-section">
        <h3>機体別記録</h3>
        <div class="vehicle-stats-list">
          ${renderVehicleStatsHtml()}
        </div>
      </div>
    `;
  }

  function renderVehicleStatsHtml() {
    const stats = normalizeVehicleStats(app.save.vehicleStats);
    return Object.values(VEHICLES).map(vehicle => {
      const item = stats[vehicle.id];
      const avgDeliveries = item.runs > 0 ? (item.totalDeliveries / item.runs).toFixed(1) : "0.0";
      const avgMoney = item.runs > 0 ? Math.round(item.totalMoney / item.runs) : 0;
      return `
        <div class="vehicle-stat-card">
          <strong>${vehicle.name}</strong>
          <span>使用回数: ${item.runs}</span>
          <span>最高配達数: ${item.bestDeliveries}</span>
          <span>最高獲得金額: ${item.bestMoney}</span>
          <span>帰還成功: ${item.returns} / 失敗: ${item.failures}</span>
          <span>平均配達: ${avgDeliveries}件 / 平均金額: ${avgMoney}</span>
          <span>生存者加入: ${item.survivorsJoined}名 / 最高評価: ${item.bestRank}</span>
        </div>
      `;
    }).join("");
  }

  function renderDebug() {
    const controls = DEBUG_CONTROLS.map(control => {
      const value = app.debugConfig[control.key];
      return `
        <label class="debug-control">
          <span>${control.label}</span>
          <strong id="debugValue-${control.key}">${formatDebugValue(value, control)}</strong>
          <input type="range" min="${control.min}" max="${control.max}" step="${control.step}" value="${value}" data-debug-key="${control.key}">
        </label>
      `;
    }).join("");

    dom.debugPanel.innerHTML = `
      <div class="record-section">
        <h3>バランス調整</h3>
        <p>ここで変更した値は次のランから反映されます。</p>
        <div class="debug-controls">${controls}</div>
      </div>
      <div class="record-section">
        <h3>プリセット</h3>
        <div class="debug-button-grid">
          ${Object.entries(DEBUG_PRESETS).map(([key, preset]) => `<button data-preset="${key}">${preset.name}</button>`).join("")}
          <button data-debug-reset>初期値に戻す</button>
        </div>
      </div>
      <div class="record-section">
        <h3>セーブ補助</h3>
        <div class="debug-button-grid">
          <button data-reset-tutorial>初回ヒントをリセット</button>
          <button data-add-materials>資材 +100</button>
          <button data-add-personnel>ランダム人員を1名追加</button>
          <button data-reset-debug>デバッグ設定を初期化</button>
          <button class="danger-button" data-reset-save>セーブデータを初期化</button>
        </div>
      </div>
    `;

    dom.debugPanel.querySelectorAll("[data-debug-key]").forEach(input => {
      input.addEventListener("input", () => {
        const key = input.getAttribute("data-debug-key");
        const control = DEBUG_CONTROLS.find(item => item.key === key);
        setDebugConfig({ [key]: Number(input.value) });
        const label = dom.debugPanel.querySelector(`#debugValue-${key}`);
        if (label) label.textContent = formatDebugValue(app.debugConfig[key], control);
      });
    });

    dom.debugPanel.querySelectorAll("[data-preset]").forEach(button => {
      button.addEventListener("click", () => {
        const preset = DEBUG_PRESETS[button.getAttribute("data-preset")];
        setDebugConfig({ ...DEFAULT_DEBUG_CONFIG, ...preset.values });
        renderDebug();
      });
    });

    dom.debugPanel.querySelector("[data-debug-reset]").addEventListener("click", () => {
      setDebugConfig(DEFAULT_DEBUG_CONFIG);
      renderDebug();
    });
    dom.debugPanel.querySelector("[data-reset-debug]").addEventListener("click", () => {
      setDebugConfig(DEFAULT_DEBUG_CONFIG);
      renderDebug();
    });
    dom.debugPanel.querySelector("[data-reset-tutorial]").addEventListener("click", () => {
      app.save.tutorialSeen = false;
      saveData();
      renderDebug();
    });
    dom.debugPanel.querySelector("[data-add-materials]").addEventListener("click", () => {
      app.save.materials += 100;
      app.save.totalMaterialsEarned = (app.save.totalMaterialsEarned || 0) + 100;
      saveData();
      renderDebug();
      renderTitle();
    });
    dom.debugPanel.querySelector("[data-add-personnel]").addEventListener("click", () => {
      app.save.personnel = app.save.personnel || [];
      const survivor = generateSurvivor();
      app.save.personnel.push(survivor);
      app.save.totalSurvivorsRecovered = (app.save.totalSurvivorsRecovered || 0) + 1;
      app.save.bestSurvivorRarity = getBestSurvivorRarity(app.save.personnel);
      saveData();
      renderDebug();
      renderTitle();
    });
    dom.debugPanel.querySelector("[data-reset-save]").addEventListener("click", () => {
      const ok = typeof window.confirm === "function"
        ? window.confirm("本当にセーブデータを初期化しますか？ 拠点・人員・記録が消えます。")
        : true;
      if (!ok) return;
      app.save = createDefaultSave();
      saveData();
      renderDebug();
      renderTitle();
    });
  }

  function formatDebugValue(value, control) {
    const text = Number(value).toFixed(control.step < 1 ? 1 : 0);
    return `${text}${control.unit}`;
  }

  function drawHelpCanvas() {
    const canvas = dom.helpCanvas;
    if (!canvas) return;
    const helpCtx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(320, Math.floor(canvas.clientWidth || 720));
    const height = Math.round(width * 7 / 12);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    helpCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const sx = width / 720;
    const sy = height / 420;
    const X = value => value * sx;
    const Y = value => value * sy;

    helpCtx.fillStyle = "#171a1f";
    helpCtx.fillRect(0, 0, width, height);
    helpCtx.fillStyle = "#343a40";
    for (const x of [78, 230, 420, 585]) helpCtx.fillRect(X(x), 0, X(46), height);
    for (const y of [68, 190, 318]) helpCtx.fillRect(0, Y(y), width, Y(44));

    helpCtx.fillStyle = "#080a0d";
    for (const rect of [
      [145, 24, 70, 92], [306, 106, 82, 70], [510, 92, 80, 104],
      [130, 250, 86, 78], [300, 275, 112, 82], [532, 254, 78, 88]
    ]) {
      helpCtx.fillRect(X(rect[0]), Y(rect[1]), X(rect[2]), Y(rect[3]));
    }

    const circle = (x, y, r, fill, stroke = null) => {
      helpCtx.fillStyle = fill;
      helpCtx.beginPath();
      helpCtx.arc(X(x), Y(y), X(r), 0, Math.PI * 2);
      helpCtx.fill();
      if (stroke) {
        helpCtx.strokeStyle = stroke;
        helpCtx.lineWidth = X(3);
        helpCtx.stroke();
      }
    };

    circle(182, 198, 34, "rgba(241,99,99,0.32)", "#f16363");
    circle(610, 332, 34, "rgba(101,167,255,0.22)", "#65a7ff");
    circle(96, 110, 20, "#f2d45c", "#111");
    circle(448, 88, 20, "#ff8fd8", "#111");
    circle(548, 198, 22, "rgba(110,226,141,0.24)", "#6ee28d");
    circle(270, 342, 20, "rgba(191,124,255,0.28)", "#bf7cff");
    circle(374, 218, 18, "rgba(255,255,255,0.22)", "#f8fbfc");

    helpCtx.save();
    helpCtx.translate(X(350), Y(210));
    helpCtx.strokeStyle = "rgba(181, 251, 255, 0.55)";
    helpCtx.lineWidth = X(3);
    helpCtx.beginPath();
    helpCtx.moveTo(X(-22), Y(-16));
    helpCtx.lineTo(X(22), Y(16));
    helpCtx.moveTo(X(22), Y(-16));
    helpCtx.lineTo(X(-22), Y(16));
    helpCtx.stroke();
    for (const sxr of [-1, 1]) {
      for (const syr of [-1, 1]) {
        helpCtx.fillStyle = "rgba(72,214,238,0.18)";
        helpCtx.beginPath();
        helpCtx.arc(X(sxr * 22), Y(syr * 16), X(9), 0, Math.PI * 2);
        helpCtx.fill();
        helpCtx.strokeStyle = "#48d6ee";
        helpCtx.lineWidth = X(2);
        helpCtx.beginPath();
        helpCtx.arc(X(sxr * 22), Y(syr * 16), X(5), 0, Math.PI * 2);
        helpCtx.stroke();
      }
    }
    helpCtx.fillStyle = "#48d6ee";
    roundedRect(helpCtx, X(-12), Y(-10), X(24), Y(20), X(6));
    helpCtx.fill();
    helpCtx.strokeStyle = "#042b34";
    helpCtx.lineWidth = X(3);
    helpCtx.stroke();
    helpCtx.fillStyle = "#e6fdff";
    helpCtx.beginPath();
    helpCtx.moveTo(0, Y(-20));
    helpCtx.lineTo(X(5), Y(-8));
    helpCtx.lineTo(X(-5), Y(-8));
    helpCtx.closePath();
    helpCtx.fill();
    helpCtx.restore();

    helpCtx.fillStyle = "#ff6f70";
    helpCtx.beginPath();
    helpCtx.moveTo(X(475), Y(232));
    helpCtx.lineTo(X(492), Y(260));
    helpCtx.lineTo(X(458), Y(260));
    helpCtx.closePath();
    helpCtx.fill();
    helpCtx.strokeStyle = "#461316";
    helpCtx.lineWidth = X(2);
    helpCtx.stroke();

    helpCtx.strokeStyle = "#48d6ee";
    helpCtx.lineWidth = X(5);
    helpCtx.beginPath();
    helpCtx.arc(X(350), Y(210), X(74), -Math.PI / 2.7, Math.PI / 6);
    helpCtx.stroke();

    helpCtx.fillStyle = "rgba(9,12,15,0.82)";
    helpCtx.fillRect(X(18), Y(16), X(236), Y(150));
    helpCtx.fillStyle = "#fff";
    helpCtx.font = `bold ${Math.max(12, X(16))}px system-ui`;
    helpCtx.fillText("画面の見方", X(32), Y(42));
    helpCtx.font = `${Math.max(10, X(13))}px system-ui`;
    const legend = [
      ["#f2d45c", "黄色: 受取地点"],
      ["#6ee28d", "緑: 目的地"],
      ["#f16363", "赤: 危険/妨害ユニット"],
      ["#ff8fd8", "ピンク: 生存者信号"],
      ["#65a7ff", "青: 帰還地点"],
      ["#bf7cff", "紫: ラン中強化"],
      ["#f8fbfc", "白: 修理地点"]
    ];
    legend.forEach((item, index) => {
      const y = Y(64 + index * 14);
      helpCtx.fillStyle = item[0];
      helpCtx.fillRect(X(32), y - Y(8), X(10), Y(10));
      helpCtx.fillStyle = "#d9e1e7";
      helpCtx.fillText(item[1], X(50), y);
    });

    helpCtx.save();
    helpCtx.translate(X(92), Y(342));
    helpCtx.strokeStyle = "rgba(120,220,235,0.72)";
    helpCtx.lineWidth = X(3);
    helpCtx.beginPath();
    helpCtx.arc(0, 0, X(44), 0, Math.PI * 2);
    helpCtx.stroke();
    helpCtx.fillStyle = "rgba(72,214,238,0.7)";
    helpCtx.beginPath();
    helpCtx.arc(X(22), Y(-16), X(16), 0, Math.PI * 2);
    helpCtx.fill();
    helpCtx.fillStyle = "#d9faff";
    helpCtx.font = `bold ${Math.max(10, X(12))}px system-ui`;
    helpCtx.textAlign = "center";
    helpCtx.fillText("疑似スティック", 0, Y(62));
    helpCtx.restore();

    helpCtx.save();
    helpCtx.translate(X(612), Y(86));
    helpCtx.fillStyle = "rgba(7,9,11,0.74)";
    helpCtx.beginPath();
    helpCtx.arc(0, 0, X(54), 0, Math.PI * 2);
    helpCtx.fill();
    helpCtx.strokeStyle = "rgba(255,255,255,0.18)";
    helpCtx.stroke();
    helpCtx.fillStyle = "#48d6ee";
    helpCtx.beginPath();
    helpCtx.arc(0, 0, X(4), 0, Math.PI * 2);
    helpCtx.fill();
    helpCtx.strokeStyle = "#f2d45c";
    helpCtx.lineWidth = X(3);
    helpCtx.beginPath();
    helpCtx.moveTo(X(34), Y(-8));
    helpCtx.lineTo(X(46), 0);
    helpCtx.lineTo(X(34), Y(8));
    helpCtx.stroke();
    helpCtx.fillStyle = "#6ee28d";
    helpCtx.beginPath();
    helpCtx.arc(X(-22), Y(18), X(4), 0, Math.PI * 2);
    helpCtx.fill();
    helpCtx.fillStyle = "#d9e1e7";
    helpCtx.font = `bold ${Math.max(9, X(11))}px system-ui`;
    helpCtx.textAlign = "center";
    helpCtx.fillText("レーダー", 0, Y(72));
    helpCtx.restore();
  }

  function startRun(vehicleId) {
    vehicleId = normalizeVehicleId(vehicleId);
    app.lastVehicleId = vehicleId;
    app.selectedVehicleId = vehicleId;
    app.pendingRunMode = "normal";
    app.state = new GameState(vehicleId, app.save, "normal");
    showGame();
    if (app.state.player.warehouseBonus > 0) {
      app.state.pushMessage("倉庫ボーナス: 積載+1");
    }
  }

  function startBonusRun(vehicleId) {
    if ((app.save.bonusTickets || 0) <= 0) {
      app.pendingRunMode = "bonus";
      showScreen("vehicle");
      return;
    }
    vehicleId = normalizeVehicleId(vehicleId);
    app.save.bonusTickets = Math.max(0, (app.save.bonusTickets || 0) - 1);
    saveData();
    app.lastVehicleId = vehicleId;
    app.selectedVehicleId = vehicleId;
    app.pendingRunMode = "bonus";
    app.state = new GameState(vehicleId, app.save, "bonus");
    showGame();
    app.state.pushMessage("廃棄区画パスを消費");
  }

  function activateSkill() {
    if (!app.state || app.mode !== "playing") return;
    app.state.player.activateSkill(app.state);
  }

  function activateAttack() {
    if (!app.state || app.mode !== "playing") return;
    app.state.player.attack(app.state);
  }

  function openUpgradeSelection(state) {
    app.mode = "upgrade";
    dom.upgradeOverlay.hidden = false;
    dom.upgradeChoices.innerHTML = "";
    const choices = getUpgradeChoices(state);
    for (const upgrade of choices) {
      const button = document.createElement("button");
      button.className = "choice-card";
      button.innerHTML = `<strong>${upgrade.name}</strong><span>${upgrade.text}</span>`;
      button.addEventListener("click", () => {
        upgrade.apply(state);
        state.runLog.upgradesTaken += 1;
        state.pushMessage(`${upgrade.name}を獲得`);
        dom.upgradeOverlay.hidden = true;
        app.mode = "playing";
      });
      dom.upgradeChoices.appendChild(button);
    }
  }

  function finishRun(returned, reason) {
    if (!app.state || app.state.over) return;
    const state = app.state;
    if (state.runMode === "bonus") {
      finishBonusRun(returned, reason);
      return;
    }
    state.over = true;
    let finalMoney = state.money;
    let bonus = 0;
    if (returned) {
      bonus = Math.round(finalMoney * CONFIG.RETURN_BONUS_RATE);
      finalMoney += bonus;
    } else {
      finalMoney = Math.floor(finalMoney * 0.5);
    }
    const baseMaterials = Math.max(0, Math.floor(finalMoney / 80) + state.deliveries * 2 + (returned ? 4 : 0));
    const materials = Math.round(baseMaterials * getBalanceValue("materialMultiplier") * (state.materialMultiplier || 1));
    const rank = getRank(state.deliveries, returned);
    const joinedSurvivors = returned
      ? state.protectedSurvivors.map(survivor => ({ ...survivor, assignedFacility: null }))
      : [];
    const lostSurvivorCount = returned ? 0 : state.protectedSurvivors.length;
    const oldBestDeliveries = app.save.bestDeliveries || 0;
    const oldBestMoney = app.save.bestMoney || 0;
    const oldBestRank = app.save.bestRank || "D";
    const oldBestSurvivorRarity = app.save.bestSurvivorRarity || "";
    const oldBestSurvivorsInRun = app.save.bestSurvivorsInRun || 0;
    const bestUpdates = [];
    if (state.deliveries > oldBestDeliveries) bestUpdates.push("最高配達数を更新！");
    if (finalMoney > oldBestMoney) bestUpdates.push("最高獲得金額を更新！");
    if (getRankScore(rank) > getRankScore(oldBestRank)) bestUpdates.push(`最高評価ランク${rank}を更新！`);
    const joinedBestRarity = getBestSurvivorRarity(joinedSurvivors);
    if (getRarityRank(joinedBestRarity) > getRarityRank(oldBestSurvivorRarity)) {
      bestUpdates.push(joinedBestRarity === "S" ? "初のSランク人員が加入！" : `最高レアリティ人員${joinedBestRarity}を更新！`);
    }
    if (joinedSurvivors.length > oldBestSurvivorsInRun) bestUpdates.push("生存者保護数を更新！");
    const runLog = {
      ...state.runLog,
      deliveries: state.deliveries,
      money: finalMoney,
      material: materials,
      returned,
      secondsLeft: Math.ceil(state.time),
      damageTaken: Math.round(state.damageTaken),
      survivorsProtected: state.protectedSurvivors.length,
      survivorsJoined: joinedSurvivors.length,
      bestSurvivorRarity: getBestSurvivorRarity(joinedSurvivors) || state.runLog.bestSurvivorRarity,
      returnSecondsLeft: returned ? Math.ceil(state.time) : null
    };

    app.result = {
      returned,
      reason,
      deliveries: state.deliveries,
      rawMoney: state.money,
      bonus,
      finalMoney,
      damageTaken: Math.round(state.damageTaken),
      vehicle: state.player.vehicle.name,
      stageTheme: state.stageTheme.name,
      areaStatus: state.areaStatus.name,
      materials,
      rank,
      joinedSurvivors,
      lostSurvivorCount,
      runLog,
      hpRatio: state.player.maxHp > 0 ? state.player.hp / state.player.maxHp : 0,
      supplyDropsCollected: state.supplyDropsCollected,
      bestUpdates,
      tutorialResultHint: state.tutorialActive
    };
    app.result.title = getRunTitle(app.result);

    app.save.materials += materials;
    app.save.totalMaterialsEarned = (app.save.totalMaterialsEarned || 0) + materials;
    app.save.bestDeliveries = Math.max(app.save.bestDeliveries, state.deliveries);
    app.save.bestMoney = Math.max(app.save.bestMoney, finalMoney);
    if (getRankScore(rank) > getRankScore(app.save.bestRank || "D")) app.save.bestRank = rank;
    app.save.bestSurvivorsInRun = Math.max(app.save.bestSurvivorsInRun || 0, joinedSurvivors.length);
    app.save.plays += 1;
    if (joinedSurvivors.length > 0) {
      app.save.personnel = app.save.personnel || [];
      app.save.totalSurvivorsRecovered = app.save.totalSurvivorsRecovered || 0;
      app.save.personnel.push(...joinedSurvivors);
      app.save.totalSurvivorsRecovered += joinedSurvivors.length;
      app.save.bestSurvivorRarity = getBestSurvivorRarity(app.save.personnel);
    }
    if (state.tutorialActive) app.save.tutorialSeen = true;
    updateVehicleStats(state.player.vehicleId, app.result);
    updateSpecialDeliveryStats(runLog);
    app.result.canUpgrade = getUpgradeableFacilities(app.save).length > 0;
    app.result.unassignedCount = getUnassignedPersonnel(app.save).length;
    app.result.nextGoal = getNextGoal(app.save, app.result);
    saveData();
    renderResult();
    showScreen("result");
  }

  function finishBonusRun(returned, reason) {
    const state = app.state;
    state.over = true;
    const finalMoney = returned ? state.money : Math.floor(state.money * CONFIG.BONUS_FAIL_KEEP_RATE);
    const materials = returned ? state.bonusMaterials : Math.floor(state.bonusMaterials * CONFIG.BONUS_FAIL_KEEP_RATE);
    const runLog = {
      ...state.runLog,
      money: finalMoney,
      material: materials,
      returned,
      secondsLeft: Math.ceil(state.time),
      damageTaken: Math.round(state.damageTaken),
      returnSecondsLeft: returned ? Math.ceil(state.time) : null
    };

    app.result = {
      mode: "bonus",
      returned,
      reason,
      title: returned ? "廃棄区画回収 成功" : "廃棄区画回収 失敗",
      deliveries: 0,
      rawMoney: state.money,
      bonus: 0,
      finalMoney,
      damageTaken: Math.round(state.damageTaken),
      vehicle: state.player.vehicle.name,
      materials,
      rank: returned ? "B" : "D",
      joinedSurvivors: [],
      lostSurvivorCount: 0,
      runLog,
      hpRatio: state.player.maxHp > 0 ? state.player.hp / state.player.maxHp : 0,
      supplyDropsCollected: state.supplyDropsCollected,
      bonusBoxesCollected: state.bonusBoxesCollected,
      bestUpdates: [],
      tutorialResultHint: false,
      canUpgrade: false,
      unassignedCount: 0,
      nextGoal: materials > 0 ? "回収資材で灰街拠点を強化できます" : "通常ランで資材を稼ぎ、次の廃棄区画パスを狙おう"
    };

    app.save.materials += materials;
    app.save.totalMaterialsEarned = (app.save.totalMaterialsEarned || 0) + materials;
    app.save.plays += 1;
    app.result.canUpgrade = getUpgradeableFacilities(app.save).length > 0;
    app.result.unassignedCount = getUnassignedPersonnel(app.save).length;
    saveData();
    renderResult();
    showScreen("result");
  }

  function renderResult() {
    const result = app.result;
    if (!result) return;
    if (result.mode === "bonus") {
      renderBonusResult(result);
      return;
    }
    const status = result.returned ? "帰還成功" : "帰還失敗";
    const reasonText = {
      return: "帰還地点へ戻りました",
      timeout: "時間切れ",
      breakdown: "機体大破"
    }[result.reason] || "";
    const survivorResult = result.joinedSurvivors.length > 0
      ? `
        <div class="survivor-result">
          <strong>生存者が灰街拠点に加入</strong>
          ${result.joinedSurvivors.map(survivor => `
            <p>名前: ${survivor.name}<br>レアリティ: ${survivor.rarity}<br>職能: ${getSurvivorRole(survivor.role)?.name || "人員"}<br>適性: ${survivor.aptitude}<br>特性: ${survivor.trait}<br>推奨配置先: ${getFacilityName(getSurvivorRole(survivor.role)?.facility)}</p>
          `).join("")}
        </div>
      `
      : result.lostSurvivorCount > 0
        ? `
          <div class="survivor-result">
            <strong>生存者の保護に失敗</strong>
            <p>通信途絶により、拠点加入なし</p>
          </div>
        `
        : "";
    const bestUpdateHtml = result.bestUpdates.length > 0
      ? `<div class="result-callout good">${result.bestUpdates.map(text => `<span>${text}</span>`).join("")}</div>`
      : "";
    const noticeHtml = [
      result.canUpgrade ? `<span class="notice-chip good">強化可能な施設があります</span>` : "",
      result.unassignedCount > 0 ? `<span class="notice-chip warn">未配置の人員が${result.unassignedCount}名います</span>` : "",
      result.tutorialResultHint ? `<span class="notice-chip">資材と人員で灰街拠点を強化しよう</span>` : ""
    ].filter(Boolean).join("");
    const specialLogHtml = renderSpecialDeliveryLogHtml(result.runLog);
    const runLogHtml = renderRunLogHtml(result.runLog);
    dom.retryButton.textContent = "同じ機体で再挑戦";
    dom.retryButton.disabled = false;
    dom.selectVehicleButton.textContent = "機体を選ぶ";

    dom.resultPanel.innerHTML = `
      <div class="stat-grid">
        <div><span>評価ランク</span><strong>${result.rank}</strong></div>
        <div><span>今回の称号</span><strong>${result.title}</strong></div>
        <div><span>帰還</span><strong>${status}</strong></div>
        <div><span>配達成功数</span><strong>${result.deliveries}</strong></div>
        <div><span>獲得金額</span><strong>${result.finalMoney}</strong></div>
        <div><span>受けた損傷</span><strong>${result.damageTaken}</strong></div>
        <div><span>機体</span><strong>${result.vehicle}</strong></div>
        <div><span>配送区域</span><strong>${result.stageTheme}</strong></div>
        <div><span>区域状況</span><strong>${result.areaStatus}</strong></div>
        <div><span>永続資材</span><strong>${result.materials}</strong></div>
        <div><span>理由</span><strong>${reasonText}</strong></div>
      </div>
      ${bestUpdateHtml}
      <p>${result.returned ? `帰還ボーナス +${result.bonus}` : "帰還できなかったため今回の報酬は半分になりました。"}</p>
      ${survivorResult}
      ${specialLogHtml}
      ${runLogHtml}
      ${noticeHtml ? `<div class="notice-list">${noticeHtml}</div>` : ""}
      <div class="next-goal"><strong>次の目標</strong><span>${result.nextGoal}</span></div>
    `;
  }

  function renderBonusResult(result) {
    const status = result.returned ? "成功" : "失敗";
    const reasonText = {
      return: "帰還地点へ戻りました",
      timeout: "時間切れ",
      breakdown: "機体大破"
    }[result.reason] || "";
    const ticketText = `廃棄区画パス ${app.save.bonusTickets || 0}/${CONFIG.BONUS_TICKET_MAX}`;
    dom.retryButton.textContent = "同じ機体で廃棄区画へ";
    dom.retryButton.disabled = (app.save.bonusTickets || 0) <= 0;
    dom.selectVehicleButton.textContent = "通常ランの機体を選ぶ";
    dom.resultPanel.innerHTML = `
      <div class="result-callout ${result.returned ? "good" : ""}">
        <span>廃棄区画回収 ${status}</span>
        <span>${result.returned ? "回収物を持ち帰りました" : "回収物は半分だけ持ち帰りました"}</span>
      </div>
      <div class="stat-grid">
        <div><span>モード名</span><strong>廃棄区画回収</strong></div>
        <div><span>結果</span><strong>${status}</strong></div>
        <div><span>資材箱</span><strong>${result.bonusBoxesCollected}</strong></div>
        <div><span>支援物資</span><strong>${result.supplyDropsCollected}</strong></div>
        <div><span>獲得金額</span><strong>${result.finalMoney}</strong></div>
        <div><span>獲得資材</span><strong>${result.materials}</strong></div>
        <div><span>受けた損傷</span><strong>${result.damageTaken}</strong></div>
        <div><span>使用機体</span><strong>${result.vehicle}</strong></div>
        <div><span>理由</span><strong>${reasonText}</strong></div>
      </div>
      <p>${ticketText}</p>
      ${result.canUpgrade ? `<div class="notice-list"><span class="notice-chip good">強化可能な施設があります</span></div>` : ""}
      <div class="next-goal"><strong>次の目標</strong><span>${result.nextGoal}</span></div>
    `;
  }

  function renderSpecialDeliveryLogHtml(log) {
    if (!log || !log.specialDelivered) return "";
    const coolingAverage = log.coolingDelivered > 0
      ? Math.round(log.coolingValueTotal / log.coolingDelivered)
      : 0;
    return `
      <div class="run-log special-delivery-log">
        <strong>特殊配送ログ</strong>
        <div class="log-grid">
          <span>壊れ物納品: ${log.fragileDelivered}件</span>
          <span>壊れ物無傷: ${log.fragilePerfect}件</span>
          <span>壊れ物損傷: ${log.fragileDamage}回</span>
          <span>冷却品納品: ${log.coolingDelivered}件</span>
          <span>冷却品平均価値: ${coolingAverage || "-"}%</span>
          <span>重量貨物納品: ${log.heavyDelivered}件</span>
          <span>重量貨物収益: ${log.heavyMoney}</span>
        </div>
      </div>
    `;
  }

  function renderRunLogHtml(log) {
    if (!log) return "";
    const eventRows = Object.entries(log.eventsByType || {})
      .map(([name, count]) => `<span>${name}: ${count}回</span>`)
      .join("");
    return `
      <div class="run-log">
        <strong>今回のログ</strong>
        <div class="log-grid">
          <span>配達成功: ${log.deliveries}件</span>
          <span>獲得金額: ${log.money}</span>
          <span>獲得資材: ${log.material}</span>
          <span>危険イベント: ${log.eventsTotal}回</span>
          <span>妨害出現: ${log.enemiesSpawned}体</span>
          <span>無力化: ${log.enemiesDisabled}体</span>
          <span>パルス使用: ${log.pulseUsed}回</span>
          <span>スキル使用: ${log.skillUsed}回</span>
          <span>生存者保護: ${log.survivorsProtected}名</span>
          <span>支援物資: ${log.supplyCollected}回</span>
          <span>帰還残り: ${log.returnSecondsLeft == null ? "-" : `${log.returnSecondsLeft}秒`}</span>
          <span>受けた損傷: ${log.damageTaken}</span>
        </div>
        <details>
          <summary>詳細ログ</summary>
          <div class="log-grid compact-log">
            <span>危険区域侵入: ${log.hazardEntries}回</span>
            <span>強化取得: ${log.upgradesTaken}回</span>
            <span>修理使用: ${log.repairsUsed}回</span>
            <span>生存者信号: ${log.survivorSignals}回</span>
            <span>リフト成功: ${log.liftSuccess}回</span>
            <span>リフト中断: ${log.liftInterrupted}回</span>
            <span>拠点加入: ${log.survivorsJoined}名</span>
            <span>最高人員: ${log.bestSurvivorRarity || "なし"}</span>
            <span>最遠目的地: ${log.farthestTargetDistance}m</span>
            ${eventRows || "<span>イベント内訳なし</span>"}
          </div>
        </details>
        <p>${getRunLogHint(log)}</p>
      </div>
    `;
  }

  function getRunLogHint(log) {
    if (log.eventsTotal >= 9) return "危険イベントが多めでした。イベント間隔を少し長くすると遊びやすくなります。";
    if (log.survivorsProtected > 0 && log.survivorsJoined === 0) return "生存者を保護できました。次は帰還を優先すると人員加入が安定します。";
    if (log.enemiesSpawned > 0 && log.pulseUsed <= 1) return "パルス使用が少なめです。妨害ユニットは無力化も選択肢です。";
    if (log.returnSecondsLeft != null && log.returnSecondsLeft < 15) return "帰還残り時間が少なめです。残り60秒時点で帰還ルートを意識しましょう。";
    if (log.damageTaken >= 55) return "損傷が多めです。危険区域損傷を下げる調整も検討できます。";
    return "今回のログを見ながら、イベント間隔や報酬倍率を少しずつ試せます。";
  }

  function formatCargoPanelLine(job, distance, due) {
    const details = [];
    if (job.type.special === "fragile") {
      details.push(`報酬 ${job.currentReward}/${job.baseReward}`);
      details.push(getFragileCondition(job));
    } else if (job.type.special === "cooling") {
      const value = job.getValuePercent();
      const tone = value >= 80 ? "cargo-good" : value >= 50 ? "cargo-warn" : "cargo-bad";
      details.push(`<span class="${tone}">冷却状態 ${value}%</span>`);
      details.push(`報酬 ${job.currentReward}/${job.baseReward}`);
    } else if (job.type.special === "heavy") {
      details.push("積載 2枠使用");
    }
    if (job.hacked) details.push("配送データ汚染");
    const detailHtml = details.length > 0 ? ` <span class="cargo-detail">${details.join(" / ")}</span>` : "";
    return `<strong style="color:${job.type.color}">${job.type.name}</strong> 目的地まで ${distance}m${due}${detailHtml}`;
  }

  function updateUi() {
    if (!app.state || app.mode === "title" || app.mode === "base" || app.mode === "help" || app.mode === "records" || app.mode === "vehicle" || app.mode === "result") {
      return;
    }
    const state = app.state;
    const player = state.player;
    const cargo = player.getCargo(state);
    const usedCapacity = state.getUsedCapacity();
    dom.hudTime.textContent = formatTime(state.time);
    dom.hudMoney.textContent = String(state.money);
    const deliveryLabel = dom.hudDeliveries.parentElement?.querySelector("span");
    if (deliveryLabel) deliveryLabel.textContent = state.runMode === "bonus" ? "回収" : "配達";
    dom.hudDeliveries.textContent = state.runMode === "bonus"
      ? String(state.bonusBoxesCollected)
      : String(state.deliveries);
    dom.hudHp.textContent = `${Math.ceil(player.hp)}/${player.maxHp}`;
    dom.hudCargo.textContent = state.runMode === "bonus" ? `資材${state.bonusMaterials}` : `${usedCapacity}/${player.capacity}`;

    const panelLines = [];
    if (state.runMode === "bonus") {
      const nearestBox = nearestMaterialBox(state);
      const nearestDrop = nearestSupplyDrop(state);
      panelLines.push(`<strong>廃棄区画回収</strong> 資材箱 ${state.bonusBoxesCollected}/${CONFIG.BONUS_BOX_COUNT} / 回収資材 ${state.bonusMaterials}`);
      if (nearestBox) panelLines.push(`<strong>資材箱</strong> ${Math.round(nearestBox.distance)}m`);
      else if (nearestDrop) panelLines.push(`<strong>支援物資</strong> ${Math.round(nearestDrop.distance)}m`);
      else panelLines.push("<strong>帰還推奨</strong> 回収物を確保しました");
      dom.jobPanel.innerHTML = panelLines.join("<br>");
      updateActionButtons(state, player);
      return;
    }
    if (state.areaStatus) {
      panelLines.push(`<strong>区域状況</strong> ${state.areaStatus.name} / ${state.areaStatus.shortText}`);
    }
    if (state.liftProgress) {
      const progress = Math.floor((state.liftProgress.timer / state.liftProgress.duration) * 100);
      panelLines.push(`<strong>リフト回収中</strong> ${clamp(progress, 0, 100)}%`);
    }
    if (state.protectedSurvivors.length > 0) {
      const names = state.protectedSurvivors.map(survivor => survivor.name).slice(0, 2).join(" / ");
      panelLines.push(`<strong>保護中</strong> ${names} / 帰還地点へ`);
    }

    if (cargo.length === 0) {
      const nearest = nearestJob(state);
      if (nearest) {
        panelLines.push(`<strong>現在の依頼</strong> ${nearest.job.type.name}の受取地点まで ${Math.round(nearest.distance)}m / 積載${nearest.job.cargoSlots}枠`);
      } else {
        panelLines.push("<strong>現在の依頼</strong> 依頼地点を探索中");
      }
    } else {
      panelLines.push(...cargo.map(job => {
        const d = Math.round(dist(player.x, player.y, job.destination.x, job.destination.y));
        const due = job.remaining > 0 ? ` / 残り${Math.ceil(job.remaining)}秒` : "";
        return formatCargoPanelLine(job, d, due);
      }));
    }
    dom.jobPanel.innerHTML = panelLines.join("<br>");

    updateActionButtons(state, player);
  }

  function updateActionButtons(state, player) {
    const skill = player.vehicle;
    if (player.attackCooldown > 0) {
      dom.attackButton.textContent = `${skill.attackName} ${player.attackCooldown.toFixed(1)}秒`;
      dom.attackButton.disabled = true;
    } else {
      dom.attackButton.textContent = skill.attackName || "パルス";
      dom.attackButton.disabled = false;
    }

    if (player.skillCooldown > 0) {
      dom.skillButton.textContent = `${skill.skillName} ${player.skillCooldown.toFixed(1)}秒`;
      dom.skillButton.disabled = true;
    } else {
      dom.skillButton.textContent = `${skill.skillName}`;
      dom.skillButton.disabled = false;
    }

    const returnDistance = Math.round(dist(player.x, player.y, state.returnPoint.x, state.returnPoint.y));
    if (returnDistance < 58 && state.canReturnNow()) {
      dom.returnButton.textContent = "帰還する";
      dom.returnButton.classList.add("primary-button");
    } else if (state.time <= getReturnWarningTime()) {
      dom.returnButton.textContent = `帰還 ${returnDistance}m`;
      dom.returnButton.classList.add("primary-button");
    } else {
      dom.returnButton.textContent = `帰還地点 ${returnDistance}m`;
      dom.returnButton.classList.remove("primary-button");
    }

    const message = state.messages[0]?.text || "";
    dom.eventToast.textContent = message;
    dom.eventToast.classList.toggle("visible", Boolean(message));
    dom.floatingPrompt.textContent = state.prompt;
    dom.floatingPrompt.classList.toggle("visible", Boolean(state.prompt));
  }

  function resizeCanvas() {
    const rect = dom.canvasWrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(280, Math.floor(rect.width));
    const height = Math.max(360, Math.floor(rect.height));
    dom.canvas.width = Math.floor(width * dpr);
    dom.canvas.height = Math.floor(height * dpr);
    dom.canvas.style.width = `${width}px`;
    dom.canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (app.state) app.state.updateCamera();
  }

  function loop(now) {
    const dt = Math.min(0.05, (now - app.lastFrame) / 1000);
    app.lastFrame = now;

    if (app.input) {
      app.input.pollGamepadActions();
    }

    if (app.state && app.mode === "playing") {
      app.state.update(dt);
    }
    if (app.state && (app.mode === "playing" || app.mode === "upgrade")) {
      draw(app.state);
      updateUi();
    }
    requestAnimationFrame(loop);
  }

  function draw(state) {
    const w = dom.canvas.clientWidth;
    const h = dom.canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#171a1f";
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(-state.camera.x, -state.camera.y);
    drawMap(state);
    drawWorldItems(state);
    ctx.restore();

    drawOverlays(state, w, h);
  }

  function drawMap(state) {
    const colors = state.stageTheme?.colors || STAGE_THEMES.central.colors;
    ctx.fillStyle = colors.ground;
    ctx.fillRect(0, 0, CONFIG.MAP_W, CONFIG.MAP_H);

    for (const road of state.roads) {
      ctx.fillStyle = road.major ? blendHex(colors.roadAlt, "#ffffff", 0.1) : (road.vertical ? colors.road : colors.roadAlt);
      ctx.fillRect(road.x, road.y, road.w, road.h);
      ctx.strokeStyle = road.major ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)";
      ctx.lineWidth = road.major ? 3 : 2;
      if (road.vertical) {
        ctx.beginPath();
        ctx.moveTo(road.x + road.w / 2, road.y);
        ctx.lineTo(road.x + road.w / 2, road.y + road.h);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(road.x, road.y + road.h / 2);
        ctx.lineTo(road.x + road.w, road.y + road.h / 2);
        ctx.stroke();
      }
    }

    for (const building of state.buildings) {
      ctx.fillStyle = colors.building;
      ctx.fillRect(building.x, building.y, building.w, building.h);
      ctx.strokeStyle = colors.buildingStroke;
      ctx.lineWidth = 3;
      ctx.strokeRect(building.x + 1, building.y + 1, building.w - 2, building.h - 2);
    }
  }

  function drawWorldItems(state) {
    const returnWarn = state.time <= getReturnWarningTime();
    const markerAlpha = state.getMarkerAlpha();
    drawReturnPoint(state.returnPoint, returnWarn, markerAlpha);

    for (const zone of state.warningZones) {
      drawWarningZone(zone);
    }

    for (const hazard of state.hazards) {
      drawHazard(hazard);
    }

    for (const drop of state.supplyDrops) {
      drawSupplyDrop(drop);
    }

    for (const box of state.materialBoxes) {
      drawMaterialBox(box);
    }

    for (const signal of state.survivorSignals) {
      drawSurvivorSignal(signal, markerAlpha);
    }

    for (const site of state.repairSites) {
      if (!site.used) drawRepairSite(site);
    }

    for (const site of state.upgradeSites) {
      if (!site.used) drawUpgradeSite(site);
    }

    for (const job of state.jobs) {
      if (job.status === "available") drawPickup(job, markerAlpha);
      if (job.status === "carried") drawDestination(job, markerAlpha);
    }

    for (const projectile of state.projectiles) {
      drawProjectile(projectile);
    }

    for (const effect of state.attackEffects) {
      drawAttackEffect(effect);
    }

    for (const enemy of state.enemies) {
      drawInterferenceUnit(enemy);
    }

    drawPlayer(state.player);
    drawProtectedSurvivors(state);
    drawLiftProgress(state);
  }

  function drawReturnPoint(point, warning, alpha = 1) {
    const pulse = warning ? 10 + Math.sin(performance.now() / 150) * 8 : 0;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(point.x, point.y);
    ctx.strokeStyle = warning ? "#80b8ff" : "rgba(101,167,255,0.55)";
    ctx.lineWidth = warning ? 6 : 4;
    ctx.beginPath();
    ctx.arc(0, 0, 44 + pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(101,167,255,0.18)";
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d8e9ff";
    ctx.font = "bold 14px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("帰還", 0, 5);
    ctx.restore();
  }

  function drawHazard(hazard) {
    ctx.save();
    ctx.translate(hazard.x, hazard.y);
    const pulse = Math.sin(hazard.pulse) * 4;
    const isFire = hazard instanceof SpreadHazard;
    ctx.fillStyle = isFire ? "rgba(255, 108, 44, 0.36)" : "rgba(231, 66, 66, 0.32)";
    ctx.beginPath();
    ctx.arc(0, 0, hazard.radius + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isFire ? "rgba(255, 166, 72, 0.9)" : "rgba(255, 102, 102, 0.85)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, hazard.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 180, 180, 0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-hazard.radius * 0.45, -hazard.radius * 0.45);
    ctx.lineTo(hazard.radius * 0.45, hazard.radius * 0.45);
    ctx.moveTo(hazard.radius * 0.45, -hazard.radius * 0.45);
    ctx.lineTo(-hazard.radius * 0.45, hazard.radius * 0.45);
    ctx.stroke();
    if (isFire) {
      ctx.fillStyle = "rgba(255, 220, 150, 0.8)";
      ctx.font = "bold 14px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("火", 0, 5);
    }
    ctx.restore();
  }

  function drawWarningZone(zone) {
    ctx.save();
    ctx.translate(zone.x, zone.y);
    const pulse = 5 + Math.sin(zone.pulse) * 4;
    ctx.fillStyle = "rgba(255, 145, 44, 0.22)";
    ctx.beginPath();
    ctx.arc(0, 0, zone.radius + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 190, 86, 0.92)";
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.arc(0, 0, zone.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#ffe2a6";
    ctx.font = "bold 15px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(Math.max(1, Math.ceil(zone.timer)), 0, 5);
    ctx.restore();
  }

  function drawSupplyDrop(drop) {
    ctx.save();
    ctx.translate(drop.x, drop.y);
    const pulse = Math.sin(drop.pulse) * 4;
    ctx.fillStyle = "rgba(160, 240, 255, 0.22)";
    ctx.beginPath();
    ctx.arc(0, 0, drop.radius + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#a8f2ff";
    ctx.lineWidth = 3;
    ctx.strokeRect(-16, -16, 32, 32);
    ctx.fillStyle = "#f8feff";
    ctx.fillRect(-4, -13, 8, 26);
    ctx.fillRect(-13, -4, 26, 8);
    ctx.restore();
  }

  function drawMaterialBox(box) {
    ctx.save();
    ctx.translate(box.x, box.y);
    const pulse = Math.sin(box.pulse) * 3;
    ctx.fillStyle = "rgba(115, 214, 255, 0.18)";
    ctx.beginPath();
    ctx.arc(0, 0, box.radius + 8 + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#74d6ff";
    ctx.strokeStyle = "#12313a";
    ctx.lineWidth = 3;
    roundedRect(ctx, -18, -14, 36, 28, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#0c2027";
    ctx.font = "bold 13px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("材", 0, 5);
    ctx.restore();
  }

  function drawSurvivorSignal(signal, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(signal.x, signal.y);
    const pulse = 5 + Math.sin(signal.pulse) * 5;
    ctx.fillStyle = "rgba(255, 143, 216, 0.2)";
    ctx.beginPath();
    ctx.arc(0, 0, signal.radius + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ff8fd8";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, signal.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#ffe3f6";
    ctx.beginPath();
    ctx.arc(0, -5, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-8, 4, 16, 13);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.72)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-14, -18);
    ctx.lineTo(14, -18);
    ctx.moveTo(0, -18);
    ctx.lineTo(0, -28);
    ctx.stroke();
    drawLabel("生存者信号", 0, -38, "#ff8fd8");
    ctx.restore();
  }

  function drawProtectedSurvivors(state) {
    if (state.protectedSurvivors.length === 0) return;
    const player = state.player;
    ctx.save();
    ctx.translate(player.x, player.y);
    for (let i = 0; i < state.protectedSurvivors.length; i += 1) {
      const angle = -Math.PI / 2 + i * 0.75;
      const x = Math.cos(angle) * 30;
      const y = Math.sin(angle) * 30 + 18;
      ctx.fillStyle = "rgba(255, 143, 216, 0.28)";
      ctx.beginPath();
      ctx.arc(x, y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffd6f1";
      ctx.beginPath();
      ctx.arc(x, y - 3, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - 5, y + 2, 10, 7);
    }
    ctx.restore();
  }

  function drawLiftProgress(state) {
    if (!state.liftProgress) return;
    const signal = state.liftProgress.signal;
    const progress = clamp(state.liftProgress.timer / state.liftProgress.duration, 0, 1);
    ctx.save();
    ctx.translate(signal.x, signal.y);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.32)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, signal.radius + 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "#ff8fd8";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(0, 0, signal.radius + 14, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 13px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("リフト", 0, 5);
    ctx.restore();
  }

  function drawRepairSite(site) {
    ctx.save();
    ctx.translate(site.x, site.y);
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f8fbfc";
    ctx.fillRect(-5, -17, 10, 34);
    ctx.fillRect(-17, -5, 34, 10);
    ctx.restore();
  }

  function drawUpgradeSite(site) {
    ctx.save();
    ctx.translate(site.x, site.y);
    ctx.fillStyle = "rgba(191,124,255,0.24)";
    ctx.beginPath();
    for (let i = 0; i < 6; i += 1) {
      const a = Math.PI / 6 + i * Math.PI / 3;
      const x = Math.cos(a) * 30;
      const y = Math.sin(a) * 30;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#bf7cff";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#f3e8ff";
    ctx.font = "bold 17px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("+", 0, 6);
    ctx.restore();
  }

  function drawPickup(job, alpha = 1) {
    const p = job.pickup;
    const ttlPulse = job.urgent ? Math.sin(performance.now() / 90) * 5 : 0;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y);
    ctx.fillStyle = job.type.color;
    ctx.beginPath();
    ctx.moveTo(0, -22 - ttlPulse);
    ctx.lineTo(22 + ttlPulse, 0);
    ctx.lineTo(0, 22 + ttlPulse);
    ctx.lineTo(-22 - ttlPulse, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#17120a";
    ctx.font = "bold 13px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(getJobMarkerGlyph(job), 0, 5);
    drawLabel(job.type.name, 0, -32, job.type.color);
    ctx.restore();
  }

  function drawDestination(job, alpha = 1) {
    const p = job.destination;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y);
    ctx.fillStyle = "rgba(110,226,141,0.22)";
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#6ee28d";
    ctx.lineWidth = 4;
    ctx.strokeRect(-19, -19, 38, 38);
    ctx.fillStyle = "#e8fff0";
    ctx.font = "bold 13px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("届", 0, 5);
    drawLabel(job.type.name, 0, -34, "#6ee28d");
    ctx.restore();
  }

  function drawProjectile(projectile) {
    ctx.save();
    ctx.translate(projectile.x, projectile.y);
    ctx.fillStyle = "#b5fbff";
    ctx.beginPath();
    ctx.arc(0, 0, projectile.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#0a5463";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  function drawAttackEffect(effect) {
    ctx.save();
    ctx.globalAlpha = clamp(effect.ttl / 0.18, 0, 1);
    ctx.strokeStyle = effect.color;
    ctx.fillStyle = effect.color;
    ctx.lineWidth = 4;
    ctx.translate(effect.x, effect.y);
    if (effect.type === "ring") {
      ctx.beginPath();
      ctx.arc(0, 0, effect.radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (effect.type === "cone") {
      const angle = Math.atan2(effect.dir.y, effect.dir.x);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, effect.range, angle - Math.PI / 3, angle + Math.PI / 3);
      ctx.closePath();
      ctx.globalAlpha *= 0.28;
      ctx.fill();
    } else {
      ctx.rotate(Math.atan2(effect.dir.y, effect.dir.x));
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(effect.range, 0);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawInterferenceUnit(enemy) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    const wobble = Math.sin(performance.now() / 170) * 0.22;

    if (enemy.type === "jammer") {
      ctx.fillStyle = "rgba(190, 80, 255, 0.12)";
      ctx.beginPath();
      ctx.arc(0, 0, enemy.effectRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(214, 120, 255, 0.38)";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, enemy.effectRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (enemy.type === "patrol") {
      const alert = enemy.alertTimer > 0;
      ctx.fillStyle = alert ? "rgba(255, 218, 92, 0.12)" : "rgba(255, 180, 76, 0.08)";
      ctx.beginPath();
      ctx.arc(0, 0, enemy.alertRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = alert ? "rgba(255, 218, 92, 0.55)" : "rgba(255, 180, 76, 0.26)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, enemy.alertRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.rotate(wobble);
    const styles = {
      chaser: { fill: "#ff6f70", stroke: "#461316", label: "追" },
      jammer: { fill: "#be6dff", stroke: "#32124c", label: "妨" },
      recovery: { fill: "#ff8fd8", stroke: "#4c163b", label: "回" },
      patrol: { fill: "#ffb454", stroke: "#4a2b0b", label: "警" },
      hacker: { fill: "#77d8ff", stroke: "#12384a", label: "汚" }
    };
    const style = styles[enemy.type] || styles.chaser;
    ctx.fillStyle = style.fill;
    ctx.beginPath();
    if (enemy.type === "jammer") {
      ctx.arc(0, 0, enemy.radius + 4, 0, Math.PI * 2);
    } else if (enemy.type === "hacker") {
      roundedRect(ctx, -13, -10, 26, 20, 5);
    } else {
      ctx.moveTo(0, -16);
      ctx.lineTo(15, 12);
      ctx.lineTo(0, 7);
      ctx.lineTo(-15, 12);
      ctx.closePath();
    }
    ctx.fill();
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(18, 0);
    if (enemy.type === "jammer") {
      ctx.moveTo(0, -18);
      ctx.lineTo(0, 18);
    }
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 11px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(style.label, 0, 4);
    ctx.restore();
  }

  function drawPlayer(player) {
    ctx.save();
    ctx.translate(player.x, player.y);
    const angle = Math.atan2(player.facing.y, player.facing.x);
    ctx.rotate(angle + Math.PI / 2);

    const activeColor = player.skillActive > 0 ? "#b5fbff" : "#48d6ee";
    const body = player.vehicleId === "beta"
      ? { w: 28, h: 22, rotorX: 24, rotorY: 16, rotorR: 7 }
      : player.vehicleId === "gamma"
        ? { w: 18, h: 28, rotorX: 18, rotorY: 20, rotorR: 5 }
        : { w: 20, h: 20, rotorX: 19, rotorY: 15, rotorR: 5.5 };

    ctx.strokeStyle = "rgba(181, 251, 255, 0.55)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-body.rotorX, -body.rotorY);
    ctx.lineTo(body.rotorX, body.rotorY);
    ctx.moveTo(body.rotorX, -body.rotorY);
    ctx.lineTo(-body.rotorX, body.rotorY);
    ctx.stroke();

    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        ctx.fillStyle = "rgba(72, 214, 238, 0.18)";
        ctx.beginPath();
        ctx.arc(sx * body.rotorX, sy * body.rotorY, body.rotorR + 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sx * body.rotorX, sy * body.rotorY, body.rotorR, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.fillStyle = activeColor;
    roundedRect(ctx, -body.w / 2, -body.h / 2, body.w, body.h, 6);
    ctx.fill();
    ctx.strokeStyle = "#042b34";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#e6fdff";
    ctx.beginPath();
    ctx.moveTo(0, -body.h / 2 - 8);
    ctx.lineTo(5, -body.h / 2 + 2);
    ctx.lineTo(-5, -body.h / 2 + 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawLabel(text, x, y, color) {
    ctx.save();
    ctx.font = "bold 12px system-ui";
    ctx.textAlign = "center";
    const width = ctx.measureText(text).width + 12;
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    roundedRect(ctx, x - width / 2, y - 17, width, 20, 6);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.fillText(text, x, y - 3);
    ctx.restore();
  }

  function drawOverlays(state, w, h) {
    if (state.blackoutTimer > 0) {
      const px = state.player.x - state.camera.x;
      const py = state.player.y - state.camera.y;
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.58)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "destination-out";
      const radius = 180 + Math.sin(performance.now() / 160) * 16;
      const gradient = ctx.createRadialGradient(px, py, radius * 0.28, px, py, radius);
      gradient.addColorStop(0, "rgba(0,0,0,1)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      ctx.restore();
    }

    drawMiniMap(state, w, h);
    drawDirectionGuides(state, w, h);

    if (app.mode === "upgrade") {
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fillRect(0, 0, w, h);
    }
  }

  function drawMiniMap(state, w, h) {
    const size = 124;
    const radius = size / 2;
    const x = w - size - 10;
    const y = 10;
    const cx = x + radius;
    const cy = y + radius;
    const radarRange = 560 + (state.personnelEffects?.radarBonus || 0);
    const hazardSize = 3.2 + (state.personnelEffects?.hazardClarity || 0) * 8;
    ctx.save();
    ctx.fillStyle = "rgba(7,9,11,0.7)";
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    for (const ring of [0.34, 0.67]) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius * ring, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy + radius);
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 4, 0, Math.PI * 2);
    ctx.clip();

    for (const hazard of state.hazards) {
      drawRadarMarker(state, hazard, "#f16363", cx, cy, radius, radarRange, hazardSize, false);
    }
    for (const zone of state.warningZones) {
      drawRadarMarker(state, zone, "#ffb454", cx, cy, radius, radarRange, 3.3, false);
    }
    for (const drop of state.supplyDrops) {
      drawRadarMarker(state, drop, "#a8f2ff", cx, cy, radius, radarRange, 3.8, true);
    }
    for (const box of state.materialBoxes) {
      drawRadarMarker(state, box, "#74d6ff", cx, cy, radius, radarRange, 3.8, true);
    }
    for (const signal of state.survivorSignals) {
      drawRadarMarker(state, signal, "#ff8fd8", cx, cy, radius, radarRange, 4.2, true);
    }
    for (const site of state.repairSites) {
      if (!site.used) drawRadarMarker(state, site, "#f8fbfc", cx, cy, radius, radarRange, 3.3, true);
    }
    for (const site of state.upgradeSites) {
      if (!site.used) drawRadarMarker(state, site, "#bf7cff", cx, cy, radius, radarRange, 3.4, true);
    }
    drawRadarMarker(state, state.returnPoint, "#65a7ff", cx, cy, radius, radarRange, 4.2, true);
    for (const job of state.jobs) {
      if (job.status === "available") drawRadarMarker(state, job.pickup, job.type.color, cx, cy, radius, radarRange, 3.6, true);
      if (job.status === "carried") drawRadarMarker(state, job.destination, "#6ee28d", cx, cy, radius, radarRange, 4, true);
    }
    ctx.restore();

    ctx.fillStyle = "#48d6ee";
    ctx.beginPath();
    ctx.moveTo(cx, cy - 5);
    ctx.lineTo(cx + 5, cy + 5);
    ctx.lineTo(cx - 5, cy + 5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.font = "bold 10px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("RADAR", cx, y + size + 12);
    ctx.restore();
  }

  function drawDirectionGuides(state, w, h) {
    const guides = collectDirectionGuideTargets(state, w, h)
      .filter(target => !isPointOnScreen(state, target.point, w, h))
      .sort((a, b) => a.priority - b.priority || a.distance - b.distance)
      .slice(0, 5);
    if (guides.length === 0) return;

    const alpha = state.getMarkerAlpha();
    for (const guide of guides) {
      drawDirectionGuide(state, guide, w, h, alpha);
    }
  }

  function collectDirectionGuideTargets(state, w, h) {
    const targets = [];
    const add = (point, label, color, priority) => {
      if (!point) return;
      targets.push({
        point,
        label,
        color,
        priority,
        distance: dist(state.player.x, state.player.y, point.x, point.y)
      });
    };

    add(state.returnPoint, "帰還", "#65a7ff", state.runMode === "bonus" || state.protectedSurvivors.length > 0 ? 0 : 1);
    for (const box of state.materialBoxes) add(box, "資材", "#74d6ff", 2);
    for (const job of state.jobs) {
      if (job.status === "carried") add(job.destination, "目的地", "#6ee28d", 2);
    }
    for (const signal of state.survivorSignals) add(signal, "生存者", "#ff8fd8", 3);
    for (const drop of state.supplyDrops) add(drop, "物資", "#a8f2ff", 4);
    for (const job of state.jobs) {
      if (job.status === "available" && job.urgent) add(job.pickup, "緊急", "#ffb454", 5);
    }
    for (const site of state.upgradeSites) {
      if (!site.used) add(site, "強化", "#bf7cff", 6);
    }
    for (const site of state.repairSites) {
      if (!site.used) add(site, "修理", "#f8fbfc", 7);
    }
    return targets;
  }

  function isPointOnScreen(state, point, w, h) {
    const x = point.x - state.camera.x;
    const y = point.y - state.camera.y;
    return x > 34 && x < w - 34 && y > 34 && y < h - 34;
  }

  function drawDirectionGuide(state, guide, w, h, alpha) {
    const screenX = guide.point.x - state.camera.x;
    const screenY = guide.point.y - state.camera.y;
    const cx = w / 2;
    const cy = h / 2;
    const dx = screenX - cx;
    const dy = screenY - cy;
    const len = Math.hypot(dx, dy) || 1;
    const margin = 30;
    const t = Math.min((cx - margin) / Math.abs(dx || 0.0001), (cy - margin) / Math.abs(dy || 0.0001));
    const x = clamp(cx + dx * t, margin, w - margin);
    const y = clamp(cy + dy * t, margin, h - margin);
    const angle = Math.atan2(dy, dx);
    const label = `${guide.label} ${Math.round(guide.distance)}m`;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.fillStyle = "rgba(7, 9, 11, 0.74)";
    ctx.beginPath();
    ctx.arc(0, 0, 19, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = guide.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.rotate(angle);
    ctx.fillStyle = guide.color;
    ctx.beginPath();
    ctx.moveTo(13, 0);
    ctx.lineTo(-4, -8);
    ctx.lineTo(-4, 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = "bold 11px system-ui";
    ctx.textAlign = "center";
    const width = ctx.measureText(label).width + 10;
    const labelY = clamp(y + 28, 18, h - 16);
    ctx.fillStyle = "rgba(7, 9, 11, 0.76)";
    roundedRect(ctx, clamp(x - width / 2, 5, w - width - 5), labelY - 14, width, 18, 6);
    ctx.fill();
    ctx.fillStyle = guide.color;
    ctx.fillText(label, clamp(x, width / 2 + 5, w - width / 2 - 5), labelY);
    ctx.restore();
  }

  function drawRadarMarker(state, point, color, cx, cy, radius, radarRange, size, showArrow) {
    const dx = point.x - state.player.x;
    const dy = point.y - state.player.y;
    const distance = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    if (distance <= radarRange) {
      const scale = (radius - 10) / radarRange;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(cx + dx * scale, cy + dy * scale, size, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    if (!showArrow) return;
    ctx.save();
    ctx.translate(cx + Math.cos(angle) * (radius - 11), cy + Math.sin(angle) * (radius - 11));
    ctx.rotate(angle);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(-7, -8);
    ctx.lineTo(6, 0);
    ctx.lineTo(-7, 8);
    ctx.stroke();
    ctx.restore();
  }

  function nearestJob(state) {
    let best = null;
    for (const job of state.jobs) {
      if (job.status !== "available") continue;
      const distance = dist(state.player.x, state.player.y, job.pickup.x, job.pickup.y);
      if (!best || distance < best.distance) best = { job, distance };
    }
    return best;
  }

  function nearestMaterialBox(state) {
    let best = null;
    for (const box of state.materialBoxes) {
      const distance = dist(state.player.x, state.player.y, box.x, box.y);
      if (!best || distance < best.distance) best = { box, distance };
    }
    return best;
  }

  function nearestSupplyDrop(state) {
    let best = null;
    for (const drop of state.supplyDrops) {
      const distance = dist(state.player.x, state.player.y, drop.x, drop.y);
      if (!best || distance < best.distance) best = { drop, distance };
    }
    return best;
  }

  function getFacilityCost(level) {
    return [10, 25, 50][level] ?? null;
  }

  function getRank(deliveries, returned) {
    if (deliveries >= 8 && returned) return "S";
    if (deliveries >= 5 && returned) return "A";
    if (deliveries >= 3) return "B";
    if (deliveries >= 1) return "C";
    return "D";
  }

  function formatTime(seconds) {
    const s = Math.max(0, Math.ceil(seconds));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  }

  function normalize(v) {
    const len = Math.hypot(v.x, v.y);
    if (len === 0) return { x: 0, y: 0 };
    return { x: v.x / len, y: v.y / len };
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function pick(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function weightedPick(items) {
    const total = items.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * total;
    for (const item of items) {
      roll -= item.weight;
      if (roll <= 0) return item.key;
    }
    return items[items.length - 1].key;
  }

  function sample(items, count) {
    const copy = [...items];
    const result = [];
    while (result.length < count && copy.length > 0) {
      const index = Math.floor(Math.random() * copy.length);
      result.push(copy.splice(index, 1)[0]);
    }
    return result;
  }

  function getUpgradeChoices(state) {
    const bonus = state?.personnelEffects?.analysisBonus || 0;
    const extra = Math.min(4, Math.floor(bonus));
    const candidates = sample(UPGRADE_POOL, Math.min(UPGRADE_POOL.length, 3 + extra));
    if (extra <= 0) return candidates.slice(0, 3);
    const priority = {
      bag: 5,
      armor: 4,
      negotiation: 4,
      hazardAi: 4,
      cooling: 3,
      lightFrame: 3,
      motor: 2,
      repairKit: state.player.hp < state.player.maxHp * 0.55 ? 5 : 1
    };
    return candidates
      .sort((a, b) => (priority[b.key] || 1) - (priority[a.key] || 1))
      .slice(0, 3);
  }

  function dist(ax, ay, bx, by) {
    return Math.hypot(ax - bx, ay - by);
  }

  function circleRect(cx, cy, radius, rect) {
    const closestX = clamp(cx, rect.x, rect.x + rect.w);
    const closestY = clamp(cy, rect.y, rect.y + rect.h);
    return dist(cx, cy, closestX, closestY) < radius;
  }

  function roundedRect(context, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.lineTo(x + width - r, y);
    context.quadraticCurveTo(x + width, y, x + width, y + r);
    context.lineTo(x + width, y + height - r);
    context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    context.lineTo(x + r, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - r);
    context.lineTo(x, y + r);
    context.quadraticCurveTo(x, y, x + r, y);
  }

  function blendHex(a, b, t) {
    const ca = parseHexColor(a);
    const cb = parseHexColor(b);
    if (!ca || !cb) return a;
    const mix = ca.map((value, index) => Math.round(value + (cb[index] - value) * t));
    return `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`;
  }

  function parseHexColor(value) {
    const match = /^#?([0-9a-f]{6})$/i.exec(value);
    if (!match) return null;
    const hex = match[1];
    return [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16));
  }

  function cryptoId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  setupEvents();
  renderTitle();
  resizeCanvas();
  requestAnimationFrame(loop);
})();

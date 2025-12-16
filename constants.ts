import { Language } from './types';

export const APP_NAME_CN = "乾坤K线";
export const APP_NAME_TW = "乾坤K線";

export const THEME = {
  bg: '#F9F7F2', // Rice paper
  ink: '#2C1810', // Dark Ink
  red: '#A93226', // Cinnabar
  gold: '#9A7D0A', // Bronze/Gold
  jade: '#1D8348', // Jade Green
};

export const CELESTIAL_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

export const TRANSLATIONS = {
  'zh-CN': {
    title: '乾坤K线',
    subtitle: '观天之道，执天之行',
    desc: '融汇中华八字绝学与量化金融，以此推演命局起伏。',
    name: '姓名 (可选)',
    gender: '阴阳 (性别)',
    male: '乾造 (男)',
    female: '坤造 (女)',
    birthDate: '诞辰 (公历)',
    birthTime: '时辰',
    birthPlace: '降生地',
    submit: '天机演算',
    loading: '神游太虚 演算中...',
    reportTitle: '命局批注',
    recalc: '重卦再算',
    assetClass: '命局格局',
    strategy: '运筹锦囊',
    bull: '大吉 (牛市)',
    bear: '潜龙 (蛰伏)', 
    volatile: '变盘 (转折)',
    admin: '天机阁 (后台)',
    freeLeft: '剩余免费次数',
    enterCode: '输入天机令 (激活码)',
    activate: '立即激活',
    buy: '获取天机令',
    limitReached: '天机不可泄露过多',
    limitDesc: '您的免费演算次数已尽。请选择以下方式继续。',
    invalidCode: '令牌无效',
    activated: '已获取天机权限',
    luckyMatch: '本命资产匹配',
    stock: '契合股票',
    crypto: '契合加密货币',
    rateTitle: '天机评价',
    rateDesc: '请为本次演算打分',
    thanksRate: '感谢您的反馈，祝您财源广进！',
    adminLoginTitle: '天机阁禁地',
    adminPasswordPlaceholder: '请输入阁主密令',
    enter: '进入',
    cancel: '返回',
    wrongPassword: '密令错误，凡人止步',
    contact: '作者',
    twitter: '关注 X',
    // Features
    featuresTitle: '天机演算系统',
    feature1Title: '一生K线推演',
    feature1Desc: '将八字大运转化为可视化K线图，一眼看穿人生牛熊周期。',
    feature2Title: 'AI命理分析',
    feature2Desc: '结合古籍与现代金融理论，提供精准的Career & Wealth 策略。',
    feature3Title: '本命资产匹配',
    feature3Desc: '寻找与您命格五行共鸣的"灵魂股票"与加密货币。',
    sampleTitle: '演算结果示例',
    sampleDestiny: '【蓝筹股命格】命主根基深厚，如茅台般稳健。早年震荡洗盘，中年后开启长牛行情...',
    sampleAdvice: '建议在35岁"变盘点"前积累筹码，定投自己，静待风口。',
    // New Unlock
    unlockTitle: '开启天机权限',
    unlockOption1: '邀请好友',
    unlockOption1Desc: '邀请好友体验，获取额外免费次数。',
    unlockOption2: '终身买断',
    unlockOption2Desc: '解锁无限次演算权限，支持作者持续更新。',
    shareBtn: '复制邀请链接',
    shareToast: '链接已复制！发送给好友即可获得奖励。',
    price: '¥9.90',
    scanToPay: '推荐使用微信支付',
    contactSupport: '支付后联系作者获取激活码',
    wechat: '微信',
    verified: '已验证',
    copyContact: '复制',
    inputPlaceholder: '在此输入激活码'
  },
  'zh-TW': {
    title: '乾坤K線',
    subtitle: '觀天之道，執天之行',
    desc: '融彙中華八字絕學與量化金融，以此推演命局起伏。',
    name: '姓名 (可選)',
    gender: '陰陽 (性別)',
    male: '乾造 (男)',
    female: '坤造 (女)',
    birthDate: '誕辰 (公曆)',
    birthTime: '時辰',
    birthPlace: '降生地',
    submit: '天機演算',
    loading: '神遊太虛 演算中...',
    reportTitle: '命局批注',
    recalc: '重卦再算',
    assetClass: '命局格局',
    strategy: '運籌錦囊',
    bull: '大吉 (牛市)',
    bear: '潛龍 (蟄伏)',
    volatile: '變盤 (轉折)',
    admin: '天機閣 (後台)',
    freeLeft: '剩餘免費次數',
    enterCode: '輸入天機令 (激活碼)',
    activate: '立即激活',
    buy: '獲取天機令',
    limitReached: '天機不可洩露過多',
    limitDesc: '您的免費演算次數已盡。請選擇以下方式繼續。',
    invalidCode: '令牌無效',
    activated: '已獲取天機權限',
    luckyMatch: '本命資產匹配',
    stock: '契合股票',
    crypto: '契合加密貨幣',
    rateTitle: '天機評價',
    rateDesc: '請為本次演算打分',
    thanksRate: '感謝您的反饋，祝您財源廣進！',
    adminLoginTitle: '天機閣禁地',
    adminPasswordPlaceholder: '請輸入閣主密令',
    enter: '進入',
    cancel: '返回',
    wrongPassword: '密令錯誤，凡人止步',
    contact: '作者',
    twitter: '關注 X',
    // Features
    featuresTitle: '天機演算系統',
    feature1Title: '一生K線推演',
    feature1Desc: '將八字大運轉化為可視化K線圖，一眼看穿人生牛熊週期。',
    feature2Title: 'AI命理分析',
    feature2Desc: '結合古籍與現代金融理論，提供精準的Career & Wealth 策略。',
    feature3Title: '本命資產匹配',
    feature3Desc: '尋找與您命格五行共鳴的"靈魂股票"與加密貨幣。',
    sampleTitle: '演算結果示例',
    sampleDestiny: '【藍籌股命格】命主根基深厚，如茅台般穩健。早年震盪洗盤，中年後開啟長牛行情...',
    sampleAdvice: '建議在35歲"變盤點"前積累籌碼，定投自己，靜待風口。',
    // New Unlock
    unlockTitle: '開啟天機權限',
    unlockOption1: '邀請好友',
    unlockOption1Desc: '邀請好友體驗，獲取額外免費次數。',
    unlockOption2: '終身買斷',
    unlockOption2Desc: '解鎖無限次演算權限，支持作者持續更新。',
    shareBtn: '複製邀請鏈接',
    shareToast: '鏈接已複製！發送給好友即可獲得獎勵。',
    price: '¥9.90',
    scanToPay: '推薦使用微信支付',
    contactSupport: '支付後聯繫作者獲取激活碼',
    wechat: '微信',
    verified: '已驗證',
    copyContact: '複製',
    inputPlaceholder: '在此輸入激活碼'
  }
};

export const stringToSeed = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; 
  }
  return Math.abs(hash);
};

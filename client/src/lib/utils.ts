import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type GridType = 'mi' | 'tian' | 'blank' | 'fourLine';
export type TemplateType = 'article' | 'single';
export type FontType = 'kaiti' | 'simsun' | 'simhei' | 'fangsong' | 'arial' | 'times' | 'courier';

export interface CharacterGridSettings {
  templateType: TemplateType;
  gridType: GridType;
  content: string;
  gridsPerRow: number;
  fontSize: 'auto' | 'small' | 'medium' | 'large';
  fontType: FontType;
  fontOpacity: number;
  showPinyin: boolean;
}

export const defaultSettings: CharacterGridSettings = {
  templateType: 'article',
  gridType: 'mi',
  content: '',
  gridsPerRow: 10,
  fontSize: 'auto',
  fontType: 'kaiti',
  fontOpacity: 30,
  showPinyin: false,
};

export function getChineseCharacters(text: string): string[] {
  // Split text into individual characters, filtering out whitespace and punctuation
  return text.split('').filter(char => {
    const code = char.charCodeAt(0);
    // Chinese character Unicode ranges
    return (code >= 0x4E00 && code <= 0x9FFF) ||
           (code >= 0x3400 && code <= 0x4DBF) ||
           (code >= 0x20000 && code <= 0x2A6DF);
  });
}

// 获取所有可显示字符（中文、英文、数字、标点符号）
export function getAllCharacters(text: string): string[] {
  // Split text into individual characters, filtering out only invisible whitespace
  return text.split('').filter(char => {
    // Keep all visible characters including punctuation, letters, numbers, and Chinese characters
    // Only filter out whitespace characters like spaces, tabs, newlines
    return char.trim() !== '';
  });
}

// Detect content type automatically
export function detectContentType(text: string): 'chinese' | 'pinyin' | 'english' | 'mixed' {
  if (!text.trim()) return 'chinese';
  
  // Check for Chinese characters
  const chineseChars = getChineseCharacters(text);
  const allChars = getAllCharacters(text);
  const hasChineseChars = chineseChars.length > 0;
  const hasNonChineseChars = allChars.length > chineseChars.length;
  
  // If both Chinese and non-Chinese characters exist, it's mixed content
  if (hasChineseChars && hasNonChineseChars) return 'mixed';
  
  // If only Chinese characters exist
  if (hasChineseChars) return 'chinese';
  
  // Check for pinyin (contains tones or typical pinyin patterns)
  const pinyinPattern = /[āáǎàēéěèīíǐìōóǒòūúǔù]|[bpmfdtnlgkhjqxzcsyw][aeiou]/i;
  if (pinyinPattern.test(text)) return 'pinyin';
  
  // Default to English
  return 'english';
}

// Enhanced pinyin mapping
export function getPinyin(char: string): string | undefined {
  const pinyinMap: Record<string, string> = {
    // Common characters with pinyin
    '春': 'chūn', '眠': 'mián', '不': 'bù', '觉': 'jué', '晓': 'xiǎo',
    '处': 'chù', '闻': 'wén', '啼': 'tí', '鸟': 'niǎo', '夜': 'yè',
    '来': 'lái', '风': 'fēng', '雨': 'yǔ', '声': 'shēng', '花': 'huā',
    '落': 'luò', '知': 'zhī', '多': 'duō', '少': 'shǎo',
    // More common characters
    '我': 'wǒ', '你': 'nǐ', '他': 'tā', '她': 'tā', '的': 'de',
    '是': 'shì', '在': 'zài', '有': 'yǒu', '和': 'hé', '人': 'rén',
    '中': 'zhōng', '国': 'guó', '学': 'xué', '生': 'shēng', '老': 'lǎo',
    '师': 'shī', '家': 'jiā', '水': 'shuǐ', '火': 'huǒ', '土': 'tǔ',
    '木': 'mù', '金': 'jīn', '大': 'dà', '小': 'xiǎo', '上': 'shàng',
    '下': 'xià', '左': 'zuǒ', '右': 'yòu', '前': 'qián', '后': 'hòu',
    // Additional common characters
    '天': 'tiān', '地': 'dì', '日': 'rì', '月': 'yuè', '星': 'xīng',
    '山': 'shān', '河': 'hé', '湖': 'hú', '海': 'hǎi', '云': 'yún',
    '雪': 'xuě', '阳': 'yáng', '光': 'guāng',
    '电': 'diàn', '车': 'chē', '路': 'lù', '门': 'mén', '窗': 'chuāng',
    '房': 'fáng', '床': 'chuáng', '桌': 'zhuō', '椅': 'yǐ', '书': 'shū',
    '笔': 'bǐ', '纸': 'zhǐ', '铱': 'qiān', '玄': 'xuán', '钢': 'gāng',
    '吃': 'chī', '喃': 'hē', '睡': 'shuì', '走': 'zǒu', '跑': 'pǎo',
    '飞': 'fēi', '游': 'yóu', '看': 'kàn', '听': 'tīng', '说': 'shuō',
    '笑': 'xiào', '哭': 'kū', '喜': 'xǐ', '怒': 'nù', '爱': 'ài',
    '好': 'hǎo', '坏': 'huài', '新': 'xīn', '旧': 'jiù', '高': 'gāo',
    '矮': 'ǎi', '长': 'cháng', '短': 'duǎn', '快': 'kuài', '慢': 'màn'
  };
  
  return pinyinMap[char];
}

// 获取汉字的偏旁部首
export function getRadical(char: string): string | undefined {
  const radicalMap: Record<string, string> = {
    // 人部
    '人': '人', '他': '人', '你': '人', '传': '人', '住': '人', '作': '人', '休': '人',
    // 水部
    '水': '水', '江': '水', '河': '水', '湖': '水', '海': '水', '清': '水', '温': '水',
    // 火部
    '火': '火', '热': '火', '烧': '火', '灯': '火', '炖': '火', '炉': '火',
    // 木部
    '木': '木', '林': '木', '森': '木', '果': '木', '花': '艹', '草': '艹', '叶': '口',
    // 土部
    '土': '土', '地': '土', '山': '山', '岩': '山', '墙': '土',
    // 金部
    '金': '金', '铱': '金', '银': '金', '铜': '金', '铁': '金', '钢': '金',
    // 手部
    '手': '手', '拉': '手', '推': '手', '拔': '手', '打': '手',
    // 口部
    '口': '口', '吃': '口', '喃': '口', '唱': '口', '呀': '口', '喔': '口',
    // 心部
    '心': '心', '情': '心', '爱': '爱', '怒': '心', '怕': '心', '惊': '心',
    // 日部
    '日': '日', '时': '日', '明': '日', '晓': '日', '昨': '日', '今': '今',
    // 月部
    '月': '月', '服': '月', '能': '月', '朋': '月', '有': '月',
    // 目部
    '目': '目', '看': '目', '着': '目', '睡': '目', '眠': '目',
    // 足部
    '足': '足', '跑': '足', '跳': '足', '踏': '足', '踢': '足',
    // 车部
    '车': '车', '载': '车', '辑': '车', '轿': '车',
    // 马部
    '马': '马', '骑': '马', '驶': '马', '验': '马',
    // 鸟部
    '鸟': '鸟', '鸡': '鸟', '鸭': '鸟', '鹅': '鸟', '鹰': '鸟',
    // 雨部
    '雨': '雨', '雪': '雨', '云': '二', '雷': '雨', '电': '电',
    // 食部
    '食': '食', '饭': '食', '面': '面', '包': '勹'
  };
  
  return radicalMap[char];
}

export function getFontFamily(fontType: FontType): string {
  const fontMap = {
    // Chinese fonts with fallback English fonts for mixed content
    kaiti: 'KaiTi, STKaiti, "Kaiti SC", "Noto Sans CJK SC", Arial, serif',
    simsun: 'SimSun, "Songti SC", "Noto Sans CJK SC", Arial, serif',
    simhei: 'SimHei, "Heiti SC", "Noto Sans CJK SC", Arial, sans-serif',
    fangsong: 'FangSong, "Fangsong SC", "Noto Sans CJK SC", Arial, serif',
    // English fonts with Chinese fallback for mixed content
    arial: 'Arial, "Helvetica Neue", Helvetica, "Noto Sans CJK SC", sans-serif',
    times: '"Times New Roman", Times, "Noto Sans CJK SC", serif',
    courier: '"Courier New", Courier, "Noto Sans CJK SC", monospace'
  };
  return fontMap[fontType];
}

export function calculateGridSize(gridsPerRow: number, containerWidth: number): number {
  const padding = 40; // 20px padding on each side (consistent with A4 layout)
  const gridSpacing = -1; // Overlapping borders (consistent with rendering)
  const availableWidth = containerWidth - padding;
  const totalSpacing = (gridsPerRow - 1) * Math.abs(gridSpacing);
  return Math.floor((availableWidth - totalSpacing) / gridsPerRow);
}
// 计算页面可容纳的最大网格数
export function calculateMaxGridsForPage(settings: CharacterGridSettings): number {
  const A4_WIDTH = 595;
  const A4_HEIGHT = 842;
  const HEADER_HEIGHT = 60;
  const PADDING = 40; // 20px on each side
  
  const availableWidth = A4_WIDTH - PADDING;
  const availableHeight = A4_HEIGHT - HEADER_HEIGHT - PADDING;
  
  // 计算网格大小
  const gridSize = availableWidth / settings.gridsPerRow;
  const gridSpacing = -1; // 重叠边框
  
  // 检查是否需要拼音行
  const contentType = detectContentType(settings.content);
  const needsPinyinRows = settings.showPinyin && (contentType === 'chinese' || contentType === 'mixed') && settings.gridType !== 'fourLine';
  const pinyinRowHeight = needsPinyinRows ? gridSize * 0.3 : 0;
  const totalRowHeight = gridSize + pinyinRowHeight + Math.abs(gridSpacing);
  
  // 计算可以容纳的最大行数
  const maxRows = Math.floor(availableHeight / totalRowHeight);
  
  // 确保至少有一行
  const actualRows = Math.max(1, maxRows);
  
  // 返回总的网格数
  return actualRows * settings.gridsPerRow;
}

export function calculateFontSize(gridSize: number, fontSize: string): number {
  const baseRatio = 0.7; // Font size relative to grid size
  const sizeMultipliers = {
    auto: baseRatio,
    small: baseRatio * 0.8,
    medium: baseRatio,
    large: baseRatio * 1.2
  };
  
  return Math.floor(gridSize * (sizeMultipliers[fontSize as keyof typeof sizeMultipliers] ?? baseRatio));
}

export function formatDateForFilename(): string {
  const now = new Date();
  return now.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_');
}

// 获取常用汉字信息用于帮助页面
export function getCommonCharacters(): Array<{char: string, pinyin: string, radical: string}> {
  const commonChars = ['我', '你', '他', '她', '的', '是', '在', '有', '和', '人', '中', '国', '学', '生', '老', '师', '家', '水', '火', '土', '木', '金', '大', '小', '上', '下', '左', '右', '前', '后', '天', '地', '日', '月', '星', '山', '河', '湖', '海', '云', '雪', '阳', '光', '风', '雨', '电', '车', '路', '门', '窗'];
  
  return commonChars.map(char => ({
    char,
    pinyin: getPinyin(char) || '',
    radical: getRadical(char) || ''
  })).filter(item => item.pinyin && item.radical);
}
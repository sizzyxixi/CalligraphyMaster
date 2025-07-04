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

// Detect content type automatically
export function detectContentType(text: string): 'chinese' | 'pinyin' | 'english' {
  if (!text.trim()) return 'chinese';
  
  // Check for Chinese characters
  const chineseChars = getChineseCharacters(text);
  if (chineseChars.length > 0) return 'chinese';
  
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
    '下': 'xià', '左': 'zuǒ', '右': 'yòu', '前': 'qián', '后': 'hòu'
  };
  
  return pinyinMap[char];
}

export function getFontFamily(fontType: FontType): string {
  const fontMap = {
    // Chinese fonts
    kaiti: 'KaiTi, STKaiti, "Kaiti SC", serif',
    simsun: 'SimSun, "Songti SC", serif',
    simhei: 'SimHei, "Heiti SC", sans-serif',
    fangsong: 'FangSong, "Fangsong SC", serif',
    // English fonts (free versions)
    arial: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
    times: '"Times New Roman", Times, serif',
    courier: '"Courier New", Courier, monospace'
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
  const needsPinyinRows = settings.showPinyin && contentType === 'chinese' && settings.gridType !== 'fourLine';
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
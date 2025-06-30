import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type GridType = 'mi' | 'tian' | 'blank' | 'fourLine';
export type TemplateType = 'empty' | 'stroke' | 'article' | 'single';
export type ContentType = 'chinese' | 'pinyin' | 'english';
export type FontType = 'kaiti' | 'simsun' | 'simhei' | 'fangsong';

export interface CharacterGridSettings {
  templateType: TemplateType;
  gridType: GridType;
  contentType: ContentType;
  content: string;
  gridsPerRow: number;
  fontSize: 'auto' | 'small' | 'medium' | 'large';
  fontType: FontType;
  fontOpacity: number;
  showPinyin: boolean;
}

export const defaultSettings: CharacterGridSettings = {
  templateType: 'empty',
  gridType: 'mi',
  contentType: 'chinese',
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

export function getFontFamily(fontType: FontType): string {
  const fontMap = {
    kaiti: 'KaiTi, STKaiti, "Kaiti SC", serif',
    simsun: 'SimSun, "Songti SC", serif',
    simhei: 'SimHei, "Heiti SC", sans-serif',
    fangsong: 'FangSong, "Fangsong SC", serif'
  };
  return fontMap[fontType];
}

export function calculateGridSize(gridsPerRow: number, containerWidth: number): number {
  const padding = 64; // 32px padding on each side
  const gridSpacing = 8; // 2px gap between grids
  const availableWidth = containerWidth - padding;
  const totalSpacing = (gridsPerRow - 1) * gridSpacing;
  return Math.floor((availableWidth - totalSpacing) / gridsPerRow);
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

import { useMemo } from "react";
import { getChineseCharacters } from "@/lib/utils";
import type { CharacterGridSettings } from "@/lib/utils";

export function useCharacterGrid(settings: CharacterGridSettings) {
  const characterData = useMemo(() => {
    if (!settings.content.trim()) return [];

    switch (settings.contentType) {
      case 'chinese': {
        const characters = getChineseCharacters(settings.content);
        return characters.map(char => ({
          character: char,
          pinyin: settings.showPinyin ? getPinyin(char) : undefined
        }));
      }
      case 'pinyin': {
        const syllables = settings.content.split(/\s+/).filter(s => s.length > 0);
        return syllables.map(syllable => ({
          character: syllable,
          pinyin: undefined
        }));
      }
      case 'english': {
        const words = settings.content.split(/\s+/).filter(w => w.length > 0);
        return words.map(word => ({
          character: word,
          pinyin: undefined
        }));
      }
      default:
        return [];
    }
  }, [settings.content, settings.contentType, settings.showPinyin]);

  const gridLayout = useMemo(() => {
    const totalCharacters = characterData.length;
    const { gridsPerRow } = settings;
    const rows = Math.ceil(totalCharacters / gridsPerRow);

    return {
      totalCharacters,
      gridsPerRow,
      rows,
      totalGrids: rows * gridsPerRow
    };
  }, [characterData.length, settings.gridsPerRow]);

  return {
    characterData,
    gridLayout
  };
}

// Simple pinyin mapping for common characters (in a real app, you'd use a proper library)
function getPinyin(char: string): string | undefined {
  const pinyinMap: Record<string, string> = {
    '春': 'chūn',
    '眠': 'mián',
    '不': 'bù',
    '觉': 'jué',
    '晓': 'xiǎo',
    '处': 'chù',
    '闻': 'wén',
    '啼': 'tí',
    '鸟': 'niǎo',
    '夜': 'yè',
    '来': 'lái',
    '风': 'fēng',
    '雨': 'yǔ',
    '声': 'shēng',
    '花': 'huā',
    '落': 'luò',
    '知': 'zhī',
    '多': 'duō',
    '少': 'shǎo'
  };
  
  return pinyinMap[char];
}

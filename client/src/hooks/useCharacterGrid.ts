import { useMemo } from "react";
import { getChineseCharacters, detectContentType, getPinyin } from "@/lib/utils";
import type { CharacterGridSettings } from "@/lib/utils";

export function useCharacterGrid(settings: CharacterGridSettings) {
  const characterData = useMemo(() => {
    const contentType = detectContentType(settings.content);
    
    // Use optimized layout values to match PDF export
    const A4_WIDTH = 595; // A4 width in points
    const A4_HEIGHT = 842; // A4 height in points
    const HEADER_HEIGHT = 60; // Reduced header height to match PDF export
    const PADDING = 40; // Reduced padding to match PDF export (20px on each side)
    
    const availableWidth = A4_WIDTH - PADDING;
    const availableHeight = A4_HEIGHT - HEADER_HEIGHT - PADDING;
    
    // Estimate grid size based on gridsPerRow
    const gridSize = availableWidth / settings.gridsPerRow;
    const gridSpacing = -1; // Overlapping borders
    const totalGridHeight = gridSize + Math.abs(gridSpacing);
    
    // Calculate how many rows can fit on one page
    const maxRows = Math.floor(availableHeight / totalGridHeight);
    const maxGridsPerPage = maxRows * settings.gridsPerRow;
    
    if (settings.templateType === 'article') {
      // Article template: For preview, show ALL content (not limited to one page)
      let contentCharacters: Array<{character: string, pinyin?: string}> = [];
      
      if (settings.content.trim()) {
        switch (contentType) {
          case 'chinese': {
            const characters = getChineseCharacters(settings.content);
            contentCharacters = characters.map(char => ({
              character: char,
              pinyin: settings.showPinyin ? getPinyin(char) : undefined
            }));
            break;
          }
          case 'pinyin': {
            const syllables = settings.content.split(/\s+/).filter(s => s.length > 0);
            contentCharacters = syllables.map(syllable => ({
              character: syllable,
              pinyin: undefined
            }));
            break;
          }
          case 'english': {
            const words = settings.content.split(/\s+/).filter(w => w.length > 0);
            contentCharacters = words.map(word => ({
              character: word,
              pinyin: undefined
            }));
            break;
          }
        }
      }
      
      // For preview: show all content + fill current page with empty grids
      const result = [];
      
      // Add all content characters (not limited to one page)
      for (let i = 0; i < contentCharacters.length; i++) {
        result.push(contentCharacters[i]);
      }
      
      // If content doesn't fill at least one complete page, fill with empty grids
      if (result.length < maxGridsPerPage) {
        for (let i = result.length; i < maxGridsPerPage; i++) {
          result.push({
            character: '',
            pinyin: undefined
          });
        }
      }
      
      return result;
    } else if (settings.templateType === 'single') {
      // Single character mode: Each character fills entire rows, show all content
      if (!settings.content.trim()) {
        // Return empty grids for one page if no content
        return Array(maxGridsPerPage).fill(null).map(() => ({
          character: '',
          pinyin: undefined
        }));
      }
      
      const characters = contentType === 'chinese' 
        ? getChineseCharacters(settings.content)
        : settings.content.split('').filter(c => c.trim());
      
      const result = [];
      
      for (const char of characters) {
        // Fill entire row with the same character
        for (let i = 0; i < settings.gridsPerRow; i++) {
          result.push({
            character: char,
            pinyin: settings.showPinyin && contentType === 'chinese' ? getPinyin(char) : undefined
          });
        }
      }
      
      // If we have less than one page of content, fill remaining space with empty grids
      if (result.length < maxGridsPerPage) {
        while (result.length < maxGridsPerPage) {
          result.push({
            character: '',
            pinyin: undefined
          });
        }
      }
      
      return result;
    }
    
    return [];
  }, [settings.content, settings.showPinyin, settings.templateType, settings.gridsPerRow]);

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
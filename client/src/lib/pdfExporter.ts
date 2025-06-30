import jsPDF from 'jspdf';
import { renderGrid } from './gridRenderer';
import { getFontFamily, calculateGridSize, calculateFontSize } from "@/lib/utils";
import type { CharacterGridSettings } from "@/lib/utils";

interface CharacterData {
  character: string;
  pinyin?: string;
}

export async function exportToPDF(settings: CharacterGridSettings, filename: string): Promise<void> {
  // Create a high-resolution canvas for PDF generation
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to create canvas context');
  }

  // Get characters based on content type
  const characterData = getCharacterData(settings);
  
  if (characterData.length === 0) {
    throw new Error('No content to export');
  }

  // Calculate grid layout
  const gridLayout = {
    totalCharacters: characterData.length,
    gridsPerRow: settings.gridsPerRow,
    rows: Math.ceil(characterData.length / settings.gridsPerRow),
    totalGrids: Math.ceil(characterData.length / settings.gridsPerRow) * settings.gridsPerRow
  };

  // High resolution canvas (300 DPI equivalent)
  const scale = 3; // 3x scale for high quality
  const pageWidth = 595 * scale; // A4 width in pixels at 72 DPI * scale
  const pageHeight = 842 * scale; // A4 height in pixels at 72 DPI * scale
  
  canvas.width = pageWidth;
  canvas.height = pageHeight;

  // Set white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, pageWidth, pageHeight);

  // Render the grid on canvas
  renderGrid(ctx, settings, characterData, gridLayout, scale);

  // Convert canvas to image and add to PDF
  const pdf = new jsPDF('portrait', 'mm', 'a4');
  const imgData = canvas.toDataURL('image/png', 1.0);
  
  // Add image to PDF (210mm x 297mm for A4)
  pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
  
  // Calculate how many pages we need
  const maxGridsPerPage = calculateMaxGridsPerPage(settings.gridsPerRow);
  const totalPages = Math.ceil(characterData.length / maxGridsPerPage);
  
  // Add additional pages if needed
  for (let page = 2; page <= totalPages; page++) {
    const startIndex = (page - 1) * maxGridsPerPage;
    const endIndex = Math.min(startIndex + maxGridsPerPage, characterData.length);
    const pageCharacterData = characterData.slice(startIndex, endIndex);
    
    if (pageCharacterData.length > 0) {
      // Clear canvas for next page
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageWidth, pageHeight);
      
      // Calculate layout for this page
      const pageGridLayout = {
        totalCharacters: pageCharacterData.length,
        gridsPerRow: settings.gridsPerRow,
        rows: Math.ceil(pageCharacterData.length / settings.gridsPerRow),
        totalGrids: Math.ceil(pageCharacterData.length / settings.gridsPerRow) * settings.gridsPerRow
      };
      
      // Render this page
      renderGrid(ctx, settings, pageCharacterData, pageGridLayout, scale);
      
      // Add to PDF
      const pageImgData = canvas.toDataURL('image/png', 1.0);
      pdf.addPage();
      pdf.addImage(pageImgData, 'PNG', 0, 0, 210, 297);
    }
  }
  
  // Save the PDF
  pdf.save(filename);
}

function calculateMaxGridsPerPage(gridsPerRow: number): number {
  // Calculate how many grids can fit on one A4 page
  // Based on typical A4 dimensions and grid sizing
  const availableHeight = 700; // Approximate available height for grids in pixels
  const gridSize = 60; // Approximate grid size
  const gridSpacing = 8; // Spacing between grids
  
  const maxRows = Math.floor(availableHeight / (gridSize + gridSpacing));
  return maxRows * gridsPerRow;
}

function getCharacterData(settings: CharacterGridSettings): CharacterData[] {
  if (!settings.content.trim()) return [];

  switch (settings.contentType) {
    case 'chinese': {
      const characters = settings.content.split('').filter(char => {
        const code = char.charCodeAt(0);
        return (code >= 0x4E00 && code <= 0x9FFF) ||
               (code >= 0x3400 && code <= 0x4DBF) ||
               (code >= 0x20000 && code <= 0x2A6DF);
      });
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
}



// Simple pinyin mapping (same as in useCharacterGrid hook)
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

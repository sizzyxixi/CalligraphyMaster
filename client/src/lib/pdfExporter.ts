import jsPDF from 'jspdf';
import { getFontFamily, calculateGridSize, calculateFontSize } from "@/lib/utils";
import type { CharacterGridSettings } from "@/lib/utils";

interface CharacterData {
  character: string;
  pinyin?: string;
}

export async function exportToPDF(settings: CharacterGridSettings, filename: string): Promise<void> {
  const pdf = new jsPDF('portrait', 'mm', 'a4');
  const pageWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  
  // Get characters based on content type
  const characterData = getCharacterData(settings);
  
  if (characterData.length === 0) {
    throw new Error('No content to export');
  }
  
  // Calculate layout
  const padding = 15;
  const headerHeight = 25;
  const availableWidth = pageWidth - (padding * 2);
  const availableHeight = pageHeight - padding - headerHeight;
  
  const gridSize = calculateGridSize(settings.gridsPerRow, availableWidth * 3.78) / 3.78; // Convert px to mm
  const gridSpacing = 2;
  
  // Calculate positions
  const totalRowWidth = (settings.gridsPerRow * gridSize) + ((settings.gridsPerRow - 1) * gridSpacing);
  const startX = (pageWidth - totalRowWidth) / 2;
  const startY = headerHeight + 10;
  
  // Add header
  addHeader(pdf, pageWidth, headerHeight);
  
  // Add character grids
  let charIndex = 0;
  const maxRows = Math.floor((availableHeight - 20) / (gridSize + gridSpacing));
  const gridsPerPage = maxRows * settings.gridsPerRow;
  
  let currentPage = 1;
  
  while (charIndex < characterData.length) {
    if (currentPage > 1) {
      pdf.addPage();
      addHeader(pdf, pageWidth, headerHeight);
    }
    
    // Render grids for current page
    for (let row = 0; row < maxRows && charIndex < characterData.length; row++) {
      for (let col = 0; col < settings.gridsPerRow && charIndex < characterData.length; col++) {
        const x = startX + (col * (gridSize + gridSpacing));
        const y = startY + (row * (gridSize + gridSpacing));
        
        const charData = characterData[charIndex];
        addCharacterGrid(pdf, settings, x, y, gridSize, charData);
        
        charIndex++;
      }
    }
    
    currentPage++;
  }
  
  // Save the PDF
  pdf.save(filename);
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

function addHeader(pdf: jsPDF, pageWidth: number, headerHeight: number) {
  // Title
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('汉字练习字帖', pageWidth / 2, 15, { align: 'center' });
  
  // Info line
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const infoY = 22;
  const infoSpacing = 50;
  let infoX = 20;
  
  pdf.text('姓名：___________', infoX, infoY);
  infoX += infoSpacing;
  
  pdf.text('日期：___________', infoX, infoY);
  infoX += infoSpacing;
  
  pdf.text('班级：___________', infoX, infoY);
}

function addCharacterGrid(
  pdf: jsPDF,
  settings: CharacterGridSettings,
  x: number,
  y: number,
  size: number,
  charData?: CharacterData
) {
  const { gridType, fontOpacity, showPinyin } = settings;
  
  // Draw outer border
  pdf.setDrawColor(107, 114, 128); // Gray-500
  pdf.setLineWidth(0.5);
  
  if (gridType === 'fourLine') {
    const lineHeight = size / 4;
    // Draw four horizontal lines
    for (let i = 0; i <= 4; i++) {
      pdf.line(x, y + (i * lineHeight), x + size, y + (i * lineHeight));
    }
    // Draw left and right borders
    pdf.line(x, y, x, y + size);
    pdf.line(x + size, y, x + size, y + size);
  } else {
    pdf.rect(x, y, size, size);
  }
  
  // Draw grid lines
  pdf.setDrawColor(209, 213, 219); // Gray-300
  pdf.setLineWidth(0.2);
  
  switch (gridType) {
    case 'mi':
      // Center lines
      pdf.line(x + size/2, y, x + size/2, y + size);
      pdf.line(x, y + size/2, x + size, y + size/2);
      // Diagonal lines
      pdf.line(x, y, x + size, y + size);
      pdf.line(x + size, y, x, y + size);
      break;
      
    case 'tian':
      // Center lines
      pdf.line(x + size/2, y, x + size/2, y + size);
      pdf.line(x, y + size/2, x + size, y + size/2);
      break;
      
    default:
      break;
  }
  
  // Add character if provided
  if (charData?.character) {
    const fontSize = Math.max(8, size * 0.6);
    
    // Add pinyin if enabled
    if (showPinyin && charData.pinyin && gridType !== 'fourLine') {
      pdf.setTextColor(107, 114, 128);
      pdf.setFontSize(fontSize * 0.4);
      pdf.text(charData.pinyin, x + size/2, y + 4, { align: 'center' });
    }
    
    // Add main character with opacity
    const alpha = fontOpacity / 100;
    const grayValue = Math.floor(107 + (148 * (1 - alpha))); // Interpolate to lighter gray
    pdf.setTextColor(grayValue, grayValue, grayValue);
    pdf.setFontSize(fontSize);
    pdf.text(charData.character, x + size/2, y + size/2 + fontSize/3, { align: 'center' });
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

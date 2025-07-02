import jsPDF from 'jspdf';
import { renderGrid } from './gridRenderer';
import { getFontFamily, calculateGridSize, calculateFontSize, detectContentType, getPinyin } from "@/lib/utils";
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
  
  if (characterData.length === 0 && settings.templateType === 'single') {
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

  // Calculate how many grids can fit on the first page
  const maxGridsPerPage = calculateMaxGridsPerPage(settings.gridsPerRow, settings);
  
  // If we have content and it doesn't fit on one page, we need multi-page support
  if (characterData.length > maxGridsPerPage) {
    // Multi-page export
    const totalPages = Math.ceil(characterData.length / maxGridsPerPage);
    
    // Render first page
    const firstPageData = characterData.slice(0, maxGridsPerPage);
    const filledFirstPageData = fillPageWithContent(firstPageData, maxGridsPerPage, settings);
    const firstPageLayout = {
      totalCharacters: filledFirstPageData.length,
      gridsPerRow: settings.gridsPerRow,
      rows: Math.ceil(filledFirstPageData.length / settings.gridsPerRow),
      totalGrids: Math.ceil(filledFirstPageData.length / settings.gridsPerRow) * settings.gridsPerRow
    };
    
    renderGrid(ctx, settings, filledFirstPageData, firstPageLayout, scale);
    
    // Convert canvas to image and add to PDF
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png', 1.0);
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
    
    // Add additional pages
    for (let page = 2; page <= totalPages; page++) {
      const startIndex = (page - 1) * maxGridsPerPage;
      const endIndex = Math.min(startIndex + maxGridsPerPage, characterData.length);
      const pageCharacterData = characterData.slice(startIndex, endIndex);
      
      if (pageCharacterData.length > 0) {
        // Clear canvas for next page
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageWidth, pageHeight);
        
        // Fill page with content and empty grids as needed
        const filledPageData = fillPageWithContent(pageCharacterData, maxGridsPerPage, settings);
        
        // Calculate layout for this page
        const pageGridLayout = {
          totalCharacters: filledPageData.length,
          gridsPerRow: settings.gridsPerRow,
          rows: Math.ceil(filledPageData.length / settings.gridsPerRow),
          totalGrids: Math.ceil(filledPageData.length / settings.gridsPerRow) * settings.gridsPerRow
        };
        
        // Render this page
        renderGrid(ctx, settings, filledPageData, pageGridLayout, scale);
        
        // Add to PDF
        const pageImgData = canvas.toDataURL('image/png', 1.0);
        pdf.addPage();
        pdf.addImage(pageImgData, 'PNG', 0, 0, 210, 297);
      }
    }
    
    // Save the PDF
    pdf.save(filename);
  } else {
    // Single page or article template with content that fits on one page
    let pageData = characterData;
    
    // For article template, if we have less content than one page, fill with empty grids
    if (settings.templateType === 'article' && characterData.length < maxGridsPerPage) {
      pageData = [...characterData];
      while (pageData.length < maxGridsPerPage) {
        pageData.push({
          character: '',
          pinyin: undefined
        });
      }
    }
    
    const singlePageLayout = {
      totalCharacters: pageData.length,
      gridsPerRow: settings.gridsPerRow,
      rows: Math.ceil(pageData.length / settings.gridsPerRow),
      totalGrids: Math.ceil(pageData.length / settings.gridsPerRow) * settings.gridsPerRow
    };
    
    renderGrid(ctx, settings, pageData, singlePageLayout, scale);
    
    // Convert canvas to image and add to PDF
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png', 1.0);
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
    
    // Save the PDF
    pdf.save(filename);
  }
}

function calculateMaxGridsPerPage(gridsPerRow: number, settings: CharacterGridSettings): number {
  // Calculate how many grids can fit on one A4 page with optimized spacing
  const A4_WIDTH = 595;
  const A4_HEIGHT = 842;
  const HEADER_HEIGHT = 60; // Reduced from 100 to 60px for less whitespace
  const PADDING = 40; // Reduced from 80 to 40px (20px on each side)
  
  const availableHeight = A4_HEIGHT - HEADER_HEIGHT - PADDING;
  
  // Calculate grid size and spacing
  const availableWidth = A4_WIDTH - PADDING;
  const gridSize = availableWidth / gridsPerRow;
  const gridSpacing = -1; // Overlapping borders
  
  // Check if we need pinyin rows
  const contentType = detectContentType(settings.content);
  const needsPinyinRows = settings.showPinyin && contentType === 'chinese' && settings.gridType !== 'fourLine';
  const pinyinRowHeight = needsPinyinRows ? gridSize * 0.3 : 0; // Reduced from 0.4 to 0.3
  const totalRowHeight = gridSize + pinyinRowHeight + Math.abs(gridSpacing);
  
  const maxRows = Math.floor(availableHeight / totalRowHeight);
  return Math.max(1, maxRows * gridsPerRow); // Ensure at least 1 grid per page
}

function getCharacterData(settings: CharacterGridSettings): CharacterData[] {
  const contentType = detectContentType(settings.content);
  
  // Use the same calculation logic as calculateMaxGridsPerPage for consistency
  const maxGridsPerPage = calculateMaxGridsPerPage(settings.gridsPerRow, settings);
  
  if (settings.templateType === 'article') {
    // Article template: For multi-page support, return all content characters
    let contentCharacters: CharacterData[] = [];
    
    if (settings.content.trim()) {
      switch (contentType) {
        case 'chinese': {
          const characters = settings.content.split('').filter(char => {
            const code = char.charCodeAt(0);
            return (code >= 0x4E00 && code <= 0x9FFF) ||
                   (code >= 0x3400 && code <= 0x4DBF) ||
                   (code >= 0x20000 && code <= 0x2A6DF);
          });
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
    
    // Always return all content characters for multi-page processing
    return contentCharacters;
  } else if (settings.templateType === 'single') {
    // Single character mode: Each character fills entire rows
    if (!settings.content.trim()) {
      // Return empty grids if no content
      return Array(maxGridsPerPage).fill(null).map(() => ({
        character: '',
        pinyin: undefined
      }));
    }
    
    const characters = contentType === 'chinese' 
      ? settings.content.split('').filter(char => {
          const code = char.charCodeAt(0);
          return (code >= 0x4E00 && code <= 0x9FFF) ||
                 (code >= 0x3400 && code <= 0x4DBF) ||
                 (code >= 0x20000 && code <= 0x2A6DF);
        })
      : settings.content.split('').filter(c => c.trim());
    
    const result: CharacterData[] = [];
    
    for (const char of characters) {
      // Fill entire row with the same character
      for (let i = 0; i < settings.gridsPerRow; i++) {
        result.push({
          character: char,
          pinyin: settings.showPinyin && contentType === 'chinese' ? getPinyin(char) : undefined
        });
      }
      
      // Stop if we've filled the page
      if (result.length >= maxGridsPerPage) break;
    }
    
    // Fill remaining space with empty grids
    while (result.length < maxGridsPerPage) {
      result.push({
        character: '',
        pinyin: undefined
      });
    }
    
    return result.slice(0, maxGridsPerPage);
  }
  
  return [];
}

// Helper function to fill a page with content and empty grids
function fillPageWithContent(
  pageCharacters: CharacterData[], 
  maxGridsPerPage: number, 
  settings: CharacterGridSettings
): CharacterData[] {
  const result: CharacterData[] = [];
  
  // Add actual content
  for (let i = 0; i < pageCharacters.length && i < maxGridsPerPage; i++) {
    result.push(pageCharacters[i]);
  }
  
  // Fill remaining grids with empty ones if this is article template
  if (settings.templateType === 'article') {
    for (let i = pageCharacters.length; i < maxGridsPerPage; i++) {
      result.push({
        character: '',
        pinyin: undefined
      });
    }
  }
  
  return result;
}
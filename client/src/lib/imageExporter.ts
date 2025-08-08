import { renderGrid } from './gridRenderer';
import { calculateGridSize, detectContentType, getPinyin, getAllCharacters, calculateMaxGridsForPage } from "@/lib/utils";
import type { CharacterGridSettings } from "@/lib/utils";

interface CharacterData {
  character: string;
  pinyin?: string;
}

export type ImageFormat = 'png' | 'jpg';

export interface ImageExportOptions {
  format: ImageFormat;
  quality?: number; // 0.0 to 1.0, only for JPG
  scale?: number;   // Resolution scale factor (default: 3 for high quality)
}

export async function exportToImage(
  settings: CharacterGridSettings, 
  filename: string, 
  options: ImageExportOptions = { format: 'png', scale: 3 }
): Promise<void> {
  const { format, quality = 0.9, scale = 3 } = options;
  
  // Create a high-resolution canvas for image generation
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to create canvas context');
  }

  // Get characters based on content type
  const characterData = getCharacterData(settings);

  // Calculate grid layout (used for layout calculation)
  // const gridLayout = {
  //   totalCharacters: characterData.length,
  //   gridsPerRow: settings.gridsPerRow,
  //   rows: Math.ceil(characterData.length / settings.gridsPerRow),
  //   totalGrids: Math.ceil(characterData.length / settings.gridsPerRow) * settings.gridsPerRow
  // };

  // Calculate if this will be multi-page export
  const maxGridsPerPage = calculateMaxGridsForPage(settings);
  const isMultiPage = characterData.length > maxGridsPerPage;
  
  // High resolution canvas (300 DPI equivalent)
  const pageWidth = 595 * scale; // A4 width in pixels at 72 DPI * scale
  
  // Dynamic height calculation - reduce whitespace for single pages
  let pageHeight: number;
  if (isMultiPage) {
    // Multi-page: use full A4 height
    pageHeight = 842 * scale;
  } else {
    // Single page: calculate dynamic height to minimize whitespace
    pageHeight = calculateDynamicPageHeight(settings, characterData, scale);
  }
  
  canvas.width = pageWidth;
  canvas.height = pageHeight;

  // Set white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, pageWidth, pageHeight);

  // Determine how many characters/grids to render
  let pageData: CharacterData[];
  
  if (isMultiPage) {
    // Multi-page: export first page only
    const firstPageData = characterData.slice(0, maxGridsPerPage);
    pageData = fillPageWithContent(firstPageData, maxGridsPerPage, settings);
  } else {
    // Single page: use all content and fill with empty grids if needed
    pageData = [...characterData];
    
    // Always fill to at least one full page for article template, or minimum needed for single template
    const minGrids = settings.templateType === 'article' ? maxGridsPerPage : 
                    (characterData.length === 0 ? settings.gridsPerRow * 3 : characterData.length); // Minimum 3 rows for empty content
    
    while (pageData.length < minGrids) {
      pageData.push({
        character: '',
        pinyin: undefined
      });
    }
  }
  
  const pageLayout = {
    totalCharacters: pageData.length,
    gridsPerRow: settings.gridsPerRow,
    rows: Math.ceil(pageData.length / settings.gridsPerRow),
    totalGrids: Math.ceil(pageData.length / settings.gridsPerRow) * settings.gridsPerRow
  };
  
  renderGrid(ctx, settings, pageData, pageLayout, scale);

  // Convert canvas to image and trigger download
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  const imageData = format === 'png' 
    ? canvas.toDataURL(mimeType) 
    : canvas.toDataURL(mimeType, quality);
  
  // Create download link
  const link = document.createElement('a');
  link.download = `${filename}.${format}`;
  link.href = imageData;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Helper functions (reused from pdfExporter.ts)
function calculateDynamicPageHeight(
  settings: CharacterGridSettings, 
  characterData: CharacterData[], 
  scale: number
): number {
  const padding = 20 * scale;
  const headerHeight = 60 * scale;
  const gridSize = calculateGridSize(settings.gridsPerRow, (595 * scale - padding * 2) / scale) * scale;
  
  // Check if we need pinyin rows
  const contentType = detectContentType(settings.content);
  const needsPinyinRows = settings.showPinyin && contentType === 'chinese' && settings.gridType !== 'fourLine';
  const pinyinRowHeight = needsPinyinRows ? gridSize * 0.3 : 0;
  
  // Calculate minimum rows to render (for empty content, show at least 3 rows)
  const maxGridsPerPage = calculateMaxGridsForPage(settings);
  const actualDataLength = characterData.length;
  let finalDataLength: number;
  
  if (settings.templateType === 'article') {
    // Article template: fill entire page
    finalDataLength = maxGridsPerPage;
  } else {
    // Single template: use content length, or minimum 3 rows if empty
    finalDataLength = actualDataLength === 0 ? settings.gridsPerRow * 3 : actualDataLength;
  }
  
  let contentHeight: number;
  
  if (settings.gridType === 'fourLine') {
    const rowHeight = 48 * scale;
    const rowSpacing = 15 * scale;
    const totalRowHeight = rowHeight + rowSpacing;
    const rows = Math.ceil(finalDataLength / settings.gridsPerRow);
    contentHeight = rows * totalRowHeight;
  } else {
    const gridSpacing = -1 * scale;
    const totalRowHeight = gridSize + pinyinRowHeight + Math.abs(gridSpacing);
    const rows = Math.ceil(finalDataLength / settings.gridsPerRow);
    contentHeight = rows * totalRowHeight;
  }
  
  const totalHeight = headerHeight + contentHeight + padding * 2;
  const maxHeight = 842 * scale; // A4 height
  
  return Math.min(totalHeight, maxHeight);
}

function fillPageWithContent(
  characterData: CharacterData[], 
  maxGridsPerPage: number, 
  _settings: CharacterGridSettings
): CharacterData[] {
  const filledData = [...characterData];
  
  // Fill remaining slots with empty grids if needed
  while (filledData.length < maxGridsPerPage) {
    filledData.push({
      character: '',
      pinyin: undefined
    });
  }
  
  return filledData;
}

function getCharacterData(settings: CharacterGridSettings): CharacterData[] {
  const contentType = detectContentType(settings.content);
  const characters = getAllCharacters(settings.content);
  
  // If no content, return empty array - we'll handle filling with empty grids later
  if (characters.length === 0) {
    return [];
  }
  
  return characters.map(char => ({
    character: char,
    pinyin: (contentType === 'chinese' && settings.showPinyin) ? getPinyin(char) : undefined
  }));
}
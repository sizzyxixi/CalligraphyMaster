import { getFontFamily, calculateFontSize, calculateGridSize, detectContentType } from "@/lib/utils";
import type { CharacterGridSettings } from "@/lib/utils";

interface CharacterData {
  character: string;
  pinyin?: string;
}

interface GridLayout {
  totalCharacters: number;
  gridsPerRow: number;
  rows: number;
  totalGrids: number;
}

export function renderGrid(
  ctx: CanvasRenderingContext2D,
  settings: CharacterGridSettings,
  characterData: CharacterData[],
  gridLayout: GridLayout,
  scale: number = 1
) {
  const { gridsPerRow } = gridLayout;
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;
  
  // Calculate dimensions with optimized spacing
  const padding = 20 * scale; // Reduced from 40 to 20px
  const headerHeight = 60 * scale; // Reduced from 100 to 60px
  const availableWidth = canvasWidth - (padding * 2);
  const availableHeight = canvasHeight - padding - headerHeight;
  
  const gridSize = calculateGridSize(gridsPerRow, availableWidth / scale) * scale;
  const gridSpacing = -1 * scale; // Overlapping borders
  
  // Check if we need pinyin rows for Chinese characters
  const contentType = detectContentType(settings.content);
  const needsPinyinRows = settings.showPinyin && contentType === 'chinese' && settings.gridType !== 'fourLine';
  const pinyinRowHeight = needsPinyinRows ? gridSize * 0.3 : 0; // Reduced from 0.4 to 0.3
  const totalRowHeight = gridSize + pinyinRowHeight + Math.abs(gridSpacing);
  
  // Set white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // Render header
  renderHeader(ctx, scale, canvasWidth, headerHeight);
  
  // Calculate starting position to center the grid
  const totalRowWidth = (gridsPerRow * gridSize) + ((gridsPerRow - 1) * Math.abs(gridSpacing));
  const startX = (canvasWidth - totalRowWidth) / 2;
  const startY = headerHeight + (10 * scale); // Reduced from 20 to 10px
  
  // Handle different grid types
  if (settings.gridType === 'fourLine') {
    // Render four-line rows
    renderFourLineRows(ctx, settings, characterData, gridLayout, scale, startX, startY, availableWidth, availableHeight, padding);
  } else {
    // Render character grids
    let charIndex = 0;
    // Calculate max rows ensuring no partial rows at bottom
    const maxRows = Math.floor((availableHeight - 20 * scale) / totalRowHeight); // Reduced from 40 to 20px
    
    for (let row = 0; row < Math.min(gridLayout.rows, maxRows); row++) {
      const rowY = startY + (row * totalRowHeight);
      
      // Check if the entire row (including pinyin) can fit
      if (rowY + totalRowHeight > canvasHeight - padding) {
        break; // Don't render partial rows
      }
      
      // Render pinyin row if needed
      if (needsPinyinRows) {
        for (let col = 0; col < gridsPerRow; col++) {
          const x = startX + (col * (gridSize + Math.abs(gridSpacing)));
          const charData = characterData[charIndex + col];
          
          if (charData) {
            renderPinyinGrid(ctx, x, rowY, gridSize, pinyinRowHeight, charData, scale);
          }
        }
      }
      
      // Render main character grids
      for (let col = 0; col < gridsPerRow; col++) {
        const x = startX + (col * (gridSize + Math.abs(gridSpacing)));
        const y = rowY + pinyinRowHeight;
        
        const charData = characterData[charIndex];
        renderCharacterGrid(ctx, settings, x, y, gridSize, charData, scale);
        
        charIndex++;
        if (charIndex >= characterData.length) break;
      }
      if (charIndex >= characterData.length) break;
    }
  }
}

function renderFourLineRows(
  ctx: CanvasRenderingContext2D,
  settings: CharacterGridSettings,
  characterData: CharacterData[],
  gridLayout: GridLayout,
  scale: number,
  startX: number,
  startY: number,
  availableWidth: number,
  availableHeight: number,
  padding: number
) {
  const { gridsPerRow } = gridLayout;
  const rowHeight = 48 * scale; // Four-line grid height
  const rowSpacing = 15 * scale; // Space between rows - increased for better readability
  const totalRowHeight = rowHeight + rowSpacing;
  
  // Calculate how many rows can fit
  const maxRows = Math.floor((availableHeight - 20 * scale) / totalRowHeight);
  
  let charIndex = 0;
  
  for (let row = 0; row < Math.min(gridLayout.rows, maxRows); row++) {
    const rowY = startY + (row * totalRowHeight);
    
    // Check if the entire row can fit
    if (rowY + rowHeight > availableHeight - padding + startY) {
      break;
    }
    
    // Get characters for this row
    const rowCharacters = characterData.slice(charIndex, charIndex + gridsPerRow);
    
    // Calculate grid size and center the four-line row
    const gridSize = calculateGridSize(gridsPerRow, availableWidth / scale) * scale;
    const totalRowWidth = gridsPerRow * gridSize;
    const centeredX = (ctx.canvas.width - totalRowWidth) / 2;
    
    // Render the four-line row
    renderSingleFourLineRow(ctx, settings, rowCharacters, centeredX, rowY, totalRowWidth, rowHeight, scale);
    
    charIndex += gridsPerRow;
    if (charIndex >= characterData.length) break;
  }
}

function renderSingleFourLineRow(
  ctx: CanvasRenderingContext2D,
  settings: CharacterGridSettings,
  rowCharacters: CharacterData[],
  x: number,
  y: number,
  width: number,
  height: number,
  scale: number
) {
  const { gridsPerRow, fontType, fontOpacity } = settings;
  
  // Draw complete four-line grid structure (4 lines total)
  ctx.strokeStyle = '#6B7280';
  ctx.lineWidth = 1 * scale;
  ctx.setLineDash([]);
  
  const lineHeight = height / 3; // 3 sections between 4 lines
  
  // Draw 4 horizontal lines: top border + 2 middle lines + bottom border
  for (let i = 0; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x, y + (i * lineHeight));
    ctx.lineTo(x + width, y + (i * lineHeight));
    ctx.stroke();
  }
  
  // Draw left and right borders
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + height);
  ctx.moveTo(x + width, y);
  ctx.lineTo(x + width, y + height);
  ctx.stroke();
  
  // Draw vertical dividing lines
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 1 * scale;
  const cellWidth = width / gridsPerRow;
  for (let i = 1; i < gridsPerRow; i++) {
    ctx.beginPath();
    ctx.moveTo(x + (i * cellWidth), y);
    ctx.lineTo(x + (i * cellWidth), y + height);
    ctx.stroke();
  }
  
  // Draw characters
  ctx.setLineDash([]);
  // Use a slightly smaller font size for better fit in four-line grid
  const fontSize = calculateFontSize(height / scale * 0.8, settings.fontSize) * scale;
  const fontFamily = getFontFamily(fontType);
  const chineseFontFamily = `${fontFamily}, "Noto Sans CJK SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", "SimHei", "Arial Unicode MS", sans-serif`;
  
  ctx.fillStyle = `rgba(107, 114, 128, ${fontOpacity / 100})`;
  ctx.font = `${fontSize}px ${chineseFontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  for (let i = 0; i < gridsPerRow && i < rowCharacters.length; i++) {
    const charData = rowCharacters[i];
    if (charData?.character) {
      const charX = x + (i * cellWidth) + (cellWidth / 2);
      const charY = calculateCharacterPositionInFourLineGrid(charData.character, y, height);
      ctx.fillText(charData.character, charX, charY);
    }
  }
}

function calculateCharacterPositionInFourLineGrid(character: string, y: number, height: number): number {
  const sectionHeight = height / 3;
  
  // Uppercase letters: occupy top and middle sections
  if (character >= 'A' && character <= 'Z') {
    // Position slightly above center of top and middle sections
    return y + sectionHeight * 0.9;
  }
  
  // Lowercase letters with ascenders (b, d, h, i, k, l, t): occupy top and middle sections
  if ('bdhiklt'.includes(character)) {
    // Position slightly above center of top and middle sections
    return y + sectionHeight * 0.9;
  }
  
  // Lowercase letters with full height (f, j): occupy all three sections
  if ('fj'.includes(character)) {
    // Position in the center of all three sections
    return y + (height / 2);
  }
  
  // Lowercase letters with descenders (p, q, y): occupy middle and bottom sections
  if ('pqy'.includes(character)) {
    // Position in the center of middle section, allowing descender to go down
    return y + sectionHeight + (sectionHeight / 2);
  }
  
  // Letters with slight descenders (g): occupy middle and bottom sections
  if ('g'.includes(character)) {
    // Position in the center of middle section, allowing descender to go down
    return y + sectionHeight + (sectionHeight / 2);
  }
  
  // Other lowercase letters (a, c, e, m, n, o, r, s, u, v, w, x, z): occupy middle section only
  // Position in the center of middle section
  return y + sectionHeight + (sectionHeight / 2);
}

function renderPinyinGrid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  charData: CharacterData,
  scale: number = 1
) {
  // Draw four-line grid for pinyin with consistent style
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 1 * scale; // Consistent with outer border
  ctx.setLineDash([]); // Solid lines for pinyin grid
  
  const lineHeight = height / 4;
  // Draw four horizontal lines
  for (let i = 0; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(x, y + (i * lineHeight));
    ctx.lineTo(x + width, y + (i * lineHeight));
    ctx.stroke();
  }
  
  // Draw left and right borders
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + height);
  ctx.moveTo(x + width, y);
  ctx.lineTo(x + width, y + height);
  ctx.stroke();
  
  // Draw pinyin text if available
  if (charData.pinyin) {
    ctx.fillStyle = '#9CA3AF';
    ctx.font = `${12 * scale}px Arial, "Helvetica Neue", Helvetica, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(charData.pinyin, x + width/2, y + height/2);
  }
}

function renderHeader(ctx: CanvasRenderingContext2D, scale: number, canvasWidth: number, headerHeight: number) {
  // Title
  ctx.fillStyle = '#1F2937';
  ctx.font = `bold ${20 * scale}px "Inter", "Noto Sans SC", sans-serif`; // Reduced from 24 to 20px
  ctx.textAlign = 'center';
  ctx.fillText('拼音练习', canvasWidth / 2, 25 * scale); // Reduced from 30 to 25px
  
  // 姓名和日期信息行 - 两端对齐分布，紧贴首行格子上方
  ctx.fillStyle = '#6B7280';
  ctx.font = `${11 * scale}px "Inter", "Noto Sans SC", sans-serif`;
  
  // 信息行位置调整到更接近格子线条 (headerHeight - 10px)
  const infoY = headerHeight - (10 * scale);
  const padding = 20 * scale; // 与格子padding保持一致
  
  // 姓名 - 左对齐
  ctx.textAlign = 'left';
  ctx.fillText('姓名：___________', padding, infoY);
  
  // 日期 - 右对齐  
  ctx.textAlign = 'right';
  ctx.fillText('日期：___________', canvasWidth - padding, infoY);
}

function renderCharacterGrid(
  ctx: CanvasRenderingContext2D,
  settings: CharacterGridSettings,
  x: number,
  y: number,
  size: number,
  charData?: CharacterData,
  scale: number = 1
) {
  const { gridType, fontType, fontOpacity, showPinyin } = settings;
  
  // Draw outer border (thinner)
  ctx.strokeStyle = '#6B7280';
  ctx.lineWidth = 1 * scale; // Changed from 2 to 1px
  ctx.setLineDash([]); // Solid line for outer border
  
  if (gridType === 'fourLine') {
    const lineHeight = size / 3; // 3 sections between 4 lines
    // Draw 4 horizontal lines: top border + 2 middle lines + bottom border
    for (let i = 0; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x, y + (i * lineHeight));
      ctx.lineTo(x + size, y + (i * lineHeight));
      ctx.stroke();
    }
    // Draw left and right borders
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + size);
    ctx.moveTo(x + size, y);
    ctx.lineTo(x + size, y + size);
    ctx.stroke();
  } else {
    ctx.strokeRect(x, y, size, size);
  }
  
  // Draw inner grid lines (dashed)
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 0.5 * scale; // Thinner for inner lines
  ctx.setLineDash([3 * scale, 3 * scale]); // Dashed line pattern
  
  switch (gridType) {
    case 'mi':
      // Vertical and horizontal center lines
      ctx.beginPath();
      ctx.moveTo(x + size/2, y);
      ctx.lineTo(x + size/2, y + size);
      ctx.moveTo(x, y + size/2);
      ctx.lineTo(x + size, y + size/2);
      ctx.stroke();
      
      // Diagonal lines
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + size, y + size);
      ctx.moveTo(x + size, y);
      ctx.lineTo(x, y + size);
      ctx.stroke();
      break;
      
    case 'tian':
      // Vertical and horizontal center lines
      ctx.beginPath();
      ctx.moveTo(x + size/2, y);
      ctx.lineTo(x + size/2, y + size);
      ctx.moveTo(x, y + size/2);
      ctx.lineTo(x + size, y + size/2);
      ctx.stroke();
      break;
      
    case 'fourLine':
      // Lines are already drawn above
      break;
      
    default: // blank
      break;
  }
  
  // Reset line dash for text rendering
  ctx.setLineDash([]);
  
  // Draw character if provided
  if (charData?.character) {
    const fontSize = calculateFontSize(size / scale, settings.fontSize) * scale;
    const fontFamily = getFontFamily(fontType);
    
    // Ensure Chinese font rendering
    const chineseFontFamily = `${fontFamily}, "Noto Sans CJK SC", "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", "SimHei", "Arial Unicode MS", sans-serif`;
    
    // Draw main character
    const alpha = fontOpacity / 100;
    ctx.fillStyle = `rgba(107, 114, 128, ${alpha})`;
    ctx.font = `${fontSize}px ${chineseFontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (gridType === 'fourLine') {
      // Use the same positioning logic for individual four-line grids
      const charY = calculateCharacterPositionInFourLineGrid(charData.character, y, size);
      ctx.fillText(charData.character, x + size/2, charY);
    } else {
      ctx.fillText(charData.character, x + size/2, y + size/2);
    }
  }
}
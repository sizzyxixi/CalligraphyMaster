import { getFontFamily, calculateFontSize, calculateGridSize } from "@/lib/utils";
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
  
  // Calculate dimensions
  const padding = 32 * scale;
  const headerHeight = 80 * scale;
  const availableWidth = canvasWidth - (padding * 2);
  const availableHeight = canvasHeight - padding - headerHeight;
  
  const gridSize = calculateGridSize(gridsPerRow, availableWidth / scale) * scale;
  const gridSpacing = 4 * scale;
  
  // Set white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // Render header
  renderHeader(ctx, scale, canvasWidth, headerHeight);
  
  // Calculate starting position to center the grid
  const totalRowWidth = (gridsPerRow * gridSize) + ((gridsPerRow - 1) * gridSpacing);
  const startX = (canvasWidth - totalRowWidth) / 2;
  const startY = headerHeight + (20 * scale);
  
  // Render character grids
  let charIndex = 0;
  const maxRows = Math.floor((availableHeight - 40 * scale) / (gridSize + gridSpacing));
  
  for (let row = 0; row < Math.min(gridLayout.rows, maxRows); row++) {
    for (let col = 0; col < gridsPerRow; col++) {
      const x = startX + (col * (gridSize + gridSpacing));
      const y = startY + (row * (gridSize + gridSpacing));
      
      const charData = characterData[charIndex];
      renderCharacterGrid(ctx, settings, x, y, gridSize, charData, scale);
      
      charIndex++;
      if (charIndex >= characterData.length) break;
    }
    if (charIndex >= characterData.length) break;
  }
}

function renderHeader(ctx: CanvasRenderingContext2D, scale: number, canvasWidth: number, headerHeight: number) {
  // Title
  ctx.fillStyle = '#1F2937';
  ctx.font = `bold ${24 * scale}px "Inter", "Noto Sans SC", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('汉字练习字帖', canvasWidth / 2, 35 * scale);
  
  // Info line
  ctx.fillStyle = '#6B7280';
  ctx.font = `${12 * scale}px "Inter", "Noto Sans SC", sans-serif`;
  ctx.textAlign = 'left';
  
  const infoY = 55 * scale;
  const infoSpacing = 80 * scale;
  let infoX = 50 * scale;
  
  ctx.fillText('姓名：___________', infoX, infoY);
  infoX += infoSpacing * 1.5;
  
  ctx.fillText('日期：___________', infoX, infoY);
  infoX += infoSpacing * 1.5;
  
  ctx.fillText('班级：___________', infoX, infoY);
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
  
  // Draw outer border
  ctx.strokeStyle = '#6B7280';
  ctx.lineWidth = 2 * scale;
  
  if (gridType === 'fourLine') {
    const lineHeight = size / 4;
    // Draw four horizontal lines
    for (let i = 0; i <= 4; i++) {
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
  
  // Draw grid lines
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 1 * scale;
  
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
  
  // Draw character if provided
  if (charData?.character) {
    const fontSize = calculateFontSize(size / scale, settings.fontSize) * scale;
    const fontFamily = getFontFamily(fontType);
    
    // Draw pinyin if enabled and not four-line grid
    if (showPinyin && charData.pinyin && gridType !== 'fourLine') {
      ctx.fillStyle = '#6B7280';
      ctx.font = `${fontSize * 0.3}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.fillText(charData.pinyin, x + size/2, y + (12 * scale));
    }
    
    // Draw main character
    const alpha = fontOpacity / 100;
    ctx.fillStyle = `rgba(107, 114, 128, ${alpha})`;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (gridType === 'fourLine') {
      // Center vertically within the four-line grid
      ctx.fillText(charData.character, x + size/2, y + size/2);
    } else {
      ctx.fillText(charData.character, x + size/2, y + size/2);
    }
  }
}

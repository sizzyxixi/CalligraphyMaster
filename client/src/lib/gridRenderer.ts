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
  renderHeader(ctx, scale, canvasWidth, headerHeight, settings);
  
  // Calculate starting position to center the grid
  const totalRowWidth = (gridsPerRow * gridSize) + ((gridsPerRow - 1) * Math.abs(gridSpacing));
  const startX = (canvasWidth - totalRowWidth) / 2;
  const startY = headerHeight + (10 * scale); // Reduced from 20 to 10px
  
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

function renderHeader(ctx: CanvasRenderingContext2D, scale: number, canvasWidth: number, headerHeight: number, settings?: CharacterGridSettings) {
  // Title - bilingual
  ctx.fillStyle = '#1F2937';
  ctx.font = `bold ${20 * scale}px "Inter", "Noto Sans SC", sans-serif`;
  ctx.textAlign = 'center';
  
  const isEnglishTemplate = settings?.templateType?.startsWith('english');
  const title = isEnglishTemplate ? 'English Calligraphy Practice / 英文书法练习' : '汉字练习字帖 / Chinese Calligraphy Practice';
  ctx.fillText(title, canvasWidth / 2, 25 * scale);
  
  // Name and date info - bilingual
  ctx.fillStyle = '#6B7280';
  ctx.font = `${11 * scale}px "Inter", "Noto Sans SC", sans-serif`;
  
  const infoY = headerHeight - (10 * scale);
  const padding = 20 * scale;
  
  // Name - left aligned
  ctx.textAlign = 'left';
  const nameLabel = isEnglishTemplate ? 'Name / 姓名：___________' : '姓名 / Name：___________';
  ctx.fillText(nameLabel, padding, infoY);
  
  // Date - right aligned  
  ctx.textAlign = 'right';
  const dateLabel = isEnglishTemplate ? 'Date / 日期：___________' : '日期 / Date：___________';
  ctx.fillText(dateLabel, canvasWidth - padding, infoY);
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
      
    case 'englishLine':
      // Three horizontal lines for English writing
      const englishLineHeight = size / 3;
      ctx.beginPath();
      ctx.moveTo(x, y + englishLineHeight);
      ctx.lineTo(x + size, y + englishLineHeight);
      ctx.moveTo(x, y + englishLineHeight * 2);
      ctx.lineTo(x + size, y + englishLineHeight * 2);
      ctx.stroke();
      break;
      
    case 'cursiveLine':
      // Cursive writing lines with dashed guidelines
      const cursiveLineHeight = size / 4;
      // Solid baseline and top line
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(x, y + cursiveLineHeight * 2); // baseline
      ctx.lineTo(x + size, y + cursiveLineHeight * 2);
      ctx.stroke();
      
      // Dashed guidelines
      ctx.setLineDash([2 * scale, 2 * scale]);
      ctx.beginPath();
      ctx.moveTo(x, y + cursiveLineHeight); // top guideline
      ctx.lineTo(x + size, y + cursiveLineHeight);
      ctx.moveTo(x, y + cursiveLineHeight * 3); // bottom guideline
      ctx.lineTo(x + size, y + cursiveLineHeight * 3);
      ctx.stroke();
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
      // Center vertically within the four-line grid
      ctx.fillText(charData.character, x + size/2, y + size/2);
    } else if (gridType === 'englishLine') {
      // Position text on the middle line for English writing
      ctx.fillText(charData.character, x + size/2, y + (size * 2/3));
    } else if (gridType === 'cursiveLine') {
      // Position text on the baseline for cursive writing
      ctx.fillText(charData.character, x + size/2, y + (size/2));
    } else {
      ctx.fillText(charData.character, x + size/2, y + size/2);
    }
  }
}
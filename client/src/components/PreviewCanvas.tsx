import { useEffect, useRef, useMemo } from "react";
import { useCharacterGrid } from "@/hooks/useCharacterGrid";
import { renderGrid } from "@/lib/gridRenderer";
import { detectContentType } from "@/lib/utils";
import type { CharacterGridSettings } from "@/lib/utils";

interface PreviewCanvasProps {
  settings: CharacterGridSettings;
  zoomLevel?: number;
}

export default function PreviewCanvas({ settings, zoomLevel = 75 }: PreviewCanvasProps) {
  const { characterData, gridLayout } = useCharacterGrid(settings);
  
  // Calculate how many grids fit per page (using optimized values)
  const maxGridsPerPage = useMemo(() => {
    const A4_WIDTH = 595;
    const A4_HEIGHT = 842;
    const HEADER_HEIGHT = 60; // Optimized header height
    const PADDING = 40; // Optimized padding
    
    const availableWidth = A4_WIDTH - PADDING;
    const availableHeight = A4_HEIGHT - HEADER_HEIGHT - PADDING;
    
    const gridSize = availableWidth / settings.gridsPerRow;
    const gridSpacing = -1;
    
    // Check if we need pinyin rows (same logic as PDF export)
    const contentType = detectContentType(settings.content);
    const needsPinyinRows = settings.showPinyin && contentType === 'chinese' && settings.gridType !== 'fourLine';
    const pinyinRowHeight = needsPinyinRows ? gridSize * 0.3 : 0;
    const totalGridHeight = gridSize + pinyinRowHeight + Math.abs(gridSpacing);
    
    const maxRows = Math.floor(availableHeight / totalGridHeight);
    return Math.max(1, maxRows * settings.gridsPerRow);
  }, [settings.gridsPerRow, settings.showPinyin, settings.content, settings.gridType]);
  
  // Calculate pages needed
  const totalPages = Math.max(1, Math.ceil(characterData.length / maxGridsPerPage));
  
  // Generate page data
  const pages = useMemo(() => {
    const result = [];
    for (let page = 0; page < totalPages; page++) {
      const startIndex = page * maxGridsPerPage;
      const endIndex = Math.min(startIndex + maxGridsPerPage, characterData.length);
      const pageCharacters = characterData.slice(startIndex, endIndex);
      
      // Fill page with empty grids if needed (for article template)
      const filledPageData = [...pageCharacters];
      if (settings.templateType === 'article' && filledPageData.length < maxGridsPerPage) {
        while (filledPageData.length < maxGridsPerPage) {
          filledPageData.push({
            character: '',
            pinyin: undefined
          });
        }
      }
      
      result.push({
        characters: filledPageData,
        layout: {
          totalCharacters: filledPageData.length,
          gridsPerRow: settings.gridsPerRow,
          rows: Math.ceil(filledPageData.length / settings.gridsPerRow),
          totalGrids: Math.ceil(filledPageData.length / settings.gridsPerRow) * settings.gridsPerRow
        }
      });
    }
    return result;
  }, [characterData, maxGridsPerPage, settings.gridsPerRow, settings.templateType, totalPages]);

  const baseWidth = 595;
  const baseHeight = 842;
  const scale = zoomLevel / 100;
  const displayWidth = baseWidth * scale;
  const displayHeight = baseHeight * scale;

  if (!settings.content.trim() && settings.templateType === 'single') {
    return (
      <div className="bg-white shadow-lg flex items-center justify-center" style={{ width: `${displayWidth}px`, height: `${displayHeight}px` }}>
        <div className="text-center text-gray-500">
          <i className="fas fa-file-alt text-4xl mb-4"></i>
          <p className="text-lg font-medium">请输入文字内容</p>
          <p className="text-sm">在左侧面板输入要练习的内容</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pages.map((page, pageIndex) => (
        <PageCanvas
          key={pageIndex}
          pageNumber={pageIndex + 1}
          totalPages={totalPages}
          characters={page.characters}
          layout={page.layout}
          settings={settings}
          zoomLevel={zoomLevel}
          displayWidth={displayWidth}
          displayHeight={displayHeight}
          scale={scale}
        />
      ))}
    </div>
  );
}

interface PageCanvasProps {
  pageNumber: number;
  totalPages: number;
  characters: Array<{character: string, pinyin?: string}>;
  layout: {
    totalCharacters: number;
    gridsPerRow: number;
    rows: number;
    totalGrids: number;
  };
  settings: CharacterGridSettings;
  zoomLevel: number;
  displayWidth: number;
  displayHeight: number;
  scale: number;
}

function PageCanvas({
  pageNumber,
  totalPages,
  characters,
  layout,
  settings,
  displayWidth,
  displayHeight,
  scale
}: PageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate dynamic height for single pages to reduce whitespace
  const dynamicHeight = useMemo(() => {
    if (totalPages > 1) {
      // Multi-page: use full A4 height
      return displayHeight;
    }
    
    // Single page: calculate actual needed height
    const headerHeight = 60 * scale;
    const padding = 20 * scale;
    const gridSize = (595 - 40) / settings.gridsPerRow * scale; // A4 width - padding
    const gridSpacing = Math.abs(-1 * scale);
    
    // Check if we need pinyin rows
    const contentType = detectContentType(settings.content);
    
    const needsPinyinRows = settings.showPinyin && contentType === 'chinese' && settings.gridType !== 'fourLine';
    const pinyinRowHeight = needsPinyinRows ? gridSize * 0.3 : 0;
    const totalRowHeight = gridSize + pinyinRowHeight + gridSpacing;
    
    // Calculate actual rows needed
    const actualRows = layout.rows;
    const contentHeight = actualRows * totalRowHeight;
    const totalNeededHeight = headerHeight + padding + contentHeight + (padding * 0.5); // Small bottom padding
    
    return Math.min(totalNeededHeight, displayHeight); // Don't exceed A4 height
  }, [totalPages, displayHeight, scale, settings, layout.rows]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // A4 dimensions with dynamic zoom level
    const baseWidth = 595;
    const baseHeight = totalPages > 1 ? 842 : (dynamicHeight / scale);
    
    canvas.width = baseWidth * scale;
    canvas.height = baseHeight * scale;
    canvas.style.width = `${baseWidth * scale}px`;
    canvas.style.height = `${baseHeight * scale}px`;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Render grid
    renderGrid(ctx, settings, characters, layout, scale);
  }, [characters, layout, settings, scale, dynamicHeight, totalPages]);

  const actualDisplayWidth = 595 * scale;
  const actualDisplayHeight = totalPages > 1 ? displayHeight : dynamicHeight;

  return (
    <div className="bg-white shadow-lg relative">
      <canvas
        ref={canvasRef}
        className="block"
        style={{ 
          width: `${actualDisplayWidth}px`, 
          height: `${actualDisplayHeight}px`,
          border: '1px solid #e5e7eb'
        }}
      />
      {totalPages > 1 && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          第 {pageNumber} 页 / 共 {totalPages} 页
        </div>
      )}
    </div>
  );
}
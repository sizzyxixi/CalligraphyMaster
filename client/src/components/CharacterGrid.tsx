import { cn, getFontFamily, calculateFontSize } from "@/lib/utils";
import type { GridType, FontType } from "@/lib/utils";

interface CharacterGridProps {
  gridType: GridType;
  character?: string;
  pinyin?: string;
  size: number;
  fontType: FontType;
  fontOpacity: number;
  showPinyin: boolean;
}

export default function CharacterGrid({
  gridType,
  character,
  pinyin,
  size,
  fontType,
  fontOpacity,
  showPinyin
}: CharacterGridProps) {
  const fontSize = calculateFontSize(size, 'auto');
  const fontFamily = getFontFamily(fontType);

  const renderGridLines = () => {
    switch (gridType) {
      case 'mi':
        return (
          <>
            {/* Vertical and horizontal center lines */}
            <div className="absolute inset-0 border-l border-r border-gray-300" style={{ left: '50%', transform: 'translateX(-50%)' }}></div>
            <div className="absolute inset-0 border-t border-b border-gray-300" style={{ top: '50%', transform: 'translateY(-50%)' }}></div>
            {/* Diagonal lines */}
            <div className="absolute inset-0">
              <svg className="w-full h-full">
                <line x1="0" y1="0" x2="100%" y2="100%" stroke="#D1D5DB" strokeWidth="1" />
                <line x1="100%" y1="0" x2="0" y2="100%" stroke="#D1D5DB" strokeWidth="1" />
              </svg>
            </div>
          </>
        );
      case 'tian':
        return (
          <>
            <div className="absolute inset-0 border-l border-r border-gray-300" style={{ left: '50%', transform: 'translateX(-50%)' }}></div>
            <div className="absolute inset-0 border-t border-b border-gray-300" style={{ top: '50%', transform: 'translateY(-50%)' }}></div>
          </>
        );
      case 'fourLine':
        return (
          <div className="absolute inset-0">
            <div className="absolute w-full border-t border-gray-400" style={{ top: '25%' }}></div>
            <div className="absolute w-full border-t border-gray-400" style={{ top: '50%' }}></div>
            <div className="absolute w-full border-t border-gray-400" style={{ top: '75%' }}></div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "relative bg-white border-2 border-gray-400 flex flex-col items-center justify-center",
        gridType === 'fourLine' ? 'h-12' : ''
      )}
      style={{ 
        width: `${size}px`, 
        height: gridType === 'fourLine' ? '48px' : `${size}px` 
      }}
    >
      {renderGridLines()}
      
      {/* Pinyin */}
      {showPinyin && pinyin && gridType !== 'fourLine' && (
        <div 
          className="absolute top-1 left-1/2 transform -translate-x-1/2 text-xs text-gray-600"
          style={{ fontSize: Math.max(10, fontSize * 0.3) }}
        >
          {pinyin}
        </div>
      )}
      
      {/* Character */}
      {character && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10"
          style={{
            fontFamily,
            fontSize: `${fontSize}px`,
            color: `rgba(107, 114, 128, ${fontOpacity / 100})`,
            lineHeight: '1'
          }}
        >
          {character}
        </div>
      )}
    </div>
  );
}

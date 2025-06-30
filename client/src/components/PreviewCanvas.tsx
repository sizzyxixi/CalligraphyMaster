import { useEffect, useRef } from "react";
import { useCharacterGrid } from "@/hooks/useCharacterGrid";
import { renderGrid } from "@/lib/gridRenderer";
import type { CharacterGridSettings } from "@/lib/utils";

interface PreviewCanvasProps {
  settings: CharacterGridSettings;
}

export default function PreviewCanvas({ settings }: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { characterData, gridLayout } = useCharacterGrid(settings);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !characterData.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // A4 dimensions at 96 DPI (scale factor for screen display)
    const scale = 0.75;
    canvas.width = 595 * scale;
    canvas.height = 842 * scale;
    canvas.style.width = `${595 * scale}px`;
    canvas.style.height = `${842 * scale}px`;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Render grid
    renderGrid(ctx, settings, characterData, gridLayout, scale);
  }, [settings, characterData, gridLayout]);

  if (!settings.content.trim()) {
    return (
      <div className="bg-white shadow-lg flex items-center justify-center" style={{ width: '446px', height: '632px' }}>
        <div className="text-center text-gray-500">
          <i className="fas fa-file-alt text-4xl mb-4"></i>
          <p className="text-lg font-medium">请输入文字内容</p>
          <p className="text-sm">在左侧面板输入要练习的内容</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg">
      <canvas
        ref={canvasRef}
        className="block"
        style={{ 
          width: '446px', 
          height: '632px',
          border: '1px solid #e5e7eb'
        }}
      />
    </div>
  );
}

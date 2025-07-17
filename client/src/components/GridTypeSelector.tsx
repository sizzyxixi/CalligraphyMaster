import { cn } from "@/lib/utils";
import type { GridType } from "@/lib/utils";

interface GridTypeSelectorProps {
  value: GridType;
  onChange: (value: GridType) => void;
}

export default function GridTypeSelector({ value, onChange }: GridTypeSelectorProps) {
  const gridTypes = [
    // Chinese grid types
    {
      id: 'mi' as const,
      label: '米字格',
      category: 'chinese',
      preview: (
        <div className="ml-2 w-6 h-6 border border-gray-400 relative">
          <div className="absolute inset-0 border-l border-r border-gray-300" style={{ left: '50%', transform: 'translateX(-50%)' }}></div>
          <div className="absolute inset-0 border-t border-b border-gray-300" style={{ top: '50%', transform: 'translateY(-50%)' }}></div>
          <div className="absolute w-full h-full border-gray-300" style={{ 
            borderWidth: '0 1.5px 1.5px 0', 
            transform: 'rotate(45deg) scale(0.71)', 
            transformOrigin: 'center'
          }}></div>
          <div className="absolute w-full h-full border-gray-300" style={{ 
            borderWidth: '1.5px 0 0 1.5px', 
            transform: 'rotate(45deg) scale(0.71)', 
            transformOrigin: 'center'
          }}></div>
        </div>
      )
    },
    {
      id: 'tian' as const,
      label: '田字格',
      category: 'chinese',
      preview: (
        <div className="ml-2 w-6 h-6 border border-gray-400 relative">
          <div className="absolute inset-0 border-l border-r border-gray-300" style={{ left: '50%', transform: 'translateX(-50%)' }}></div>
          <div className="absolute inset-0 border-t border-b border-gray-300" style={{ top: '50%', transform: 'translateY(-50%)' }}></div>
        </div>
      )
    },
    {
      id: 'blank' as const,
      label: '空白格',
      category: 'universal',
      preview: (
        <div className="ml-2 w-6 h-6 border border-gray-400"></div>
      )
    },
    {
      id: 'fourLine' as const,
      label: '四线格',
      category: 'universal',
      preview: (
        <div className="ml-2 w-6 h-4 border-l border-r border-gray-400 relative">
          <div className="absolute w-full border-t border-gray-400" style={{ top: '25%' }}></div>
          <div className="absolute w-full border-t border-gray-400" style={{ top: '50%' }}></div>
          <div className="absolute w-full border-t border-gray-400" style={{ top: '75%' }}></div>
        </div>
      )
    },
    // English grid types
    {
      id: 'englishLine' as const,
      label: 'English Lines',
      category: 'english',
      preview: (
        <div className="ml-2 w-6 h-4 border-l border-r border-gray-400 relative">
          <div className="absolute w-full border-t border-gray-400" style={{ top: '33%' }}></div>
          <div className="absolute w-full border-t border-gray-400" style={{ top: '66%' }}></div>
        </div>
      )
    },
    {
      id: 'cursiveLine' as const,
      label: 'Cursive Lines',
      category: 'english',
      preview: (
        <div className="ml-2 w-6 h-4 border-l border-r border-gray-400 relative">
          <div className="absolute w-full border-t border-gray-300 border-dashed" style={{ top: '25%' }}></div>
          <div className="absolute w-full border-t border-gray-400" style={{ top: '50%' }}></div>
          <div className="absolute w-full border-t border-gray-300 border-dashed" style={{ top: '75%' }}></div>
        </div>
      )
    }
  ];

  const chineseGrids = gridTypes.filter(g => g.category === 'chinese');
  const universalGrids = gridTypes.filter(g => g.category === 'universal');
  const englishGrids = gridTypes.filter(g => g.category === 'english');

  return (
    <div className="p-6 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">格子类型 / Grid Type</h3>
      
      {/* Chinese Grids */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-600 mb-2">中文格子 Chinese</h4>
        <div className="space-y-2">
          {chineseGrids.map(gridType => (
            <div key={gridType.id} className="flex items-center">
              <input
                type="radio"
                id={`grid-${gridType.id}`}
                name="gridType"
                value={gridType.id}
                checked={value === gridType.id}
                onChange={() => onChange(gridType.id)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <label htmlFor={`grid-${gridType.id}`} className="ml-3 flex items-center text-sm font-medium text-gray-700">
                {gridType.label}
                {gridType.preview}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Universal Grids */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-600 mb-2">通用格子 Universal</h4>
        <div className="space-y-2">
          {universalGrids.map(gridType => (
            <div key={gridType.id} className="flex items-center">
              <input
                type="radio"
                id={`grid-${gridType.id}`}
                name="gridType"
                value={gridType.id}
                checked={value === gridType.id}
                onChange={() => onChange(gridType.id)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <label htmlFor={`grid-${gridType.id}`} className="ml-3 flex items-center text-sm font-medium text-gray-700">
                {gridType.label}
                {gridType.preview}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* English Grids */}
      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-2">英文格子 English</h4>
        <div className="space-y-2">
          {englishGrids.map(gridType => (
            <div key={gridType.id} className="flex items-center">
              <input
                type="radio"
                id={`grid-${gridType.id}`}
                name="gridType"
                value={gridType.id}
                checked={value === gridType.id}
                onChange={() => onChange(gridType.id)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <label htmlFor={`grid-${gridType.id}`} className="ml-3 flex items-center text-sm font-medium text-gray-700">
                {gridType.label}
                {gridType.preview}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

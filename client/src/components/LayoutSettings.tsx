import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LayoutSettingsProps {
  gridsPerRow: number;
  fontSize: string;
  onGridsPerRowChange: (value: number) => void;
  onFontSizeChange: (value: string) => void;
}

export default function LayoutSettings({
  gridsPerRow,
  fontSize,
  onGridsPerRowChange,
  onFontSizeChange
}: LayoutSettingsProps) {
  return (
    <div className="p-6 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">布局设置</h3>
      <div className="space-y-4">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">每行格子数</Label>
          <Slider
            value={[gridsPerRow]}
            onValueChange={(values) => onGridsPerRowChange(values[0])}
            min={6}
            max={20}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>6</span>
            <span className="font-medium">{gridsPerRow}</span>
            <span>20</span>
          </div>
        </div>
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">字体大小</Label>
          <Select value={fontSize} onValueChange={onFontSizeChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">自动适配</SelectItem>
              <SelectItem value="small">小号</SelectItem>
              <SelectItem value="medium">中号</SelectItem>
              <SelectItem value="large">大号</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

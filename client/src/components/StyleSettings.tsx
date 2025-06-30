import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FontType } from "@/lib/utils";

interface StyleSettingsProps {
  fontType: FontType;
  fontOpacity: number;
  showPinyin: boolean;
  onFontTypeChange: (value: FontType) => void;
  onFontOpacityChange: (value: number) => void;
  onShowPinyinChange: (value: boolean) => void;
}

export default function StyleSettings({
  fontType,
  fontOpacity,
  showPinyin,
  onFontTypeChange,
  onFontOpacityChange,
  onShowPinyinChange
}: StyleSettingsProps) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">字体样式</h3>
      <div className="space-y-4">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">字体选择</Label>
          <Select value={fontType} onValueChange={onFontTypeChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kaiti">楷体</SelectItem>
              <SelectItem value="simsun">宋体</SelectItem>
              <SelectItem value="simhei">黑体</SelectItem>
              <SelectItem value="fangsong">仿宋</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">字体颜色透明度</Label>
          <Slider
            value={[fontOpacity]}
            onValueChange={(values) => onFontOpacityChange(values[0])}
            min={10}
            max={80}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>浅色</span>
            <span>适中</span>
            <span>深色</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-gray-700">显示拼音</Label>
          <Switch
            checked={showPinyin}
            onCheckedChange={onShowPinyinChange}
          />
        </div>
      </div>
    </div>
  );
}

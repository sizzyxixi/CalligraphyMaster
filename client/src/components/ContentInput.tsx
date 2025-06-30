import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ContentType } from "@/lib/utils";

interface ContentInputProps {
  contentType: ContentType;
  content: string;
  onContentTypeChange: (value: ContentType) => void;
  onContentChange: (value: string) => void;
}

export default function ContentInput({ 
  contentType, 
  content, 
  onContentTypeChange, 
  onContentChange 
}: ContentInputProps) {
  const getPlaceholder = () => {
    switch (contentType) {
      case 'chinese':
        return '请输入要练习的汉字内容...';
      case 'pinyin':
        return '请输入拼音内容，如：chūn mián bù jué xiǎo...';
      case 'english':
        return 'Please enter English text to practice...';
      default:
        return '请输入内容...';
    }
  };

  return (
    <div className="p-6 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">文字内容</h3>
      <div className="space-y-4">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">输入模式</Label>
          <Select value={contentType} onValueChange={onContentTypeChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chinese">中文汉字</SelectItem>
              <SelectItem value="pinyin">拼音</SelectItem>
              <SelectItem value="english">英文</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">字帖内容</Label>
          <Textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            className="w-full font-chinese"
            rows={4}
            placeholder={getPlaceholder()}
          />
        </div>
      </div>
    </div>
  );
}

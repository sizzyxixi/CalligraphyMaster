import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ContentInputProps {
  content: string;
  onContentChange: (value: string) => void;
}

export default function ContentInput({ 
  content, 
  onContentChange 
}: ContentInputProps) {
  return (
    <div className="p-6 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">文字内容</h3>
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-2">字帖内容</Label>
        <Textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="w-full font-chinese"
          rows={4}
          placeholder="请输入要练习的内容..."
        />
      </div>
    </div>
  );
}
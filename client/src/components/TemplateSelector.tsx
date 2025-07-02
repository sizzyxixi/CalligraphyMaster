import { cn } from "@/lib/utils";
import type { TemplateType } from "@/lib/utils";

interface TemplateSelectorProps {
  value: TemplateType;
  onChange: (value: TemplateType) => void;
}

export default function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
  const templates = [
    { id: 'article' as const, label: '文章字帖', icon: 'fas fa-file-alt' },
    { id: 'single' as const, label: '单字强化', icon: 'fas fa-font' },
  ];

  return (
    <div className="p-6 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">字帖类型</h3>
      <div className="grid grid-cols-2 gap-3">
        {templates.map(template => (
          <button
            key={template.id}
            onClick={() => onChange(template.id)}
            className={cn(
              "p-3 border-2 rounded-lg text-sm font-medium transition-colors",
              value === template.id
                ? "border-primary-500 bg-primary-50 text-primary-700"
                : "border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-gray-50"
            )}
          >
            <i className={`${template.icon} block mb-1`}></i>
            {template.label}
          </button>
        ))}
      </div>
    </div>
  );
}
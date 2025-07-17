import { cn } from "@/lib/utils";
import type { TemplateType } from "@/lib/utils";

interface TemplateSelectorProps {
  value: TemplateType;
  onChange: (value: TemplateType) => void;
}

export default function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
  const templates = [
    // Chinese templates
    { id: 'article' as const, label: '文章字帖', icon: 'fas fa-file-alt', category: 'chinese' },
    { id: 'single' as const, label: '单字强化', icon: 'fas fa-font', category: 'chinese' },
    // English templates
    { id: 'englishPrint' as const, label: 'Print Letters', icon: 'fas fa-spell-check', category: 'english' },
    { id: 'englishCursive' as const, label: 'Cursive Writing', icon: 'fas fa-signature', category: 'english' },
    { id: 'englishWords' as const, label: 'Word Practice', icon: 'fas fa-language', category: 'english' },
  ];

  const chineseTemplates = templates.filter(t => t.category === 'chinese');
  const englishTemplates = templates.filter(t => t.category === 'english');

  return (
    <div className="p-6 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">字帖类型 / Template Type</h3>
      
      {/* Chinese Templates */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-600 mb-2">中文字帖 Chinese</h4>
        <div className="grid grid-cols-2 gap-3">
          {chineseTemplates.map(template => (
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

      {/* English Templates */}
      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-2">英文字帖 English</h4>
        <div className="grid grid-cols-1 gap-2">
          {englishTemplates.map(template => (
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
              <i className={`${template.icon} mr-2`}></i>
              {template.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
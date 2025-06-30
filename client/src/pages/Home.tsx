import { useState } from "react";
import { Button } from "@/components/ui/button";
import TemplateSelector from "@/components/TemplateSelector";
import GridTypeSelector from "@/components/GridTypeSelector";
import ContentInput from "@/components/ContentInput";
import LayoutSettings from "@/components/LayoutSettings";
import StyleSettings from "@/components/StyleSettings";
import PreviewCanvas from "@/components/PreviewCanvas";
import { defaultSettings, type CharacterGridSettings, formatDateForFilename } from "@/lib/utils";
import { exportToPDF } from "@/lib/pdfExporter";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [settings, setSettings] = useState<CharacterGridSettings>(defaultSettings);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const updateSettings = (updates: Partial<CharacterGridSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const handleExportPDF = async () => {
    if (!settings.content.trim()) {
      toast({
        title: "内容为空",
        description: "请先输入要练习的文字内容",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const filename = `字帖_${formatDateForFilename()}.pdf`;
      await exportToPDF(settings, filename);
      
      toast({
        title: "导出成功",
        description: "PDF 文件已生成并开始下载",
      });
    } catch (error) {
      console.error('PDF export failed:', error);
      toast({
        title: "导出失败",
        description: "PDF 生成时发生错误，请重试",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreview = () => {
    if (!settings.content.trim()) {
      toast({
        title: "内容为空",
        description: "请先输入要练习的文字内容",
        variant: "destructive",
      });
      return;
    }
    
    // Preview is always visible, this just validates content
    toast({
      title: "预览已更新",
      description: "字帖预览已根据当前设置更新",
    });
  };

  const handleRegenerate = () => {
    // Force re-render of preview
    setSettings(prev => ({ ...prev }));
    toast({
      title: "重新生成",
      description: "字帖已重新生成",
    });
  };

  const getCharacterCount = () => {
    if (settings.contentType === 'chinese') {
      return settings.content.replace(/\s/g, '').length;
    }
    return settings.content.split(/\s+/).filter(word => word.length > 0).length;
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary-600">
                  <i className="fas fa-edit mr-2"></i>字帖生成器
                </h1>
              </div>
              <nav className="hidden md:ml-10 md:flex md:space-x-8">
                <a href="#" className="text-gray-900 hover:text-primary-600 px-3 py-2 text-sm font-medium">首页</a>
                <a href="#" className="text-gray-500 hover:text-primary-600 px-3 py-2 text-sm font-medium">模板库</a>
                <a href="#" className="text-gray-500 hover:text-primary-600 px-3 py-2 text-sm font-medium">帮助</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleExportPDF}
                disabled={isExporting || !settings.content.trim()}
                className="bg-primary-500 hover:bg-primary-600 text-white"
              >
                {isExporting ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i>生成中...</>
                ) : (
                  <><i className="fas fa-download mr-2"></i>导出PDF</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-1 gap-6">
          {/* Left Sidebar - Controls */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <TemplateSelector 
                value={settings.templateType}
                onChange={(templateType) => updateSettings({ templateType })}
              />

              <GridTypeSelector
                value={settings.gridType}
                onChange={(gridType) => updateSettings({ gridType })}
              />

              <ContentInput
                contentType={settings.contentType}
                content={settings.content}
                onContentTypeChange={(contentType) => updateSettings({ contentType })}
                onContentChange={(content) => updateSettings({ content })}
              />

              <LayoutSettings
                gridsPerRow={settings.gridsPerRow}
                fontSize={settings.fontSize}
                onGridsPerRowChange={(gridsPerRow) => updateSettings({ gridsPerRow })}
                onFontSizeChange={(fontSize) => updateSettings({ fontSize })}
              />

              <StyleSettings
                fontType={settings.fontType}
                fontOpacity={settings.fontOpacity}
                showPinyin={settings.showPinyin}
                onFontTypeChange={(fontType) => updateSettings({ fontType })}
                onFontOpacityChange={(fontOpacity) => updateSettings({ fontOpacity })}
                onShowPinyinChange={(showPinyin) => updateSettings({ showPinyin })}
              />
            </div>
          </div>

          {/* Main Content - Preview Area */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Preview Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-lg font-semibold text-gray-900">字帖预览</h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <i className="fas fa-file-pdf"></i>
                      <span>A4 纸张 (210×297mm)</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 text-xs font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50">
                      <i className="fas fa-search-minus mr-1"></i>缩小
                    </button>
                    <span className="text-sm text-gray-500">75%</span>
                    <button className="px-3 py-1 text-xs font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50">
                      <i className="fas fa-search-plus mr-1"></i>放大
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview Canvas */}
              <div className="p-6 bg-gray-100 min-h-[800px] flex justify-center">
                <PreviewCanvas settings={settings} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button 
                    onClick={handlePreview}
                    variant="secondary"
                    className="bg-secondary-500 hover:bg-secondary-600 text-white"
                  >
                    <i className="fas fa-eye mr-2"></i>
                    预览字帖
                  </Button>
                  <Button 
                    onClick={handleRegenerate}
                    variant="outline"
                  >
                    <i className="fas fa-redo mr-2"></i>
                    重新生成
                  </Button>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">页数:</span> 1 页
                    <span className="ml-4 font-medium">字数:</span> {getCharacterCount()} 字
                  </div>
                  <Button 
                    onClick={handleExportPDF}
                    disabled={isExporting || !settings.content.trim()}
                    className="bg-primary-500 hover:bg-primary-600 text-white font-medium"
                  >
                    {isExporting ? (
                      <><i className="fas fa-spinner fa-spin mr-2"></i>生成中...</>
                    ) : (
                      <><i className="fas fa-download mr-2"></i>导出PDF</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import TemplateSelector from "@/components/TemplateSelector";
import GridTypeSelector from "@/components/GridTypeSelector";
import ContentInput from "@/components/ContentInput";
import LayoutSettings from "@/components/LayoutSettings";
import StyleSettings from "@/components/StyleSettings";
import PreviewCanvas from "@/components/PreviewCanvas";
import HelpDialog from "@/components/HelpDialog";
import { defaultSettings, getDefaultSettingsForTemplate, type CharacterGridSettings, formatDateForFilename } from "@/lib/utils";
import { exportToPDF } from "@/lib/pdfExporter";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [settings, setSettings] = useState<CharacterGridSettings>(defaultSettings);
  const [isExporting, setIsExporting] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100); // Default zoom level
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const { toast } = useToast();

  const updateSettings = (updates: Partial<CharacterGridSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const handleTemplateTypeChange = (templateType: CharacterGridSettings['templateType']) => {
    const templateDefaults = getDefaultSettingsForTemplate(templateType);
    setSettings(prev => ({ ...prev, templateType, ...templateDefaults }));
  };

  const handleExportPDF = async () => {
    const needsContent = ['single', 'englishPrint', 'englishCursive', 'englishWords'].includes(settings.templateType);
    if (!settings.content.trim() && needsContent) {
      toast({
        title: "内容为空 / Content Empty",
        description: "请先输入要练习的文字内容 / Please enter content to practice",
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
    const needsContent = ['single', 'englishPrint', 'englishCursive', 'englishWords'].includes(settings.templateType);
    if (!settings.content.trim() && needsContent) {
      toast({
        title: "内容为空 / Content Empty",
        description: "请先输入要练习的文字内容 / Please enter content to practice",
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

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 150)); // Max 150%
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50)); // Min 50%
  };

  const getCharacterCount = () => {
    if (settings.templateType === 'article') {
      // For article template, estimate grid count based on page layout
      const A4_WIDTH = 595; // A4 width in points
      const A4_HEIGHT = 842; // A4 height in points
      const HEADER_HEIGHT = 80;
      const PADDING = 80; // 40 * 2
      
      const availableWidth = A4_WIDTH - PADDING;
      const availableHeight = A4_HEIGHT - HEADER_HEIGHT - PADDING;
      
      // Estimate grid size based on gridsPerRow
      const gridSize = availableWidth / settings.gridsPerRow;
      const gridSpacing = 0; // Set to 0 as requested
      const totalGridHeight = gridSize + gridSpacing;
      
      // Calculate how many rows can fit
      const maxRows = Math.floor(availableHeight / totalGridHeight);
      const totalGrids = maxRows * settings.gridsPerRow;
      
      if (!settings.content.trim()) {
        return totalGrids; // Return total available grids for empty content
      }
      
      // Return actual content length for filled content
      return Math.min(settings.content.replace(/\s/g, '').length, totalGrids);
    }
    
    // For single character mode
    return settings.content.replace(/\s/g, '').length;
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-primary-600">
                    <i className="fas fa-edit mr-2"></i>字帖生成器
                  </h1>
                  <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    made by ClackyAI
                  </div>
                </div>
              </div>
              <nav className="hidden md:ml-10 md:flex md:space-x-8">
                <a href="#" className="text-gray-900 hover:text-primary-600 px-3 py-2 text-sm font-medium">首页</a>
                <a href="#" className="text-gray-500 hover:text-primary-600 px-3 py-2 text-sm font-medium">模板库</a>
                <button 
                  onClick={() => setShowHelpDialog(true)}
                  className="text-gray-500 hover:text-primary-600 px-3 py-2 text-sm font-medium"
                >
                  帮助
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleExportPDF}
                disabled={isExporting || (!settings.content.trim() && ['single', 'englishPrint', 'englishCursive', 'englishWords'].includes(settings.templateType))}
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
              <ContentInput
                content={settings.content}
                onContentChange={(content) => updateSettings({ content })}
              />

              <TemplateSelector 
                value={settings.templateType}
                onChange={handleTemplateTypeChange}
              />

              <GridTypeSelector
                value={settings.gridType}
                onChange={(gridType) => updateSettings({ gridType })}
              />

              <LayoutSettings
                gridsPerRow={settings.gridsPerRow}
                fontSize={settings.fontSize}
                onGridsPerRowChange={(gridsPerRow) => updateSettings({ gridsPerRow })}
                onFontSizeChange={(fontSize) => updateSettings({ fontSize })}
              />

              <StyleSettings
                gridType={settings.gridType}
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
                    <button 
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= 50}
                      className="px-3 py-1 text-xs font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="fas fa-search-minus mr-1"></i>缩小
                    </button>
                    <span className="text-sm text-gray-500 w-12 text-center">{zoomLevel}%</span>
                    <button 
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= 150}
                      className="px-3 py-1 text-xs font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="fas fa-search-plus mr-1"></i>放大
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview Canvas */}
              <div className="p-6 bg-gray-100 min-h-[800px] flex justify-center">
                <PreviewCanvas settings={settings} zoomLevel={zoomLevel} />
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
                    <span className="ml-4 font-medium">
                      {settings.templateType === 'article' ? '格子数:' : '字数:'}
                    </span> {getCharacterCount()} {settings.templateType === 'article' ? '个' : '字'}
                  </div>
                  <Button 
                    onClick={handleExportPDF}
                    disabled={isExporting || (!settings.content.trim() && ['single', 'englishPrint', 'englishCursive', 'englishWords'].includes(settings.templateType))}
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
      
      {/* Help Dialog */}
      <HelpDialog 
        open={showHelpDialog}
        onOpenChange={setShowHelpDialog}
      />
    </div>
  );
}
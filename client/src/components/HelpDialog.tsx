import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  const { toast } = useToast();

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "复制成功",
        description: `${type}已复制到剪贴板`,
      });
    }).catch(() => {
      toast({
        title: "复制失败",
        description: "请手动选择文字进行复制",
        variant: "destructive",
      });
    });
  };

  const CopySection = ({ title, content, type }: { title: string, content: string, type: string }) => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <Button
          onClick={() => copyToClipboard(content, type)}
          size="sm"
          variant="outline"
          className="text-xs"
        >
          <i className="fas fa-copy mr-1"></i>复制
        </Button>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );

  // 拼音数据
  const pinyinData = {
    声母: "b,p,m,f,d,t,n,l,g,k,h,j,q,x,zh,ch,sh,z,c,s,r,y,w",
    韵母: "ɑ,o,e,i,u,ü,ɑi,ei,ui,ɑo,ou,iu,ie,üe,er,ɑn,en,in,un,ün,ɑng,eng,ing,ong",
    整体认读音节: "zhi,chi,shi,ri,zi,ci,si,yi,wu,yu,ye,yue,yuɑn,yin,yun,ying",
    声调: "ā,á,ǎ,à,ē,é,ě,è,ī,í,ǐ,ì,ō,ó,ǒ,ò,ū,ú,ǔ,ù,ǖ,ǘ,ǚ,ǜ",
    "英语单元音-短元音": "[ɪ] [ɒ] [ʊ] [ə] [ʌ] [æ]",
    "英语单元音-长元音": "[i:] [ɔ:] [e] [u:] [ɜ:] [ɑ:]",
    英语双元音: "[eɪ] [aɪ] [ɔɪ] [ɪə] [eə] [ʊə] [aʊ] [əʊ]",
    清辅音: "[p] [t] [k] [f] [θ] [s] [h]  [ts] [tr] [ʃ] [tʃ]",
    浊辅音: "[b] [d] [g] [v] [ð] [z] [dz] [dr] [ʒ] [dʒ]",
    鼻音: "[m] [n] [ŋ]",
    "半元音、边音": "[j] [w] [l]"
  };

  // 偏旁部首数据
  const radicalData = {
    "一画": "丨亅丿乛一乙乚丶",
    "二画": "八勹匕冫卜厂刀刂儿二匚阝丷几卩冂力冖凵人亻入十厶亠匸讠廴又",
    "三画": "艹屮彳巛川辶寸大飞干工弓廾广己彐彑巾口马门宀女犭山彡尸饣士扌氵纟巳土囗兀夕小忄幺弋尢夂子",
    "四画": "贝比灬长车歹斗厄方风父戈卝户火旡见斤耂毛木肀牛牜爿片攴攵气欠犬日氏礻手殳水瓦尣王韦文毋心牙爻曰月爫支止爪",
    "五画": "白癶歺甘瓜禾钅立龙矛皿母目疒鸟皮生石矢示罒田玄穴疋业衤用玉",
    "六画": "耒艸臣虫而耳缶艮虍臼米齐肉色舌覀页先行血羊聿至舟衣竹自羽糸糹",
    "七画": "貝采镸車辰赤辵豆谷見角克里卤麦身豕辛言邑酉豸走足",
    "八画": "青靑雨齿長非阜金釒隶門靣飠鱼隹",
    "九画": "風革骨鬼韭面首韋香頁音",
    "十画": "髟鬯鬥高鬲馬",
    "十一画": "黄鹵鹿麻麥鳥魚",
    "十二画": "鼎黑黽黍黹",
    "十三画": "鼓鼠",
    "十四画": "鼻齊",
    "十七画": "齒龍龠",
    字左类: "(两点水)(三点水)(工字旁)(提土旁)(王字旁)(立字旁)(言字旁)(提手旁)(子字旁)(女字旁)(单人旁)(双人旁)(竖心旁)(左耳旁)(木字旁)(禾字旁)(示字旁)(衣字旁)(又字旁)(火字旁)(口字旁)(日字旁)(目字旁)(月字旁)(山字旁)(反犬旁)(将字旁)(牛字旁)(车字旁)(绞丝旁)(足字旁)(食字旁)(金字旁)(马字旁)(耳字旁)(鱼字旁)(革字旁)(巾字旁)(米字旁)(虫字旁)(矢字旁)(贝字旁)(歹字旁)(方字旁)(石字旁)(酉字旁)(身字旁)(里字旁)(舟字旁)(弓字旁)(片字旁)(牙字旁)(田字旁)(青字旁)(舌字旁)(夕字旁)(白字旁)",
    字右类: "(反文旁)(欠字旁)(单耳旁)(右耳旁)(立刀旁)(三撇儿)(右月字旁)(力字旁)(斤字旁)(寸字旁)(页字旁)(鸟字旁)(隹字旁)(戈字旁)(斗字旁)(见字旁)(才字旁)(青字旁2)(疋字旁)(羽字旁)(鬼字旁)(鸟字旁)(甘字旁)(瓦字旁)(羊字旁)",
    字头类: "(秃宝盖)(宝盖头)(草字头)(竹字头)(土字头)(士字头)(八字头)(人字头)(大字头)(折文头)(十字头)(斜刀头)(口字头)(日字头)(倒八头)(相向点)(倒小头)(穴宝盖)(穴字头)(雨字头)(立字头)(山字头)(四字头)(西字头)(木字头)(禾字头)(父字头)(春字头)(卷字头)(老字头)(学字头)(爪字头)(黄字头)(青字头)(龙字头)(癶字头)(非字头)(田字头)(彐字头)(白字头)(业字头)(文字头)(党字头)(京字头)(三拐头)(折文头)(止字头)(光字头)(小字头)(美字头)(点横头)(大字旁)",
    字底类: "(土字底)(皿字底)(四点底)(心字底)(八字底)(相背点)(大字底)(木字底)(口字底)(日字底)(贝字底)(月字底)(山字底)(女字底)(水字底)(衣字底)(糸字底)(巾字底)(又字底)(力字底)(子字底)(见字底)(竖心底)(火字底)(王字底)(虫字底)(上下点)(手字底)(鸟字底)(疋字底)(禾字底)(示字底)(羽字底)(土字旁)(目字底)(刀字底)(豕字底)(彐字底)",
    字框类: "(厂字头)(广字头)(尸字头)(户字头)(走之底)(建字底)(包字头)(气字头)(区字框)(凶字框)(门字框)(同字框)(风字框)(国字框)(病字头)(虎字头)(走字底)(走字旁)(羊字头)(毛字旁)(弋字旁)(左字头)(折文旁)(鬼字旁2)(手字旁)(爪字旁)",
    笔画组合: "(撇横撇突出)(撇横横突出)"
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">字帖生成器帮助</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="pinyin" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pinyin">拼音参考</TabsTrigger>
            <TabsTrigger value="radical">偏旁部首</TabsTrigger>
            <TabsTrigger value="usage">使用说明</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pinyin" className="space-y-4">
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">拼音参考表</h3>
                <p className="text-sm text-gray-600">点击各区块右上角的复制按钮可快速复制内容</p>
              </div>
              
              {Object.entries(pinyinData).map(([key, value]) => (
                <CopySection
                  key={key}
                  title={`${key}：${key === '声母' ? '23个' : key === '韵母' ? '24个' : key === '整体认读音节' ? '16个' : key === '声调' ? '24个' : ''}`}
                  content={value}
                  type={key}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="radical" className="space-y-4">
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">偏旁部首参考表</h3>
                <p className="text-sm text-gray-600">点击各区块右上角的复制按钮可快速复制内容</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                  <p className="text-sm text-blue-800">
                    <strong>使用提示：</strong>直接复制上方偏旁到输入框即可显示对应的楷体偏旁字，以上偏旁字做了居中处理，如不需要居中的偏旁字在后面加1，例：(两点水1)。
                  </p>
                </div>
              </div>
              
              {Object.entries(radicalData).map(([key, value]) => (
                <CopySection
                  key={key}
                  title={key}
                  content={value}
                  type={`偏旁部首-${key}`}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="usage" className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <h3 className="text-lg font-semibold mb-4">使用说明</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">📝 基本功能</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>支持中文汉字、英文字母、数字和标点符号混合输入</li>
                    <li>提供米字格、田字格、空白格、四线格等多种网格类型</li>
                    <li>可选择显示拼音标注（仅中文字符）</li>
                    <li>支持字体样式和透明度调整</li>
                    <li>支持文章模式和单字模式</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">🎯 字帖模式</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li><strong>文章模式</strong>：适合练习段落和文章，每个字符占用一个格子</li>
                    <li><strong>单字模式</strong>：适合练习单个汉字，每个字符填满整行</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">📐 网格类型</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li><strong>米字格</strong>：十字线+对角线，适合汉字结构练习</li>
                    <li><strong>田字格</strong>：十字线分割，经典汉字练习格</li>
                    <li><strong>空白格</strong>：纯边框，适合自由书写</li>
                    <li><strong>四线格</strong>：适合英文和拼音练习</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">🔧 高级设置</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>调整每行格子数量（1-20个）</li>
                    <li>设置字体大小（小、中、大、自动）</li>
                    <li>选择字体样式（楷体、宋体、黑体等）</li>
                    <li>调整字体透明度（作为描摹引导）</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">💡 使用技巧</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>在"拼音参考"页面复制需要的拼音符号</li>
                    <li>在"偏旁部首"页面复制需要的偏旁部首</li>
                    <li>调整字体透明度作为描摹练习</li>
                    <li>导出PDF后可打印使用</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
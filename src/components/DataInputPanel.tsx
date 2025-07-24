import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Trash2 } from "lucide-react";

interface DataInputPanelProps {
  title: string;
  data: string;
  onDataChange: (data: string) => void;
  placeholder: string;
}

export const DataInputPanel = ({ title, data, onDataChange, placeholder }: DataInputPanelProps) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onDataChange(content);
      };
      reader.readAsText(file);
    }
  };

  const clearData = () => {
    onDataChange("");
  };

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(data);
      onDataChange(JSON.stringify(parsed, null, 2));
    } catch (error) {
      // 忽略格式化错误
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between">
          <span className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-primary" />
            {title}
          </span>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={formatJSON}
              disabled={!data.trim()}
              className="h-8 px-2 text-xs"
            >
              格式化
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={clearData}
              disabled={!data.trim()}
              className="h-8 px-2 text-xs text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <label className="flex-1">
            <input
              type="file"
              accept=".json,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              className="w-full border-dashed border-muted-foreground/50 hover:border-primary"
              onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              上传文件
            </Button>
          </label>
        </div>
        
        <Textarea
          value={data}
          onChange={(e) => onDataChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[400px] font-mono text-sm bg-muted/50 border-border/50 focus:border-primary transition-colors"
        />
        
        <div className="text-xs text-muted-foreground">
          行数: {data.split('\n').length} | 字符数: {data.length}
        </div>
      </CardContent>
    </Card>
  );
};
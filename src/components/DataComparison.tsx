import { useState } from "react";
import { DataInputPanel } from "./DataInputPanel";
import { ComparisonResult } from "./ComparisonResult";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export interface ComparisonData {
  added: any[];
  modified: any[];
  removed: any[];
  unchanged: any[];
  total: number;
}

export const DataComparison = () => {
  const [leftData, setLeftData] = useState<string>("");
  const [rightData, setRightData] = useState<string>("");
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const { toast } = useToast();

  const compareData = () => {
    if (!leftData.trim() || !rightData.trim()) {
      toast({
        title: "数据缺失",
        description: "请在两个面板中都输入数据",
        variant: "destructive",
      });
      return;
    }

    setIsComparing(true);
    
    try {
      const left = JSON.parse(leftData);
      const right = JSON.parse(rightData);
      
      // 简单的比对逻辑（可以根据需要扩展）
      const result = performComparison(left, right);
      setComparison(result);
      
      toast({
        title: "比对完成",
        description: `发现 ${result.added.length + result.modified.length + result.removed.length} 处差异`,
      });
    } catch (error) {
      toast({
        title: "数据格式错误",
        description: "请确保输入的是有效的JSON格式",
        variant: "destructive",
      });
    } finally {
      setIsComparing(false);
    }
  };

  const performComparison = (left: any, right: any): ComparisonData => {
    // 这里实现基本的比对逻辑
    // 实际项目中可以使用更复杂的diff算法
    const added: any[] = [];
    const modified: any[] = [];
    const removed: any[] = [];
    const unchanged: any[] = [];

    if (Array.isArray(left) && Array.isArray(right)) {
      // 数组比对
      left.forEach((item, index) => {
        if (index < right.length) {
          if (JSON.stringify(item) === JSON.stringify(right[index])) {
            unchanged.push({ index, value: item });
          } else {
            modified.push({ index, left: item, right: right[index] });
          }
        } else {
          removed.push({ index, value: item });
        }
      });

      right.forEach((item, index) => {
        if (index >= left.length) {
          added.push({ index, value: item });
        }
      });
    } else if (typeof left === 'object' && typeof right === 'object') {
      // 对象比对
      const allKeys = new Set([...Object.keys(left), ...Object.keys(right)]);
      
      allKeys.forEach(key => {
        if (!(key in left)) {
          added.push({ key, value: right[key] });
        } else if (!(key in right)) {
          removed.push({ key, value: left[key] });
        } else if (JSON.stringify(left[key]) !== JSON.stringify(right[key])) {
          modified.push({ key, left: left[key], right: right[key] });
        } else {
          unchanged.push({ key, value: left[key] });
        }
      });
    }

    return {
      added,
      modified,
      removed,
      unchanged,
      total: added.length + modified.length + removed.length + unchanged.length
    };
  };

  const exportResults = () => {
    if (!comparison) return;
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: comparison.total,
        added: comparison.added.length,
        modified: comparison.modified.length,
        removed: comparison.removed.length,
        unchanged: comparison.unchanged.length
      },
      details: comparison
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparison_report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 操作按钮 */}
      <div className="flex justify-center space-x-4">
        <Button 
          onClick={compareData} 
          disabled={isComparing}
          className="bg-gradient-primary hover:shadow-glow-primary transition-all duration-300"
        >
          {isComparing && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
          {isComparing ? "比对中..." : "开始比对"}
        </Button>
        
        {comparison && (
          <Button 
            onClick={exportResults}
            variant="outline"
            className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
          >
            <Download className="mr-2 h-4 w-4" />
            导出报告
          </Button>
        )}
      </div>

      {/* 数据输入面板 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataInputPanel
          title="数据源 A"
          data={leftData}
          onDataChange={setLeftData}
          placeholder="请输入第一个数据源的JSON数据..."
        />
        <DataInputPanel
          title="数据源 B"
          data={rightData}
          onDataChange={setRightData}
          placeholder="请输入第二个数据源的JSON数据..."
        />
      </div>

      {/* 比对结果 */}
      {comparison && (
        <ComparisonResult comparison={comparison} />
      )}
    </div>
  );
};
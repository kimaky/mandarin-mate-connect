import { useState } from "react";
import { DataInputPanel } from "./DataInputPanel";
import { ComparisonResult } from "./ComparisonResult";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export interface ComparisonData {
  added: any[];
  modified: any[];
  removed: any[];
  unchanged: any[];
  total: number;
}

export type DataFormat = 'json' | 'csv' | 'excel' | 'java' | 'text';

export const DataComparison = () => {
  const [leftData, setLeftData] = useState<string>("");
  const [rightData, setRightData] = useState<string>("");
  const [leftFormat, setLeftFormat] = useState<DataFormat>('json');
  const [rightFormat, setRightFormat] = useState<DataFormat>('json');
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const { toast } = useToast();

  // 解析Excel数据
  const parseExcel = (data: string): any => {
    try {
      const workbook = XLSX.read(data, { type: 'binary' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      return XLSX.utils.sheet_to_json(worksheet);
    } catch (error) {
      throw new Error('Excel格式解析失败');
    }
  };

  // 格式检测增强
  const detectFormat = (data: string, fileName?: string): DataFormat => {
    // 如果有文件名，优先从文件扩展名判断
    if (fileName) {
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        return 'excel';
      }
      if (fileName.endsWith('.csv')) {
        return 'csv';
      }
      if (fileName.endsWith('.java')) {
        return 'java';
      }
    }
    
    const trimmed = data.trim();
    
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      return 'json';
    }
    
    if (trimmed.includes(',') && trimmed.includes('\n')) {
      return 'csv';
    }
    
    if (trimmed.includes('class ') || trimmed.includes('public ') || trimmed.includes('private ')) {
      return 'java';
    }
    
    return 'text';
  };

  // 解析CSV数据
  const parseCSV = (data: string): any => {
    try {
      const result = Papa.parse(data, { header: true, skipEmptyLines: true });
      if (result.errors.length > 0) {
        throw new Error('CSV格式解析失败');
      }
      return result.data;
    } catch (error) {
      throw new Error('CSV格式解析失败');
    }
  };

  // 解析Java代码
  const parseJava = (data: string): any => {
    // 简单的Java代码解析，按行分割
    const lines = data.split('\n').filter(line => line.trim());
    return lines.map((line, index) => ({ line: index + 1, content: line.trim() }));
  };

  // 解析文本数据
  const parseText = (data: string): any => {
    const lines = data.split('\n').filter(line => line.trim());
    return lines.map((line, index) => ({ line: index + 1, content: line.trim() }));
  };

  // 统一解析函数
  const parseData = (data: string, format: DataFormat): any => {
    switch (format) {
      case 'json':
        return JSON.parse(data);
      case 'csv':
        return parseCSV(data);
      case 'excel':
        return parseExcel(data);
      case 'java':
        return parseJava(data);
      case 'text':
        return parseText(data);
      default:
        throw new Error(`不支持的格式: ${format}`);
    }
  };

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
      // 自动检测格式
      const detectedLeftFormat = detectFormat(leftData);
      const detectedRightFormat = detectFormat(rightData);
      
      // 解析数据
      const left = parseData(leftData, detectedLeftFormat);
      const right = parseData(rightData, detectedRightFormat);
      
      // 更新格式状态
      setLeftFormat(detectedLeftFormat);
      setRightFormat(detectedRightFormat);
      
      // 执行比对
      const result = performComparison(left, right, detectedLeftFormat, detectedRightFormat);
      setComparison(result);
      
      toast({
        title: "比对完成",
        description: `发现 ${result.added.length + result.modified.length + result.removed.length} 处差异`,
      });
    } catch (error) {
      toast({
        title: "数据格式错误",
        description: error instanceof Error ? error.message : "数据解析失败",
        variant: "destructive",
      });
    } finally {
      setIsComparing(false);
    }
  };

  const performComparison = (left: any, right: any, leftFormat: DataFormat, rightFormat: DataFormat): ComparisonData => {
    const added: any[] = [];
    const modified: any[] = [];
    const removed: any[] = [];
    const unchanged: any[] = [];

    // 如果格式不同，提示用户
    if (leftFormat !== rightFormat) {
      // 可以在这里处理格式不同的情况
      console.warn(`格式不匹配: ${leftFormat} vs ${rightFormat}`);
    }

    // 根据格式类型选择比对策略
    if (leftFormat === 'java' || leftFormat === 'text') {
      // 按行比对
      const leftLines = Array.isArray(left) ? left : [left];
      const rightLines = Array.isArray(right) ? right : [right];
      
      leftLines.forEach((item, index) => {
        if (index < rightLines.length) {
          if (JSON.stringify(item) === JSON.stringify(rightLines[index])) {
            unchanged.push({ index, value: item });
          } else {
            modified.push({ index, left: item, right: rightLines[index] });
          }
        } else {
          removed.push({ index, value: item });
        }
      });

      rightLines.forEach((item, index) => {
        if (index >= leftLines.length) {
          added.push({ index, value: item });
        }
      });
    } else if (Array.isArray(left) && Array.isArray(right)) {
      // 数组比对（JSON、CSV、Excel）
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
          placeholder="请输入第一个数据源的数据 (支持 JSON, CSV, Excel, Java, 文本格式)..."
          detectedFormat={leftFormat}
        />
        <DataInputPanel
          title="数据源 B"
          data={rightData}
          onDataChange={setRightData}
          placeholder="请输入第二个数据源的数据 (支持 JSON, CSV, Excel, Java, 文本格式)..."
          detectedFormat={rightFormat}
        />
      </div>

      {/* 比对结果 */}
      {comparison && (
        <ComparisonResult comparison={comparison} />
      )}
    </div>
  );
};
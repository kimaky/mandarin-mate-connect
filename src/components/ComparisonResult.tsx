import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, Edit, Check, BarChart3 } from "lucide-react";
import { ComparisonData } from "./DataComparison";

interface ComparisonResultProps {
  comparison: ComparisonData;
}

export const ComparisonResult = ({ comparison }: ComparisonResultProps) => {
  const { added, modified, removed, unchanged, total } = comparison;

  const StatCard = ({ title, count, icon: Icon, color }: any) => (
    <Card className="bg-gradient-card border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{count}</p>
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  const DiffItem = ({ item, type }: { item: any; type: 'added' | 'removed' | 'modified' | 'unchanged' }) => {
    const colors = {
      added: 'text-accent bg-accent/10 border-accent/20',
      removed: 'text-destructive bg-destructive/10 border-destructive/20',
      modified: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
      unchanged: 'text-muted-foreground bg-muted/10 border-muted/20'
    };

    return (
      <div className={`p-3 rounded-lg border ${colors[type]} transition-all duration-200 hover:scale-[1.02]`}>
        <div className="font-mono text-sm">
          {type === 'modified' ? (
            <div className="space-y-2">
              <div className="text-destructive">- {JSON.stringify(item.left)}</div>
              <div className="text-accent">+ {JSON.stringify(item.right)}</div>
            </div>
          ) : (
            <div>{JSON.stringify(item.value || item)}</div>
          )}
        </div>
        {(item.key || item.index !== undefined) && (
          <div className="mt-2 text-xs opacity-75">
            {item.key ? `键: ${item.key}` : `索引: ${item.index}`}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 统计概览 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="新增"
          count={added.length}
          icon={Plus}
          color="text-accent"
        />
        <StatCard
          title="删除"
          count={removed.length}
          icon={Minus}
          color="text-destructive"
        />
        <StatCard
          title="修改"
          count={modified.length}
          icon={Edit}
          color="text-yellow-400"
        />
        <StatCard
          title="未变化"
          count={unchanged.length}
          icon={Check}
          color="text-muted-foreground"
        />
      </div>

      {/* 总体统计 */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-primary" />
            比对统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">总计项目</span>
              <Badge variant="outline">{total}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">差异率</span>
              <Badge variant="outline">
                {total > 0 ? ((added.length + modified.length + removed.length) / total * 100).toFixed(1) : 0}%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">一致性</span>
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                {total > 0 ? (unchanged.length / total * 100).toFixed(1) : 0}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 详细差异 */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>详细差异</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="added" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-muted/50">
              <TabsTrigger value="added" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                新增 ({added.length})
              </TabsTrigger>
              <TabsTrigger value="removed" className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
                删除 ({removed.length})
              </TabsTrigger>
              <TabsTrigger value="modified" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-yellow-900">
                修改 ({modified.length})
              </TabsTrigger>
              <TabsTrigger value="unchanged" className="data-[state=active]:bg-muted">
                未变化 ({unchanged.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="added" className="space-y-3 mt-4">
              {added.length > 0 ? (
                added.map((item, index) => (
                  <DiffItem key={index} item={item} type="added" />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">无新增项目</p>
              )}
            </TabsContent>
            
            <TabsContent value="removed" className="space-y-3 mt-4">
              {removed.length > 0 ? (
                removed.map((item, index) => (
                  <DiffItem key={index} item={item} type="removed" />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">无删除项目</p>
              )}
            </TabsContent>
            
            <TabsContent value="modified" className="space-y-3 mt-4">
              {modified.length > 0 ? (
                modified.map((item, index) => (
                  <DiffItem key={index} item={item} type="modified" />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">无修改项目</p>
              )}
            </TabsContent>
            
            <TabsContent value="unchanged" className="space-y-3 mt-4">
              {unchanged.length > 0 ? (
                unchanged.slice(0, 10).map((item, index) => (
                  <DiffItem key={index} item={item} type="unchanged" />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">无未变化项目</p>
              )}
              {unchanged.length > 10 && (
                <p className="text-muted-foreground text-center text-sm">
                  显示前10项，共{unchanged.length}项未变化
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
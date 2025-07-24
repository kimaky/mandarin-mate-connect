import { DataComparison } from "@/components/DataComparison";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            异构系统数据比对工具
          </h1>
          <p className="text-muted-foreground text-lg">
            高效比对不同数据源，精准识别数据差异
          </p>
        </header>
        
        <DataComparison />
      </div>
    </div>
  );
};

export default Index;
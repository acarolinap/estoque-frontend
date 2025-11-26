import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, DollarSign, Package, TrendingDown, BarChart3 } from "lucide-react";
import { PriceListReport } from "@/components/reports/PriceListReport";
import { BalanceReport } from "@/components/reports/BalanceReport";
import { LowStockReport } from "@/components/reports/LowStockReport";
import { CategoryReport } from "@/components/reports/CategoryReport";
import { TopMovementsReport } from "@/components/reports/TopMovementsReport";

const Reports = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Relatórios Gerenciais
          </h1>
          <p className="mt-2 text-muted-foreground">
            Visualize informações estratégicas sobre seus produtos
          </p>
        </div>

        <Tabs defaultValue="price-list" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="price-list" className="gap-2">
              <FileText className="h-4 w-4" />
              Lista de Preços
            </TabsTrigger>
            <TabsTrigger value="balance" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Balanço
            </TabsTrigger>
            <TabsTrigger value="low-stock" className="gap-2">
              <TrendingDown className="h-4 w-4" />
              Abaixo do Mínimo
            </TabsTrigger>
            <TabsTrigger value="by-category" className="gap-2">
              <Package className="h-4 w-4" />
              Por Categoria
            </TabsTrigger>
            <TabsTrigger value="top-movements" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Movimentações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="price-list">
            <PriceListReport />
          </TabsContent>

          <TabsContent value="balance">
            <BalanceReport />
          </TabsContent>

          <TabsContent value="low-stock">
            <LowStockReport />
          </TabsContent>

          <TabsContent value="by-category">
            <CategoryReport />
          </TabsContent>

          <TabsContent value="top-movements">
            <TopMovementsReport />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Reports;

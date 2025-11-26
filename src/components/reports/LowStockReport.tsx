import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export function LowStockReport() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["reports", "low-stock"],
    queryFn: async () => {
      const { data, error } = await productService.getAll();

      if (error) throw new Error(error);
      
      // CORREÇÃO: Filtrar usando os campos corretos (quantity e minimumQuantity)
      return (data || []).filter(product => {
        const qty = product.quantity ?? product.stock ?? 0;
        const min = product.minimumQuantity ?? product.min_stock ?? 0;
        // Retorna apenas se o mínimo for maior que 0 e o estoque atual for menor que o mínimo
        return min > 0 && qty < min;
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Produtos Abaixo da Mínima</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Produtos Abaixo da Mínima
        </CardTitle>
        <CardDescription>
          Produtos que precisam de reposição urgente de estoque
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Produto</TableHead>
                <TableHead className="text-right">Qtd. Mínima</TableHead>
                <TableHead className="text-right">Qtd. em Estoque</TableHead>
                <TableHead className="text-right">Diferença</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products && products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Todos os produtos estão com estoque adequado
                  </TableCell>
                </TableRow>
              ) : (
                products?.map((product) => {
                  // CORREÇÃO: Leitura correta das variáveis para exibição
                  const currentStock = product.quantity ?? product.stock ?? 0;
                  const minStock = product.minimumQuantity ?? product.min_stock ?? 0;
                  
                  const difference = minStock - currentStock;
                  const percentageBelow = ((difference / minStock) * 100).toFixed(0);
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {minStock}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {currentStock}
                      </TableCell>
                      <TableCell className="text-right font-mono text-destructive font-semibold">
                        -{difference}
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">
                          {percentageBelow}% abaixo
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

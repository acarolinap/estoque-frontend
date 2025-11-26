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
  TableFooter,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DollarSign } from "lucide-react";

export function BalanceReport() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["reports", "balance"],
    queryFn: async () => {
      const { data, error } = await productService.getAll();

      if (error) throw new Error(error);
      return data || [];
    },
  });

  const totalValue = products?.reduce(
    (sum, product) => {
      const qty = product.quantity ?? product.stock ?? 0;
      const price = product.price || 0;
      return sum + (price * qty);
    },
    0
  ) || 0;

  // Função auxiliar para formatar dinheiro no padrão brasileiro (R$ 1.234,56)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Balanço Físico/Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Alert className="border-primary">
        <DollarSign className="h-4 w-4" />
        <AlertTitle>Valor Total do Estoque</AlertTitle>
        <AlertDescription className="text-2xl font-bold mt-2">
          {/* Usa a formatação correta aqui */}
          {formatCurrency(totalValue)}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Balanço Físico/Financeiro</CardTitle>
          <CardDescription>
            Quantidade e valor financeiro de cada produto em estoque
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Produto</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Preço Unit.</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products && products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Nenhum produto cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  products?.map((product) => {
                    const qty = product.quantity ?? product.stock ?? 0;
                    const price = product.price || 0;
                    const totalProductValue = price * qty;
                    
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {qty}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {/* Formata preço unitário */}
                          {formatCurrency(price)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {/* Formata valor total */}
                          {formatCurrency(totalProductValue)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
              {products && products.length > 0 && (
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} className="font-bold">
                      Total Geral
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-lg">
                      {/* Formata total geral no rodapé */}
                      {formatCurrency(totalValue)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

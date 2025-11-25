import { useQuery } from "@tanstack/react-query";
import { stockService } from "@/services";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from "lucide-react";

export function TopMovementsReport() {
  const { data: movements, isLoading } = useQuery({
    queryKey: ["reports", "top-movements"],
    queryFn: async () => {
      const { data, error } = await stockService.getAll();

      if (error) throw new Error(error);

      // Agrupar por produto e tipo de movimentação
      type GroupedProduct = {
        name: string;
        entrada: number;
        saida: number;
      };

      const grouped = (data || []).reduce((acc: Record<string, GroupedProduct>, movement) => {
        const productId = movement.product_id;
        const productName = movement.products?.name || "Produto removido";
        const movementType = movement.movement_type || movement.type;
        
        if (!acc[productId]) {
          acc[productId] = {
            name: productName,
            entrada: 0,
            saida: 0
          };
        }
        
        if (movementType === "Entrada" || movementType === "entrada") {
          acc[productId].entrada += movement.quantity;
        } else {
          acc[productId].saida += movement.quantity;
        }
        
        return acc;
      }, {});

      // Converter para array e encontrar os maiores
      const products = Object.values(grouped);
      
      const topEntrada = products.reduce((max: GroupedProduct | null, product: GroupedProduct) => 
        product.entrada > (max?.entrada || 0) ? product : max
      , null);
      
      const topSaida = products.reduce((max: GroupedProduct | null, product: GroupedProduct) => 
        product.saida > (max?.saida || 0) ? product : max
      , null);

      return {
        topEntrada,
        topSaida,
        hasData: products.length > 0
      };
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!movements?.hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Maiores Movimentações</CardTitle>
          <CardDescription>
            Produtos com maior entrada e saída de estoque
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Nenhuma movimentação registrada ainda
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">Maiores Movimentações</h2>
        <p className="text-muted-foreground">
          Produtos com maior entrada e saída de estoque
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <TrendingUp className="h-5 w-5" />
              Maior Entrada
            </CardTitle>
            <CardDescription>
              Produto com mais unidades recebidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {movements.topEntrada ? (
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Produto</div>
                  <div className="text-2xl font-bold">
                    {movements.topEntrada.name}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUp className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Total de Entradas
                    </div>
                    <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                      {movements.topEntrada.entrada}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">
                Nenhuma entrada registrada
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <TrendingDown className="h-5 w-5" />
              Maior Saída
            </CardTitle>
            <CardDescription>
              Produto com mais unidades vendidas/retiradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {movements.topSaida ? (
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Produto</div>
                  <div className="text-2xl font-bold">
                    {movements.topSaida.name}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowDown className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Total de Saídas
                    </div>
                    <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">
                      {movements.topSaida.saida}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">
                Nenhuma saída registrada
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { useQuery } from "@tanstack/react-query";
import { productService, categoryService } from "@/services";
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

export function PriceListReport() {
  // Busca Produtos
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["reports", "price-list"],
    queryFn: async () => {
      const { data, error } = await productService.getAll();
      if (error) throw new Error(error);
      return data || [];
    },
  });

  // Busca Categorias para cruzar o nome (caso o produto tenha apenas o ID)
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await categoryService.getAll();
      if (error) throw new Error(error);
      return data || [];
    },
  });

  const isLoading = isLoadingProducts || isLoadingCategories;

  // Função auxiliar para formatar dinheiro no padrão brasileiro
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Função auxiliar para pegar o nome da categoria
  const getCategoryName = (categoryId?: number | string) => {
    if (!categoryId) return "Sem categoria";
    const category = categories?.find((c) => String(c.id) === String(categoryId));
    return category ? category.name : "Sem categoria";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lista de Preços</CardTitle>
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
    <Card>
      <CardHeader>
        <CardTitle>Lista de Preços</CardTitle>
        <CardDescription>
          Produtos ordenados alfabeticamente com seus preços e categorias
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Produto</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Categoria</TableHead>
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
                products?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-right font-mono">
                      {/* Usa a formatação correta (vírgula) */}
                      {formatCurrency(product.price || 0)}
                    </TableCell>
                    <TableCell>
                      {product.unit || "un"}
                    </TableCell>
                    <TableCell>
                      {/* Resolve o nome da categoria corretamente */}
                      {getCategoryName(product.categoryId || product.category_id)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

import { useQuery } from "@tanstack/react-query";
import { categoryService, productService } from "@/services";
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

export function CategoryReport() {
  // 1. Busca as Categorias
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await categoryService.getAll();
      if (error) throw new Error(error);
      return data || [];
    },
  });

  // 2. Busca os Produtos para contar
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await productService.getAll();
      if (error) throw new Error(error);
      return data || [];
    },
  });

  const isLoading = isLoadingCategories || isLoadingProducts;

  // 3. Processa os dados: Conta quantos produtos cada categoria tem
  const reportData = categories?.map((category) => {
    const count = products?.filter((product) => {
      // Verifica ID novo (categoryId) ou antigo (category_id)
      const pCatId = product.categoryId || product.category_id;
      return String(pCatId) === String(category.id);
    }).length || 0;

    return {
      ...category,
      productCount: count,
    };
  }) || [];

  // Calcula o total de produtos cadastrados para a porcentagem
  const totalProducts = reportData.reduce((sum, cat) => sum + cat.productCount, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Produtos por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
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
        <CardTitle>Produtos por Categoria</CardTitle>
        <CardDescription>
          Quantidade de produtos distintos em cada categoria
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome da Categoria</TableHead>
                <TableHead className="text-right">Quantidade de Produtos</TableHead>
                <TableHead className="text-right">Percentual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Nenhuma categoria cadastrada
                  </TableCell>
                </TableRow>
              ) : (
                reportData.map((category) => {
                  // Calcula a porcentagem (evita divisão por zero)
                  const percentage = totalProducts > 0 
                    ? ((category.productCount / totalProducts) * 100).toFixed(1)
                    : "0.0";
                  
                  return (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {category.productCount}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {percentage}%
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
            {reportData.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell className="font-bold">Total</TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    {totalProducts}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    100%
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

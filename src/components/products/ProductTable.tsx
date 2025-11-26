import { useState } from "react";
import { Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import type { Product } from "@/services/types";
import { useQuery } from "@tanstack/react-query";
import { categoryService } from "@/services";

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDelete: () => void;
}

export const ProductTable = ({
  products,
  isLoading,
  onEdit,
  onDelete,
}: ProductTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  // Busca as categorias para cruzar o ID com o Nome (caso o produto venha só com ID)
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await categoryService.getAll();
      return data || [];
    },
  });

  // Função auxiliar para obter o nome da categoria
  const getCategoryName = (product: Product) => {
    // Se o backend já manda o objeto aninhado (antigo padrão)
    if (product.categories?.name) return product.categories.name;
    
    // Se o backend manda só o ID (novo padrão Java), procuramos na lista
    if (product.categoryId || product.category_id) {
        const id = product.categoryId || product.category_id;
        const cat = categories?.find(c => Number(c.id) === Number(id));
        return cat ? cat.name : "—";
    }
    return "—";
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCategoryName(product).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  return (
    <>
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Produtos</CardTitle>
              <CardDescription>
                {filteredProducts.length} produto(s) encontrado(s)
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="hidden sm:table-cell">Unidade</TableHead>
                  <TableHead className="text-right">Estoque</TableHead>
                  <TableHead className="text-right hidden md:table-cell">Mínimo</TableHead>
                  <TableHead className="text-right hidden md:table-cell">Máximo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum produto encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => {
                    // Lógica de fallback para ler tanto do padrão antigo quanto do novo (Java)
                    const stock = product.quantity ?? product.stock ?? 0;
                    const minStock = product.minimumQuantity ?? product.min_stock ?? 0;
                    const maxStock = product.maximumQuantity ?? product.max_stock ?? 0;
                    
                    return (
                      <TableRow key={product.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            {getCategoryName(product)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPrice(product.price || 0)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {product.unit || "un"}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              stock > minStock
                                ? "bg-green-100 text-green-800"
                                : stock > 0
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {stock}
                          </span>
                        </TableCell>
                        <TableCell className="text-right hidden md:table-cell">
                          {minStock}
                        </TableCell>
                        <TableCell className="text-right hidden md:table-cell">
                          {maxStock}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(product)}
                              className="hover:bg-primary/10 hover:text-primary"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteProduct(product)}
                              className="hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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

      <DeleteConfirmDialog
        product={deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onSuccess={onDelete}
      />
    </>
  );
};

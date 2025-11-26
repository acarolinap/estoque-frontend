import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductTable } from "@/components/products/ProductTable";
import { ProductDialog } from "@/components/products/ProductDialog";
import { useQuery } from "@tanstack/react-query";
import { productService, Product } from "@/services";
import { useToast } from "@/hooks/use-toast";

const Products = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const { data: products, isLoading, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await productService.getAll();

      if (error) {
        toast({
          title: "Erro ao carregar produtos",
          description: error,
          variant: "destructive",
        });
        throw new Error(error);
      }

      return data || [];
    },
  });

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleSuccess = () => {
    refetch();
    handleCloseDialog();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Gerenciamento de Produtos
            </h1>
            <p className="mt-2 text-muted-foreground">
              Adicione, edite e gerencie seus produtos
            </p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            size="lg"
            className="gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-5 w-5" />
            Novo Produto
          </Button>
        </div>

        <ProductTable
          products={products || []}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={refetch}
        />

        <ProductDialog
          open={isDialogOpen}
          onOpenChange={handleCloseDialog}
          product={selectedProduct}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
};

export default Products;

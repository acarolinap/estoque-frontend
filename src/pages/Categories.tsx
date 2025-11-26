import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryTable } from "@/components/categories/CategoryTable";
import { CategoryDialog } from "@/components/categories/CategoryDialog";
import { useQuery } from "@tanstack/react-query";
import { categoryService, Category } from "@/services";
import { useToast } from "@/hooks/use-toast";

const Categories = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  const { data: categories, isLoading, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await categoryService.getAll();

      if (error) {
        toast({
          title: "Erro ao carregar categorias",
          description: error,
          variant: "destructive",
        });
        throw new Error(error);
      }

      return data || [];
    },
  });

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedCategory(null);
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
              Gerenciamento de Categorias
            </h1>
            <p className="mt-2 text-muted-foreground">
              Adicione, edite e gerencie suas categorias
            </p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            size="lg"
            className="gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-5 w-5" />
            Nova Categoria
          </Button>
        </div>

        <CategoryTable
          categories={categories || []}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={refetch}
        />

        <CategoryDialog
          open={isDialogOpen}
          onOpenChange={handleCloseDialog}
          category={selectedCategory}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
};

export default Categories;

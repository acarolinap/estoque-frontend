import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { categoryService, Category } from "@/services";

interface DeleteCategoryDialogProps {
  category: Category | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeleteCategoryDialog = ({
  category,
  onClose,
  onSuccess,
}: DeleteCategoryDialogProps) => {
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!category) return;

    try {
      const { error } = await categoryService.delete(category.id);

      if (error) throw new Error(error);

      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso.",
      });

      onSuccess();
      onClose();
    } catch (error: unknown) {
      toast({
        title: "Erro ao excluir categoria",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao excluir a categoria.",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={!!category} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a categoria "{category?.name}"? 
            Esta ação não pode ser desfeita. Os produtos associados a esta categoria 
            ficarão sem categoria.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

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
import { productService, Product } from "@/services";

interface DeleteConfirmDialogProps {
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeleteConfirmDialog = ({
  product,
  onClose,
  onSuccess,
}: DeleteConfirmDialogProps) => {
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!product) return;

    try {
      const { error } = await productService.delete(product.id);

      if (error) throw new Error(error);

      toast({
        title: "Produto excluído",
        description: "O produto foi excluído com sucesso.",
      });

      onSuccess();
      onClose();
    } catch (error: unknown) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao excluir o produto.",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={!!product} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o produto "{product?.name}"? Esta ação não pode ser desfeita.
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

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { categoryService, sizeService, packagingService, Category } from "@/services";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SizeManager } from "./SizeManager";
import { PackagingManager } from "./PackagingManager";

// Define interfaces locais para os tipos auxiliares
interface SizeType {
  id: number | string;
  name: string;
}

interface PackagingType {
  id: number | string;
  name: string;
}

const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  description: z.string().max(500, "Descrição muito longa").optional(),
  size_id: z.string().min(1, "Tamanho é obrigatório"),
  packaging_id: z.string().min(1, "Embalagem é obrigatória"),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onSuccess: () => void;
}

export const CategoryDialog = ({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!category;

  const { data: sizes } = useQuery({
    queryKey: ["sizes"],
    queryFn: async () => {
      const { data, error } = await sizeService.getAll();
      if (error) throw new Error(error);
      return (data || []) as unknown as SizeType[];
    },
  });

  const { data: packagings } = useQuery({
    queryKey: ["packagings"],
    queryFn: async () => {
      const { data, error } = await packagingService.getAll();
      if (error) throw new Error(error);
      return (data || []) as unknown as PackagingType[];
    },
  });

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      size_id: "",
      packaging_id: "",
    },
  });

  // Resetar o formulário quando a modal abre ou fecha, ou quando a categoria muda
  useEffect(() => {
    if (open) {
      if (category) {
        // Modo Edição: Preenche com dados da categoria
        form.reset({
          name: category.name,
          description: category.description || "",
          // @ts-ignore
          size_id: category.size_id ? String(category.size_id) : "",
          // @ts-ignore
          packaging_id: category.packaging_id ? String(category.packaging_id) : "",
        });
      } else {
        // Modo Criação: Limpa o formulário
        form.reset({
          name: "",
          description: "",
          size_id: "",
          packaging_id: "",
        });
      }
    }
  }, [open, category, form]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      // Converte os IDs de string para número
      const categoryData = {
        name: data.name,
        description: data.description || null,
        size_id: Number(data.size_id),
        packaging_id: Number(data.packaging_id),
      };

      if (isEditing && category) {
        // @ts-ignore
        const { error } = await categoryService.update(category.id, categoryData);

        if (error) throw new Error(error);

        toast({
          title: "Categoria atualizada",
          description: "A categoria foi atualizada com sucesso.",
        });
      } else {
        // @ts-ignore
        const { error } = await categoryService.create(categoryData);

        if (error) throw new Error(error);

        toast({
          title: "Categoria criada",
          description: "A categoria foi criada com sucesso.",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onSuccess();
      
      // Limpa o formulário após o sucesso se for criação
      if (!isEditing) {
          form.reset();
      }
      
    } catch (error: unknown) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao salvar a categoria.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações da categoria."
              : "Preencha os dados para criar uma nova categoria."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da categoria" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição da categoria"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="size_id"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Tamanho</FormLabel>
                    <SizeManager />
                  </div>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tamanho" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sizes?.map((size) => (
                        <SelectItem key={size.id} value={String(size.id)}>
                          {size.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="packaging_id"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Embalagem</FormLabel>
                    <PackagingManager />
                  </div>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a embalagem" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {packagings?.map((packaging) => (
                        <SelectItem key={packaging.id} value={String(packaging.id)}>
                          {packaging.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                {isEditing ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

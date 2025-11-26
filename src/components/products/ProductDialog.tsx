import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { categoryService, productService, Product } from "@/services";

const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  price: z.string().min(1, "Preço é obrigatório"),
  unit: z.string().min(1, "Unidade é obrigatória").max(20, "Unidade muito longa"),
  stock: z.string().min(1, "Estoque é obrigatório"),
  min_stock: z.string().min(1, "Estoque mínimo é obrigatório"),
  max_stock: z.string().min(1, "Estoque máximo é obrigatório"),
  category_id: z.string().min(1, "Categoria é obrigatória"),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSuccess: () => void;
}

export const ProductDialog = ({
  open,
  onOpenChange,
  product,
  onSuccess,
}: ProductDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!product;

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await categoryService.getAll();
      if (error) throw new Error(error);
      return data || [];
    },
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: "",
      unit: "un",
      stock: "",
      min_stock: "10",
      max_stock: "1000",
      category_id: "",
    },
  });

  // CORREÇÃO AQUI: Adicionado 'open' nas dependências e lógica de reset
  useEffect(() => {
    if (open) {
      if (product) {
        // Modo Edição: Carrega os dados do produto
        form.reset({
          name: product.name,
          price: product.price?.toString() || "0",
          unit: product.unit || "un",
          // Garante leitura correta dos campos novos (quantity) ou antigos (stock)
          stock: (product.quantity ?? product.stock ?? 0).toString(),
          min_stock: (product.minimumQuantity ?? product.min_stock ?? 10).toString(),
          max_stock: (product.maximumQuantity ?? product.max_stock ?? 1000).toString(),
          category_id: (product.categoryId ?? product.category_id ?? "").toString(),
        });
      } else {
        // Modo Criação: Limpa o formulário completamente
        form.reset({
          name: "",
          price: "",
          unit: "un",
          stock: "",
          min_stock: "10",
          max_stock: "1000",
          category_id: "",
        });
      }
    }
  }, [open, product, form]); // 'open' é crucial aqui

  const onSubmit = async (data: ProductFormData) => {
    try {
      // Mapeia os dados do formulário para o formato que o Backend Java espera
      const productData = {
        name: data.name,
        price: parseFloat(data.price),
        unit: data.unit,
        quantity: parseInt(data.stock),           // Front: stock -> Back: quantity
        minimumQuantity: parseInt(data.min_stock), // Front: min_stock -> Back: minimumQuantity
        maximumQuantity: parseInt(data.max_stock), // Front: max_stock -> Back: maximumQuantity
        categoryId: parseInt(data.category_id),    // Front: category_id -> Back: categoryId
      };

      if (isEditing && product) {
        // @ts-ignore
        const { error } = await productService.update(product.id, productData);

        if (error) throw new Error(error);

        toast({
          title: "Produto atualizado",
          description: "O produto foi atualizado com sucesso.",
        });
      } else {
        // @ts-ignore
        const { error } = await productService.create(productData);

        if (error) throw new Error(error);

        toast({
          title: "Produto criado",
          description: "O produto foi criado com sucesso.",
        });
      }

      // Atualiza as listas
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      
      onSuccess();

      // Limpa o formulário após sucesso se for criação
      if (!isEditing) {
        form.reset();
      }
    } catch (error: unknown) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao salvar o produto.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do produto."
              : "Preencha os dados para criar um novo produto."}
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
                    <Input placeholder="Nome do produto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ex: un, kg, l"
                        maxLength={20}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mínimo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Máximo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="1000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {category.name}
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

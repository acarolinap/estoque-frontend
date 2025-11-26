import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { productService, stockService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // CORREÇÃO: Importado useQueryClient
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

// CORREÇÃO: Padronizado para IN/OUT
const formSchema = z.object({
  product_id: z.string().min(1, "Selecione um produto"),
  movement_date: z.string().min(1, "Data é obrigatória"),
  quantity: z.coerce.number().positive("Quantidade deve ser maior que zero"),
  movement_type: z.enum(["IN", "OUT"], {
    required_error: "Selecione o tipo de movimentação",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface StockMovementFormProps {
  onSuccess: () => void;
}

export function StockMovementForm({ onSuccess }: StockMovementFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient(); // CORREÇÃO: Instância do cliente para atualizar cache
  
  const [stockWarning, setStockWarning] = useState<{
    type: "min" | "max" | "negative" | null;
    message: string;
  }>({ type: null, message: "" });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_id: "",
      movement_date: new Date().toISOString().split("T")[0],
      quantity: 0,
      movement_type: "IN", // Padrão IN
    },
  });

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await productService.getAll();
      if (error) throw new Error(error);
      return data || [];
    },
  });

  const selectedProductId = form.watch("product_id");
  const quantity = form.watch("quantity");
  const movementType = form.watch("movement_type");

  useState(() => {
    if (selectedProductId && quantity > 0) {
      const product = products?.find((p) => String(p.id) === selectedProductId);
      
      if (product) {
        // CORREÇÃO: Lê o campo 'quantity' (novo padrão) ou 'stock' (fallback)
        const currentStock = product.quantity ?? product.stock ?? 0;
        const minStock = product.minimumQuantity ?? product.min_stock ?? 0;
        const maxStock = product.maximumQuantity ?? product.max_stock ?? 0;

        const newStock =
          movementType === "IN"
            ? currentStock + quantity
            : currentStock - quantity;

        if (movementType === "OUT" && newStock < 0) {
          setStockWarning({
            type: "negative",
            message: `Estoque insuficiente! Estoque atual: ${currentStock}`,
          });
        } else if (movementType === "OUT" && newStock < minStock) {
          setStockWarning({
            type: "min",
            message: `Atenção: Estoque ficará abaixo do mínimo (${minStock}). Novo estoque: ${newStock}`,
          });
        } else if (movementType === "IN" && newStock > maxStock) {
          setStockWarning({
            type: "max",
            message: `Atenção: Estoque ficará acima do máximo (${maxStock}). Novo estoque: ${newStock}`,
          });
        } else {
          setStockWarning({ type: null, message: "" });
        }
      }
    } else {
      setStockWarning({ type: null, message: "" });
    }
  });

  const onSubmit = async (values: FormValues) => {
    if (values.movement_type === "OUT") {
      const product = products?.find((p) => String(p.id) === values.product_id);
      const currentStock = product?.quantity ?? product?.stock ?? 0;
      
      if (product && currentStock < values.quantity) {
        toast({
          title: "Erro",
          description: "Estoque insuficiente para realizar esta saída",
          variant: "destructive",
        });
        return;
      }
    }

    const { error } = await stockService.create({
      product_id: values.product_id,
      date: values.movement_date,
      quantity: values.quantity,
      type: values.movement_type, // Envia "IN" ou "OUT" direto
      reason: null,
    });

    if (error) {
      toast({
        title: "Erro ao registrar movimentação",
        description: error,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Movimentação registrada",
      description: "O estoque foi atualizado com sucesso",
    });

    // CORREÇÃO: Atualiza os dados na tela imediatamente
    await queryClient.invalidateQueries({ queryKey: ["products"] });
    await queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
    await queryClient.invalidateQueries({ queryKey: ["reports"] });

    onSuccess();

    // CORREÇÃO: Mantém o tipo de movimentação selecionado para facilitar registros em sequência
    form.reset({
      product_id: "",
      movement_date: new Date().toISOString().split("T")[0],
      quantity: 0,
      movement_type: values.movement_type, 
    });
    setStockWarning({ type: null, message: "" });
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Registrar Movimentação</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="product_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produto *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value} // CORREÇÃO: Usar 'value' torna o componente controlado
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o produto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products?.map((product) => {
                         const displayStock = product.quantity ?? product.stock ?? 0;
                         return (
                          <SelectItem key={product.id} value={String(product.id)}>
                            {product.name} (Estoque atual: {displayStock})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="movement_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Movimentação *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value} // CORREÇÃO: Usar 'value' torna o componente controlado
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* CORREÇÃO: Valores padronizados para o Backend */}
                      <SelectItem value="IN">Entrada</SelectItem>
                      <SelectItem value="OUT">Saída</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Digite a quantidade"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="movement_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data da Movimentação *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {stockWarning.message && (
              <Alert
                variant={
                  stockWarning.type === "negative" ? "destructive" : "default"
                }
              >
                {stockWarning.type === "negative" ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <AlertDescription>{stockWarning.message}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={stockWarning.type === "negative"}
            >
              Registrar Movimentação
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

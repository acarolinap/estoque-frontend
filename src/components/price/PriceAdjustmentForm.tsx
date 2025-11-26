import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { productService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
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

const formSchema = z.object({
  percentage: z.coerce
    .number()
    .min(-100, "Percentual não pode ser menor que -100%")
    .max(1000, "Percentual não pode ser maior que 1000%")
    .refine((val) => val !== 0, "Percentual não pode ser zero"),
});

type FormValues = z.infer<typeof formSchema>;

export function PriceAdjustmentForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingPercentage, setPendingPercentage] = useState<number | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      percentage: 0,
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

  const percentage = form.watch("percentage");

  const calculateNewPrice = (currentPrice: number, percent: number) => {
    return currentPrice * (1 + percent / 100);
  };

  const onSubmit = async (values: FormValues) => {
    setPendingPercentage(values.percentage);
    setShowConfirmDialog(true);
  };

  const handleConfirmAdjustment = async () => {
    if (!pendingPercentage || !products) return;

    setIsApplying(true);
    setShowConfirmDialog(false);

    try {
      // Atualizar cada produto com o novo preço enviando o OBJETO COMPLETO
      const updates = products.map((product) => {
        const currentPrice = product.price || 0;
        const newPrice = calculateNewPrice(currentPrice, pendingPercentage);
        
        // Constrói o objeto completo necessário pelo backend
        // Usa os valores novos (quantity) ou fallback para os antigos (stock)
        const productPayload = {
            name: product.name,
            quantity: product.quantity ?? product.stock ?? 0,
            minimumQuantity: product.minimumQuantity ?? product.min_stock ?? 0,
            maximumQuantity: product.maximumQuantity ?? product.max_stock ?? 0,
            price: parseFloat(newPrice.toFixed(2)),
            unit: product.unit,
            categoryId: product.categoryId || product.category_id
        };

        // @ts-ignore - Ignora erro de tipagem estrita para garantir envio correto
        return productService.update(product.id, productPayload);
      });

      const results = await Promise.all(updates);

      const errors = results.filter((result) => result.error);
      
      if (errors.length > 0) {
        toast({
          title: "Erro parcial no reajuste",
          description: `${errors.length} produto(s) não foram atualizados`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Reajuste aplicado com sucesso",
          description: `${products.length} produto(s) tiveram seus preços atualizados`,
        });
        
        form.reset();
      }

      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    } catch (error: unknown) {
      toast({
        title: "Erro ao aplicar reajuste",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
      setPendingPercentage(null);
    }
  };

  const exampleProduct = products?.[0];
  const showExample = exampleProduct && percentage !== 0;
  const isIncrease = percentage > 0;

  // ... Renderização do componente continua igual ao original ...
  // (Para economizar espaço, mantenha o return do componente igual, 
  // a mudança foi apenas na lógica do handleConfirmAdjustment acima)
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Aplicar Reajuste de Preços
          </CardTitle>
          <CardDescription>
            Ajuste todos os preços dos produtos de uma vez com um percentual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Percentual de Reajuste *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 10 para aumento de 10% ou -5 para redução de 5%"
                          className="pr-8"
                          {...field}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          %
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Use valores positivos para aumentar ou negativos para diminuir
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showExample && (
                <Alert className={isIncrease ? "border-green-500" : "border-orange-500"}>
                  {isIncrease ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-orange-500" />
                  )}
                  <AlertTitle>Exemplo de Reajuste</AlertTitle>
                  <AlertDescription className="space-y-2">
                    <div className="font-medium">
                      Produto: {exampleProduct.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Preço atual:</span>
                      <span className="font-mono">
                        R$ {(exampleProduct.price || 0).toFixed(2)}
                      </span>
                      <span>→</span>
                      <span className="font-mono font-semibold">
                        R${" "}
                        {calculateNewPrice(
                          exampleProduct.price || 0,
                          percentage
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Este reajuste será aplicado a todos os {products?.length}{" "}
                      produtos cadastrados
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {products && products.length === 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Nenhum produto cadastrado</AlertTitle>
                  <AlertDescription>
                    Cadastre produtos antes de aplicar reajustes
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={!products || products.length === 0 || isApplying}
                size="lg"
              >
                {isApplying ? "Aplicando Reajuste..." : "Aplicar Reajuste"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Reajuste de Preços</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Você está prestes a aplicar um reajuste de{" "}
                <span className="font-bold">
                  {pendingPercentage && pendingPercentage > 0 ? "+" : ""}
                  {pendingPercentage}%
                </span>{" "}
                em todos os {products?.length} produtos cadastrados.
              </p>
              <p className="text-destructive font-medium">
                Esta ação não pode ser desfeita automaticamente.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAdjustment}>
              Confirmar Reajuste
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

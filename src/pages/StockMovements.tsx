import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { stockService, StockMovement } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { StockMovementForm } from "@/components/stock/StockMovementForm";
import { StockMovementTable } from "@/components/stock/StockMovementTable";

const StockMovements = () => {
  const { toast } = useToast();

  const { data: movements, isLoading, refetch } = useQuery({
    queryKey: ["stock-movements"],
    queryFn: async () => {
      const { data, error } = await stockService.getAll();

      if (error) {
        toast({
          title: "Erro ao carregar movimentações",
          description: error,
          variant: "destructive",
        });
        throw new Error(error);
      }

      return data || [];
    },
  });

  const handleSuccess = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Movimentação de Estoque
          </h1>
          <p className="mt-2 text-muted-foreground">
            Registre entradas e saídas de produtos
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <StockMovementForm onSuccess={handleSuccess} />
          <StockMovementTable
            movements={movements || []}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default StockMovements;

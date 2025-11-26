import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area"; // Importamos a área de rolagem
import { ArrowDown, ArrowUp } from "lucide-react";
import type { StockMovement } from "@/services/types";

interface StockMovementTableProps {
  movements: StockMovement[];
  isLoading: boolean;
}

export function StockMovementTable({
  movements,
  isLoading,
}: StockMovementTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Movimentações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          {/* Define altura fixa de ~300px (aprox 5 linhas) e habilita o scroll */}
          <ScrollArea className="h-[390px]"> 
            <Table>
              <TableHeader>
                {/* 'sticky top-0' faz o cabeçalho fixar no topo ao rolar */}
                <TableRow className="sticky top-0 bg-card z-20 shadow-sm hover:bg-card">
                  <TableHead>Produto</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Nenhuma movimentação registrada
                    </TableCell>
                  </TableRow>
                ) : (
                  movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="font-medium">
                        {movement.products?.name || "Produto removido"}
                      </TableCell>
                      <TableCell>
                        {format(new Date(movement.date), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            movement.movement_type === "Entrada" || movement.movement_type === "IN"
                              ? "default"
                              : "secondary"
                          }
                          className="gap-1"
                        >
                          {movement.movement_type === "Entrada" || movement.movement_type === "IN" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )}
                          {/* Exibe o texto vindo do banco (Entrada/Saída) */}
                          {movement.movement_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {movement.quantity}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

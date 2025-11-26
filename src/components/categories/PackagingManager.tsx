import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { packagingService } from "@/services";
import type { Packaging } from "@/services";
import { useToast } from "@/hooks/use-toast";

export const PackagingManager = () => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) {
      setEditingId(null);
      setName("");
    }
  }, [open]);

  const { data: packagings, isLoading } = useQuery({
    queryKey: ["packagings"],
    queryFn: async () => {
      const { data, error } = await packagingService.getAll();
      if (error) throw new Error(error);
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await packagingService.create({ name });
      if (error) throw new Error(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packagings"] });
      setName("");
      toast({ title: "Embalagem criada com sucesso" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar embalagem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await packagingService.update(id, { name });
      if (error) throw new Error(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packagings"] });
      setEditingId(null);
      setName("");
      toast({ title: "Embalagem atualizada com sucesso" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar embalagem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await packagingService.delete(id);
      if (error) throw new Error(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packagings"] });
      toast({ title: "Embalagem excluída com sucesso" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir embalagem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Impede propagação
    if (!name.trim()) return;

    if (editingId) {
      updateMutation.mutate({ id: editingId, name: name.trim() });
    } else {
      createMutation.mutate(name.trim());
    }
  };

  const handleEdit = (packaging: Packaging) => {
    setEditingId(packaging.id);
    setName(packaging.name);
  };

  const handleCancel = () => {
    setEditingId(null);
    setName("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          type="button"
          onClick={(e) => {
            // CORREÇÃO CRÍTICA
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }}
        >
          Gerenciar Embalagens
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Gerenciar Embalagens</DialogTitle>
          <DialogDescription>
            Adicione, edite ou exclua embalagens disponíveis
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <Input
            placeholder="Nome da embalagem"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={!name.trim()}>
            {editingId ? "Atualizar" : <Plus className="h-4 w-4" />}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
          )}
        </form>

        <div className="rounded-md border max-h-[300px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-4">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : packagings?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-4">
                    Nenhuma embalagem cadastrada
                  </TableCell>
                </TableRow>
              ) : (
                packagings?.map((packaging) => (
                  <TableRow key={packaging.id}>
                    <TableCell>{packaging.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(packaging)}
                          type="button"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(packaging.id)}
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

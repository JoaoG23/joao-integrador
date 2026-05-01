import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import api from "../../api/api";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Plus, Zap, Play, Settings, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { useState } from "react";

export function IntegrationsListPage() {
  const queryClient = useQueryClient();
  const [integrationToDelete, setIntegrationToDelete] = useState<number | null>(null);

  const { data: integrations, isLoading } = useQuery({
    queryKey: ["integrations"],
    queryFn: async () => {
      const response = await api.get("/integrations");
      return response.data;
    },
  });

  const runMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/integrations/${id}/run`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Execução iniciada", {
        icon: <Play className="h-4 w-4" />,
        description: "A integração está rodando em segundo plano."
      });
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
    onError: (error: any) => {
      toast.error("Falha ao iniciar execução", {
        description: error.response?.data?.message || error.message
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/integrations/${id}`);
    },
    onSuccess: () => {
      toast.success("Integração excluída com sucesso");
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      setIntegrationToDelete(null);
    },
    onError: (error: any) => {
      toast.error("Falha ao excluir integração", {
        description: error.response?.data?.message || error.message
      });
    }
  });

  const handleDelete = () => {
    if (!integrationToDelete) return;
    deleteMutation.mutate(integrationToDelete);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Integrações</h1>
        <Button asChild>
          <Link to="/integrations/new">
            <Plus className="mr-2 h-4 w-4" /> Adicionar Integração
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-muted-foreground" />
            Integrações Ativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-10">Carregando integrações...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Expressão Cron</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Execução</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {integrations?.map((integration: any) => (
                  <TableRow key={integration.id}>
                    <TableCell className="font-medium">
                      <Link to={`/integrations/${integration.id}`} className="hover:underline">
                        {integration.name}
                      </Link>
                    </TableCell>
                    <TableCell><code>{integration.cronExpression}</code></TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        integration.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {integration.isActive ? "Ativa" : "Inativa"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {integration.lastRun ? new Date(integration.lastRun).toLocaleString() : "Nunca"}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        title="Rodar Agora"
                        onClick={() => runMutation.mutate(integration.id)}
                        disabled={runMutation.isPending}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" title="Detalhes e Passos" asChild>
                        <Link to={`/integrations/${integration.id}`}>
                          <Settings className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            title="Excluir"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setIntegrationToDelete(integration.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Integração</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir esta integração? Todos os seus passos e logs serão perdidos. Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setIntegrationToDelete(null)}>
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={handleDelete}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
                {integrations?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      Nenhuma integração encontrada. Adicione sua primeira integração para começar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


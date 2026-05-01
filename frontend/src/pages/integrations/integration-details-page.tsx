import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import api from "../../api/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { SqlTextarea } from "./sql-textarea";
import { CheckCircle2, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Play, Plus, ListTree, History, Pencil, Trash2, X } from "lucide-react";

export function IntegrationDetailsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [editingStepId, setEditingStepId] = useState<number | null>(null);

  const { data: integration, isLoading: isIntegrationLoading } = useQuery({
    queryKey: ["integration", id],
    queryFn: async () => {
      const response = await api.get(`/integrations/${id}`);
      return response.data;
    },
  });

  const { data: connections } = useQuery({
    queryKey: ["connections"],
    queryFn: async () => {
      const response = await api.get("/connections");
      return response.data;
    },
  });

  const runMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/integrations/${id}/run`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Execução iniciada", {
        icon: <Play className="h-4 w-4" />,
        description: "A integração está rodando em segundo plano."
      });
      queryClient.invalidateQueries({ queryKey: ["integration", id] });
    },
    onError: (error: any) => {
      toast.error("Falha na execução", {
        description: error.response?.data?.message || error.message
      });
    }
  });

  const stepMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingStepId) {
        const response = await api.patch(
          `/integrations/${id}/steps/${editingStepId}`,
          data,
        );
        return response.data;
      } else {
        const response = await api.post(`/integrations/${id}/steps`, data);
        return response.data;
      }
    },
    onSuccess: () => {
      toast.success(editingStepId ? "Passo atualizado" : "Passo adicionado");
      queryClient.invalidateQueries({ queryKey: ["integration", id] });
      handleCancelEdit();
    },
    onError: (error: any) => {
      toast.error("Falha ao salvar passo", {
        description: error.response?.data?.message || error.message
      });
    }
  });

  const deleteStepMutation = useMutation({
    mutationFn: async (stepId: number) => {
      await api.delete(`/integrations/${id}/steps/${stepId}`);
    },
    onSuccess: () => {
      toast.success("Passo excluído");
      queryClient.invalidateQueries({ queryKey: ["integration", id] });
    },
    onError: (error: any) => {
      toast.error("Falha ao excluir passo", {
        description: error.response?.data?.message || error.message
      });
    }
  });

  const runStepMutation = useMutation({
    mutationFn: async (stepId: number) => {
      const response = await api.post(
        `/integrations/${id}/steps/${stepId}/run`,
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Execução do passo finalizada!", {
        icon: <CheckCircle2 className="h-4 w-4" />,
        description: `Linhas processadas: ${data.processedRows}`
      });
      queryClient.invalidateQueries({ queryKey: ["integration", id] });
    },
    onError: (error: any) => {
      toast.error("Falha na execução do passo", {
        icon: <AlertCircle className="h-4 w-4" />,
        description: error.response?.data?.message || error.message
      });
    },
  });

  const stepForm = useForm({
    defaultValues: {
      sourceConnectionId: "",
      sourceQuery: "",
      targetConnectionId: "",
      targetQuery: "",
      executionOrder: 1,
      batchSize: 1000,
    },
  });

  function onStepSubmit(data: any) {
    data.sourceConnectionId = Number(data.sourceConnectionId);
    data.targetConnectionId = Number(data.targetConnectionId);
    data.executionOrder = Number(data.executionOrder);
    data.batchSize = Number(data.batchSize);
    stepMutation.mutate(data);
  }

  const handleEditStep = (step: any) => {
    setEditingStepId(step.id);
    stepForm.reset({
      sourceConnectionId: step.sourceConnectionId.toString(),
      sourceQuery: step.sourceQuery,
      targetConnectionId: step.targetConnectionId.toString(),
      targetQuery: step.targetQuery,
      executionOrder: step.executionOrder,
      batchSize: step.batchSize,
    });
  };

  const handleCancelEdit = () => {
    setEditingStepId(null);
    stepForm.reset({
      sourceConnectionId: "",
      sourceQuery: "",
      targetConnectionId: "",
      targetQuery: "",
      executionOrder: 1,
      batchSize: 1000,
    });
  };

  const handleDeleteStep = (stepId: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este passo?")) return;
    deleteStepMutation.mutate(stepId);
  };

  if (isIntegrationLoading) return <div>Carregando detalhes da integração...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {integration.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            {integration.description}
          </p>
          <div className="mt-2 flex gap-4 text-sm">
            <span className="flex items-center gap-1 font-medium">
              CRON:{" "}
              <code className="bg-muted px-1 rounded">
                {integration.cronExpression}
              </code>
            </span>
            <span
              className={`font-semibold ${integration.isActive ? "text-green-600" : "text-red-600"}`}
            >
              {integration.isActive ? "Ativa" : "Inativa"}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/integrations/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </Link>
          </Button>
          <Button
            onClick={() => runMutation.mutate()}
            disabled={runMutation.isPending}
          >
            <Play className="mr-2 h-4 w-4" /> Rodar Agora
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Steps List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListTree className="h-5 w-5" />
                Passos de Execução
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Ordem</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {integration.steps?.map((step: any) => (
                    <TableRow key={step.id}>
                      <TableCell className="font-bold">
                        {step.executionOrder}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground mb-1">
                          Conn ID: {step.sourceConnectionId}
                        </div>
                        <code
                          className="text-[10px] block max-w-[150px] truncate"
                          title={step.sourceQuery}
                        >
                          {step.sourceQuery}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground mb-1">
                          Conn ID: {step.targetConnectionId}
                        </div>
                        <code
                          className="text-[10px] block max-w-[150px] truncate"
                          title={step.targetQuery}
                        >
                          {step.targetQuery}
                        </code>
                      </TableCell>
                      <TableCell>{step.batchSize}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => runStepMutation.mutate(step.id)}
                          disabled={runStepMutation.isPending}
                          title="Rodar este passo manualmente"
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditStep(step)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteStep(step.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {integration.steps?.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-10 text-muted-foreground"
                      >
                        Nenhum passo definido para esta integração.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Logs List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Logs de Execução
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead>Horário</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Duração</TableHead>
                      <TableHead>Mensagem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {integration.logs?.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs">
                          {new Date(log.startTime).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.status === "SUCCESS"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {log.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">
                          {log.endTime
                            ? `${((new Date(log.endTime).getTime() - new Date(log.startTime).getTime()) / 1000).toFixed(2)}s`
                            : "-"}
                        </TableCell>
                        <TableCell
                          className="text-xs max-w-[200px] truncate"
                          title={log.message}
                        >
                          {log.message}
                        </TableCell>
                      </TableRow>
                    ))}
                    {integration.logs?.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-6 text-muted-foreground"
                        >
                          Nenhum log disponível.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Step Form */}
        <div>
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2 text-lg">
                <div className="flex items-center gap-2">
                  {editingStepId ? (
                    <Pencil className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {editingStepId ? "Atualizar Passo" : "Adicionar Passo"}
                </div>
                {editingStepId && (
                  <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...stepForm}>
                <form
                  onSubmit={stepForm.handleSubmit(onStepSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={stepForm.control}
                    name="sourceConnectionId"
                    rules={{ required: "Conexão de origem é obrigatória" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conexão de Origem</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a origem" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {connections?.map((c: any) => (
                              <SelectItem key={c.id} value={c.id.toString()}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={stepForm.control}
                    name="sourceQuery"
                    rules={{ required: "Query de origem é obrigatória" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Query de Origem (SELECT)</FormLabel>
                        <FormControl>
                          <SqlTextarea
                            placeholder="SELECT * FROM tabela"
                            className="font-mono text-xs"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={stepForm.control}
                    name="targetConnectionId"
                    rules={{ required: "Conexão de destino é obrigatória" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conexão de Destino</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o destino" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {connections?.map((c: any) => (
                              <SelectItem key={c.id} value={c.id.toString()}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={stepForm.control}
                    name="targetQuery"
                    rules={{ required: "Query de destino é obrigatória" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Query de Destino (INSERT/UPDATE)</FormLabel>
                        <FormControl>
                          <SqlTextarea
                            placeholder="INSERT INTO tabela VALUES (:col)"
                            className="font-mono text-xs"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={stepForm.control}
                      name="executionOrder"
                      rules={{ required: "Ordem é obrigatória" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ordem</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={stepForm.control}
                      name="batchSize"
                      rules={{ required: "Tamanho do lote é obrigatório" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tamanho do Lote</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={stepMutation.isPending}
                  >
                    {stepMutation.isPending
                      ? editingStepId
                        ? "Atualizando..."
                        : "Adicionando..."
                      : editingStepId
                        ? "Atualizar Passo"
                        : "Adicionar Passo"}
                  </Button>

                  {editingStepId && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleCancelEdit}
                    >
                      Cancelar
                    </Button>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

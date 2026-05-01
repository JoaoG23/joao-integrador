import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../../api/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "../../components/ui/form";
import { Checkbox } from "../../components/ui/checkbox";
import { useEffect } from "react";

export function IntegrationEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { data: integration, isLoading } = useQuery({
    queryKey: ["integration", id],
    queryFn: async () => {
      const response = await api.get(`/integrations/${id}`);
      return response.data;
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      cronExpression: "0 0 * * *",
      isActive: true,
    },
  });

  useEffect(() => {
    if (integration) {
      form.reset({
        name: integration.name,
        description: integration.description || "",
        cronExpression: integration.cronExpression,
        isActive: integration.isActive,
      });
    }
  }, [integration, form]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.patch(`/integrations/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Integração atualizada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      queryClient.invalidateQueries({ queryKey: ["integration", id] });
      navigate(`/integrations/${id}`);
    },
    onError: (error: any) => {
      toast.error("Falha ao atualizar integração", {
        description: error.response?.data?.message || error.message
      });
    }
  });

  function onSubmit(data: any) {
    mutation.mutate(data);
  }

  if (isLoading) return <div>Carregando integração...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Editar Integração</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Integração</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Nome da integração é obrigatório" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Integração</FormLabel>
                    <FormControl>
                      <Input placeholder="Vendas para DW" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                rules={{ required: "Descrição é obrigatória" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input placeholder="Descrição do que esta integração faz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cronExpression"
                rules={{ required: "Expressão Cron é obrigatória" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expressão Cron</FormLabel>
                    <FormControl>
                      <Input placeholder="0 0 * * *" {...field} />
                    </FormControl>
                    <FormDescription>
                      Formato CRON padrão (ex: "0 0 * * *" para diariamente à meia-noite).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Ativo</FormLabel>
                      <FormDescription>
                        Agendar esta integração para rodar automaticamente.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(`/integrations/${id}`)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

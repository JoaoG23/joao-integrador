import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../../api/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Database, Save, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
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
import { useEffect } from "react";

export function ConnectionEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: connection, isLoading } = useQuery({
    queryKey: ["connection", id],
    queryFn: async () => {
      const response = await api.get(`/connections/${id}`);
      return response.data;
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      driver: "postgres",
      host: "localhost",
      port: 5432,
      username: "",
      password: "",
      databaseName: "",
      schema: "public",
    },
  });

  useEffect(() => {
    if (connection) {
      form.reset(connection);
    }
  }, [connection, form]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.patch(`/connections/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Conexão atualizada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["connection", id] });
      navigate("/connections");
    },
    onError: (error: any) => {
      toast.error(
        `Erro ao atualizar: ${error.response?.data?.message || error.message}`,
      );
    },
  });

  const testMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post(`/connections/${id}/test`, data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Conexão bem-sucedida!", {
          icon: <CheckCircle2 className="h-4 w-4" />,
          description: "Comunicação com o banco de dados estabelecida corretamente.",
        });
      } else {
        toast.error("Falha na conexão", {
          icon: <AlertCircle className="h-4 w-4" />,
          description: data.message,
        });
      }
    },
    onError: (error: any) => {
      toast.error("Falha no teste", {
        description: error.response?.data?.message || error.message,
      });
    },
  });

  function onSubmit(data: any) {
    data.port = Number(data.port);
    // Remove ID if present in data
    const { id: _, createdAt: __, ...updateData } = data;
    mutation.mutate(updateData);
  }

  const handleTest = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const values = form.getValues();
    values.port = Number(values.port);
    testMutation.mutate(values);
  };

  const driver = form.watch("driver");

  if (isLoading) return <div>Carregando conexão...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Editar Conexão</h1>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Conexão</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Nome da conexão é obrigatório" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Conexão</FormLabel>
                    <FormControl>
                      <Input placeholder="Meu Banco de Dados" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="driver"
                  rules={{ required: "Driver é obrigatório" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Driver</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        key={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um driver" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="postgres">PostgreSQL</SelectItem>
                          <SelectItem value="mysql">MySQL</SelectItem>
                          <SelectItem value="mssql">SQL Server</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="host"
                  rules={{ required: "Host é obrigatório" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Host</FormLabel>
                      <FormControl>
                        <Input placeholder="localhost" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="port"
                  rules={{ required: "Porta é obrigatória" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Porta</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="databaseName"
                  rules={{ required: "Nome do banco de dados é obrigatório" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Banco de Dados</FormLabel>
                      <FormControl>
                        <Input placeholder="meu_db" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  rules={{ required: "Usuário é obrigatório" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuário</FormLabel>
                      <FormControl>
                        <Input placeholder="admin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  rules={{ required: "Senha é obrigatória" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {driver !== "mysql" && (
                <FormField
                  control={form.control}
                  name="schema"
                  rules={{ required: "Schema é obrigatório" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schema</FormLabel>
                      <FormControl>
                        <Input placeholder="public" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/connections")}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleTest}
                  disabled={testMutation.isPending}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  {testMutation.isPending ? (
                    "Testando..."
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" /> Testar Conexão
                    </>
                  )}
                </Button>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                >
                  {mutation.isPending ? (
                    "Salvando..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../../api/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Database, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";

export function ConnectionCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
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

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/connections", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Connection created successfully");
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      navigate("/connections");
    },
    onError: (error: any) => {
      toast.error(`Failed to create: ${error.response?.data?.message || error.message}`);
    }
  });

  const testMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/connections/test", data);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Connection successful!", {
          icon: <CheckCircle2 className="h-4 w-4" />,
          description: "Database communication established correctly."
        });
      } else {
        toast.error("Connection failed", {
          icon: <AlertCircle className="h-4 w-4" />,
          description: data.message
        });
      }
    },
    onError: (error: any) => {
      toast.error("Test failed", {
        description: error.response?.data?.message || error.message
      });
    }
  });

  function onSubmit(data: any) {
    // Convert port to number just in case
    data.port = Number(data.port);
    mutation.mutate(data);
  }

  const handleTest = () => {
    const values = form.getValues();
    values.port = Number(values.port);
    testMutation.mutate(values);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Add Connection</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Connection Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Connection Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Database" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="driver"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Driver</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a driver" />
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Port</FormLabel>
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Database Name</FormLabel>
                      <FormControl>
                        <Input placeholder="my_db" {...field} />
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="schema"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schema (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="public" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate("/connections")}>
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={handleTest} 
                  disabled={testMutation.isPending}
                  className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  {testMutation.isPending ? (
                    "Testing..."
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" /> Test Connection
                    </>
                  )}
                </Button>
                <Button type="submit" disabled={mutation.isPending} className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600">
                  {mutation.isPending ? (
                    "Creating..."
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" /> Create Connection
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

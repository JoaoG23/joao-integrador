import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import api from "../../api/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
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
import { Play, Plus, ListTree, History } from "lucide-react";

export function IntegrationDetailsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();

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
      alert("Execution started");
      queryClient.invalidateQueries({ queryKey: ["integration", id] });
    },
  });

  const addStepMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post(`/integrations/${id}/steps`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integration", id] });
      stepForm.reset();
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

  function onAddStep(data: any) {
    data.sourceConnectionId = Number(data.sourceConnectionId);
    data.targetConnectionId = Number(data.targetConnectionId);
    data.executionOrder = Number(data.executionOrder);
    data.batchSize = Number(data.batchSize);
    addStepMutation.mutate(data);
  }

  if (isIntegrationLoading) return <div>Loading integration details...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{integration.name}</h1>
          <p className="text-muted-foreground mt-1">{integration.description}</p>
          <div className="mt-2 flex gap-4 text-sm">
            <span className="flex items-center gap-1 font-medium">
              CRON: <code className="bg-muted px-1 rounded">{integration.cronExpression}</code>
            </span>
            <span className={`font-semibold ${integration.isActive ? "text-green-600" : "text-red-600"}`}>
              {integration.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
        <Button onClick={() => runMutation.mutate()} disabled={runMutation.isPending}>
          <Play className="mr-2 h-4 w-4" /> Run Now
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Steps List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListTree className="h-5 w-5" />
                Execution Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Order</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Batch</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {integration.steps?.map((step: any) => (
                    <TableRow key={step.id}>
                      <TableCell className="font-bold">{step.executionOrder}</TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground mb-1">Conn ID: {step.sourceConnectionId}</div>
                        <code className="text-[10px] block max-w-[200px] truncate" title={step.sourceQuery}>
                          {step.sourceQuery}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground mb-1">Conn ID: {step.targetConnectionId}</div>
                        <code className="text-[10px] block max-w-[200px] truncate" title={step.targetQuery}>
                          {step.targetQuery}
                        </code>
                      </TableCell>
                      <TableCell>{step.batchSize}</TableCell>
                    </TableRow>
                  ))}
                  {integration.steps?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                        No steps defined for this integration.
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
                Execution Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {integration.logs?.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs">
                        {new Date(log.startTime).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === "SUCCESS" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {log.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">
                        {log.endTime ? `${((new Date(log.endTime).getTime() - new Date(log.startTime).getTime()) / 1000).toFixed(2)}s` : "-"}
                      </TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate" title={log.message}>
                        {log.message}
                      </TableCell>
                    </TableRow>
                  ))}
                  {integration.logs?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        No logs available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Add Step Form */}
        <div>
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="h-4 w-4" /> Add Step
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...stepForm}>
                <form onSubmit={stepForm.handleSubmit(onAddStep)} className="space-y-4">
                  <FormField
                    control={stepForm.control}
                    name="sourceConnectionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source Connection</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {connections?.map((c: any) => (
                              <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
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
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source Query (SELECT)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="SELECT * FROM table" 
                            className="font-mono text-xs h-32" 
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
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Connection</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select target" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {connections?.map((c: any) => (
                              <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
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
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Query (INSERT/UPDATE)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="INSERT INTO table VALUES (:col)" 
                            className="font-mono text-xs h-32" 
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
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order</FormLabel>
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
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Batch Size</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={addStepMutation.isPending}>
                    {addStepMutation.isPending ? "Adding..." : "Add Step"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

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

export function IntegrationsListPage() {
  const queryClient = useQueryClient();
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
      toast.success("Execution started", {
        icon: <Play className="h-4 w-4" />,
        description: "The integration is now running in the background."
      });
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
    onError: (error: any) => {
      toast.error("Failed to start execution", {
        description: error.response?.data?.message || error.message
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/integrations/${id}`);
    },
    onSuccess: () => {
      toast.success("Integration deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
    onError: (error: any) => {
      toast.error("Failed to delete integration", {
        description: error.response?.data?.message || error.message
      });
    }
  });

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this integration? All its steps and logs will be lost.")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <Button asChild>
          <Link to="/integrations/new">
            <Plus className="mr-2 h-4 w-4" /> Add Integration
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-muted-foreground" />
            Active Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-10">Loading integrations...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Cron Expression</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                        {integration.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {integration.lastRun ? new Date(integration.lastRun).toLocaleString() : "Never"}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        title="Run Now"
                        onClick={() => runMutation.mutate(integration.id)}
                        disabled={runMutation.isPending}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" title="Details & Steps" asChild>
                        <Link to={`/integrations/${integration.id}`}>
                          <Settings className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        title="Delete"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(integration.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {integrations?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      No integrations found. Add your first integration to get started.
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


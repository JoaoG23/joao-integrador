import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
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
import { Plus, Database } from "lucide-react";

export function ConnectionsListPage() {
  const { data: connections, isLoading } = useQuery({
    queryKey: ["connections"],
    queryFn: async () => {
      const response = await api.get("/connections");
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Database Connections</h1>
        <Button asChild>
          <Link to="/connections/new">
            <Plus className="mr-2 h-4 w-4" /> Add Connection
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            Registered Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-10">Loading connections...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Database</TableHead>
                  <TableHead>Schema</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {connections?.map((conn: any) => (
                  <TableRow key={conn.id}>
                    <TableCell className="font-medium">{conn.name}</TableCell>
                    <TableCell className="capitalize">{conn.driver}</TableCell>
                    <TableCell>{conn.host}:{conn.port}</TableCell>
                    <TableCell>{conn.databaseName}</TableCell>
                    <TableCell>{conn.schema}</TableCell>
                  </TableRow>
                ))}
                {connections?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      No connections found. Add your first connection to get started.
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

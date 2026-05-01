import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { MainLayout } from "./components/layout/MainLayout";
import { ConnectionsListPage } from "./pages/connections/connections-list-page";
import { ConnectionCreatePage } from "./pages/connections/connection-create-page";
import { ConnectionEditPage } from "./pages/connections/connection-edit-page";
import { IntegrationsListPage } from "./pages/integrations/integrations-list-page";
import { IntegrationCreatePage } from "./pages/integrations/integration-create-page";
import { IntegrationEditPage } from "./pages/integrations/integration-edit-page";
import { IntegrationDetailsPage } from "./pages/integrations/integration-details-page";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster richColors position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/integrations" replace />} />
            
            <Route path="/connections" element={<ConnectionsListPage />} />
            <Route path="/connections/new" element={<ConnectionCreatePage />} />
            <Route path="/connections/:id/edit" element={<ConnectionEditPage />} />
            
            <Route path="/integrations" element={<IntegrationsListPage />} />
            <Route path="/integrations/new" element={<IntegrationCreatePage />} />
            <Route path="/integrations/:id" element={<IntegrationDetailsPage />} />
            <Route path="/integrations/:id/edit" element={<IntegrationEditPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

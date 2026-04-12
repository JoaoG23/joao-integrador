import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MainLayout } from "./components/layout/MainLayout";
import { ConnectionsListPage } from "./pages/connections/ConnectionsListPage";
import { ConnectionCreatePage } from "./pages/connections/ConnectionCreatePage";
import { ConnectionEditPage } from "./pages/connections/ConnectionEditPage";
import { IntegrationsListPage } from "./pages/integrations/IntegrationsListPage";
import { IntegrationCreatePage } from "./pages/integrations/IntegrationCreatePage";
import { IntegrationEditPage } from "./pages/integrations/IntegrationEditPage";
import { IntegrationDetailsPage } from "./pages/integrations/IntegrationDetailsPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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

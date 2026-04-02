import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navigate, Route, Routes } from "react-router";
import ClientCreatePage from "./client/new/page";
import ClientListPage from "./client/page";
import Home from "./home/page";
import Layout from "./layout";

import OrderEditPage from "./order/edit/page";
import OrderCreatePage from "./order/new/page";
import OrderListPage from "./order/page";
import PurchaseOrderDetailPage from "./purchase-order/detail/page";
import PurchaseOrderNewLayout from "./purchase-order/new/page";
import PurchaseOrderSelectPage from "./purchase-order/new/select/page";
import PurchaseOrderSummaryPage from "./purchase-order/new/summary/page";
import PurchaseOrderListPage from "./purchase-order/page";
import StatsPage from "./stats/page";
import LoginPage from "./login/page";
import { AuthGuard } from "../features/auth/components/AuthGuard";

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<AuthGuard />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/order" element={<OrderListPage />} />
            <Route path="/order/new" element={<OrderCreatePage />} />
            <Route path="/order/:id/edit" element={<OrderEditPage />} />

            <Route path="/client" element={<ClientListPage />} />
            <Route path="/client/new" element={<ClientCreatePage />} />
            <Route path="/purchase-order" element={<PurchaseOrderListPage />} />
            <Route
              path="/purchase-order/:id"
              element={<PurchaseOrderDetailPage />}
            />
            <Route
              path="/purchase-order/new"
              element={<PurchaseOrderNewLayout />}
            >
              <Route index element={<Navigate to="select" replace />} />
              <Route path="select" element={<PurchaseOrderSelectPage />} />
              <Route path="summary" element={<PurchaseOrderSummaryPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </QueryClientProvider>
  );
}

export default App;

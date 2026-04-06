import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, ShoppingBag, X } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useState, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteOrder } from "@/features/orders/api/delete-order";
import {
  getOrders,
  type OrderListItem,
  type OrdersResponse,
} from "@/features/orders/api/get-orders";
import {
  type OrderStatus,
  updateOrderStatus,
} from "@/features/orders/api/update-order-status";
import OrderCard from "@/features/orders/components/OrderCard";

export default function OrdersListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [pinnedIds, setPinnedIds] = useState<Set<number>>(new Set());

  const { data, isPending, error } = useQuery<OrdersResponse>({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const filteredOrders = useMemo(() => {
    if (!data?.orders) return [];
    let orders = data.orders;
    if (statusFilter === "active") {
      orders = orders.filter((o) => o.status !== "delivered_paid" || pinnedIds.has(o.orderId));
    } else if (statusFilter !== "all") {
      orders = orders.filter((o) => o.status === statusFilter || pinnedIds.has(o.orderId));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      orders = orders.filter(
        (o) =>
          (o.localName ?? "").toLowerCase().includes(q) ||
          String(o.orderId).includes(q),
      );
    }
    return orders;
  }, [data, search, statusFilter, pinnedIds]);

  const deleteMutation = useMutation({
    mutationFn: (payload: { orderId: number; order: OrderListItem }) =>
      deleteOrder(payload.orderId),
    onSuccess: () => {
      toast.success("Pedido eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (mutationError) => {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "No se pudo eliminar el pedido.";
      toast.error(message);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (payload: { orderId: number; status: OrderStatus }) =>
      updateOrderStatus(payload.orderId, payload.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => {
      toast.error("Error al actualizar estado");
    },
    onSettled: () => {
      setUpdatingOrderId(null);
    },
  });

  const handleDelete = (order: OrderListItem) => {
    if (deleteMutation.isPending) return;
    deleteMutation.mutate({ orderId: order.orderId, order });
  };

  const handleStatusChange = (orderId: number, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    setPinnedIds((prev) => new Set(prev).add(orderId));
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    setPinnedIds(new Set());
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-4 pt-6 pb-8 sm:px-6">

        {/* HEADER */}
        <header className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground leading-none">
                Lista de Pedidos
              </h1>
              <p className="text-xs font-medium text-muted-foreground/60 mt-0.5">
                {filteredOrders.length} de {data?.orders.length ?? 0} pedidos
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate("/order/new")}
            size="icon"
            className="h-10 w-10 rounded-full shrink-0 shadow-lg shadow-primary/20"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </header>

        {/* STATUS FILTERS */}
        <div className="-mx-4 sm:-mx-6">
          <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 sm:px-6 pb-0.5">
            {[
              { value: "active",    label: "Activos" },
              { value: "all",       label: "Todos" },
              { value: "pending",   label: "Pendiente" },
              { value: "delivered", label: "Entregado" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => handleFilterChange(f.value)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-black transition-colors border ${
                  statusFilter === f.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/40 text-muted-foreground border-border/40 hover:bg-muted/70"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 z-10 pointer-events-none" />
          <Input
            type="text"
            placeholder="Buscar por cliente o ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-full bg-muted/40 border-border/40 pl-11 pr-10 h-11 focus-visible:ring-primary/30 focus-visible:border-border/80"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted/60 text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* FEEDBACK STATES */}
        {isPending && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-border/60 bg-card p-3.5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <Skeleton className="h-2.5 w-16" />
                    <Skeleton className="h-5 w-36" />
                  </div>
                  <Skeleton className="h-7 w-20 rounded-full" />
                </div>
                <Skeleton className="h-16 w-full rounded-xl" />
                <div className="flex justify-between items-center pt-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-7 w-28" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="font-bold text-destructive">Error al cargar la lista</p>
            <p className="mt-1 text-sm text-destructive/70">
              Por favor intenta de nuevo más tarde.
            </p>
          </div>
        )}

        {!isPending && !error && data?.orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed border-border/40 rounded-2xl mt-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/40 mb-4">
              <ShoppingBag className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-black text-foreground">No hay pedidos</h3>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Creá el primer pedido con el botón +
            </p>
          </div>
        )}

        {!isPending && !error && data?.orders && filteredOrders.length === 0 && search && (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center border border-dashed border-border/40 rounded-2xl mt-4">
            <h3 className="text-base font-black text-foreground">Sin resultados</h3>
            <p className="text-sm text-muted-foreground/60 mt-1">
              No hay pedidos que coincidan con "{search}"
            </p>
            <button
              onClick={() => setSearch("")}
              className="mt-4 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
            >
              Limpiar búsqueda
            </button>
          </div>
        )}

        {/* LIST */}
        <section className="flex flex-col gap-3">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.orderId}
              id={order.orderId}
              localName={order.localName ?? "Cliente Local"}
              status={order.status}
              createdAt={order.createdAt}
              items={order.lines.map((item) => ({
                name: item.productName ?? "Producto",
                quantity: item.quantity,
                pricePerUnit: item.pricePerUnit,
                buyPriceSupplier: item.buyPriceSupplier,
              }))}
              onEdit={(orderId) => navigate(`/order/${orderId}/edit`)}
              onDelete={() => handleDelete(order)}
              onStatusChange={handleStatusChange}
              isSelected={false}
              isUpdating={updatingOrderId === order.orderId}
            />
          ))}
        </section>
      </div>
    </div>
  );
}

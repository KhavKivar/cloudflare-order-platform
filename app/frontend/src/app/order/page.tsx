import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, ShoppingBag, X } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { useOfflineStatus } from "@/hooks/use-offline";
import { useDebounce } from "@/hooks/use-debounce";
import { useWindowVirtualizer } from "@tanstack/react-virtual";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteOrder } from "@/features/orders/api/delete-order";
import { getOrders, type OrderListItem, type OrdersResponse } from "@/features/orders/api/get-orders";
import { type OrderStatus, updateOrderStatus } from "@/features/orders/api/update-order-status";
import { queryKeys } from "@/features/orders/config/constants";
import OrderCard from "@/features/orders/components/OrderCard";

export default function OrdersListPage() {
  const navigate = useNavigate();
  const { isOffline } = useOfflineStatus();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [searchByProduct, setSearchByProduct] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  const { data, isPending, isFetching, error } = useQuery<OrdersResponse>({
    queryKey: queryKeys.orders,
    queryFn: () => getOrders(),
  });

  const filteredOrders = (data?.orders ?? []).filter((order) => {
    if (statusFilter !== "all") {
      if (statusFilter === "no_oc") {
        if (order.purchaseOrderId !== null || order.status === "cancelled") return false;
      } else {
        if (order.status !== statusFilter) return false;
      }
    }

    const term = debouncedSearch.trim().toLowerCase();
    if (term) {
      if (searchByProduct) {
        const hasMatch = order.lines.some((l) =>
          l.productName?.toLowerCase().includes(term),
        );
        if (!hasMatch) return false;
      } else {
        const matchesName = order.localName?.toLowerCase().includes(term);
        const matchesId = String(order.orderId).includes(term);
        if (!matchesName && !matchesId) return false;
      }
    }

    return true;
  });

  const deleteMutation = useMutation({
    mutationFn: (payload: { orderId: number; order: OrderListItem }) =>
      deleteOrder(payload.orderId),
    onSuccess: () => {
      toast.success("Pedido eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
    },
    onSettled: () => setDeletingOrderId(null),
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
    onError: () => {
      toast.error("Error al actualizar estado");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
    },
    onSettled: () => {
      setUpdatingOrderId(null);
    },
  });

  const handleDelete = (order: OrderListItem) => {
    if (deleteMutation.isPending) return;
    if (isOffline) {
      toast.error("Esta acción requiere conexión a internet");
      return;
    }
    setDeletingOrderId(order.orderId);
    deleteMutation.mutate({ orderId: order.orderId, order });
  };

  const handleStatusChange = (orderId: number, newStatus: OrderStatus) => {
    if (isOffline) {
      toast.error("Esta acción requiere conexión a internet");
      return;
    }
    setUpdatingOrderId(orderId);
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  const parentRef = useRef(null);
  const virtualizer = useWindowVirtualizer({
    count: filteredOrders.length,
    estimateSize: () => 200,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-4 pt-6 pb-8 sm:px-6">

        {/* HEADER CARD */}
        <div className="rounded-2xl border border-border/50 bg-card shadow-sm p-4 flex flex-col gap-3">

          {/* Title row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-foreground leading-none">
                  Lista de Pedidos
                </h1>
                <p className="text-xs font-medium text-muted-foreground/60 mt-0.5 flex items-center gap-1.5">
                  {filteredOrders.length} pedidos
                  {isFetching && !isPending && (
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse" />
                  )}
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
          </div>

          {/* STATUS FILTERS */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {[
              { value: "pending",   label: "Pendiente" },
              { value: "all",       label: "Todos" },
              { value: "cancelled", label: "Cancelados" },
              { value: "no_oc",     label: "Sin OC" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => handleFilterChange(f.value)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-black transition-colors border ${
                  statusFilter === f.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border/40 hover:bg-muted/40"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* SEARCH */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 z-10 pointer-events-none" />
            <Input
              type="text"
              placeholder={searchByProduct ? "Buscar por producto..." : "Buscar por cliente o ID..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-full bg-background border-border/40 pl-11 pr-10 h-11 focus-visible:ring-primary/30 focus-visible:border-primary/30"
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

          {/* SEARCH BY PRODUCT TOGGLE */}
          <label className="flex items-center gap-2 px-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={searchByProduct}
              onChange={(e) => setSearchByProduct(e.target.checked)}
              className="h-4 w-4 rounded border-border/40 text-primary focus:ring-primary/30 focus:ring-offset-0"
            />
            <span className="text-xs font-medium text-muted-foreground">Buscar solo por producto</span>
          </label>

        </div>

        {isFetching && !isPending && (
          <div className="h-0.5 -mt-2 rounded-full bg-gradient-to-r from-primary/80 via-primary/40 to-transparent animate-pulse" />
        )}

        {/* FEEDBACK STATES */}
        {isPending && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-border/40 border-l-[3px] border-l-border/30 bg-card p-3.5 space-y-3"
                style={{ opacity: 1 - (i - 1) * 0.2 }}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <Skeleton className="h-2 w-14" />
                    <Skeleton className="h-6 w-40" />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <Skeleton className="h-7 w-24 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2 border-t border-border/20 pt-2">
                  {Array.from({ length: i === 2 ? 2 : 1 }).map((_, j) => (
                    <div key={j} className="flex justify-between items-center py-1">
                      <div className="space-y-1 flex-1 pr-4">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-2.5 w-24" />
                      </div>
                      <Skeleton className="h-3.5 w-16 shrink-0" />
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border/20 pt-2.5">
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-7 w-7 rounded-full" />
                    <Skeleton className="h-7 w-7 rounded-full" />
                    <Skeleton className="h-7 w-7 rounded-full" />
                  </div>
                  <div className="text-right space-y-1">
                    <Skeleton className="h-2 w-16 ml-auto" />
                    <Skeleton className="h-6 w-24" />
                  </div>
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

        {!isPending && !error && filteredOrders.length === 0 && !debouncedSearch.trim() && (
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

        {!isPending && !error && filteredOrders.length === 0 && debouncedSearch.trim() && (
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
        <section
          ref={parentRef}
          className="flex flex-col gap-3 relative"
          style={{ height: `${totalSize}px` }}
        >
          {virtualItems.map((virtualItem) => {
            const order = filteredOrders[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                className={virtualItem.index < filteredOrders.length - 1 ? "pb-3" : ""}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <OrderCard
                  id={order.orderId}
                  localName={order.localName ?? "Cliente Local"}
                  status={order.status}
                  purchaseOrderId={order.purchaseOrderId}
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
                  isDeleting={deletingOrderId === order.orderId}
                />
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}

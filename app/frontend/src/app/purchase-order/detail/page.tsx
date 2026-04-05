import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Calendar,
  Loader2,
  Package,
  Pencil,
  Save,
  ShoppingBasket,
  Store,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getOrdersAvailable } from "@/features/orders/api/get-order-availables";
import {
  type OrderListItem,
  type OrdersResponse,
} from "@/features/orders/api/get-orders";
import OrderCard from "@/features/orders/components/OrderCard";
import { getPurchaseOrder } from "@/features/purchase-orders/api/get-purchase-order";
import { updatePurchaseOrder } from "@/features/purchase-orders/api/update-purchase-order";
import { formatChileanPeso } from "@/utils/format-currency";

// --- TYPES & HELPERS ---

type ConsolidatedLine = {
  productId: number;
  productName: string;
  quantity: number;
  buyPriceSupplier: number;
};

type OrderLineInput = {
  productId: number;
  productName: string | null;
  buyPriceSupplier: number;
  quantity: number;
};

type OrderWithLines = { lines: OrderLineInput[] };

const buildConsolidatedLines = (orders: OrderWithLines[]): ConsolidatedLine[] => {
  const merged = new Map<number, ConsolidatedLine>();
  orders.forEach((order) => {
    order.lines.forEach((line) => {
      const existing = merged.get(line.productId);
      if (existing) {
        existing.quantity += line.quantity;
        return;
      }
      merged.set(line.productId, {
        productId: line.productId,
        productName: line.productName ?? "Producto",
        quantity: line.quantity,
        buyPriceSupplier: line.buyPriceSupplier,
      });
    });
  });
  return Array.from(merged.values());
};

// --- MAIN PAGE ---

export default function PurchaseOrderDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const purchaseOrderId = Number(id);
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);

  const { data: purchaseOrder, isPending, error } = useQuery({
    queryKey: ["purchase-order", purchaseOrderId],
    queryFn: () => getPurchaseOrder(purchaseOrderId),
    enabled: Number.isFinite(purchaseOrderId),
  });

  const { data: ordersData, isPending: ordersPending, error: ordersError } =
    useQuery<OrdersResponse>({
      queryKey: ["orders-available", purchaseOrderId],
      queryFn: () => getOrdersAvailable(purchaseOrderId),
      enabled: isEditing,
    });

  const updateMutation = useMutation({
    mutationFn: updatePurchaseOrder,
    onSuccess: () => {
      toast.success("Orden actualizada correctamente");
      queryClient.invalidateQueries({ queryKey: ["purchase-order", purchaseOrderId] });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      setIsEditing(false);
    },
    onError: () => toast.error("Error al actualizar la orden"),
  });

  const consolidated = useMemo(
    () => (purchaseOrder ? buildConsolidatedLines(purchaseOrder.orders) : []),
    [purchaseOrder],
  );

  const effectiveSelectedOrderIds = useMemo(
    () => isEditing ? selectedOrderIds : (purchaseOrder?.orders.map((o) => o.orderId) ?? []),
    [isEditing, selectedOrderIds, purchaseOrder],
  );

  const selectedOrders = useMemo(() => {
    if (!ordersData) return [];
    return ordersData.orders.filter((o) => effectiveSelectedOrderIds.includes(o.orderId));
  }, [ordersData, effectiveSelectedOrderIds]);

  const editConsolidated = useMemo(
    () => buildConsolidatedLines(selectedOrders),
    [selectedOrders],
  );

  const consolidatedTotal = useMemo(
    () => consolidated.reduce((sum, l) => sum + l.buyPriceSupplier * l.quantity, 0),
    [consolidated],
  );

  const editConsolidatedTotal = useMemo(
    () => editConsolidated.reduce((sum, l) => sum + l.buyPriceSupplier * l.quantity, 0),
    [editConsolidated],
  );

  const handleStartEdit = () => {
    if (!purchaseOrder) return;
    setSelectedOrderIds(purchaseOrder.orders.map((o) => o.orderId));
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (purchaseOrder) setSelectedOrderIds(purchaseOrder.orders.map((o) => o.orderId));
  };

  const handleToggleOrder = (order: OrderListItem) => {
    setSelectedOrderIds((prev) => {
      const current = isEditing
        ? prev
        : (purchaseOrder?.orders.map((o) => o.orderId) ?? []);
      return current.includes(order.orderId)
        ? current.filter((i) => i !== order.orderId)
        : [...current, order.orderId];
    });
  };

  const handleSaveChanges = () => {
    if (updateMutation.isPending || effectiveSelectedOrderIds.length === 0) return;
    updateMutation.mutate({ id: purchaseOrderId, orderListIds: effectiveSelectedOrderIds });
  };

  // Invalid ID
  if (!Number.isFinite(purchaseOrderId)) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="flex max-w-md flex-col items-center text-center">
          <AlertCircle className="size-10 text-destructive" />
          <h2 className="mt-4 text-lg font-black text-foreground">ID Inválido</h2>
          <p className="mt-2 text-sm text-muted-foreground">No se encontró la orden.</p>
          <Button variant="outline" className="mt-6" onClick={() => navigate("/purchase-order")}>
            Volver al listado
          </Button>
        </div>
      </div>
    );
  }

  const displayLines = isEditing ? editConsolidated : consolidated;
  const displayTotal = isEditing ? editConsolidatedTotal : consolidatedTotal;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-lg px-4 pt-5 pb-36 flex flex-col gap-4">

        {/* LOADING */}
        {isPending && (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <div className="size-10 animate-spin rounded-full border-4 border-border border-t-crimson mb-4" />
            <p className="font-bold text-sm">Cargando orden...</p>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center mt-8">
            <AlertCircle className="mx-auto size-8 text-destructive/60 mb-3" />
            <p className="font-bold text-destructive">Error al cargar la orden</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </Button>
          </div>
        )}

        {purchaseOrder && (
          <>
            {/* HEADER */}
            <header className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
                  <Package className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-black tracking-tight text-foreground leading-none">
                      Orden #{purchaseOrder.purchaseOrderId}
                    </h1>
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
                      Activa
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground/50">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(purchaseOrder.createdAt).toLocaleDateString("es-CL", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {!isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStartEdit}
                  className="h-9 rounded-xl border border-border/50 text-muted-foreground/70 hover:text-foreground hover:bg-muted/60 gap-1.5"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Modificar
                </Button>
              )}
            </header>

            {/* CONSOLIDATED CARD */}
            <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/30">
                <ShoppingBasket className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-black text-foreground/80">Consolidado</h3>
                <span className="ml-auto text-[10px] font-bold text-muted-foreground/40">
                  Total a pedir al proveedor
                </span>
              </div>

              {displayLines.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground/30">
                  <Package className="size-8 mb-2" />
                  <p className="text-sm font-bold">Sin productos</p>
                </div>
              ) : (
                <div className="divide-y divide-border/20">
                  {displayLines.map((line) => (
                    <div
                      key={line.productId}
                      className="flex items-center justify-between px-5 py-3.5"
                    >
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-4">
                        <p className="font-bold text-sm text-foreground truncate">
                          {line.productName}
                        </p>
                        <p className="text-[11px] text-muted-foreground/50 font-mono">
                          {line.quantity} unidades × {formatChileanPeso(line.buyPriceSupplier)}
                        </p>
                      </div>
                      <span className="font-black text-sm text-foreground shrink-0">
                        {formatChileanPeso(line.buyPriceSupplier * line.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="px-5 py-4 border-t border-border/30 bg-muted/20 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                    Total Estimado
                  </p>
                  <p className="text-2xl font-black text-foreground tracking-tighter mt-0.5">
                    {formatChileanPeso(displayTotal)}
                  </p>
                </div>
                <span className="text-xs font-bold text-muted-foreground/30">
                  {displayLines.length} {displayLines.length === 1 ? "producto" : "productos"}
                </span>
              </div>
            </div>

            {/* INCLUDED ORDERS — view mode */}
            {!isEditing && (
              <section className="flex flex-col gap-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">
                  Pedidos Incluidos ({purchaseOrder.orders.length})
                </h3>

                {purchaseOrder.orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border/30 rounded-2xl text-muted-foreground/30">
                    <Store className="size-7 mb-2" />
                    <p className="text-sm font-bold">Sin pedidos asociados</p>
                  </div>
                ) : (
                  purchaseOrder.orders.map((order) => {
                    const orderTotal = order.lines.reduce(
                      (acc, l) => acc + l.pricePerUnit * l.quantity,
                      0,
                    );
                    return (
                      <div
                        key={order.orderId}
                        className="rounded-xl border border-border/40 bg-card/30 p-4"
                      >
                        <div className="flex items-center justify-between mb-2.5">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                              Pedido #{order.orderId}
                            </p>
                            <p className="font-bold text-sm text-foreground">
                              {order.localName || "Cliente"}
                            </p>
                          </div>
                          <span className="font-black text-sm text-foreground">
                            {formatChileanPeso(orderTotal)}
                          </span>
                        </div>
                        <div className="rounded-lg bg-muted/30 border border-border/20 px-3 py-1.5 divide-y divide-border/15">
                          {order.lines.slice(0, 2).map((line, idx) => (
                            <div key={idx} className="flex justify-between py-1.5 text-xs">
                              <span className="text-muted-foreground/60 truncate flex-1 pr-3">
                                {line.quantity}x {line.productName}
                              </span>
                            </div>
                          ))}
                          {order.lines.length > 2 && (
                            <p className="py-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground/30">
                              + {order.lines.length - 2} productos adicionales
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </section>
            )}

            {/* EDIT MODE — order selection */}
            {isEditing && (
              <section className="flex flex-col gap-3">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1 mb-1">
                    Seleccioná los pedidos a incluir
                  </h3>
                  <p className="text-xs text-muted-foreground/40 px-1">
                    Tocá una tarjeta para incluirla o excluirla
                  </p>
                </div>

                {ordersPending && (
                  <div className="flex items-center justify-center py-12 text-muted-foreground/40">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span className="text-sm font-bold">Cargando pedidos...</span>
                  </div>
                )}

                {ordersError && (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center text-destructive text-sm font-bold">
                    Error cargando pedidos disponibles
                  </div>
                )}

                {!ordersPending && !ordersError && ordersData?.orders.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border/30 rounded-2xl text-muted-foreground/30">
                    <Package className="size-7 mb-2" />
                    <p className="text-sm font-bold">No hay pedidos disponibles</p>
                  </div>
                )}

                {ordersData?.orders.map((order) => (
                  <OrderCard
                    key={order.orderId}
                    id={order.orderId}
                    localName={order.localName ?? "Cliente Local"}
                    status={order.status}
                    createdAt={order.createdAt}
                    items={order.lines.map((i) => ({
                      name: i.productName ?? "Item",
                      quantity: i.quantity,
                      pricePerUnit: i.pricePerUnit,
                      buyPriceSupplier: i.buyPriceSupplier,
                    }))}
                    isSelected={effectiveSelectedOrderIds.includes(order.orderId)}
                    onClick={() => handleToggleOrder(order)}
                  />
                ))}
              </section>
            )}
          </>
        )}
      </div>

      {/* STICKY FOOTER — edit mode only */}
      {isEditing && (
        <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-6 pt-10 bg-gradient-to-t from-background via-background/95 to-transparent">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
            <div className="flex flex-col shrink-0">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/50">
                Seleccionados
              </span>
              <span className="text-xl font-black text-foreground leading-tight">
                {effectiveSelectedOrderIds.length} {effectiveSelectedOrderIds.length === 1 ? "Pedido" : "Pedidos"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className="h-10 rounded-xl text-muted-foreground/70 hover:bg-muted/60 gap-1.5"
              >
                <X className="h-3.5 w-3.5" />
                Cancelar
              </Button>
              <Button
                onClick={handleSaveChanges}
                disabled={selectedOrderIds.length === 0 || updateMutation.isPending}
                className="h-10 rounded-xl bg-crimson hover:bg-crimson/90 text-white font-bold shadow-lg shadow-crimson/20 disabled:opacity-40 gap-1.5"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                {updateMutation.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

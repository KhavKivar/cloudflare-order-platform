import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Calendar,
  Edit,
  Package,
  Save,
  ShoppingBasket,
  Store,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

type OrderWithLines = {
  lines: OrderLineInput[];
};

const buildConsolidatedLines = (
  orders: OrderWithLines[],
): ConsolidatedLine[] => {
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

// --- SUB-COMPONENTS FOR CLEANER RENDER ---

const ConsolidatedView = ({
  lines,
  total,
}: {
  lines: ConsolidatedLine[];
  total: number;
}) => (
  <Card className="overflow-hidden rounded-[2.5rem] border-0 bg-card shadow-xl ring-1 ring-border">
    <div className="bg-secondary px-8 py-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary-foreground/10 text-primary-foreground/70">
          <ShoppingBasket className="size-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-secondary-foreground">Consolidado</h2>
          <p className="text-xs text-secondary-foreground/60 font-medium uppercase tracking-wider">
            Total a pedir al proveedor
          </p>
        </div>
      </div>
    </div>

    <CardContent className="bg-card px-2">
      <div className="divide-y divide-border">
        {lines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/30">
            <Package className="size-12 opacity-20" />
            <p className="mt-4 text-sm font-medium">
              No hay productos en esta orden
            </p>
          </div>
        ) : (
          lines.map((line) => (
            <div
              key={line.productId}
              className="flex items-center justify-between px-6 py-5 transition-colors hover:bg-muted/50"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-foreground">
                  {line.productName}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  {line.quantity} unidades ×{" "}
                  {formatChileanPeso(line.buyPriceSupplier)}
                </span>
              </div>
              <span className="text-lg font-black text-foreground">
                {formatChileanPeso(line.buyPriceSupplier * line.quantity)}
              </span>
            </div>
          ))
        )}
      </div>
    </CardContent>

    <div className="bg-primary/5 px-8 py-6 border-t border-primary/10">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/50">
            Total Estimado
          </span>
          <div className="text-3xl font-black text-primary">
            {formatChileanPeso(total)}
          </div>
        </div>
      </div>
    </div>
  </Card>
);

// --- MAIN PAGE COMPONENT ---

export default function PurchaseOrderDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const purchaseOrderId = Number(id);
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);

  // 1. Queries
  const {
    data: purchaseOrder,
    isPending,
    error,
  } = useQuery({
    queryKey: ["purchase-order", purchaseOrderId],
    queryFn: () => getPurchaseOrder(purchaseOrderId),
    enabled: Number.isFinite(purchaseOrderId),
  });

  const {
    data: ordersData,
    isPending: ordersPending,
    error: ordersError,
  } = useQuery<OrdersResponse>({
    queryKey: ["orders"],
    queryFn: () => getOrdersAvailable(purchaseOrderId),
    enabled: isEditing,
  });

  // 2. Mutations
  const updateMutation = useMutation({
    mutationFn: updatePurchaseOrder,
    onSuccess: () => {
      toast.success("Orden actualizada correctamente");
      queryClient.invalidateQueries({
        queryKey: ["purchase-order", purchaseOrderId],
      });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      setIsEditing(false);
    },
    onError: () => toast.error("Error al actualizar la orden"),
  });

  // 3. Effects & Memos
  const consolidated = useMemo(
    () => (purchaseOrder ? buildConsolidatedLines(purchaseOrder.orders) : []),
    [purchaseOrder],
  );

  // Initialize selectedOrderIds when not editing
  const effectiveSelectedOrderIds = useMemo(
    () =>
      isEditing
        ? selectedOrderIds
        : (purchaseOrder?.orders.map((o) => o.orderId) ?? []),
    [isEditing, selectedOrderIds, purchaseOrder],
  );

  const selectedOrders = useMemo(() => {
    if (!ordersData) return [];
    return ordersData.orders.filter((o) =>
      effectiveSelectedOrderIds.includes(o.orderId),
    );
  }, [ordersData, effectiveSelectedOrderIds]);

  const editConsolidated = useMemo(
    () => buildConsolidatedLines(selectedOrders),
    [selectedOrders],
  );

  const consolidatedTotal = useMemo(
    () =>
      consolidated.reduce(
        (sum, line) => sum + line.buyPriceSupplier * line.quantity,
        0,
      ),
    [consolidated],
  );

  const editConsolidatedTotal = useMemo(
    () =>
      editConsolidated.reduce(
        (sum, line) => sum + line.buyPriceSupplier * line.quantity,
        0,
      ),
    [editConsolidated],
  );

  // 4. Handlers
  const handleStartEdit = () => {
    if (!purchaseOrder) return;
    setSelectedOrderIds(purchaseOrder.orders.map((o) => o.orderId));
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (purchaseOrder)
      setSelectedOrderIds(purchaseOrder.orders.map((o) => o.orderId));
  };

  const handleToggleOrder = (order: OrderListItem) => {
    setSelectedOrderIds((prev) => {
      const current = isEditing
        ? prev
        : (purchaseOrder?.orders.map((o) => o.orderId) ?? []);
      return current.includes(order.orderId)
        ? current.filter((id) => id !== order.orderId)
        : [...current, order.orderId];
    });
  };

  const handleSaveChanges = () => {
    if (updateMutation.isPending || effectiveSelectedOrderIds.length === 0)
      return;
    updateMutation.mutate({
      id: purchaseOrderId,
      orderListIds: effectiveSelectedOrderIds,
    });
  };

  // 5. Early Returns (Invalid ID)
  if (!Number.isFinite(purchaseOrderId)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50 p-6">
        <div className="flex max-w-md flex-col items-center text-center">
          <AlertCircle className="size-12 text-destructive" />
          <h2 className="mt-4 text-xl font-bold text-foreground">ID Inválido</h2>
          <p className="mt-2 text-muted-foreground">
            No se pudo encontrar la orden solicitada.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => navigate("/purchase-order")}
          >
            Volver al listado
          </Button>
        </div>
      </div>
    );
  }

  // 6. Main Render
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pt-6 sm:px-6 sm:pt-10">
        {isPending && (
          <div className="py-10 text-center text-muted-foreground">
            Cargando información...
          </div>
        )}

        {error && (
          <Card className="border-destructive/20 bg-destructive/10 p-6 text-center text-destructive">
            <p className="font-medium">Error al cargar la orden de compra.</p>
            <Button
              variant="outline"
              className="mt-4 border-destructive/30 bg-background"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </Button>
          </Card>
        )}

        {purchaseOrder && (
          <>
            {/* CABECERA PRINCIPAL */}
            <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <Package className="size-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-black tracking-tight text-foreground">
                      Orden #{purchaseOrder.purchaseOrderId}
                    </h1>
                    <span className="rounded-full bg-success/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-success">
                      Activa
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-sm font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-4 text-muted-foreground/70" />
                      <span>
                        {new Date(purchaseOrder.createdAt).toLocaleDateString(
                          "es-CL",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTONES DE ACCIÓN */}
              {!isEditing ? (
                <Button
                  variant="outline"
                  onClick={handleStartEdit}
                  className="group h-12 w-full justify-center rounded-2xl border-border px-6 font-bold shadow-sm transition-all hover:bg-muted hover:ring-2 hover:ring-primary/10 sm:w-auto"
                >
                  <Edit className="mr-2 size-4 text-primary transition-transform group-hover:scale-110" />
                  Modificar Orden
                </Button>
              ) : (
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                  <Button
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="h-12 w-full rounded-2xl font-bold text-muted-foreground hover:bg-muted sm:w-auto"
                  >
                    <X className="mr-2 size-4" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveChanges}
                    disabled={
                      selectedOrderIds.length === 0 || updateMutation.isPending
                    }
                    className="h-12 w-full rounded-2xl px-8 font-black shadow-lg shadow-primary/10 sm:w-auto"
                  >
                    {updateMutation.isPending ? (
                      "Guardando..."
                    ) : (
                      <>
                        <Save className="mr-2 size-4" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </div>
              )}
            </header>

            {/* CONTENIDO PRINCIPAL - GRID RESPONSIVO */}
            <main className="grid gap-8 lg:grid-cols-12 lg:items-start">
              {/* COLUMNA IZQUIERDA: LISTA DE PEDIDOS */}
              <div className="space-y-6 lg:col-span-7">
                {isEditing ? (
                  <div className="rounded-3xl border border-primary/10 bg-card p-6 shadow-sm">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-foreground">
                        Selección de Pedidos
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Marca los pedidos que deseas incluir en esta orden de
                        compra.
                      </p>
                    </div>

                    {ordersPending ? (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        Cargando pedidos disponibles...
                      </div>
                    ) : ordersError ? (
                      <div className="py-8 text-center text-sm text-destructive">
                        Error cargando pedidos.
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-1">
                        {ordersData?.orders.map((order) => (
                          <OrderCard
                            key={order.orderId}
                            id={order.orderId}
                            localName={order.localName ?? "Cliente Local"}
                            status={order.status}
                            createdAt={order.createdAt}
                            // Mapeo simplificado para la tarjeta de selección
                            items={order.lines.map((i) => ({
                              name: i.productName ?? "Item",
                              quantity: i.quantity,
                              pricePerUnit: i.pricePerUnit,
                              buyPriceSupplier: i.buyPriceSupplier,
                            }))}
                            isSelected={effectiveSelectedOrderIds.includes(
                              order.orderId,
                            )}
                            onClick={() => handleToggleOrder(order)}
                          />
                        ))}
                        {ordersData?.orders.length === 0 && (
                          <p className="text-center text-sm text-muted-foreground">
                            No hay más pedidos disponibles.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="ml-1 text-lg font-bold text-foreground">
                      Pedidos Incluidos ({purchaseOrder.orders.length})
                    </h3>
                    {purchaseOrder.orders.length === 0 ? (
                      <Card className="flex flex-col items-center justify-center p-8 text-muted-foreground border-dashed">
                        <Store className="size-8 opacity-20" />
                        <p className="mt-2 text-sm">
                          Esta orden no tiene pedidos asociados.
                        </p>
                      </Card>
                    ) : (
                      purchaseOrder.orders.map((order) => {
                        const orderTotal = order.lines.reduce(
                          (acc, l) => acc + l.pricePerUnit * l.quantity,
                          0,
                        );
                        return (
                          <Card
                            key={order.orderId}
                            className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-border/80"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    #{order.orderId}
                                  </span>
                                  <h4 className="font-bold text-foreground">
                                    {order.localName || "Cliente"}
                                  </h4>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {new Date(order.createdAt).toLocaleDateString(
                                    "es-CL",
                                  )}
                                </p>
                              </div>
                              <span className="font-semibold text-foreground">
                                {formatChileanPeso(orderTotal)}
                              </span>
                            </div>
                            {/* Preview rápido de items (solo los primeros 2) */}
                            <div className="mt-3 space-y-1 border-t border-border pt-3">
                              {order.lines.map((line, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between text-xs text-muted-foreground"
                                >
                                  <span>
                                    {line.quantity}x {line.productName}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </Card>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* COLUMNA DERECHA: CONSOLIDADO (Sticky en Desktop) */}
              <div className="lg:sticky lg:top-8 lg:col-span-5">
                {isEditing ? (
                  <ConsolidatedView
                    lines={editConsolidated}
                    total={editConsolidatedTotal}
                  />
                ) : (
                  <ConsolidatedView
                    lines={consolidated}
                    total={consolidatedTotal}
                  />
                )}
              </div>
            </main>
          </>
        )}
      </div>
    </div>
  );
}

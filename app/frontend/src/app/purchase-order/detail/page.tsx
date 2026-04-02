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

import { Button } from "@/components/ui/Button/button";
import { Card } from "@/components/ui/Card/card";
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
  <Card className="overflow-hidden rounded-[2.5rem] border-0 bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-100">
    <div className="bg-slate-900 px-8 py-6 text-white">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-indigo-400">
          <ShoppingBasket className="size-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Consolidado</h2>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Total a pedir al proveedor
          </p>
        </div>
      </div>
    </div>

    <div className="bg-white px-2">
      <div className="divide-y divide-slate-100">
        {lines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-300">
            <Package className="size-12 opacity-20" />
            <p className="mt-4 text-sm font-medium">
              No hay productos en esta orden
            </p>
          </div>
        ) : (
          lines.map((line) => (
            <div
              key={line.productId}
              className="flex items-center justify-between px-6 py-5 transition-colors hover:bg-slate-50/50"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-slate-900">
                  {line.productName}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {line.quantity} unidades ×{" "}
                  {formatChileanPeso(line.buyPriceSupplier)}
                </span>
              </div>
              <span className="text-lg font-black text-slate-900">
                {formatChileanPeso(line.buyPriceSupplier * line.quantity)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>

    <div className="bg-indigo-50/50 px-8 py-6 border-t border-indigo-100/50">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
            Total Estimado
          </span>
          <div className="text-3xl font-black text-indigo-600">
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50/50 p-6">
        <div className="flex max-w-md flex-col items-center text-center">
          <AlertCircle className="size-12 text-rose-400" />
          <h2 className="mt-4 text-xl font-bold text-slate-900">ID Inválido</h2>
          <p className="mt-2 text-slate-500">
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
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pt-6 sm:px-6 sm:pt-10">
        {isPending && (
          <div className="py-10 text-center text-slate-500">
            Cargando información...
          </div>
        )}

        {error && (
          <Card className="border-rose-100 bg-rose-50 p-6 text-center text-rose-700">
            <p className="font-medium">Error al cargar la orden de compra.</p>
            <Button
              variant="outline"
              className="mt-4 border-rose-200 bg-white"
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
                <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                  <Package className="size-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">
                      Orden #{purchaseOrder.purchaseOrderId}
                    </h1>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Activa
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-sm font-medium text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-4 text-slate-400" />
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
                  className="group h-12 w-full justify-center rounded-2xl border-slate-200 bg-white px-6 font-bold shadow-sm transition-all hover:bg-slate-50 hover:ring-2 hover:ring-indigo-100 sm:w-auto"
                >
                  <Edit className="mr-2 size-4 text-indigo-500 transition-transform group-hover:scale-110" />
                  Modificar Orden
                </Button>
              ) : (
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                  <Button
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="h-12 w-full rounded-2xl font-bold text-slate-500 hover:bg-slate-100 sm:w-auto"
                  >
                    <X className="mr-2 size-4" />
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSaveChanges}
                    disabled={
                      selectedOrderIds.length === 0 || updateMutation.isPending
                    }
                    className="h-12 w-full rounded-2xl px-8 font-black shadow-lg shadow-indigo-100 sm:w-auto"
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
                  <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-slate-900">
                        Selección de Pedidos
                      </h3>
                      <p className="text-sm text-slate-500">
                        Marca los pedidos que deseas incluir en esta orden de
                        compra.
                      </p>
                    </div>

                    {ordersPending ? (
                      <div className="py-8 text-center text-sm text-slate-400">
                        Cargando pedidos disponibles...
                      </div>
                    ) : ordersError ? (
                      <div className="py-8 text-center text-sm text-rose-500">
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
                          <p className="text-center text-sm text-slate-500">
                            No hay más pedidos disponibles.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="ml-1 text-lg font-bold text-slate-900">
                      Pedidos Incluidos ({purchaseOrder.orders.length})
                    </h3>
                    {purchaseOrder.orders.length === 0 ? (
                      <Card className="flex flex-col items-center justify-center p-8 text-slate-400 border-dashed">
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
                            className="rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    #{order.orderId}
                                  </span>
                                  <h4 className="font-bold text-slate-900">
                                    {order.localName || "Cliente"}
                                  </h4>
                                </div>
                                <p className="mt-1 text-xs text-slate-500">
                                  {new Date(order.createdAt).toLocaleDateString(
                                    "es-CL",
                                  )}
                                </p>
                              </div>
                              <span className="font-semibold text-slate-900">
                                {formatChileanPeso(orderTotal)}
                              </span>
                            </div>
                            {/* Preview rápido de items (solo los primeros 2) */}
                            <div className="mt-3 space-y-1 border-t border-slate-100 pt-3">
                              {order.lines.map((line, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between text-xs text-slate-600"
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

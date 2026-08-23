import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  Copy,
  Loader2,
  Package,
  Pencil,
  Save,
  ShoppingBasket,
  Store,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { useOfflineStatus } from "@/hooks/use-offline";

import { Button } from "@/components/ui/button";
import { getOrdersAvailable } from "@/features/orders/api/get-order-availables";
import {
  type OrderListItem,
  type OrdersResponse,
} from "@/features/orders/api/get-orders";
import { type PurchaseOrderDetail } from "@/features/purchase-orders/api/get-purchase-order";
import { type PurchaseOrdersResponse } from "@/features/purchase-orders/api/get-purchase-orders";
import OrderCard from "@/features/orders/components/OrderCard";
import { updatePurchaseOrder } from "@/features/purchase-orders/api/update-purchase-order";
import {
  updatePurchaseOrderStatus,
  type PurchaseOrderStatus,
} from "@/features/purchase-orders/api/update-purchase-order-status";
import { purchaseOrderKeys, purchaseOrderFns } from "@/features/purchase-orders/config/constants";
import { cn } from "@/lib/utils";
import { formatChileanPeso } from "@/utils/format-currency";

const STATUS_CONFIG: Record<string, { label: string; style: string }> = {
  pending:   { label: "Pendiente", style: "bg-amber-500/20 text-amber-400 border border-amber-500/20" },
  received:  { label: "Recibido",  style: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
  paid:      { label: "Pagado",    style: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
  cancelled: { label: "Cancelado", style: "bg-muted text-muted-foreground border border-border" },
};

const SWITCHABLE_STATUSES = new Set(["pending", "received", "paid"]);

const SEGMENTED_OPTIONS: { value: PurchaseOrderStatus; label: string; activeClass: string }[] = [
  { value: "pending",  label: "Pendiente", activeClass: "bg-warning/15 text-warning border-warning/20" },
  { value: "received", label: "Recibido",  activeClass: "bg-primary/10 text-primary border-primary/20" },
  { value: "paid",     label: "Pagado",    activeClass: "bg-emerald/10 text-emerald border-emerald/20" },
];

// --- TYPES & HELPERS ---

type ConsolidatedLine = {
  productId: number;
  productName: string;
  quantity: number;
  buyPriceSupplier: number;
  sizeMl?: number | null;
  batchSize?: number | null;
};

type OrderLineInput = {
  productId: number;
  productName: string | null;
  buyPriceSupplier: number;
  quantity: number;
  sizeMl?: number | null;
  batchSize?: number | null;
};

type OrderWithLines = { lines: OrderLineInput[] };

type PurchasePriceDifference = {
  productId: number;
  productName: string;
  prices: number[];
};

const is200mlProduct = (sizeMl?: number | null, productName?: string | null): boolean => {
  if (sizeMl === 200) return true;
  if (productName && /200\s*ml/i.test(productName)) return true;
  return false;
};

const formatQuantityFor200ml = (
  quantity: number,
  batchSize?: number | null,
  sizeMl?: number | null,
  productName?: string | null,
): string | null => {
  if (!is200mlProduct(sizeMl, productName)) return null;
  const batch = batchSize && batchSize > 0 ? batchSize : 48;
  const cajas = Math.floor(quantity / batch);
  if (cajas === 0) return null;
  const resto = quantity % batch;
  if (resto === 0) {
    return `${cajas} ${cajas === 1 ? "caja" : "cajas"} (${quantity} un)`;
  }
  return `${cajas} ${cajas === 1 ? "caja" : "cajas"} + ${resto} un (${quantity} un)`;
};

const formatCopyLine = (
  line: { productName: string; quantity: number; buyPriceSupplier: number; sizeMl?: number | null; batchSize?: number | null },
): string => {
  const cajasText = formatQuantityFor200ml(line.quantity, line.batchSize, line.sizeMl, line.productName);
  if (cajasText) {
    return `• ${line.productName}: ${cajasText} x ${formatChileanPeso(line.buyPriceSupplier)} = ${formatChileanPeso(line.buyPriceSupplier * line.quantity)}`;
  }
  return `• ${line.productName}: ${line.quantity} x ${formatChileanPeso(line.buyPriceSupplier)} = ${formatChileanPeso(line.buyPriceSupplier * line.quantity)}`;
};

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
        sizeMl: line.sizeMl ?? null,
        batchSize: line.batchSize ?? null,
      });
    });
  });
  return Array.from(merged.values());
};

const findPurchasePriceDifferences = (
  orders: OrderWithLines[],
): PurchasePriceDifference[] => {
  const products = new Map<number, { productName: string; prices: Set<number> }>();

  orders.forEach((order) => {
    order.lines.forEach((line) => {
      const existing = products.get(line.productId);
      if (existing) {
        existing.prices.add(line.buyPriceSupplier);
        return;
      }
      products.set(line.productId, {
        productName: line.productName ?? "Producto",
        prices: new Set([line.buyPriceSupplier]),
      });
    });
  });

  return Array.from(products.entries())
    .filter(([, product]) => product.prices.size > 1)
    .map(([productId, product]) => ({
      productId,
      productName: product.productName,
      prices: Array.from(product.prices).sort((a, b) => a - b),
    }));
};

// --- MAIN PAGE ---

export default function PurchaseOrderDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isOffline } = useOfflineStatus();
  const purchaseOrderId = Number(id);
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [showStatusStrip, setShowStatusStrip] = useState(false);
  const [purchasePriceOverrides, setPurchasePriceOverrides] = useState<Record<number, string>>({});

  const updateStatusMutation = useMutation({
    mutationFn: (status: PurchaseOrderStatus) =>
      updatePurchaseOrderStatus(purchaseOrderId, status),
    onMutate: async (status) => {
      await queryClient.cancelQueries({ queryKey: purchaseOrderKeys.detail(purchaseOrderId) });
      await queryClient.cancelQueries({ queryKey: purchaseOrderKeys.all });
      const snapshotDetail = queryClient.getQueryData<PurchaseOrderDetail>(purchaseOrderKeys.detail(purchaseOrderId));
      const snapshotAll = queryClient.getQueryData<PurchaseOrdersResponse>(purchaseOrderKeys.all);
      queryClient.setQueryData<PurchaseOrderDetail>(purchaseOrderKeys.detail(purchaseOrderId), (old) =>
        old ? { ...old, status } : old,
      );
      queryClient.setQueryData<PurchaseOrdersResponse>(purchaseOrderKeys.all, (old) => {
        if (!old) return old;
        return { ...old, orders: old.orders.map((o) => o.purchaseOrderId === purchaseOrderId ? { ...o, status } : o) };
      });
      return { snapshotDetail, snapshotAll };
    },
    onError: (_, __, context) => {
      if (context?.snapshotDetail) queryClient.setQueryData(purchaseOrderKeys.detail(purchaseOrderId), context.snapshotDetail);
      if (context?.snapshotAll) queryClient.setQueryData(purchaseOrderKeys.all, context.snapshotAll);
      toast.error("No se pudo actualizar el estado.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(purchaseOrderId) });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.all });
      setShowStatusStrip(false);
    },
  });

  const { data: purchaseOrder, isPending, error } = useQuery({
    queryKey: purchaseOrderKeys.detail(purchaseOrderId),
    queryFn: purchaseOrderFns.detail(purchaseOrderId),
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
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: purchaseOrderKeys.detail(purchaseOrderId) });
      await queryClient.cancelQueries({ queryKey: purchaseOrderKeys.all });

      const snapshotDetail = queryClient.getQueryData<PurchaseOrderDetail>(purchaseOrderKeys.detail(purchaseOrderId));
      const snapshotAll = queryClient.getQueryData<PurchaseOrdersResponse>(purchaseOrderKeys.all);

      const optimisticOrders = ordersData?.orders
        .filter((o) => payload.orderListIds.includes(o.orderId))
        .map((o) => ({
          orderId: o.orderId,
          createdAt: o.createdAt,
          localName: o.localName,
          phone: o.phone,
          lines: o.lines.map((l) => ({
            lineId: l.lineId,
            productId: l.productId,
            productName: l.productName,
            pricePerUnit: l.pricePerUnit,
            buyPriceSupplier: l.buyPriceSupplier,
            quantity: l.quantity,
            lineTotal: l.lineTotal,
            sizeMl: (l as { sizeMl?: number | null }).sizeMl ?? null,
            batchSize: (l as { batchSize?: number | null }).batchSize ?? null,
          })),
        })) ?? snapshotDetail?.orders ?? [];

      queryClient.setQueryData<PurchaseOrderDetail>(purchaseOrderKeys.detail(purchaseOrderId), (old) =>
        old ? { ...old, orders: optimisticOrders } : old,
      );

      const consolidatedLines = new Map<number, { productId: number; productName: string | null; buyPriceSupplier: number; sellPriceClient: number; quantity: number; sizeMl?: number | null; batchSize?: number | null }>();
      optimisticOrders.forEach((o) => {
        o.lines.forEach((l) => {
          const existing = consolidatedLines.get(l.productId);
          if (existing) {
            existing.quantity += l.quantity;
          } else {
            consolidatedLines.set(l.productId, {
              productId: l.productId,
              productName: l.productName,
              buyPriceSupplier: l.buyPriceSupplier,
              sellPriceClient: 0,
              quantity: l.quantity,
              sizeMl: (l as { sizeMl?: number | null }).sizeMl ?? null,
              batchSize: (l as { batchSize?: number | null }).batchSize ?? null,
            });
          }
        });
      });

      queryClient.setQueryData<PurchaseOrdersResponse>(purchaseOrderKeys.all, (old) => {
        if (!old) return old;
        return {
          ...old,
          orders: old.orders.map((o) =>
            o.purchaseOrderId === purchaseOrderId
              ? { ...o, lines: Array.from(consolidatedLines.values()) }
              : o,
          ),
        };
      });

      return { snapshotDetail, snapshotAll };
    },
    onError: (_, __, context) => {
      if (context?.snapshotDetail) queryClient.setQueryData(purchaseOrderKeys.detail(purchaseOrderId), context.snapshotDetail);
      if (context?.snapshotAll) queryClient.setQueryData(purchaseOrderKeys.all, context.snapshotAll);
      toast.error("Error al actualizar la orden");
    },
    onSuccess: () => {
      toast.success("Orden actualizada correctamente");
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(purchaseOrderId) });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.all });
      setIsEditing(false);
    },
  });

  const consolidated = useMemo(
    () => (purchaseOrder ? buildConsolidatedLines(purchaseOrder.orders) : []),
    [purchaseOrder],
  );

  const purchasePriceDifferences = useMemo(
    () => (purchaseOrder ? findPurchasePriceDifferences(purchaseOrder.orders) : []),
    [purchaseOrder],
  );

  const pricedConsolidated = useMemo(
    () => consolidated.map((line) => {
      const override = Number(purchasePriceOverrides[line.productId]);
      return Number.isFinite(override) && override > 0
        ? { ...line, buyPriceSupplier: override }
        : line;
    }),
    [consolidated, purchasePriceOverrides],
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
    () => pricedConsolidated.reduce((sum, l) => sum + l.buyPriceSupplier * l.quantity, 0),
    [pricedConsolidated],
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
    if (isOffline) {
      toast.error("Esta acción requiere conexión a internet");
      return;
    }
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

  const displayLines = isEditing ? editConsolidated : pricedConsolidated;
  const displayTotal = isEditing ? editConsolidatedTotal : consolidatedTotal;

  const handleCopy = () => {
    if (!purchaseOrder) return;
    const orderText = [
      `📦 Orden de Compra #${purchaseOrder.purchaseOrderId}`,
      `🗓️ Fecha: ${new Date(purchaseOrder.createdAt).toLocaleDateString("es-CL")}`,
      "",
      ...displayLines.map((line) => formatCopyLine(line)),
      "",
      `💰 Total: ${formatChileanPeso(displayTotal)}`,
      "Total a pedir al proveedor",
    ].join("\n");
    try {
      navigator.clipboard.writeText(orderText);
      toast.success("Orden copiada al portapapeles");
    } catch {
      toast.error("Error al copiar");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-lg px-4 pt-5 pb-36 flex flex-col gap-4">

        {/* LOADING */}
        {isPending && (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <div className="size-10 animate-spin rounded-full border-4 border-border border-t-primary mb-4" />
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
            {/* HEADER CARD */}
            <div className="rounded-2xl border border-border/50 bg-card shadow-sm p-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
                  <Package className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-black tracking-tight text-foreground leading-none">
                      Orden #{purchaseOrder.purchaseOrderId}
                    </h1>
                    {SWITCHABLE_STATUSES.has(purchaseOrder.status) ? (
                      <button
                        className={cn(
                          "flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wider transition-opacity",
                          STATUS_CONFIG[purchaseOrder.status]?.style ?? STATUS_CONFIG.pending.style,
                          updateStatusMutation.isPending && "opacity-50",
                        )}
                        onClick={() => setShowStatusStrip((v) => !v)}
                      >
                        {STATUS_CONFIG[purchaseOrder.status]?.label ?? "Pendiente"}
                        <ChevronDown className={cn("h-2.5 w-2.5 transition-transform", showStatusStrip && "rotate-180")} />
                      </button>
                    ) : (
                      <span className={cn(
                        "rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wider",
                        STATUS_CONFIG[purchaseOrder.status]?.style ?? STATUS_CONFIG.pending.style,
                      )}>
                        {STATUS_CONFIG[purchaseOrder.status]?.label ?? "Pendiente"}
                      </span>
                    )}
                  </div>
                  {showStatusStrip && (
                    <div className="flex gap-1.5 mt-2 rounded-xl border border-border/30 bg-background p-1.5">
                      {SEGMENTED_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          disabled={isOffline || updateStatusMutation.isPending}
                          title={isOffline ? "Sin conexión" : undefined}
                          onClick={() => {
                            if (isOffline) {
                              toast.error("Esta acción requiere conexión a internet");
                              return;
                            }
                            updateStatusMutation.mutate(opt.value);
                          }}
                          className={cn(
                            "flex-1 rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition-all border",
                            purchaseOrder.status === opt.value
                              ? opt.activeClass
                              : "border-transparent text-muted-foreground/50 hover:bg-muted/60 hover:text-foreground",
                            updateStatusMutation.isPending && "opacity-50 cursor-not-allowed",
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 mt-0.5 text-sm text-muted-foreground/70">
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

              <div className="flex items-center gap-1 shrink-0">
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
              </div>
            </div>

            {/* COPY DETAILS — after order, before consolidado */}
            <Button
              variant="outline"
              onClick={handleCopy}
              className="w-full rounded-xl bg-card border-border/50 shadow-sm gap-2 font-bold hover:bg-card/80"
            >
              <Copy className="h-4 w-4" />
              Copiar detalles
            </Button>

            {!isEditing && purchasePriceDifferences.length > 0 && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-amber-700 dark:text-amber-400">
                    Hay productos con distintos precios de compra
                  </p>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-foreground/80">
                    Define el precio que se usará en este consolidado. Este cambio solo se aplica en esta pantalla.
                  </p>
                  <div className="mt-3 flex flex-col gap-3">
                    {purchasePriceDifferences.map((product) => {
                      const currentPrice = consolidated.find(
                        (line) => line.productId === product.productId,
                      )?.buyPriceSupplier;

                      return (
                        <label key={product.productId} className="flex flex-col gap-1.5">
                          <span className="text-xs leading-relaxed text-foreground">
                            <span className="font-black">{product.productName}:</span>{" "}
                            <span className="font-bold text-foreground/80">
                              {product.prices.map(formatChileanPeso).join(" y ")}
                            </span>
                          </span>
                          <div className="flex items-center rounded-lg border border-amber-500/25 bg-background/80 focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/20">
                            <span className="pl-3 text-sm font-bold text-muted-foreground">$</span>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              inputMode="numeric"
                              aria-label={`Precio de compra de ${product.productName}`}
                              value={purchasePriceOverrides[product.productId] ?? String(currentPrice ?? "")}
                              onChange={(event) => setPurchasePriceOverrides((current) => ({
                                ...current,
                                [product.productId]: event.target.value,
                              }))}
                              className="h-10 w-full bg-transparent px-2 text-sm font-bold text-foreground outline-none"
                            />
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* CONSOLIDATED CARD */}
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/30">
                <ShoppingBasket className="h-4 w-4 text-amber-400" />
                <h3 className="text-base font-black text-foreground">Consolidado</h3>
                <span className="ml-auto text-xs font-medium text-muted-foreground/60">
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
                        <p className="font-bold text-base text-foreground truncate">
                          {line.productName}
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          {formatQuantityFor200ml(line.quantity, line.batchSize, line.sizeMl, line.productName) ?? `${line.quantity} unidades`} × {formatChileanPeso(line.buyPriceSupplier)}
                        </p>
                      </div>
                      <span className="font-black text-base text-foreground shrink-0">
                        {formatChileanPeso(line.buyPriceSupplier * line.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="px-5 py-4 border-t border-border/30 bg-muted/20 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                    Total Estimado
                  </p>
                  <p className="text-3xl font-black text-foreground tracking-tighter mt-0.5">
                    {formatChileanPeso(displayTotal)}
                  </p>
                </div>
                <span className="text-sm font-medium text-muted-foreground/60">
                  {displayLines.length} {displayLines.length === 1 ? "producto" : "productos"}
                </span>
              </div>
            </div>

            {/* INCLUDED ORDERS — view mode */}
            {!isEditing && (
              <section className="flex flex-col gap-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 px-1">
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
                        className="rounded-xl border border-border/40 bg-card shadow-sm p-4"
                      >
                        <div className="flex items-center justify-between mb-2.5">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                              Pedido #{order.orderId}
                            </p>
                            <p className="font-bold text-base text-foreground">
                              {order.localName || "Cliente"}
                            </p>
                          </div>
                          <span className="font-black text-base text-foreground">
                            {formatChileanPeso(orderTotal)}
                          </span>
                        </div>
                        <div className="divide-y divide-border/20 mt-1">
                          {order.lines.map((line, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-3 py-2 text-sm">
                              <span className="text-muted-foreground/70 truncate flex-1 pr-3">
                                {line.quantity}x {line.productName}
                              </span>
                              <span className="shrink-0 text-right text-xs text-muted-foreground/70">
                                <span className="block font-medium text-foreground/80">
                                  {formatChileanPeso(line.buyPriceSupplier)} c/u
                                </span>
                                Precio de compra
                              </span>
                            </div>
                          ))}
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
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 px-1 mb-1">
                    Seleccioná los pedidos a incluir
                  </h3>
                  <p className="text-sm text-muted-foreground/60 px-1">
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
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                Seleccionados
              </span>
              <span className="text-2xl font-black text-foreground leading-tight">
                {effectiveSelectedOrderIds.length} {effectiveSelectedOrderIds.length === 1 ? "Pedido" : "Pedidos"}
              </span>
            </div>
            <div className="flex items-center gap-2">
<Button
                  onClick={handleSaveChanges}
                  disabled={isOffline || selectedOrderIds.length === 0 || updateMutation.isPending}
                  title={isOffline ? "Sin conexión" : undefined}
                  className="h-10 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 disabled:opacity-40 gap-1.5"
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

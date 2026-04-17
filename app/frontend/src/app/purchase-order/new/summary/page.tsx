import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PurchaseOrdersResponse } from "@/features/purchase-orders/api/get-purchase-orders";
import {
  ChevronRight,
  Info,
  Loader2,
  Package,
  PackageSearch,
  ShoppingBag,
} from "lucide-react";
import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import {
  cleanSelectedPurchaseOrder,
  selectedPurchaseOrder,
} from "@/app/purchaseOrderSlice";
import { Button } from "@/components/ui/button";
import { createPurchaseOrder } from "@/features/purchase-orders/api/create-purchase-orders";
import { purchaseOrderKeys } from "@/features/purchase-orders/config/constants";
import { useAppSelector } from "@/hooks/redux.hooks";
import { cn } from "@/lib/utils";
import { formatChileanPeso } from "@/utils/format-currency";

type PurchaseItem = {
  productId: number;
  name: string;
  quantity: number;
  pricePerUnit: number;
};

export default function PurchaseOrderSummaryPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedOrders = useAppSelector(selectedPurchaseOrder);

  const queryClient = useQueryClient();

  const purchaseOrderMutation = useMutation({
    mutationFn: createPurchaseOrder,
    onSuccess: (created) => {
      const optimisticOrder = {
        purchaseOrderId: created.purchaseOrder.id,
        createdAt: created.purchaseOrder.createdAt,
        status: created.purchaseOrder.status,
        lines: purchaseItems.map((item) => ({
          productId: item.productId,
          productName: item.name,
          quantity: item.quantity,
          buyPriceSupplier: item.pricePerUnit,
          sellPriceClient: 0,
        })),
      };

      queryClient.setQueryData<PurchaseOrdersResponse>(purchaseOrderKeys.all, (old) => ({
        orders: [optimisticOrder, ...(old?.orders ?? [])],
      }));
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.all });

      dispatch(cleanSelectedPurchaseOrder());
      navigate("/purchase-order", { replace: true });
      toast.success("Orden de compra creada correctamente");
    },
    onError: () => {
      toast.error("No se pudo crear la orden de compra");
    },
  });

  const purchaseItems = useMemo<PurchaseItem[]>(() => {
    const merged = new Map<number, PurchaseItem>();
    selectedOrders.forEach((order) => {
      order.lines.forEach((line) => {
        const existing = merged.get(line.productId);
        if (existing) {
          existing.quantity += line.quantity;
          return;
        }
        merged.set(line.productId, {
          productId: line.productId,
          name: line.productName ?? "Producto",
          quantity: line.quantity,
          pricePerUnit:
            (line as { buyPriceSupplier?: number }).buyPriceSupplier ??
            line.pricePerUnit,
        });
      });
    });
    return Array.from(merged.values());
  }, [selectedOrders]);

  const total = useMemo(
    () =>
      purchaseItems.reduce(
        (sum, item) => sum + item.pricePerUnit * item.quantity,
        0,
      ),
    [purchaseItems],
  );

  const handleCreatePurchaseOrder = () => {
    if (purchaseItems.length === 0 || purchaseOrderMutation.isPending) return;
    purchaseOrderMutation.mutate({
      orderListIds: selectedOrders.map((order) => order.orderId),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-lg px-4 pt-5 pb-36 flex flex-col gap-4">

        {/* HEADER */}
        <header className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
            <Package className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-foreground leading-none">
              Confirmar Orden
            </h1>
            <p className="text-xs text-muted-foreground/60 mt-0.5">
              Revisá el consolidado antes de generar
            </p>
          </div>
        </header>

        {/* CONSOLIDATED PRODUCTS CARD */}
        <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/30">
            <ShoppingBag className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-black text-foreground/80">
              Consolidado de Productos
            </h3>
          </div>

          {purchaseItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/30">
              <PackageSearch className="size-8 mb-2" />
              <p className="text-sm font-bold">Sin productos consolidados</p>
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {purchaseItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between px-5 py-3.5"
                >
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-4">
                    <p className="font-bold text-sm text-foreground truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground/50 font-mono">
                      {item.quantity} unidades × {formatChileanPeso(item.pricePerUnit)}
                    </p>
                  </div>
                  <span className="font-black text-sm text-foreground shrink-0">
                    {formatChileanPeso(item.pricePerUnit * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="px-5 py-4 border-t border-border/30 bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                  Total Estimado
                </p>
                <p className="text-2xl font-black text-foreground tracking-tighter mt-0.5">
                  {formatChileanPeso(total)}
                </p>
              </div>
              <span className="text-xs font-bold text-muted-foreground/40">
                {purchaseItems.length} {purchaseItems.length === 1 ? "producto" : "productos"}
              </span>
            </div>
          </div>
        </div>

        {/* INFO BANNER */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-500/15 bg-blue-500/5 p-4">
          <Info className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-400/80 leading-relaxed font-medium">
            Esta orden consolidará todos los productos de los pedidos seleccionados
            en una única lista para facilitar la compra al proveedor.
          </p>
        </div>

        {/* SOURCE ORDERS */}
        <section className="flex flex-col gap-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">
            Pedidos Seleccionados ({selectedOrders.length})
          </h3>

          {selectedOrders.map((order) => {
            const orderTotal = order.lines.reduce(
              (sum, line) => sum + line.pricePerUnit * line.quantity,
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
                      {order.localName || "Local"}
                    </p>
                  </div>
                  <span className="font-black text-sm text-foreground">
                    {formatChileanPeso(orderTotal)}
                  </span>
                </div>

                <div className={cn(
                  "rounded-lg bg-muted/30 border border-border/20 px-3 py-1.5",
                  "divide-y divide-border/15",
                )}>
                  {order.lines.map((line) => (
                    <div
                      key={line.lineId}
                      className="flex items-center justify-between py-1.5 text-xs"
                    >
                      <span className="text-muted-foreground/60 truncate flex-1 pr-3">
                        {line.quantity}x {line.productName}
                      </span>
                      <span className="font-bold text-foreground/80 shrink-0">
                        {formatChileanPeso(line.pricePerUnit * line.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      </div>

      {/* STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-6 pt-10 bg-gradient-to-t from-background via-background/95 to-transparent">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <div className="flex flex-col shrink-0">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/50">
              Total Estimado
            </span>
            <span className="text-xl font-black text-foreground leading-tight tracking-tighter">
              {formatChileanPeso(total)}
            </span>
          </div>
          <Button
            onClick={handleCreatePurchaseOrder}
            disabled={purchaseItems.length === 0 || purchaseOrderMutation.isPending}
            className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 disabled:opacity-40"
          >
            {purchaseOrderMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                Generar Orden
                <ChevronRight className="ml-1.5 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

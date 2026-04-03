import { useMutation } from "@tanstack/react-query";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Info,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPurchaseOrder } from "@/features/purchase-orders/api/create-purchase-orders";
import { useAppSelector } from "@/hooks/redux.hooks";
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

  const purchaseOrderMutation = useMutation({
    mutationFn: createPurchaseOrder,
    onSuccess: () => {
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
    if (purchaseItems.length === 0 || purchaseOrderMutation.isPending) {
      return;
    }

    purchaseOrderMutation.mutate({
      orderListIds: selectedOrders.map((order) => order.orderId),
    });
  };

  return (
    <div className="space-y-8 pb-32 sm:pb-10">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Confirmar Orden
        </h1>
        <p className="text-muted-foreground font-medium">
          Revisa el consolidado de productos antes de generar la orden de
          compra.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
        {/* COLUMNA IZQUIERDA: CONSOLIDADO */}
        <section className="space-y-6 lg:col-span-7">
          <Card className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border bg-muted/50 px-6 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-5 text-primary" />
                <CardTitle className="text-lg font-bold text-foreground">
                  Consolidado de Productos
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-0">
                  {purchaseItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <PackageSearch className="size-10 opacity-20" />
                      <p className="mt-2 text-sm">No hay productos consolidados.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {purchaseItems.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex flex-col gap-0.5">
                            <p className="font-semibold text-foreground">
                              {item.name}
                            </p>
                            <p className="text-xs text-muted-foreground font-medium">
                              {item.quantity} unidades ×{" "}
                              {formatChileanPeso(item.pricePerUnit)}
                            </p>
                          </div>
                          <span className="font-bold text-foreground">
                            {formatChileanPeso(item.pricePerUnit * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
            </CardContent>

            <div className="bg-muted/30 px-6 py-6 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Total Estimado
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {formatChileanPeso(total)}
                  </p>
                </div>
                <Button
                  onClick={handleCreatePurchaseOrder}
                  disabled={
                    purchaseItems.length === 0 ||
                    purchaseOrderMutation.isPending
                  }
                  className="hidden sm:flex px-8 h-12 rounded-2xl shadow-lg shadow-primary/10"
                >
                  {purchaseOrderMutation.isPending
                    ? "Generando..."
                    : "Crear Orden de Compra"}
                  {!purchaseOrderMutation.isPending && (
                    <ChevronRight className="ml-2 size-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>

          <div className="flex items-start gap-3 rounded-2xl bg-primary/5 p-4 border border-primary/10">
            <Info className="size-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-primary leading-relaxed font-medium">
              Esta orden consolidará todos los productos de los pedidos
              seleccionados en una única lista para facilitar la compra al
              proveedor.
            </p>
          </div>
        </section>

        {/* COLUMNA DERECHA: PEDIDOS FUENTE */}
        <section className="space-y-4 lg:col-span-5">
          <h3 className="flex items-center gap-2 px-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            <Clock className="size-4" />
            Pedidos Seleccionados ({selectedOrders.length})
          </h3>
          <div className="grid gap-4">
            {selectedOrders.map((order) => (
              <Card
                key={order.orderId}
                className="group overflow-hidden rounded-2xl border-border bg-background/70 p-4 shadow-none transition-all hover:bg-card hover:shadow-md"
              >
                <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Pedido #{order.orderId}
                    </span>
                    <h4 className="font-bold text-foreground">
                      {order.localName || "Local"}
                    </h4>
                  </div>
                  <CheckCircle2 className="size-5 text-success" />
                </div>

                <div className="space-y-1.5">
                  {order.lines.slice(0, 2).map((line) => (
                    <div
                      key={line.lineId}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-muted-foreground">
                        {line.quantity}x {line.productName}
                      </span>
                      <span className="font-medium text-foreground">
                        {formatChileanPeso(line.pricePerUnit * line.quantity)}
                      </span>
                    </div>
                  ))}
                  {order.lines.length > 2 && (
                    <p className="text-[10px] italic text-muted-foreground font-medium">
                      + {order.lines.length - 2} productos adicionales
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>

      {/* STICKY BOTTOM BAR FOR MOBILE */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 p-4 backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Total Estimado
            </span>
            <span className="text-xl font-bold text-primary">
              {formatChileanPeso(total)}
            </span>
          </div>
          <Button
            onClick={handleCreatePurchaseOrder}
            disabled={
              purchaseItems.length === 0 || purchaseOrderMutation.isPending
            }
            className="flex-1 h-12 shadow-lg shadow-primary/10 rounded-xl"
          >
            {purchaseOrderMutation.isPending ? "Generando..." : "Generar Orden"}
            {!purchaseOrderMutation.isPending && (
              <ChevronRight className="ml-2 size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

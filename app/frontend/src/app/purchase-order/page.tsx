import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  ChevronRight,
  Copy,
  Loader2,
  Package,
  Plus,
  Receipt,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deletePurchaseOrder } from "@/features/purchase-orders/api/delete-purchase-order";
import {
  getPurchaseOrders,
  type PurchaseOrderLine,
  type PurchaseOrderListItem,
} from "@/features/purchase-orders/api/get-purchase-orders";
import { cn } from "@/lib/utils";
import { formatChileanPeso } from "@/utils/format-currency";

const STATUS_CONFIG: Record<string, { label: string; style: string; topBorder: string }> = {
  pending: {
    label: "Pendiente",
    style: "bg-amber-500/20 text-amber-400 border border-amber-500/20",
    topBorder: "border-t-amber-500/40",
  },
  received: {
    label: "Recibido",
    style: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    topBorder: "border-t-blue-500/40",
  },
  paid: {
    label: "Pagado",
    style: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    topBorder: "border-t-emerald-500/40",
  },
  cancelled: {
    label: "Cancelado",
    style: "bg-muted text-muted-foreground border border-border",
    topBorder: "border-t-border",
  },
};

export default function PurchaseOrdersListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isPending, error } = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: getPurchaseOrders,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePurchaseOrder,
    onSuccess: () => {
      toast.success("Orden de compra eliminada correctamente");
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
    onError: (mutationError) => {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "No se pudo eliminar la orden de compra.";
      toast.error(message);
    },
  });

  const handleDelete = (orderId: number) => {
    if (deleteMutation.isPending) return;
    deleteMutation.mutate(orderId);
  };

  const handleCopy = (order: PurchaseOrderListItem, total: number) => {
    const groupedLines = order.lines.reduce(
      (acc: Record<string, PurchaseOrderLine>, line) => {
        const key = `${line.productId}-${line.productName}-${line.buyPriceSupplier}`;
        if (!acc[key]) {
          acc[key] = { ...line };
        } else {
          acc[key].quantity += line.quantity;
        }
        return acc;
      },
      {},
    );

    const orderText = [
      `📦 Orden de Compra #${order.purchaseOrderId}`,
      `🗓️ Fecha: ${new Date(order.createdAt).toLocaleDateString("es-CL")}`,
      "",
      ...Object.values(groupedLines).map(
        (line: PurchaseOrderLine) =>
          `• ${line.productName ?? "Producto"}: ${line.quantity} x ${formatChileanPeso(line.buyPriceSupplier)} = ${formatChileanPeso(line.buyPriceSupplier * line.quantity)}`,
      ),
      "",
      `💰 Total: ${formatChileanPeso(total)}`,
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
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-4 pt-6 pb-8 sm:px-6">

        {/* HEADER */}
        <header className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
              <Package className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground leading-none">
                Órdenes de Compra
              </h1>
              <p className="text-xs font-medium text-muted-foreground/60 mt-0.5">
                {data?.orders?.length ?? 0} pendientes
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate("/purchase-order/new")}
            size="icon"
            className="h-10 w-10 rounded-full bg-crimson hover:bg-crimson/90 text-white shrink-0 shadow-lg shadow-crimson/20"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </header>

        {/* FEEDBACK STATES */}
        {isPending && (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <div className="size-10 animate-spin rounded-full border-4 border-border border-t-crimson mb-4" />
            <p className="font-bold tracking-tight text-sm">Cargando historial...</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="font-bold text-destructive">Error al cargar las órdenes</p>
            <p className="mt-1 text-sm text-destructive/70">
              Por favor intenta de nuevo más tarde.
            </p>
          </div>
        )}

        {!isPending && !error && (!data?.orders || data.orders.length === 0) && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed border-border/40 rounded-2xl mt-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/40 mb-4">
              <Receipt className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-black text-foreground">Sin órdenes aún</h3>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Registrá la primera orden de compra con el botón +
            </p>
          </div>
        )}

        {/* ORDER CARDS */}
        <section className="flex flex-col gap-3">
          {data?.orders?.map((order) => {
            const orderTotal = (order.lines ?? []).reduce(
              (total, line) => total + line.buyPriceSupplier * line.quantity,
              0,
            );
            const statusKey = "pending";
            const statusInfo = STATUS_CONFIG[statusKey];

            return (
              <article
                key={order.purchaseOrderId}
                className={cn(
                  "rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden border-t-2",
                  statusInfo.topBorder,
                )}
              >
                {/* CARD HEADER */}
                <div className="p-4 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black font-mono text-muted-foreground/50">
                        ID: #{order.purchaseOrderId}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider",
                            statusInfo.style,
                          )}
                        >
                          {statusInfo.label}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground/50">
                          <Calendar className="h-3 w-3" />
                          {new Date(order.createdAt).toLocaleDateString("es-CL", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-muted-foreground/50 hover:text-foreground hover:bg-muted/60"
                        onClick={() => handleCopy(order, orderTotal)}
                        title="Copiar detalles"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent onClick={(e) => e.stopPropagation()}>
                          <DialogHeader>
                            <DialogTitle>¿Eliminar orden?</DialogTitle>
                            <DialogDescription>
                              Esta acción no se puede deshacer. Se eliminará la
                              orden #{order.purchaseOrderId}.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="gap-2 sm:gap-0">
                            <DialogClose asChild>
                              <Button variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button
                              variant="destructive"
                              onClick={() => handleDelete(order.purchaseOrderId)}
                            >
                              Eliminar Orden
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>

                {/* PRODUCT LINES */}
                <div className="mx-4 rounded-xl bg-muted/30 border border-border/30 px-3 py-1.5 mb-3">
                  {(order.lines ?? []).slice(0, 2).map((line, i) => (
                    <div
                      key={line.productId}
                      className={cn(
                        "flex justify-between items-center py-1.5",
                        i !== 0 && "border-t border-border/20",
                      )}
                    >
                      <p className="text-xs font-bold text-foreground/80 truncate flex-1 pr-3">
                        {line.productName ?? "Producto"}
                      </p>
                      <p className="text-xs text-muted-foreground/60 shrink-0">
                        {line.quantity} × {formatChileanPeso(line.buyPriceSupplier)}
                      </p>
                    </div>
                  ))}
                  {(order.lines ?? []).length > 2 && (
                    <div className="py-1.5 border-t border-border/20 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/40">
                      + {(order.lines ?? []).length - 2} productos adicionales
                    </div>
                  )}
                </div>

                {/* FOOTER: TOTAL + ACTION */}
                <div className="flex items-end justify-between px-4 pb-4 border-t border-border/30 pt-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 block mb-0.5">
                      Total Orden
                    </span>
                    <span className="text-2xl font-black text-foreground tracking-tighter">
                      {formatChileanPeso(orderTotal)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-xl border-border/50 text-sm font-bold hover:bg-muted/60"
                    onClick={() => navigate(`/purchase-order/${order.purchaseOrderId}`)}
                  >
                    Gestionar
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </article>
            );
          })}

          {deleteMutation.isPending && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/40" />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

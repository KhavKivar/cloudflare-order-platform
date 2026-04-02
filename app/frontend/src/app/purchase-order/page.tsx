import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Calendar,
  ChevronRight,
  Copy,
  Loader2,
  Package,
  Plus,
  Receipt,
  Store,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button/button";
import { Card } from "@/components/ui/Card/card";
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

const STATUS_CONFIG: Record<string, { label: string; style: string }> = {
  pending: {
    label: "Pendiente",
    style: "bg-amber-100 text-amber-700 border-amber-200",
  },
  received: {
    label: "Recibido",
    style: "bg-blue-100 text-blue-700 border-blue-200",
  },
  paid: {
    label: "Pagado",
    style: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  cancelled: {
    label: "Cancelado",
    style: "bg-slate-100 text-slate-600 border-slate-200",
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
    if (deleteMutation.isPending) {
      return;
    }
    deleteMutation.mutate(orderId);
  };

  const handleCopy = (order: PurchaseOrderListItem, total: number) => {
    // Group products by ID, name and price to ensure correct consolidation
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
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pt-8 sm:px-6">
        {/* HEADER SECTION */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <Package className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Órdenes de Compra
              </h1>
              <p className="text-sm font-medium text-slate-500">
                {data?.orders.length ?? 0} registros de proveedores
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={() => navigate("/purchase-order/new/select")}
            className="group h-12 w-full rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-200 transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] sm:h-11 sm:w-auto sm:px-8"
          >
            <Plus className="mr-2 size-5 transition-transform group-hover:rotate-90" />
            Nueva Orden de Compra
          </Button>
        </header>

        {/* FEEDBACK STATES */}
        <section className="grid gap-6">
          {isPending && (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2 className="size-10 animate-spin text-indigo-600 mb-4" />
              <p className="font-bold">Cargando historial...</p>
            </div>
          )}

          {error && (
            <div className="rounded-[2.5rem] border border-rose-100 bg-rose-50 p-12 text-center text-rose-600">
              <AlertCircle className="mx-auto size-10 mb-4 opacity-50" />
              <p className="font-bold">Error al cargar las órdenes</p>
              <p className="mt-1 text-sm opacity-80">
                Por favor intenta de nuevo más tarde.
              </p>
            </div>
          )}

          {!isPending && !error && data?.orders.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-200 bg-white/50 p-20 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-300 mb-6">
                <Receipt className="size-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                Sin órdenes aún
              </h3>
              <p className="mt-2 text-slate-500 font-medium max-w-xs mx-auto">
                Registra tu primera orden de compra consolidada para tus
                proveedores.
              </p>
            </div>
          )}

          {/* LISTADO DE TARJETAS */}
          {data?.orders.map((order) => {
            const orderTotal = order.lines.reduce(
              (total, line) => total + line.buyPriceSupplier * line.quantity,
              0,
            );
            const statusInfo = STATUS_CONFIG.pending;

            return (
              <Card
                key={order.purchaseOrderId}
                className="p-2 group relative flex flex-col overflow-hidden rounded-[2.5rem] border-0 bg-white shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-xl hover:shadow-slate-200/50"
              >
                {/* CABECERA DE TARJETA */}
                <div className="flex flex-col gap-6 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {/* Icono de Proveedor */}
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-all group-hover:bg-indigo-600 group-hover:text-white sm:h-14 sm:w-14 sm:rounded-[1.25rem]">
                        <Store className="size-6 sm:size-7" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            ID: #{order.purchaseOrderId}
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border",
                              statusInfo.style,
                            )}
                          >
                            {statusInfo.label}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 sm:text-2xl">
                          Proveedor: Barack
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                        onClick={() => handleCopy(order, orderTotal)}
                        title="Copiar detalles"
                      >
                        <Copy className="size-4" />
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-700"
                            onClick={(e) => e.stopPropagation()} // Evita seleccionar la card al abrir el diálogo
                            aria-label="Eliminar pedido"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </DialogTrigger>
                        <DialogContent onClick={(e) => e.stopPropagation()}>
                          <DialogHeader>
                            <DialogTitle>¿Eliminar pedido?</DialogTitle>
                            <DialogDescription>
                              Esta acción no se puede deshacer. Se eliminará el
                              registro del pedido .
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="gap-2 sm:gap-0">
                            <DialogClose asChild>
                              <Button variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button
                              variant="destructive"
                              onClick={() =>
                                handleDelete(order.purchaseOrderId)
                              }
                            >
                              Eliminar Pedido
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* INFO SECTION */}
                  <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm font-bold text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                        <Calendar className="size-4" />
                      </div>
                      <span className="text-slate-600">
                        {new Date(order.createdAt).toLocaleDateString("es-CL", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                        <Package className="size-4" />
                      </div>
                      <span className="text-slate-600">
                        {order.lines.length} productos consolidado
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="h-12 w-full rounded-2xl border-indigo-100 bg-white px-6 font-black text-indigo-600 shadow-sm transition-all hover:bg-slate-900 hover:text-white hover:border-slate-900"
                    onClick={() =>
                      navigate(`/purchase-order/${order.purchaseOrderId}`)
                    }
                  >
                    Gestionar Orden
                    <ChevronRight className="ml-2 size-4" />
                  </Button>
                </div>

                {/* DETALLE DE ITEMS (Lista compacta) */}
                <div className="px-6 pb-2">
                  <div className="rounded-[1.5rem] bg-slate-50/50 p-4 ring-1 ring-slate-100/50">
                    <div className="flex flex-col divide-y divide-slate-200/30">
                      {order.lines.slice(0, 2).map((line) => (
                        <div
                          key={line.productId}
                          className="flex items-center justify-between py-2 text-sm"
                        >
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700 leading-tight">
                              {line.quantity}x {line.productName ?? "Producto"}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                              {formatChileanPeso(line.buyPriceSupplier)} p/u
                            </span>
                          </div>
                          <span className="font-black text-slate-900">
                            {formatChileanPeso(
                              line.buyPriceSupplier * line.quantity,
                            )}
                          </span>
                        </div>
                      ))}
                      {order.lines.length > 2 && (
                        <div className="pt-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">
                          + {order.lines.length - 2} productos adicionales
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* FOOTER: TOTAL - SLEEK FLOATING BAR */}
                <div className="mt-4 px-6 pb-6">
                  <div className="flex items-center justify-between gap-3 bg-indigo-600 p-6 text-white rounded-[2rem] shadow-lg shadow-indigo-200/50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-100/70">
                        Total a Pagar
                      </span>
                      <span className="text-2xl font-black tracking-tight leading-none mt-1">
                        {formatChileanPeso(orderTotal)}
                      </span>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
                      <Receipt className="size-6 text-white" />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </section>
      </div>
    </div>
  );
}

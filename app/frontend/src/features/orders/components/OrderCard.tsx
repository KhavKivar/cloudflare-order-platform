import { Button } from "@/components/ui/Button/button";
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
import { cn } from "@/lib/utils";
import { formatChileanPeso } from "@/utils/format-currency";
import {
  Calendar,
  Copy,
  Pencil,
  RefreshCw,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

type OrderLine = {
  name: string;
  quantity: number;
  pricePerUnit: number;
  buyPriceSupplier: number;
};

type OrderCardProps = {
  id: number;
  localName: string;
  status: "pending" | "paid" | "delivered" | "delivered_paid" | "cancelled";
  createdAt: string;
  items: OrderLine[];
  onEdit?: (orderId: number) => void;
  onDelete?: (orderId: number) => void;
  onClick?: () => void;
  isSelected: boolean;
};

const STATUS_LABELS: Record<OrderCardProps["status"], string> = {
  pending: "Pendiente",
  paid: "Pagado",
  delivered: "Entregado",
  delivered_paid: "Entregado y pagado",
  cancelled: "Cancelado",
};

const STATUS_STYLES: Record<OrderCardProps["status"], string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  delivered: "bg-sky-100 text-sky-700",
  delivered_paid: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
};

export default function OrderCard({
  id,
  localName,
  status,
  createdAt,
  items,
  isSelected,
  onEdit,
  onClick,
  onDelete,
  onStatusChange,
}: OrderCardProps & {
  onStatusChange?: (
    orderId: number,
    newStatus: OrderCardProps["status"],
  ) => void;
}) {
  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onStatusChange) return;

    const nextStatusMap: Record<
      OrderCardProps["status"],
      OrderCardProps["status"]
    > = {
      pending: "delivered",
      delivered: "delivered_paid",
      delivered_paid: "pending",
      paid: "delivered_paid", // If somehow paid, move to delivered_paid
      cancelled: "pending", // If cancelled, revive to pending
    };

    const nextStatus = nextStatusMap[status];
    onStatusChange(id, nextStatus);
  };
  const total = items.reduce(
    (sum, item) => sum + item.pricePerUnit * item.quantity,
    0,
  );

  const revenue = items.reduce(
    (sum, item) =>
      sum + (item.pricePerUnit - item.buyPriceSupplier) * item.quantity,
    0,
  );

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const orderText = [
      `📦 Local: ${localName}`,
      `🗓️ Fecha: ${new Date(createdAt).toLocaleDateString("es-CL")}`,
      "",
      ...items.map(
        (item) =>
          `• ${item.name}: ${item.quantity} x ${formatChileanPeso(item.pricePerUnit)} = ${formatChileanPeso(item.pricePerUnit * item.quantity)}`,
      ),
      "",
      `💰 *Total: ${formatChileanPeso(total)}*`,
    ].join("\n");

    try {
      navigator.clipboard.writeText(orderText);
      toast.success("Pedido copiado al portapapeles");
    } catch {
      toast.error("Error al copiar");
    }
  };

  return (
    <article
      onClick={onClick}
      className={cn(
        "group relative rounded-3xl border border-border/70 bg-card/90 p-6 shadow-sm transition-all cursor-pointer",
        isSelected
          ? "border-emerald-400 bg-emerald-50/50 shadow-md ring-2 ring-emerald-200"
          : "hover:border-emerald-200 hover:bg-card hover:shadow-md",
      )}
    >
      {/* HEADER: Nombre y Ganancia */}
      <div className="flex flex-nowrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
            Pedido #{id}
          </p>
          <h3 className="text-xl font-bold text-foreground leading-tight">
            {localName}
          </h3>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={handleStatusClick}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide transition-all hover:scale-105 active:scale-95",
              "whitespace-nowrap max-w-[200px]",
              STATUS_STYLES[status],
              onStatusChange
                ? "cursor-pointer hover:shadow-sm"
                : "cursor-default",
            )}
            title={onStatusChange ? "Click para cambiar estado" : undefined}
          >
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="truncate">{STATUS_LABELS[status]}</span>
              {onStatusChange && <RefreshCw className="h-3 w-3 shrink-0" />}
            </div>
          </button>
          <div className="flex items-center gap-1.5 bg-emerald-100/50 px-2 py-1 rounded-lg text-emerald-700">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="text-xs font-bold">
              {formatChileanPeso(revenue)}
            </span>
          </div>
        </div>
      </div>

      {/* CONTENT: Items (con un divisor sutil) */}
      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div key={`${item.name}-${item.quantity}`} className="group/item">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-foreground/90">
                {item.name}
              </span>
              <span className="font-bold text-foreground">
                {formatChileanPeso(item.pricePerUnit * item.quantity)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {item.quantity} unidades × {formatChileanPeso(item.pricePerUnit)}
            </p>
          </div>
        ))}
      </div>

      {/* FOOTER: Fecha, Acciones y Total Final */}
      <div className="mt-6 pt-4 border-t border-dashed border-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className="text-xs font-medium">
            {new Date(createdAt).toLocaleDateString("es-CL", {
              day: "2-digit",
              month: "short",
            })}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Botones de acción agrupados */}
          <div className="flex items-center gap-1 mr-2">
            <button
              onClick={handleCopy}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              title="Copiar detalles"
            >
              <Copy className="h-4 w-4" />
            </button>
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(id);
                }}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
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
                      Esta acción no se puede deshacer. Se eliminará el registro
                      del pedido #{id}.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(id);
                      }}
                    >
                      Eliminar Pedido
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Total Destacado */}
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">
              Total A Cobrar
            </p>
            <p className="text-lg font-black text-foreground">
              {formatChileanPeso(total)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

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
import { cn } from "@/lib/utils";
import { formatChileanPeso } from "@/utils/format-currency";
import {
  Calendar,
  ChevronDown,
  Copy,
  Loader2,
  Pencil,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
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
  isUpdating?: boolean;
};

const STATUS_LABELS: Record<OrderCardProps["status"], string> = {
  pending: "Pendiente",
  paid: "Pagado",
  delivered: "Entregado",
  delivered_paid: "Completado",
  cancelled: "Cancelado",
};

const STATUS_STYLES: Record<OrderCardProps["status"], string> = {
  pending: "bg-warning/15 text-warning",
  paid: "bg-primary/10 text-primary",
  delivered: "bg-emerald/10 text-emerald",
  delivered_paid: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

const STATUS_ACCENT: Record<OrderCardProps["status"], string> = {
  pending: "border-l-warning",
  paid: "border-l-primary",
  delivered: "border-l-emerald",
  delivered_paid: "border-l-primary",
  cancelled: "border-l-border",
};

const SEGMENTED_OPTIONS: {
  value: "pending" | "paid" | "delivered" | "delivered_paid";
  label: string;
  activeClass: string;
}[] = [
  {
    value: "pending",
    label: "Pendiente",
    activeClass: "bg-warning/15 text-warning",
  },
  {
    value: "paid",
    label: "Pagado",
    activeClass: "bg-primary/10 text-primary",
  },
  {
    value: "delivered",
    label: "Entregado",
    activeClass: "bg-emerald/10 text-emerald",
  },
  {
    value: "delivered_paid",
    label: "Completado",
    activeClass: "bg-emerald/20 text-emerald",
  },
];

const SWITCHABLE_STATUSES = new Set(["pending", "paid", "delivered", "delivered_paid"]);

export default function OrderCard({
  id,
  localName,
  status,
  createdAt,
  items,
  isSelected,
  isUpdating = false,
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
  const [showStrip, setShowStrip] = useState(false);

  const total = items.reduce(
    (sum, item) => sum + item.pricePerUnit * item.quantity,
    0,
  );

  const revenue = items.reduce(
    (sum, item) =>
      sum + (item.pricePerUnit - item.buyPriceSupplier) * item.quantity,
    0,
  );

  const canSwitchStatus = !!(onStatusChange && SWITCHABLE_STATUSES.has(status));

  // Auto-collapse strip after a successful status update
  useEffect(() => {
    setShowStrip(false);
  }, [status]);

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
        "group relative flex flex-col overflow-hidden rounded-2xl border-l-[3px] border bg-card text-left transition-all duration-300 cursor-pointer",
        "hover:-translate-y-0.5 hover:scale-[1.006] active:scale-[0.985]",
        STATUS_ACCENT[status],
        isSelected
          ? "border-primary/50 bg-primary/5 shadow-2xl shadow-primary/10 ring-1 ring-primary/20"
          : "border-border/60 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
      )}
    >
      {/* MAIN CONTENT */}
      <div className="p-3.5">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/50">
              Pedido #{id}
            </p>
            <h3 className="text-xl font-black text-foreground leading-snug tracking-tight">
              {localName}
            </h3>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {/* Status badge — tappable if status can be switched */}
            {canSwitchStatus ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowStrip((prev) => !prev);
                }}
                className={cn(
                  "rounded-full px-2.5 h-7 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-opacity touch-manipulation",
                  STATUS_STYLES[status],
                  isUpdating && "opacity-60 pointer-events-none",
                )}
              >
                {isUpdating ? (
                  <Loader2 className="h-2.5 w-2.5 animate-spin shrink-0" />
                ) : (
                  <ChevronDown
                    className={cn(
                      "h-2.5 w-2.5 shrink-0 transition-transform duration-200",
                      showStrip && "rotate-180",
                    )}
                  />
                )}
                {STATUS_LABELS[status]}
              </button>
            ) : (
              <div
                className={cn(
                  "rounded-full px-3 h-7 text-[9px] font-black uppercase tracking-widest flex items-center",
                  STATUS_STYLES[status],
                )}
              >
                {STATUS_LABELS[status]}
              </div>
            )}
            <div className="flex items-center gap-1 bg-emerald/10 px-2 py-1 rounded-full text-emerald border border-emerald/20">
              <TrendingUp className="h-2.5 w-2.5 shrink-0" />
              <span className="text-[10px] font-black tracking-tight">
                +{formatChileanPeso(revenue)}
              </span>
            </div>
          </div>
        </div>

        {/* ITEMS */}
        <div className="mt-3 divide-y divide-border/20">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between items-center py-2">
              <div className="min-w-0 flex-1 pr-3">
                <p className="font-semibold text-foreground/90 text-sm leading-snug">
                  {item.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.quantity} unidades × {formatChileanPeso(item.pricePerUnit)}
                </p>
              </div>
              <p className="font-bold text-foreground text-sm shrink-0">
                {formatChileanPeso(item.pricePerUnit * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="mt-2.5 flex items-center justify-between border-t border-border/40 pt-2.5">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-muted-foreground/60">
              <Calendar className="h-3 w-3" />
              <span className="text-[9px] font-black uppercase tracking-widest">
                {new Date(createdAt).toLocaleDateString("es-CL", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </div>
            <div className="flex items-center gap-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full opacity-40 hover:opacity-100"
                onClick={handleCopy}
              >
                <Copy className="h-3 w-3" />
              </Button>
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full opacity-40 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(id);
                  }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              )}
              {onDelete && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full opacity-40 hover:opacity-100 text-destructive hover:bg-destructive/10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent onClick={(e) => e.stopPropagation()}>
                    <DialogHeader>
                      <DialogTitle>¿Eliminar pedido?</DialogTitle>
                      <DialogDescription>
                        Esta acción no se puede deshacer. Se eliminará el
                        registro del pedido #{id}.
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
          </div>
          <div className="text-right">
            <p className="text-[8px] font-black uppercase text-muted-foreground/40 tracking-[0.2em] mb-0.5">
              Total a cobrar
            </p>
            <p className="text-xl font-black text-foreground tracking-tighter">
              {formatChileanPeso(total)}
            </p>
          </div>
        </div>
      </div>

      {/* STATUS STRIP — integrated bottom, revealed by tapping the badge */}
      {canSwitchStatus && showStrip && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "flex border-t border-border/40 overflow-hidden",
            isUpdating && "opacity-50 pointer-events-none",
          )}
        >
          {SEGMENTED_OPTIONS.map((option, i) => {
            const isActive = status === option.value;
            return (
              <button
                key={option.value}
                type="button"
                disabled={isUpdating || isActive}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isUpdating && !isActive) {
                    onStatusChange!(id, option.value);
                  }
                }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors duration-150 touch-manipulation",
                  i !== 0 && "border-l border-border/30",
                  isActive
                    ? option.activeClass
                    : "text-muted-foreground/40 hover:text-foreground/60 hover:bg-muted/40 active:bg-muted/60",
                )}
              >
                {isUpdating && isActive ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : null}
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </article>
  );
}

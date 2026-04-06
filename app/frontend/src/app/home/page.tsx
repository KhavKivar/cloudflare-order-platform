import {
  ArrowUpRight,
  BarChart3,
  Package,
  Package2,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getOrders } from "@/features/orders/api/get-orders";
import { getRevenue } from "@/features/revenue/api/get-revenue";
import { cn } from "@/lib/utils";
import { formatChileanPeso } from "@/utils/format-currency";
import { useQuery } from "@tanstack/react-query";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  delivered: "Entregado",
  delivered_paid: "Completado",
  cancelled: "Cancelado",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-warning/15 text-warning border-warning/20",
  paid: "bg-success/15 text-success border-success/20",
  delivered: "bg-emerald/10 text-emerald border-emerald/20",
  delivered_paid: "bg-success/15 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (
      location.state &&
      typeof location.state === "object" &&
      "toast" in location.state
    ) {
      const message = (location.state as { toast: string }).toast;
      setTimeout(() => toast.success(message), 100);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const { data: ordersData } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const { data: revenueData } = useQuery({
    queryKey: ["revenue"],
    queryFn: getRevenue,
  });

  const currentMonth = new Date().toISOString().slice(0, 7);

  const orders = ordersData?.orders ?? [];

  const currentMonthRevenue =
    revenueData?.revenue
      .filter((r) => r.day.startsWith(currentMonth))
      .reduce((sum, r) => sum + r.revenue, 0) ?? 0;

  const lastMonthRevenue =
    revenueData?.revenue
      .filter((r) => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return r.day.startsWith(lastMonth.toISOString().slice(0, 7));
      })
      .reduce((sum, r) => sum + r.revenue, 0) ?? 0;

  const growthPercent =
    lastMonthRevenue > 0
      ? Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : null;

  const recentOrders = [...orders]
    .filter((o) => o.status === "pending")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 pt-6 pb-4 sm:gap-8 sm:px-6 sm:pt-10">

        {/* HERO — Ventas del Mes */}
        <div>
          <Card className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent pointer-events-none" />
            <CardContent className="p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                    <BarChart3 className="h-3.5 w-3.5" />
                    <span>Ventas del mes</span>
                  </div>
                  <p className="text-4xl font-black tracking-tighter text-foreground sm:text-5xl">
                    {formatChileanPeso(currentMonthRevenue)}
                  </p>
                  {growthPercent !== null && (
                    <div
                      className={cn(
                        "flex items-center gap-1 text-xs font-black",
                        growthPercent >= 0 ? "text-success" : "text-destructive",
                      )}
                    >
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>
                        {growthPercent >= 0 ? "+" : ""}
                        {growthPercent}% vs mes anterior
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* NAVIGATION CARDS */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              href: "/order",
              icon: ShoppingBag,
              label: "Ventas",
              description: "Crear & cobrar",
              iconClass: "text-primary",
              bgClass: "bg-primary/10 border-primary/20",
              hoverClass: "hover:border-primary/30",
            },
            {
              href: "/purchase-order",
              icon: Package,
              label: "Compras",
              description: "Proveedores",
              iconClass: "text-amber-500",
              bgClass: "bg-amber-500/10 border-amber-500/20",
              hoverClass: "hover:border-amber-500/30",
            },
            {
              href: "/client",
              icon: Users,
              label: "Clientes",
              description: "Cuentas corrientes",
              iconClass: "text-blue-400",
              bgClass: "bg-blue-500/10 border-blue-500/20",
              hoverClass: "hover:border-blue-500/30",
            },
            {
              href: "/stats",
              icon: BarChart3,
              label: "Estadísticas",
              description: "Reportes globales",
              iconClass: "text-purple-400",
              bgClass: "bg-purple-500/10 border-purple-500/20",
              hoverClass: "hover:border-purple-500/30",
            },
            {
              href: "/product",
              icon: Package2,
              label: "Productos",
              description: "Catálogo & precios",
              iconClass: "text-orange-500",
              bgClass: "bg-orange-500/10 border-orange-500/20",
              hoverClass: "hover:border-orange-500/30",
            },
          ].map((item) => (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className={cn(
                "relative text-left rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 h-[110px] flex flex-col justify-between transition-colors group",
                item.hoverClass,
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl border",
                  item.bgClass,
                )}
              >
                <item.icon className={cn("h-5 w-5", item.iconClass)} />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground leading-tight">{item.label}</p>
                <p className="text-[11px] text-muted-foreground/50 font-medium mt-0.5">{item.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* RECENT ORDERS */}
        {recentOrders.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black uppercase tracking-[0.15em] text-muted-foreground/70">
                Últimos pedidos
              </h3>
              <button
                onClick={() => navigate("/order")}
                className="flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/80 transition-colors"
              >
                Ver todos
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <Card className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                {recentOrders.map((order, i) => {
                  const lines = order.lines ?? [];
                  const total = lines.reduce(
                    (sum: number, l: { pricePerUnit: number; quantity: number }) =>
                      sum + l.pricePerUnit * l.quantity,
                    0,
                  );
                  const revenue = lines.reduce(
                    (sum: number, l: { pricePerUnit: number; buyPriceSupplier: number; quantity: number }) =>
                      sum + (l.pricePerUnit - l.buyPriceSupplier) * l.quantity,
                    0,
                  );
                  return (
                    <div
                      key={order.orderId}
                      className={cn(
                        "flex items-center justify-between gap-3 px-4 py-3.5",
                        i !== 0 && "border-t border-border/40",
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-foreground truncate">
                          {order.localName}
                        </p>
                        <p className="text-[11px] text-muted-foreground/60 font-medium mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("es-CL", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <p className="text-sm font-black text-foreground tracking-tight">
                          {formatChileanPeso(total)}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <span className="flex items-center gap-0.5 text-[10px] font-black text-success">
                            <TrendingUp className="h-2.5 w-2.5" />
                            {formatChileanPeso(revenue)}
                          </span>
                          <Badge
                            className={cn(
                              "text-[9px] font-black uppercase tracking-widest border px-2 py-0.5 rounded-full",
                              STATUS_STYLES[order.status] ?? "",
                            )}
                          >
                            {STATUS_LABELS[order.status] ?? order.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

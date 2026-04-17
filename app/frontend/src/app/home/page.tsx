import {
  BarChart3,
  ChevronRight,
  Package,
  Package2,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { getRevenue } from "@/features/revenue/api/get-revenue";
import { cn } from "@/lib/utils";
import { formatChileanPeso } from "@/utils/format-currency";
import { useQuery } from "@tanstack/react-query";

const NAV_ITEMS = [
  {
    id: "ventas",
    href: "/order",
    icon: ShoppingBag,
    label: "Ventas (Pedidos)",
    description: "Gestionar pedidos de clientes",
    iconClass: "text-primary",
    bgClass: "bg-primary/10",
  },
  {
    id: "compras",
    href: "/purchase-order",
    icon: Package,
    label: "Compras",
    description: "Órdenes a proveedores",
    iconClass: "text-blue-400",
    bgClass: "bg-blue-500/10",
  },
  {
    id: "stats",
    href: "/stats",
    icon: BarChart3,
    label: "Estadísticas",
    description: "Reportes de ingresos y KPIs",
    iconClass: "text-emerald-400",
    bgClass: "bg-emerald-500/10",
  },
  {
    id: "clientes",
    href: "/client",
    icon: Users,
    label: "Clientes",
    description: "Directorio de locales y rutas",
    iconClass: "text-amber-500",
    bgClass: "bg-amber-500/10",
  },
  {
    id: "productos",
    href: "/product",
    icon: Package2,
    label: "Productos",
    description: "Catálogo & precios",
    iconClass: "text-purple-400",
    bgClass: "bg-purple-500/10",
  },
];

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

  const { data: revenueData } = useQuery({ queryKey: ["revenue"], queryFn: getRevenue });

  const currentMonth = new Date().toISOString().slice(0, 7);

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

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 pt-6 pb-4 sm:px-6 sm:pt-10">

        {/* HERO */}
        <Card className="relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent pointer-events-none" />
          <CardContent className="p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>Ventas del mes</span>
                </div>
                <p className="text-4xl font-black tracking-tighter text-foreground sm:text-5xl">
                  {formatChileanPeso(currentMonthRevenue)}
                </p>
                {growthPercent !== null && (
                  <div
                    className={cn(
                      "flex items-center gap-1 text-sm font-bold",
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

        {/* NAV CARDS */}
        <div className="flex flex-col gap-3">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.href)}
              className="w-full flex items-center gap-4 px-5 py-5 text-left rounded-2xl border border-border/50 bg-card shadow-sm active:bg-muted/30 transition-colors"
            >
              <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl", item.bgClass)}>
                <item.icon className={cn("h-7 w-7", item.iconClass)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground/60 mt-0.5">{item.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground/30 shrink-0" />
            </button>
          ))}

        </div>

      </div>
    </div>
  );
}

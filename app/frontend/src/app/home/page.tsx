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

  const now = new Date();
  const thisMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthStart = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}-01`;
  const lastMonthEnd = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}-${String(new Date(now.getFullYear(), now.getMonth(), 0).getDate()).padStart(2, "0")}`;

  const thisMonthRevenue =
    revenueData?.revenue
      .filter((r) => r.day >= thisMonthStart)
      .reduce((sum, r) => sum + r.revenue, 0) ?? 0;

  const lastMonthRevenue =
    revenueData?.revenue
      .filter((r) => r.day >= lastMonthStart && r.day <= lastMonthEnd)
      .reduce((sum, r) => sum + r.revenue, 0) ?? 0;

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 pt-6 pb-4 sm:px-6 sm:pt-10">

        {/* HERO */}
        <Card className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-card shadow-sm dark:shadow-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent pointer-events-none" />
          <CardContent className="p-4 sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-0.5">
                    <TrendingUp className="h-3 w-3" />
                    <span>Ganancia este mes</span>
                  </div>
                  <p className="text-2xl font-black tracking-tighter text-foreground sm:text-4xl">
                    {formatChileanPeso(thisMonthRevenue)}
                  </p>
                </div>
                <div className="flex items-center gap-4 border-t border-border/50 pt-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-0.5">
                      <BarChart3 className="h-3 w-3" />
                      <span>Ganancia mes anterior</span>
                    </div>
                    <p className="text-lg font-black tracking-tighter text-muted-foreground/80 sm:text-3xl">
                      {formatChileanPeso(lastMonthRevenue)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex h-9 w-9 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-primary/10 border border-primary/20 self-center">
                <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
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
              className="w-full flex items-center gap-4 px-5 py-5 text-left rounded-2xl border border-border bg-card shadow-sm dark:shadow-none active:bg-muted/40 hover:border-border/80 transition-colors"
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

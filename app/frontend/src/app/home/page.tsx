import {
  BarChart3,
  ChevronRight,
  ClipboardList,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { getOrders } from "@/features/orders/api/get-orders";
import { getRevenue } from "@/features/revenue/api/get-revenue";
import { cn } from "@/lib/utils";
import { formatChileanPeso } from "@/utils/format-currency";
import { useQuery } from "@tanstack/react-query";

const DASHBOARD_ITEMS = [
  {
    title: "Ventas (Pedidos)",
    description: "Gestionar pedidos de clientes",
    icon: ShoppingBag,
    href: "/order",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  {
    title: "Clientes",
    description: "Directorio de locales y rutas",
    icon: Users,
    href: "/client",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    title: "Compras",
    description: "Órdenes a proveedores",
    icon: Package,
    href: "/purchase-order",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Estadísticas",
    description: "Reportes de ingresos y KPIs",
    icon: BarChart3,
    href: "/stats",
    color: "text-success",
    bgColor: "bg-success/10",
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

  const { data: ordersData } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const { data: revenueData } = useQuery({
    queryKey: ["revenue"],
    queryFn: getRevenue,
  });

  const today = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  const ordersToday =
    ordersData?.orders.filter((order) => order.createdAt.startsWith(today))
      .length ?? 0;

  const currentMonthRevenue =
    revenueData?.revenue
      .filter((r) => r.day.startsWith(currentMonth))
      .reduce((sum, r) => sum + r.revenue, 0) ?? 0;

  const growth = "🚀";

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pt-8 sm:px-6">
        {/* WELCOME SECTION */}
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Panel de Control
          </h2>
          <p className="text-muted-foreground font-medium">
            Bienvenido a Vasvani App. ¿Qué quieres hacer hoy?
          </p>
        </div>

        {/* ACCIONES RÁPIDAS (GRID) */}
        <div className="grid gap-4 sm:grid-cols-2">
          {DASHBOARD_ITEMS.map((item) => (
            <Card
              key={item.title}
              onClick={() => navigate(item.href)}
              className={cn(
                "group cursor-pointer overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:shadow-lg hover:bg-accent/5 active:scale-[0.98]",
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div
                      className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110",
                        item.bgColor,
                      )}
                    >
                      <item.icon className={cn("h-7 w-7", item.color)} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-card-foreground">
                        {item.title}
                      </h3>
                      <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground/70 transition-colors">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* SECCIÓN RESUMEN RÁPIDO - Standard Shadcn Grid */}
        <div className="grid gap-6 sm:grid-cols-3">
          <Card className="rounded-[2rem] border border-border bg-card shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 opacity-60 mb-4 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
                <ClipboardList className="h-4 w-4" />
                <span>Pedidos Hoy</span>
              </div>
              <div className="text-3xl font-black text-foreground">
                {ordersToday}
              </div>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">
                Despachos del día
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border border-border bg-card shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 opacity-60 mb-4 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                <span>Ventas Mes</span>
              </div>
              <div className="text-3xl font-black text-foreground">
                {formatChileanPeso(currentMonthRevenue)}
              </div>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">
                Ingresos acumulados
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border border-border bg-card shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 opacity-60 mb-4 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>Crecimiento</span>
              </div>
              <div className="text-3xl font-black text-foreground">
                {growth}
              </div>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">
                Rendimiento actual
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

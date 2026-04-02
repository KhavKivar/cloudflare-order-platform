import {
  BarChart3,
  ChevronRight,
  ClipboardList,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";

import { Card } from "@/components/ui/Card/card";
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
    color: "text-rose-600",
    bgColor: "bg-rose-50 border-rose-100",
  },
  {
    title: "Clientes",
    description: "Directorio de locales y rutas",
    icon: Users,
    href: "/client",
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-100",
  },
  {
    title: "Compras",
    description: "Órdenes a proveedores",
    icon: Package,
    href: "/purchase-order",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 border-indigo-100",
  },
  {
    title: "Estadísticas",
    description: "Reportes de ingresos y KPIs",
    icon: BarChart3,
    href: "/stats",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 border-emerald-100",
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
      .reduce((sum, r) => sum + Number(r.totalGain), 0) ?? 0;

  // Simple growth calculation logic could be added here if we had historical context easily available
  // For now, we'll leave it as a placeholder or remove it.
  // Let's just show a positive message.
  const growth = "🚀";

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pt-8 sm:px-6">
        {/* WELCOME SECTION */}
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">
            Panel de Control
          </h2>
          <p className="text-slate-500 font-medium">
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
                "group relative cursor-pointer overflow-hidden rounded-[2rem] border-0 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 active:scale-[0.98]",
                "bg-white ring-1 ring-slate-100",
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-2xl border transition-all duration-300 group-hover:scale-110",
                      item.bgColor,
                    )}
                  >
                    <item.icon className={cn("h-7 w-7", item.color)} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 text-left">
                      {item.title}
                    </h3>
                    <p className="text-sm font-medium text-slate-400 group-hover:text-slate-500 transition-colors">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* SECCIÓN RESUMEN RÁPIDO */}
        <div className="rounded-[2.5rem] bg-indigo-600 p-8 text-white shadow-2xl shadow-indigo-200 transition-transform hover:scale-[1.01]">
          <div className="flex items-center gap-3 opacity-80 mb-6">
            <ClipboardList className="h-5 w-5" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">
              Estado del Negocio
            </span>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="space-y-1 text-center sm:text-left">
              <span className="block text-4xl font-black">{ordersToday}</span>
              <span className="text-sm font-bold text-indigo-100/70 uppercase tracking-wider">
                Pedidos Hoy
              </span>
            </div>
            <div className="space-y-1 text-center sm:text-left border-y border-white/10 py-6 sm:border-y-0 sm:border-x sm:px-8 sm:py-0">
              <span className="block text-4xl font-black">
                {formatChileanPeso(currentMonthRevenue)}
              </span>
              <span className="text-sm font-bold text-indigo-100/70 uppercase tracking-wider">
                Ventas Mes
              </span>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <span className="block text-4xl font-black">{growth}</span>
              <span className="text-sm font-bold text-indigo-100/70 uppercase tracking-wider">
                Crecimiento
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

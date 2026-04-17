import { Button } from "@/components/ui/button";
import { getOrders } from "@/features/orders/api/get-orders";
import { getRevenue } from "@/features/revenue/api/get-revenue";
import type { Revenue } from "@/features/revenue/api/revenue-schema";
import { cn } from "@/lib/utils";
import { formatChileanPeso } from "@/utils/format-currency";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  BarChart3,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";

// --- Types & Helpers ---

type WeeklyGain = { label: string; gain: number; start: Date };
type DailyGain = { label: string; gain: number; date: Date };
type DateFilter = "this_month" | "last_month" | "3_months" | "all";

const DATE_FILTER_LABELS: Record<DateFilter, string> = {
  this_month: "Este mes",
  last_month: "Mes anterior",
  "3_months": "Últ. 3 meses",
  all: "Todo",
};

const MONTHS_SHORT = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

const parseRevenueDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
};

const formatShortDate = (date: Date) =>
  `${String(date.getDate()).padStart(2, "0")} ${MONTHS_SHORT[date.getMonth()]}`;

const getWeekStart = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getDateRange = (filter: DateFilter): { start: Date | null; end: Date | null } => {
  const now = new Date();
  if (filter === "all") return { start: null, end: null };
  if (filter === "this_month") {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    };
  }
  if (filter === "last_month") {
    return {
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      end: new Date(now.getFullYear(), now.getMonth(), 0),
    };
  }
  // 3_months
  return {
    start: new Date(now.getFullYear(), now.getMonth() - 2, 1),
    end: now,
  };
};

const normalizeRevenue = (entries: Revenue[]) => {
  const dailyMap = new Map<string, DailyGain>();

  entries.forEach((entry) => {
    const date = parseRevenueDate(entry.day);
    if (!date) return;
    const key = date.toISOString().split("T")[0];
    const gain = entry.revenue || 0;
    const existing = dailyMap.get(key);
    if (existing) {
      existing.gain += gain;
    } else {
      dailyMap.set(key, { date, label: entry.day, gain });
    }
  });

  const dailyGains = Array.from(dailyMap.values()).sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );

  const weeklyMap = new Map<number, WeeklyGain>();
  const chronologicalDays = [...dailyGains].reverse();

  chronologicalDays.forEach((entry) => {
    const weekStart = getWeekStart(entry.date);
    const weekKey = weekStart.getTime();
    const existing = weeklyMap.get(weekKey);
    if (existing) {
      existing.gain += entry.gain;
    } else {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weeklyMap.set(weekKey, {
        label: `${formatShortDate(weekStart)} - ${formatShortDate(weekEnd)}`,
        gain: entry.gain,
        start: weekStart,
      });
    }
  });

  const weeklyGains = Array.from(weeklyMap.values()).sort(
    (a, b) => b.start.getTime() - a.start.getTime(),
  );

  return { dailyGains, weeklyGains };
};

// --- Main Component ---

export default function StatsPage() {
  const [dateFilter, setDateFilter] = useState<DateFilter>("this_month");

  const { data, isPending, error } = useQuery({
    queryKey: ["revenue"],
    queryFn: getRevenue,
  });

  const { data: ordersData } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const { start, end } = useMemo(() => getDateRange(dateFilter), [dateFilter]);

  // Weekly bars never filtered — always show full weeks.
  const { weeklyGains } = useMemo(
    () => normalizeRevenue(data?.revenue ?? []),
    [data],
  );

  // Snap start to Monday of the containing week so edge-case days are included.
  const effectiveStart = useMemo(
    () => (start ? getWeekStart(start) : null),
    [start],
  );

  // Daily breakdown and product rankings use the filtered range.
  const { dailyGains } = useMemo(() => {
    const entries = data?.revenue ?? [];
    if (!effectiveStart && !end) return normalizeRevenue(entries);
    const filtered = entries.filter((e) => {
      const d = parseRevenueDate(e.day);
      if (!d) return false;
      if (effectiveStart && d < effectiveStart) return false;
      if (end && d > end) return false;
      return true;
    });
    return normalizeRevenue(filtered);
  }, [data, effectiveStart, end]);

  const filteredOrders = useMemo(() => {
    const orders = ordersData?.orders ?? [];
    if (!effectiveStart && !end) return orders;
    return orders.filter((o) => {
      const d = new Date(o.createdAt);
      if (effectiveStart && d < effectiveStart) return false;
      if (end && d > end) return false;
      return true;
    });
  }, [ordersData, effectiveStart, end]);

  const topProductsBySales = useMemo(() => {
    if (!filteredOrders.length) return [];

    const productMap = new Map<string, { name: string; units: number; profit: number }>();

    for (const order of filteredOrders) {
      for (const line of order.lines) {
        const name = line.productName ?? "Sin nombre";
        const profit = (line.pricePerUnit - line.buyPriceSupplier) * line.quantity;
        const existing = productMap.get(name);
        if (existing) {
          existing.units += line.quantity;
          existing.profit += profit;
        } else {
          productMap.set(name, { name, units: line.quantity, profit });
        }
      }
    }

    return Array.from(productMap.values())
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);
  }, [filteredOrders]);

  const topClientsByProfit = useMemo(() => {
    if (!filteredOrders.length) return [];

    const clientMap = new Map<string, { name: string; profit: number }>();

    for (const order of filteredOrders) {
      const name = order.localName ?? "Sin nombre";
      const orderProfit = order.lines.reduce(
        (sum, line) => sum + (line.pricePerUnit - line.buyPriceSupplier) * line.quantity,
        0,
      );
      const existing = clientMap.get(name);
      if (existing) {
        existing.profit += orderProfit;
      } else {
        clientMap.set(name, { name, profit: orderProfit });
      }
    }

    return Array.from(clientMap.values())
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);
  }, [filteredOrders]);

  if (isPending) return <StatsSkeleton />;

  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="max-w-xs">
          <h3 className="text-lg font-black text-foreground">Error de Conexión</h3>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            No pudimos sincronizar los datos financieros.
          </p>
        </div>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="rounded-2xl px-8"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  const maxWeeklyGain = Math.max(...weeklyGains.map((w) => w.gain), 1);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 pt-6 pb-8 sm:px-6">

        {/* HEADER CARD */}
        <div className="rounded-2xl border border-border/50 bg-card shadow-sm p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-foreground leading-none">
              Métricas
            </h1>
            <p className="text-xs font-medium text-muted-foreground/60 mt-0.5">
              Desempeño general
            </p>
          </div>
        </div>

        {dailyGains.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed border-border/40 rounded-2xl mt-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/40 mb-4">
              <BarChart3 className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-black text-foreground">Sin estadísticas</h3>
            <p className="text-sm text-muted-foreground/60 mt-1">
              No hay datos para el período seleccionado.
            </p>
          </div>
        ) : (
          <>
            {/* WEEKLY BARS */}
            {weeklyGains.length > 0 && (
              <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-5 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                  Ingresos Semanales
                </h3>
                {weeklyGains.map((week, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-[72px] shrink-0 flex flex-col">
                      <span className="text-[10px] font-black text-muted-foreground/50 leading-tight">
                        S{i + 1}
                      </span>
                      <span className="text-[9px] text-muted-foreground/30 leading-tight">
                        {week.label}
                      </span>
                    </div>
                    <div className="flex-1 h-2.5 rounded-full bg-muted/60 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          week.gain === Math.max(...weeklyGains.map((w) => w.gain))
                            ? "bg-gradient-to-r from-primary to-orange-500"
                            : "bg-gradient-to-r from-primary/70 to-orange-500/70",
                        )}
                        style={{ width: `${(week.gain / maxWeeklyGain) * 100}%` }}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-xs w-20 text-right shrink-0 font-bold",
                        week.gain === Math.max(...weeklyGains.map((w) => w.gain))
                          ? "text-foreground font-black"
                          : "text-muted-foreground/70",
                      )}
                    >
                      {formatChileanPeso(week.gain)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* TOP PRODUCTS BY SALES */}
            {topProductsBySales.length > 0 && (
              <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-3.5 w-3.5 text-primary" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                    Más vendidos
                  </h3>
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {(["this_month", "last_month", "3_months", "all"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setDateFilter(f)}
                      className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-black transition-colors border ${
                        dateFilter === f
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border/40 hover:bg-muted/40"
                      }`}
                    >
                      {DATE_FILTER_LABELS[f]}
                    </button>
                  ))}
                </div>
                {topProductsBySales.map((p, i) => (
                  <div key={p.name} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[11px] font-black text-muted-foreground/40 w-4 shrink-0">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{p.name}</p>
                        <p className="text-[11px] text-muted-foreground/50 font-medium">{p.units} unidades</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-success shrink-0">
                      +{formatChileanPeso(Math.round(p.profit))}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* TOP CLIENTS BY PROFIT */}
            {topClientsByProfit.length > 0 && (
              <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-5 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                    Ganancia por cliente
                  </h3>
                </div>
                {topClientsByProfit.map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[11px] font-black text-muted-foreground/40 w-4 shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-sm font-bold text-foreground truncate">{c.name}</span>
                    </div>
                    <span className="text-sm font-black text-success shrink-0">
                      +{formatChileanPeso(Math.round(c.profit))}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* DAILY LIST */}
            <section className="space-y-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">
                Desglose por Jornada
              </h3>
              {dailyGains.map((entry) => (
                <div
                  key={entry.label}
                  className="flex items-center justify-between px-4 py-3 rounded-xl border border-border/40 bg-card shadow-sm hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground/50">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold text-foreground capitalize">
                      {entry.date.toLocaleDateString("es-CL", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <span className="text-sm font-black text-foreground tracking-tight">
                    +{formatChileanPeso(entry.gain)}
                  </span>
                </div>
              ))}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 pt-6 pb-8 sm:px-6 animate-pulse">
        <div className="h-10 w-40 bg-muted/60 rounded-full" />
        <div className="h-40 bg-muted/40 rounded-2xl" />
        <div className="h-40 bg-muted/40 rounded-2xl" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-muted/40 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

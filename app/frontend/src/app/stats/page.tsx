import { Button } from "@/components/ui/button";
import { getRevenue } from "@/features/revenue/api/get-revenue";
import type { Revenue } from "@/features/revenue/api/revenue-schema";
import { cn } from "@/lib/utils";
import { formatChileanPeso } from "@/utils/format-currency";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  BarChart3,
  Calendar,
  Crown,
  DollarSign,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useMemo } from "react";

// --- Types & Helpers ---

type WeeklyGain = { label: string; gain: number; start: Date };
type DailyGain = { label: string; gain: number; date: Date };

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

  const totalRevenue = dailyGains.reduce((acc, curr) => acc + curr.gain, 0);
  const bestDay = dailyGains.reduce(
    (max, curr) => (curr.gain > max.gain ? curr : max),
    { gain: 0, label: "-" } as DailyGain,
  );
  const averageDaily = dailyGains.length > 0 ? totalRevenue / dailyGains.length : 0;

  return { dailyGains, weeklyGains, kpis: { totalRevenue, bestDay, averageDaily } };
};

// --- Main Component ---

export default function StatsPage() {
  const { data, isPending, error } = useQuery({
    queryKey: ["revenue"],
    queryFn: getRevenue,
  });

  const { dailyGains, weeklyGains, kpis } = useMemo(
    () => normalizeRevenue(data?.revenue ?? []),
    [data],
  );

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

        {/* HEADER */}
        <header className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-foreground leading-none">
              Métricas
            </h1>
            <p className="text-xs font-medium text-muted-foreground/60 mt-0.5">
              Desempeño mensual
            </p>
          </div>
        </header>

        {dailyGains.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed border-border/40 rounded-2xl mt-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/40 mb-4">
              <BarChart3 className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-black text-foreground">Sin estadísticas</h3>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Registrá ventas en la sección de pedidos para generar reportes.
            </p>
          </div>
        ) : (
          <>
            {/* KPI CARDS */}
            <div className="grid grid-cols-2 gap-3">
              {/* Total — full width */}
              <div className="col-span-2 relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
                <div className="flex items-start justify-between mb-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                    Ingreso Total
                  </span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                    <DollarSign className="h-3.5 w-3.5 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-black text-foreground tracking-tighter">
                  {formatChileanPeso(kpis.totalRevenue)}
                </div>
              </div>

              {/* Best Day */}
              <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-4 border-t-2 border-t-emerald-500/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">
                    Mejor Día
                  </span>
                  <Crown className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div className="text-xl font-black text-foreground">
                  {formatChileanPeso(kpis.bestDay.gain)}
                </div>
                <div className="text-[11px] text-muted-foreground/50 mt-0.5 font-medium">
                  {kpis.bestDay.label !== "-"
                    ? parseRevenueDate(kpis.bestDay.label)?.toLocaleDateString("es-CL", {
                        day: "numeric",
                        month: "short",
                      }) ?? kpis.bestDay.label
                    : "-"}
                </div>
              </div>

              {/* Average */}
              <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-4 border-t-2 border-t-amber-500/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">
                    Promedio
                  </span>
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <div className="text-xl font-black text-foreground">
                  {formatChileanPeso(Math.round(kpis.averageDaily))}
                </div>
                <div className="text-[11px] text-muted-foreground/50 mt-0.5 font-medium">
                  Por día
                </div>
              </div>
            </div>

            {/* WEEKLY BARS */}
            {weeklyGains.length > 0 && (
              <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-5 space-y-3">
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

            {/* DAILY LIST */}
            <section className="space-y-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1">
                Desglose por Jornada
              </h3>
              {dailyGains.map((entry) => (
                <div
                  key={entry.label}
                  className="flex items-center justify-between px-4 py-3 rounded-xl border border-border/40 bg-card/30 hover:bg-card/60 transition-colors"
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
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 h-24 bg-muted/40 rounded-2xl" />
          <div className="h-20 bg-muted/40 rounded-2xl" />
          <div className="h-20 bg-muted/40 rounded-2xl" />
        </div>
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

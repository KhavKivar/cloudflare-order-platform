import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { getRevenue } from "@/features/revenue/api/get-revenue";
import type { Revenue } from "@/features/revenue/api/revenue-schema";
import { cn } from "@/lib/utils";
import { formatChileanPeso } from "@/utils/format-currency";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

// --- Tipos y Constantes ---

type WeeklyGain = {
  label: string;
  gain: number;
  start: Date;
};

type DailyGain = {
  label: string;
  gain: number;
  date: Date;
};

const chartConfig = {
  gain: {
    label: "Ganancias",
    color: "#f97316", // Orange-500
  },
} satisfies ChartConfig;

const MONTHS_SHORT = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

// --- Helpers de Fecha y Datos ---

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
  const diff = day === 0 ? -6 : 1 - day; // Ajustar al Lunes
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const normalizeRevenue = (entries: Revenue[]) => {
  const dailyMap = new Map<string, DailyGain>();

  entries.forEach((entry) => {
    const date = parseRevenueDate(entry.day);
    if (!date) return;

    // Key única YYYY-MM-DD para agrupar mismo día si fuera necesario
    const key = date.toISOString().split("T")[0];
    const gain = entry.revenue || 0;

    const existing = dailyMap.get(key);
    if (existing) {
      existing.gain += gain;
    } else {
      dailyMap.set(key, { date, label: entry.day, gain });
    }
  });

  // Ordenar días: más reciente primero
  const dailyGains = Array.from(dailyMap.values()).sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );

  // Agrupar por semanas
  const weeklyMap = new Map<number, WeeklyGain>();

  // Para el gráfico, queremos orden cronológico (antiguo -> nuevo), así que invertimos temporalmente
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
      const label = `${formatShortDate(weekStart)} - ${formatShortDate(weekEnd)}`;

      weeklyMap.set(weekKey, {
        label,
        gain: entry.gain,
        start: weekStart,
      });
    }
  });

  const weeklyGains = Array.from(weeklyMap.values()).sort(
    (a, b) => a.start.getTime() - b.start.getTime(),
  );

  // Calcular KPIs
  const totalRevenue = dailyGains.reduce((acc, curr) => acc + curr.gain, 0);
  const bestDay = dailyGains.reduce(
    (max, curr) => (curr.gain > max.gain ? curr : max),
    { gain: 0, label: "-" },
  );
  const averageDaily =
    dailyGains.length > 0 ? totalRevenue / dailyGains.length : 0;

  return {
    dailyGains,
    weeklyGains,
    kpis: { totalRevenue, bestDay, averageDaily },
  };
};

// --- Componente Principal ---

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
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-destructive/10 text-destructive shadow-inner">
          <AlertCircle className="h-10 w-10" />
        </div>
        <div className="max-w-xs">
          <h3 className="text-xl font-black text-foreground">
            Error de Conexión
          </h3>
          <p className="mt-2 font-medium text-muted-foreground">
            No pudimos sincronizar los datos financieros en este momento.
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

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 pt-8 sm:px-6">
        {/* HEADER */}
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
              <BarChart3 className="size-6" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Métricas de Negocio
            </h1>
          </div>
          <p className="text-muted-foreground font-medium ml-1">
            Análisis de rentabilidad y rendimiento de ventas.
          </p>
        </header>

        {dailyGains.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-200 bg-white/50 p-20 text-center">
            <div className="bg-muted p-6 rounded-full mb-6">
              <BarChart3 className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-2xl font-black text-foreground">
              Sin estadísticas
            </h3>
            <p className="mt-2 text-muted-foreground font-medium max-w-xs mx-auto">
              Comienza a registrar ventas en la sección de pedidos para generar
              reportes.
            </p>
          </div>
        ) : (
          <>
            {/* KPI CARDS - Premium Style */}
            <div className="grid gap-6 sm:grid-cols-3">
              <KpiCard
                title="Ganancia Total"
                value={formatChileanPeso(kpis.totalRevenue)}
                icon={DollarSign}
                subtitle="Ingresos acumulados"
                variant="indigo"
              />
              <KpiCard
                title="Récord Diario"
                value={formatChileanPeso(kpis.bestDay.gain)}
                subtitle={kpis.bestDay.label}
                icon={TrendingUp}
                variant="emerald"
              />
              <KpiCard
                title="Promedio"
                value={formatChileanPeso(kpis.averageDaily)}
                icon={BarChart3}
                subtitle="Por jornada laboral"
                variant="amber"
              />
            </div>

            {/* CHART SECTION - Modern & Floating */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Evolución Semanal
                </h3>
              </div>
              <Card className="p-8 rounded-[2.5rem] border border-border bg-card shadow-sm shadow-slate-200/50 ring-1 ring-border">
                <ChartContainer
                  config={chartConfig}
                  className="h-[320px] w-full"
                >
                  <BarChart
                    data={weeklyGains}
                    margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="4 4"
                      className="stroke-border"
                    />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={16}
                      fontSize={11}
                      fontWeight={700}
                      tick={{ fill: "var(--color-muted-foreground)" }}
                    />
                    <YAxis hide />
                    <ChartTooltip
                      cursor={{ fill: "rgba(79, 70, 229, 0.05)", radius: 12 }}
                      content={
                        <ChartTooltipContent
                          className="bg-secondary border-0 text-secondary-foreground shadow-2xl rounded-2xl p-4"
                          formatter={(value) => (
                            <span className="text-lg font-black text-white">
                              {formatChileanPeso(Number(value))}
                            </span>
                          )}
                        />
                      }
                    />
                    <Bar
                      dataKey="gain"
                      fill="var(--color-gain)"
                      radius={[12, 12, 4, 4]}
                      maxBarSize={50}
                    />
                  </BarChart>
                </ChartContainer>
              </Card>
            </section>

            {/* LISTA DETALLADA - Clean Feed */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Desglose por Jornada
                </h3>
              </div>
              <div className="grid gap-3">
                {dailyGains.map((entry) => (
                  <Card
                    key={entry.label}
                    className="flex items-center justify-between px-6 py-5 rounded-2xl border border-border bg-card transition-all hover:ring-2 hover:ring-indigo-100/50 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground capitalize leading-none">
                          {entry.date.toLocaleDateString("es-CL", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </p>
                        <p className="mt-1.5 text-xs font-black uppercase tracking-widest text-muted-foreground">
                          Operación diaria
                        </p>
                      </div>
                    </div>
                    <span className="text-xl font-black tracking-tight text-foreground">
                      {formatChileanPeso(entry.gain)}
                    </span>
                  </Card>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

// --- Sub-componentes Visuales ---

type KpiCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  variant: "indigo" | "emerald" | "amber";
};

const VARIANT_STYLES = {
  indigo: {
    bg: "bg-primary/10",
    text: "text-primary",
    ring: "hover:ring-primary/10",
  },
  emerald: {
    bg: "bg-success/10",
    text: "text-success",
    ring: "hover:ring-success/10",
  },
  amber: {
    bg: "bg-warning/10",
    text: "text-warning",
    ring: "hover:ring-warning/10",
  },
};

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant,
}: KpiCardProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <Card
      className={cn(
        "relative overflow-hidden p-6 rounded-[2rem] border-0 bg-card shadow-sm ring-1 ring-border transition-all hover:shadow-xl",
        styles.ring,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            {title}
          </p>
          <div className="text-2xl font-black text-foreground">{value}</div>
          {subtitle && (
            <p className="text-xs font-bold text-muted-foreground/80">{subtitle}</p>
          )}
        </div>
        <div
          className={cn("rounded-2xl p-3 shadow-inner", styles.bg, styles.text)}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}

function StatsSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 pb-12 pt-8 sm:pt-12 lg:pt-16 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-3xl"></div>
          ))}
        </div>
        <div className="h-[300px] bg-slate-200 rounded-3xl"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

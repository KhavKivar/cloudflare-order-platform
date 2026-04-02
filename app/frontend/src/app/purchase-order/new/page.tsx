import { cn } from "@/lib/utils";
import { Check, ChevronRight } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router";

export default function PurchaseOrderNewLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isSummary = location.pathname.includes("summary");

  const steps = [
    {
      id: 1,
      label: "Selección",
      active: !isSummary,
      completed: isSummary,
    },
    {
      id: 2,
      label: "Resumen",
      active: isSummary,
      completed: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pt-6 sm:pt-10">
        {/* STEPPER / INDICADOR DE PROGRESO */}
        <div className="flex items-center justify-center">
          <nav className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white/50 p-2 backdrop-blur-sm sm:gap-8 sm:p-3">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  onClick={() =>
                    step.completed && navigate("/purchase-order/new/select")
                  }
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-300",
                    step.active
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                      : step.completed
                        ? "text-emerald-600 bg-emerald-50 cursor-pointer hover:bg-emerald-100"
                        : "text-slate-400",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full text-xs font-bold transition-all",
                      step.active
                        ? "bg-white/20"
                        : step.completed
                          ? "bg-emerald-100"
                          : "bg-slate-100",
                    )}
                  >
                    {step.completed ? <Check className="size-3.5" /> : step.id}
                  </div>
                  <span className="text-sm font-semibold whitespace-nowrap">
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="ml-4 size-4 text-slate-300 sm:ml-8" />
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

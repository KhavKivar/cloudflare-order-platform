import { cn } from "@/utils/cn";

type SpinnerProps = {
  className?: string;
  label?: string;
};

export function Spinner({ className, label = "Cargando..." }: SpinnerProps) {
  return (
    <div
      className={cn("flex items-center gap-3 text-sm text-muted-foreground", className)}
      role="status"
      aria-live="polite"
    >
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-foreground"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}

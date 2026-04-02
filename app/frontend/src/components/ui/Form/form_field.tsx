import { cn } from "@/lib/utils";
import { Spacer } from "../Spacer/spacer";

type FormFieldProps = {
  children: React.ReactNode;
  label: string;
  className?: string;
  labelClassName?: string;
  error?: string;
};

export default function FormField({
  children,
  label,
  className,
  labelClassName,
  error,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", labelClassName)}>
      <label className={cn("text-sm font-semibold text-slate-700", className)}>
        {label}
      </label>
      <Spacer size={1} />
      {children}
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}

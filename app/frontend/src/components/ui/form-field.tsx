import { cn } from "@/lib/utils"

interface FormFieldProps {
  label: string
  error?: string
  labelClassName?: string
  children: React.ReactNode
}

export default function FormField({ label, error, labelClassName, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className={cn("block text-sm font-medium text-muted-foreground", labelClassName)}>
        {label}
      </label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

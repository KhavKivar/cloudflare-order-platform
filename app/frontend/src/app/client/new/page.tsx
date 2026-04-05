import {
  createClient,
  CreateClientDtoSchema,
} from "@/features/client/api/create-client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, MapPin, Phone, Users } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

type FormFields = z.input<typeof CreateClientDtoSchema>;

export default function NewClientPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(CreateClientDtoSchema),
  });

  const navigate = useNavigate();

  const { mutate, isPending, error } = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      toast.success("Cliente creado");
      navigate("/client", { replace: true });
    },
  });

  const onSubmit: SubmitHandler<FormFields> = (data) => {
    const phone = `56${data.phone}`;
    mutate({ ...data, phone, phoneId: phone });
  };

  const localNameValue = watch("localName");
  const hasLocalName = !!(localNameValue && localNameValue.trim().length > 0);
  const errorMessage =
    error instanceof Error ? error.message : "No se pudo crear el cliente.";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-md flex-col px-5 pt-6 pb-32">

        {/* API ERROR BANNER */}
        {error && (
          <div className="mb-6 rounded-2xl border border-destructive/25 bg-destructive/8 p-4 flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-destructive/15 p-1 shrink-0">
              <Phone className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-bold text-destructive">Error al crear cliente</p>
              <p className="text-xs text-destructive/70 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* HEADER */}
        <header className="mb-8 flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-foreground leading-none">
              Nuevo Cliente
            </h1>
            <p className="text-xs text-muted-foreground/60 mt-0.5">
              Registrá los datos del local para asociarlo a los pedidos.
            </p>
          </div>
        </header>

        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

          {/* Nombre del Local */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-[0.08em] text-muted-foreground/60 mb-2 ml-1">
              Nombre del Local
            </label>
            <div className="relative">
              <input
                {...register("localName")}
                type="text"
                placeholder="Ej. Tienda Central"
                className={cn(
                  "w-full rounded-2xl border bg-muted/30 px-4 py-4 pr-11 text-[15px] font-medium text-foreground placeholder:text-muted-foreground/30",
                  "outline-none transition-all duration-200",
                  "focus:bg-muted/50 focus:border-border/80",
                  errors.localName
                    ? "border-destructive/50 bg-destructive/5"
                    : "border-border/40",
                )}
              />
              {hasLocalName && !errors.localName && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400/80">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              )}
            </div>
            {errors.localName && (
              <p className="mt-1.5 ml-1 text-[12px] font-medium text-destructive flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-destructive shrink-0" />
                {errors.localName.message}
              </p>
            )}
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-[0.08em] text-muted-foreground/60 mb-2 ml-1">
              Dirección
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40">
                <MapPin className="h-4.5 w-4.5" />
              </div>
              <input
                {...register("address")}
                type="text"
                placeholder="Ej. Av. Santa Fe 3450"
                className={cn(
                  "w-full rounded-2xl border bg-muted/30 pl-11 pr-4 py-4 text-[15px] font-medium text-foreground placeholder:text-muted-foreground/30",
                  "outline-none transition-all duration-200",
                  "focus:bg-muted/50 focus:border-border/80",
                  errors.address
                    ? "border-destructive/50 bg-destructive/5"
                    : "border-border/40",
                )}
              />
            </div>
            {errors.address && (
              <p className="mt-1.5 ml-1 text-[12px] font-medium text-destructive flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-destructive shrink-0" />
                {errors.address.message}
              </p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label
              className={cn(
                "block text-[11px] font-black uppercase tracking-[0.08em] mb-2 ml-1",
                errors.phone ? "text-destructive" : "text-muted-foreground/60",
              )}
            >
              Teléfono
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 border-r border-border/40 pr-3">
                <span className="text-sm leading-none">🇨🇱</span>
                <span className="text-[13px] font-bold text-muted-foreground/60">+56</span>
              </div>
              <input
                {...register("phone")}
                type="tel"
                inputMode="tel"
                maxLength={20}
                placeholder="912345678"
                className={cn(
                  "w-full rounded-2xl border bg-muted/30 pl-[80px] pr-4 py-4 text-[15px] font-medium text-foreground placeholder:text-muted-foreground/30",
                  "outline-none transition-all duration-200",
                  "focus:bg-muted/50 focus:border-border/80",
                  errors.phone
                    ? "border-destructive/50 bg-destructive/5"
                    : "border-border/40",
                )}
              />
            </div>
            {errors.phone ? (
              <p className="mt-1.5 ml-1 text-[12px] font-medium text-destructive flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-destructive shrink-0" />
                {errors.phone.message}
              </p>
            ) : (
              <p className="mt-1.5 ml-1 text-[11px] text-muted-foreground/40">
                9 dígitos sin el prefijo +56
              </p>
            )}
          </div>

        </form>
      </div>

      {/* STICKY BOTTOM CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-5 pb-8 pt-10 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none">
        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
          className={cn(
            "pointer-events-auto w-full h-[58px] rounded-2xl text-white text-[16px] font-bold tracking-wide",
            "bg-crimson hover:bg-crimson/90 active:scale-[0.98]",
            "shadow-[0_8px_25px_rgba(216,19,53,0.25)] border border-crimson/40",
            "transition-all duration-200 flex items-center justify-center gap-2.5",
            isPending && "opacity-80 pointer-events-none",
          )}
        >
          {isPending ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            "Guardar Cliente"
          )}
        </button>
      </div>
    </div>
  );
}

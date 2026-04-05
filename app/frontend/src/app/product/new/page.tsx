import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  CheckCircle2,
  DollarSign,
  Loader2,
  Package,
  Tag,
  Type,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { createProduct } from "@/features/products/api/create-product";
import {
  CreateProductDtoSchema,
  PRODUCT_TYPES,
  type CreateProductDto,
} from "@/features/products/api/product.schema";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  whisky: "Whisky",
  ron: "Ron",
  gin: "Gin",
  tequila: "Tequila",
  vodka: "Vodka",
  licor: "Licor",
  aguardiente: "Aguardiente",
  energy_drink: "Energética",
};

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<CreateProductDto>({
    resolver: zodResolver(CreateProductDtoSchema),
    defaultValues: {
      name: "",
      type: undefined,
      sizeMl: undefined,
      sellPriceClient: undefined,
      buyPriceSupplier: undefined,
      description: "",
      batchSize: 12,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const { mutate, isPending } = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate("/product", { state: { toast: "Producto creado" } });
    },
    onError: () => {
      toast.error("Error al crear el producto");
    },
  });

  const watchedType = watch("type");
  const watchedName = watch("name");

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-md flex-col px-5 pt-6 pb-32">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/10 border border-orange-500/20">
            <Package className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-lg font-black text-foreground leading-tight">Nuevo producto</h1>
            <p className="text-[11px] text-muted-foreground/60 font-medium">Completá los campos requeridos</p>
          </div>
        </div>

        <form onSubmit={handleSubmit((data) => mutate(data))} className="flex flex-col gap-5">

          {/* Nombre */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black uppercase tracking-[0.08em] text-muted-foreground/70">
              Nombre *
            </label>
            <div className="relative">
              <Type className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
              <input
                {...register("name")}
                placeholder="Ej: Whisky Jack Daniel N°7 1 Lt"
                className={cn(
                  "w-full rounded-2xl border bg-muted/30 px-4 py-4 pl-11 text-[15px] font-medium text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 transition-all",
                  errors.name
                    ? "border-destructive/50 bg-destructive/5 focus:ring-destructive/20"
                    : watchedName
                      ? "border-success/40 bg-success/5 focus:ring-success/20"
                      : "border-border/50 focus:ring-orange-500/20 focus:border-orange-500/40",
                )}
              />
              {watchedName && !errors.name && (
                <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-success" />
              )}
            </div>
            {errors.name && (
              <p className="text-[11px] text-destructive font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Tipo */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black uppercase tracking-[0.08em] text-muted-foreground/70">
              Tipo *
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {PRODUCT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setValue("type", type, { shouldValidate: true })}
                  className={cn(
                    "rounded-xl border py-2.5 px-1 text-[11px] font-black uppercase tracking-wide transition-all",
                    watchedType === type
                      ? "bg-orange-500/15 border-orange-500/40 text-orange-600 dark:text-orange-400"
                      : "bg-muted/30 border-border/40 text-muted-foreground/60 hover:bg-muted/50",
                  )}
                >
                  {TYPE_LABELS[type]}
                </button>
              ))}
            </div>
            {errors.type && (
              <p className="text-[11px] text-destructive font-medium">{errors.type.message}</p>
            )}
          </div>

          {/* Precios */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-[0.08em] text-muted-foreground/70">
                Precio venta *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                <input
                  type="number"
                  {...register("sellPriceClient", { valueAsNumber: true })}
                  placeholder="15500"
                  className={cn(
                    "w-full rounded-2xl border bg-muted/30 px-3 py-4 pl-9 text-[15px] font-medium text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 transition-all",
                    errors.sellPriceClient
                      ? "border-destructive/50 focus:ring-destructive/20"
                      : "border-border/50 focus:ring-orange-500/20 focus:border-orange-500/40",
                  )}
                />
              </div>
              {errors.sellPriceClient && (
                <p className="text-[11px] text-destructive font-medium">{errors.sellPriceClient.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-[0.08em] text-muted-foreground/70">
                Precio compra *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                <input
                  type="number"
                  {...register("buyPriceSupplier", { valueAsNumber: true })}
                  placeholder="15000"
                  className={cn(
                    "w-full rounded-2xl border bg-muted/30 px-3 py-4 pl-9 text-[15px] font-medium text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 transition-all",
                    errors.buyPriceSupplier
                      ? "border-destructive/50 focus:ring-destructive/20"
                      : "border-border/50 focus:ring-orange-500/20 focus:border-orange-500/40",
                  )}
                />
              </div>
              {errors.buyPriceSupplier && (
                <p className="text-[11px] text-destructive font-medium">{errors.buyPriceSupplier.message}</p>
              )}
            </div>
          </div>

          {/* Tamaño ml + Caja */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-[0.08em] text-muted-foreground/70">
                Tamaño (ml)
              </label>
              <input
                type="number"
                {...register("sizeMl", { valueAsNumber: true, setValueAs: (v) => (v === "" || isNaN(v) ? null : Number(v)) })}
                placeholder="1000"
                className="w-full rounded-2xl border border-border/50 bg-muted/30 px-4 py-4 text-[15px] font-medium text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/40 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-[0.08em] text-muted-foreground/70">
                Caja (unidades) *
              </label>
              <div className="relative">
                <Box className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                <input
                  type="number"
                  {...register("batchSize", { valueAsNumber: true })}
                  placeholder="12"
                  className={cn(
                    "w-full rounded-2xl border bg-muted/30 px-3 py-4 pl-9 text-[15px] font-medium text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 transition-all",
                    errors.batchSize
                      ? "border-destructive/50 focus:ring-destructive/20"
                      : "border-border/50 focus:ring-orange-500/20 focus:border-orange-500/40",
                  )}
                />
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black uppercase tracking-[0.08em] text-muted-foreground/70">
              Descripción
            </label>
            <div className="relative">
              <Tag className="absolute left-4 top-4 h-4 w-4 text-muted-foreground/40" />
              <textarea
                {...register("description")}
                placeholder="Notas adicionales (opcional)"
                rows={2}
                className="w-full rounded-2xl border border-border/50 bg-muted/30 px-4 py-4 pl-11 text-[15px] font-medium text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/40 resize-none transition-all"
              />
            </div>
          </div>
        </form>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent px-5 pt-6 pb-6">
        <button
          onClick={handleSubmit((data) => mutate(data))}
          disabled={isPending}
          className="w-full h-[58px] rounded-2xl bg-crimson hover:bg-crimson/90 disabled:opacity-50 text-white font-black text-[15px] shadow-[0_8px_25px_rgba(216,19,53,0.25)] transition-all flex items-center justify-center gap-2"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Crear Producto"
          )}
        </button>
      </div>
    </div>
  );
}

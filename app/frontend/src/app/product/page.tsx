import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  Package,
  PencilLine,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";

import { getProducts } from "@/features/products/api/get-products";
import type { Product } from "@/features/products/api/product.schema";
import { cn } from "@/lib/utils";
import { formatChileanPeso } from "@/utils/format-currency";

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

const TYPE_COLORS: Record<string, string> = {
  whisky: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  ron: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20",
  gin: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  tequila: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  vodka: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
  licor: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20",
  aguardiente: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
  energy_drink: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
};

export default function ProductListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (location.state && typeof location.state === "object" && "toast" in location.state) {
      const message = (location.state as { toast: string }).toast;
      setTimeout(() => toast.success(message), 100);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const { data, isPending, error } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const filtered = useMemo(() => {
    const products = data?.products ?? [];
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (TYPE_LABELS[p.type] ?? p.type).toLowerCase().includes(q),
    );
  }, [data, search]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-4 pt-6 pb-8 sm:px-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/10 border border-orange-500/20">
            <Package className="h-5 w-5 text-orange-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-black text-foreground leading-tight">Productos</h1>
            {data && (
              <p className="text-[11px] text-muted-foreground/60 font-medium">
                {data.products.length} {data.products.length === 1 ? "producto" : "productos"}
              </p>
            )}
          </div>
          <button
            onClick={() => navigate("/product/new")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-crimson hover:bg-crimson/90 text-white shadow-lg shadow-crimson/20 transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <input
            type="text"
            placeholder="Buscar por nombre o tipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full bg-muted/40 border border-border/40 py-3 pl-11 pr-10 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/40"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted/60"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground/50" />
            </button>
          )}
        </div>

        {/* States */}
        {isPending && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/40" />
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            Error al cargar los productos.
          </div>
        )}

        {!isPending && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Package className="h-10 w-10 text-muted-foreground/20" />
            {search ? (
              <>
                <p className="text-sm font-semibold text-muted-foreground/60">Sin resultados</p>
                <button
                  onClick={() => setSearch("")}
                  className="text-xs text-orange-500 hover:text-orange-400 font-medium"
                >
                  Limpiar búsqueda
                </button>
              </>
            ) : (
              <p className="text-sm font-semibold text-muted-foreground/60">
                No hay productos. Agregá uno con el botón +
              </p>
            )}
          </div>
        )}

        {/* Product list */}
        <div className="flex flex-col gap-2">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={() => navigate(`/product/${product.id}/edit`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  onEdit,
}: {
  product: Product;
  onEdit: () => void;
}) {
  const typeColor = TYPE_COLORS[product.type] ?? "bg-muted/30 text-muted-foreground border-border/20";
  const typeLabel = TYPE_LABELS[product.type] ?? product.type;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-4">
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-foreground leading-tight truncate">
          {product.name}
        </p>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wide",
              typeColor,
            )}
          >
            {typeLabel}
          </span>
          {product.sizeMl && (
            <span className="text-[11px] text-muted-foreground/50 font-medium">
              {product.sizeMl} ml
            </span>
          )}
          <span className="text-[11px] text-muted-foreground/40 font-medium">
            · caja x{product.batchSize}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-0.5 shrink-0 mr-2">
        <p className="text-sm font-black text-foreground tracking-tight">
          {formatChileanPeso(product.sellPriceClient)}
        </p>
        <p className="text-[11px] text-muted-foreground/50 font-medium">
          costo {formatChileanPeso(product.buyPriceSupplier)}
        </p>
      </div>

      <button
        onClick={onEdit}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/40 bg-muted/30 hover:bg-muted/60 transition-colors"
      >
        <PencilLine className="h-4 w-4 text-muted-foreground/60" />
      </button>
    </div>
  );
}

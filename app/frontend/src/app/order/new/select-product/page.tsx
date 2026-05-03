import { useMemo, useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, Search } from "lucide-react";

import httpClient from "@/lib/api-provider";
import type { Product } from "@/features/orders/api/product.schema";
import { formatChileanPeso } from "@/utils/format-currency";
import { useOrderDraftStore } from "@/features/orders/state/use-order-draft";

type ProductQuery = { products: Product[] };

export default function SelectProductPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setDraft } = useOrderDraftStore();
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isPending } = useQuery<ProductQuery>({
    queryKey: ["products"],
    queryFn: () => httpClient.get("/products").then((res) => res.data),
  });

  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(id);
  }, []);

  const normalizeText = (str: string) =>
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filtered = useMemo(() => {
    if (!data?.products) return [];
    if (!search.trim()) return data.products;
    const q = normalizeText(search);
    return data.products.filter((p) => normalizeText(p.name).includes(q));
  }, [data?.products, search]);

  const handleSelect = (product: Product) => {
    setDraft({ ...(location.state ?? {}), selectProduct: product });
    navigate(-1);
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Search bar */}
      <div className="sticky top-16 z-10 bg-background/95 backdrop-blur border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-3 rounded-xl bg-muted/50 border border-border/50 px-4 h-11 focus-within:border-primary/40 focus-within:bg-muted/80 transition-colors">
          <Search className="size-4 text-muted-foreground/50 shrink-0" />
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/40"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/20 text-muted-foreground/60 hover:bg-muted-foreground/30 text-xs font-bold shrink-0 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {!isPending && data?.products && (
          <p className="text-[11px] text-muted-foreground/40 font-bold uppercase tracking-wider mt-2 px-1">
            {filtered.length === data.products.length
              ? `${data.products.length} productos`
              : `${filtered.length} de ${data.products.length}`}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-2">
        {isPending && (
          <div className="flex justify-center py-20">
            <div className="size-8 animate-spin rounded-full border-4 border-border border-t-primary" />
          </div>
        )}

        {!isPending && filtered.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 mb-4">
              <Package className="size-7 text-muted-foreground/30" />
            </div>
            <p className="font-bold text-muted-foreground/50">Sin resultados</p>
            <p className="text-sm text-muted-foreground/30 mt-1">
              {search ? `Nada coincide con "${search}"` : "No hay productos cargados"}
            </p>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="rounded-2xl border border-border/40 bg-card overflow-hidden divide-y divide-border/30">
            {filtered.map((product) => (
              <button
                key={product.id}
                onClick={() => handleSelect(product)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 active:bg-primary/5 transition-colors text-left"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <Package className="size-4 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground truncate leading-tight">
                    {product.name}
                  </p>
                  <p className="text-xs text-muted-foreground/50 mt-0.5">
                    Precio sugerido
                  </p>
                </div>
                <span className="text-sm font-black text-primary shrink-0 ml-2">
                  {formatChileanPeso(product.sellPriceClient)}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="h-8" />
      </div>
    </div>
  );
}

import { useMemo, useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, Search } from "lucide-react";

import httpClient from "@/lib/api-provider";
import type { Product } from "@/features/orders/api/product.schema";
import { formatChileanPeso } from "@/utils/format-currency";

type ProductQuery = { products: Product[] };

export default function SelectProductPage() {
  const navigate = useNavigate();
  const location = useLocation();
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

  const filtered = useMemo(() => {
    if (!data?.products) return [];
    if (!search.trim()) return data.products;
    const q = search.toLowerCase();
    return data.products.filter((p) => p.name.toLowerCase().includes(q));
  }, [data?.products, search]);

  const handleSelect = (product: Product) => {
    navigate("/order/new", {
      replace: true,
      state: {
        ...(location.state ?? {}),
        selectedProduct: product,
      },
    });
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Search bar — sticky below navbar (~64px) */}
      <div className="sticky top-16 z-10 bg-background border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-3 rounded-xl bg-muted/40 border border-border/40 px-4 h-12">
          <Search className="size-4 text-muted-foreground/40 shrink-0" />
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/40"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-muted-foreground/40 hover:text-foreground text-sm font-bold shrink-0"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="px-4 py-2">
        {isPending && (
          <div className="flex justify-center py-16">
            <div className="size-8 animate-spin rounded-full border-4 border-border border-t-primary" />
          </div>
        )}

        {!isPending && filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground/60 py-12">
            No hay resultados.
          </p>
        )}

        {filtered.map((product) => (
          <button
            key={product.id}
            onClick={() => handleSelect(product)}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-muted/40 active:bg-muted/60 transition-colors text-left"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0">
              <Package className="size-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base text-foreground truncate">{product.name}</p>
            </div>
            <span className="text-sm font-black text-primary shrink-0">
              {formatChileanPeso(product.sellPriceClient)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

import { useMemo, useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, Users } from "lucide-react";

import httpClient from "@/lib/api-provider";
import type { Client } from "@/features/client/api/client.schema";
import { useOrderDraftStore } from "@/features/orders/state/use-order-draft";

type ClientQuery = { clients: Client[] };

function ClientAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 border border-primary/20">
      <span className="text-sm font-black text-primary leading-none">{initials}</span>
    </div>
  );
}

export default function SelectClientPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setDraft } = useOrderDraftStore();
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isPending } = useQuery<ClientQuery>({
    queryKey: ["clients"],
    queryFn: () => httpClient.get("/clients").then((res) => res.data),
  });

  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(id);
  }, []);

  const filtered = useMemo(() => {
    if (!data?.clients) return [];
    if (!search.trim()) return data.clients;
    const q = search.toLowerCase();
    return data.clients.filter((c) => c.localName.toLowerCase().includes(q));
  }, [data?.clients, search]);

  const handleSelect = (client: Client) => {
    setDraft({ ...(location.state ?? {}), selectClient: client });
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
            placeholder="Filtrar por nombre..."
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

        {/* Count */}
        {!isPending && data?.clients && (
          <p className="text-[11px] text-muted-foreground/40 font-bold uppercase tracking-wider mt-2 px-1">
            {filtered.length === data.clients.length
              ? `${data.clients.length} clientes`
              : `${filtered.length} de ${data.clients.length}`}
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
              <Users className="size-7 text-muted-foreground/30" />
            </div>
            <p className="font-bold text-muted-foreground/50">Sin resultados</p>
            <p className="text-sm text-muted-foreground/30 mt-1">
              {search ? `Nada coincide con "${search}"` : "No hay clientes cargados"}
            </p>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="rounded-2xl border border-border/40 bg-card overflow-hidden divide-y divide-border/30">
            {filtered.map((client) => (
              <button
                key={client.id}
                onClick={() => handleSelect(client)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 active:bg-primary/5 transition-colors text-left"
              >
                <ClientAvatar name={client.localName} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground truncate leading-tight">
                    {client.localName}
                  </p>
                  {client.phone && (
                    <p className="text-xs text-muted-foreground/50 mt-0.5 truncate">
                      {client.phone}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="h-8" />
      </div>
    </div>
  );
}

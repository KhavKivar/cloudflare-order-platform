import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  MapPin,
  PencilLine,
  Phone,
  Plus,
  Search,
  Store,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  useForm,
  type SubmitHandler,
  type ControllerRenderProps,
} from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Client } from "@/features/client/api/client.schema";
import { deleteClient } from "@/features/client/api/delete-client";
import { getClients } from "@/features/client/api/get-clients";
import {
  updateClient,
  UpdateClientDtoSchema,
  type UpdateClientDto,
} from "@/features/client/api/update-client";

export default function ClientsAllPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isEditOpen, setEditOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isPending, error } = useQuery({
    queryKey: ["clients", "all"],
    queryFn: getClients,
  });

  const form = useForm<UpdateClientDto>({
    resolver: zodResolver(UpdateClientDtoSchema),
    defaultValues: {
      localName: "",
      address: "",
      phone: "",
      phoneId: "",
    },
  });

  const { reset, handleSubmit } = form;

  useEffect(() => {
    if (!editingClient) return;
    reset({
      localName: editingClient.localName ?? "",
      address: editingClient.address ?? "",
      phone: editingClient.phone ?? "",
      phoneId: editingClient.phoneId ?? "",
    });
  }, [editingClient, reset]);

  const updateMutation = useMutation({
    mutationFn: (payload: { id: number | string; data: UpdateClientDto }) =>
      updateClient(payload.id, payload.data),
    onSuccess: () => {
      toast.success("Cliente actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setEditOpen(false);
      setEditingClient(null);
    },
    onError: (mutationError) => {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "No se pudo actualizar el cliente.";
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      toast.success("Cliente eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (mutationError) => {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "No se pudo eliminar el cliente.";
      toast.error(message);
    },
  });

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setEditOpen(true);
  };

  const handleDelete = (client: Client) => {
    if (deleteMutation.isPending) return;
    deleteMutation.mutate(client.id);
  };

  const onSubmit: SubmitHandler<UpdateClientDto> = (formData) => {
    if (!editingClient) return;
    updateMutation.mutate({
      id: editingClient.id,
      data: { ...formData, phoneId: formData.phone },
    });
  };

  const clients = useMemo(() => data?.clients ?? [], [data]);

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter(
      (c) =>
        (c.localName ?? "").toLowerCase().includes(q) ||
        (c.phone ?? "").toLowerCase().includes(q) ||
        (c.address ?? "").toLowerCase().includes(q),
    );
  }, [clients, search]);

  const [visibleCount, setVisibleCount] = useState(20);
  const CLIENTS_PER_PAGE = 20;
  const visibleClients = filteredClients.slice(0, visibleCount);
  const hasMore = visibleCount < filteredClients.length;

  const loadMoreRef = useCallback(
    (node: HTMLElement | null) => {
      if (!node) return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setVisibleCount((prev) =>
              Math.min(prev + CLIENTS_PER_PAGE, filteredClients.length),
            );
          }
        },
        { threshold: 0.5, rootMargin: "100px" },
      );
      observer.observe(node);
      return () => observer.disconnect();
    },
    [hasMore, filteredClients.length],
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-4 pt-6 pb-8 sm:px-6">

        {/* HEADER */}
        <header className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground leading-none">
                Directorio
              </h1>
              <p className="text-xs font-medium text-muted-foreground/60 mt-0.5">
                {clients.length} clientes activos
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate("/client/new")}
            size="icon"
            className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-white shrink-0 shadow-lg shadow-primary/20"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </header>

        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 pointer-events-none z-10" />
          <Input
            type="text"
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-full bg-muted/40 border-border/40 pl-11 pr-10 h-11 focus-visible:ring-primary/30 focus-visible:border-border/80"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted/60 text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* FEEDBACK STATES */}
        {isPending && (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <div className="size-10 animate-spin rounded-full border-4 border-border border-t-primary mb-4" />
            <p className="font-bold tracking-tight text-sm">Cargando directorio...</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="font-bold text-destructive">Error al cargar clientes</p>
            <p className="mt-1 text-sm text-destructive/70">
              Por favor intenta de nuevo más tarde.
            </p>
          </div>
        )}

        {!isPending && !error && clients.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed border-border/40 rounded-2xl mt-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/40 mb-4">
              <Store className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-black text-foreground">Sin clientes aún</h3>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Registrá el primer local con el botón +
            </p>
          </div>
        )}

        {!isPending && !error && clients.length > 0 && filteredClients.length === 0 && search && (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center border border-dashed border-border/40 rounded-2xl mt-4">
            <h3 className="text-base font-black text-foreground">Sin resultados</h3>
            <p className="text-sm text-muted-foreground/60 mt-1">
              No hay clientes que coincidan con "{search}"
            </p>
            <button
              onClick={() => setSearch("")}
              className="mt-4 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
            >
              Limpiar búsqueda
            </button>
          </div>
        )}

        {/* LIST */}
        <section className="flex flex-col gap-2">
          {visibleClients.map((client) => (
            <article
              key={client.id}
              className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-4 transition-colors hover:border-border/80"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <Store className="h-5 w-5 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground truncate leading-snug">
                  {client.localName || "Cliente sin nombre"}
                </h3>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {client.phone && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
                      <Phone className="h-3 w-3 shrink-0" />
                      <span className="truncate max-w-[120px]">{client.phone}</span>
                    </span>
                  )}
                  {client.phone && client.address && (
                    <span className="w-1 h-1 rounded-full bg-border/60" />
                  )}
                  {client.address && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate max-w-[120px]">{client.address}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-0.5 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-muted/60"
                  onClick={() => handleEdit(client)}
                >
                  <PencilLine className="h-3.5 w-3.5" />
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent onClick={(e) => e.stopPropagation()}>
                    <DialogHeader>
                      <DialogTitle>¿Eliminar cliente?</DialogTitle>
                      <DialogDescription>
                        Esta acción no se puede deshacer. Se eliminará el
                        registro de {client.localName}.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                      <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                      </DialogClose>
                      <Button
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(client);
                        }}
                      >
                        Eliminar Cliente
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </article>
          ))}

          {hasMore && (
            <div
              ref={loadMoreRef}
              className="flex items-center justify-center py-8"
            >
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/40" />
            </div>
          )}
        </section>
      </div>

      {/* EDIT DIALOG */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditingClient(null);
        }}
      >
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader className="px-6 pt-6 pb-2 text-left">
            <DialogTitle className="text-xl font-black text-foreground">
              Editar Cliente
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Modificá los datos del local seleccionado.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5 px-6 pb-6"
            >
              <FormField
                control={form.control}
                name="localName"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<UpdateClientDto, "localName">;
                }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Nombre del Local
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="h-11 rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<UpdateClientDto, "address">;
                }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Dirección
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="h-11 rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<UpdateClientDto, "phone">;
                }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Teléfono
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        inputMode="tel"
                        className="h-11 rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="h-11 rounded-xl">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={updateMutation.isPending} className="h-11 rounded-xl">
                  {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

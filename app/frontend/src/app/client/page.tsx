import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Check,
  ChevronsUpDown,
  Loader2,
  MapPin,
  PencilLine,
  Phone,
  Plus,
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Client } from "@/features/client/api/client.schema";
import { deleteClient } from "@/features/client/api/delete-client";
import { getClients } from "@/features/client/api/get-clients";
import {
  updateClient,
  UpdateClientDtoSchema,
  type UpdateClientDto,
} from "@/features/client/api/update-client";
import { cn } from "@/lib/utils";

export default function ClientsAllPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isEditOpen, setEditOpen] = useState(false);
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");

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
    if (!editingClient) {
      return;
    }

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
    if (deleteMutation.isPending) {
      return;
    }
    deleteMutation.mutate(client.id);
  };

  const onSubmit: SubmitHandler<UpdateClientDto> = (formData) => {
    if (!editingClient) {
      return;
    }

    const payload: UpdateClientDto = {
      ...formData,
      phoneId: formData.phone,
    };

    updateMutation.mutate({ id: editingClient.id, data: payload });
  };

  const clients = useMemo(() => data?.clients ?? [], [data]);
  const filteredClients = useMemo(() => {
    const selectedClientExists = clients.some(
      (client) => String(client.id) === selectedClientId,
    );
    const activeClientId = selectedClientExists ? selectedClientId : "";

    if (!activeClientId) {
      return clients;
    }

    return clients.filter((client) => String(client.id) === activeClientId);
  }, [clients, selectedClientId]);

  const activeClient = useMemo(
    () => clients.find((client) => String(client.id) === selectedClientId),
    [clients, selectedClientId],
  );

  const activeClientId = activeClient ? selectedClientId : "";
  const hasClients = clients.length > 0;

  const [visibleCount, setVisibleCount] = useState(10);
  const CLIENTS_PER_PAGE = 10;

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
    <div className="min-h-screen bg-background pb-20">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pt-8 sm:px-6">
        {/* HEADER */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <Users className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Directorio de Clientes
              </h1>
              <p className="text-sm font-medium text-muted-foreground">
                {clients.length} locales registrados
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
            <Button
              onClick={() => navigate("/client/new")}
              className="w-full sm:w-auto sm:px-8"
            >
              <Plus className="mr-2 size-5" />
              Nuevo Cliente
            </Button>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <Popover open={isFilterOpen} onOpenChange={setFilterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isFilterOpen}
                    className="h-11 w-full justify-between sm:w-[260px]"
                  >
                    <span className="truncate">
                      {activeClientId
                        ? (activeClient?.localName ?? "Filtrar cliente...")
                        : "Filtrar cliente..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] p-0 sm:w-(--radix-popover-trigger-width)"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder="Filtrar por nombre..." />
                    <CommandList>
                      <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                      <CommandGroup>
                        {clients.map((client) => (
                          <CommandItem
                            key={client.id}
                            value={client.localName}
                            onSelect={() => {
                              const stringClientId = String(client.id);
                              setSelectedClientId(
                                stringClientId === activeClientId
                                  ? ""
                                  : stringClientId,
                              );
                              setFilterOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                activeClientId === String(client.id)
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {client.localName}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {activeClientId && (
                <Button
                  variant="ghost"
                  onClick={() => setSelectedClientId("")}
                  className="w-full sm:w-auto"
                >
                  <X className="mr-2 h-4 w-4" />
                  Limpiar
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {isPending && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-muted-foreground">
              <Loader2 className="size-10 animate-spin text-primary mb-4" />
              <p className="font-bold">Cargando directorio...</p>
            </div>
          )}

          {error && (
            <div className="col-span-full rounded-3xl border border-destructive/20 bg-destructive/5 p-12 text-center text-destructive">
              <AlertCircle className="mx-auto size-10 mb-4 opacity-50" />
              <p className="font-bold border-none">Error al cargar clientes</p>
              <p className="mt-1 text-sm opacity-80">
                Por favor intenta de nuevo más tarde.
              </p>
            </div>
          )}

          {/* ESTADO VACÍO */}
          {!isPending && !error && !hasClients && (
            <div className="col-span-full flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-muted bg-card/50 p-20 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-muted-foreground mb-6">
                <Store className="size-10" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                Sin clientes aún
              </h3>
              <p className="mt-2 text-muted-foreground font-medium max-w-xs mx-auto">
                Registra tu primer local comercial para empezar a tomar pedidos.
              </p>
            </div>
          )}

          {/* LISTADO DE TARJETAS */}
          {visibleClients.map((client) => (
            <Card
              key={client.id}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:shadow-md hover:bg-accent/5"
            >
              <CardContent className="p-6">
                <div className="flex flex-col gap-6">
                  {/* Top: Nombre y Acciones */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Store className="size-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
                          {client.address && client.address.includes("Chile")
                            ? "Cliente Nacional"
                            : "Local Comercial"}
                        </span>
                        <h3 className="text-xl font-bold leading-tight text-card-foreground text-left line-clamp-1">
                          {client.localName || "Cliente sin nombre"}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => handleEdit(client)}
                      >
                        <PencilLine className="size-4" />
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full text-destructive hover:bg-destructive/10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-3xl"
                        >
                          <DialogHeader>
                            <DialogTitle>¿Eliminar cliente?</DialogTitle>
                            <DialogDescription>
                              Esta acción no se puede deshacer. Se eliminará el
                              registro del cliente {client.localName}.
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
                  </div>

                  {/* Info: Teléfono y Dirección */}
                  <div className="grid grid-cols-1 gap-2 rounded-2xl bg-muted/30 p-5 border border-border/50">
                    <div className="flex items-center gap-4 text-left">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background text-muted-foreground shadow-sm">
                        <Phone className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                          Contacto
                        </p>
                        <p className="truncate text-base font-bold text-foreground">
                          {client.phone || "No registrado"}
                        </p>
                      </div>
                    </div>
                    <div className="h-px bg-border/50 my-1 mx-2" />
                    <div className="flex items-center gap-4 text-left">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background text-muted-foreground shadow-sm">
                        <MapPin className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                          Ubicación
                        </p>
                        <p className="truncate text-base font-semibold text-muted-foreground">
                          {client.address || "Sin dirección registrada"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Sentinel for infinite scroll */}
          {hasMore && (
            <div
              ref={loadMoreRef}
              className="col-span-full h-20 flex items-center justify-center"
            >
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          )}
        </section>
      </div>

      {/* DIALOG DE EDICIÓN */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditingClient(null);
        }}
      >
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader className="px-6 pt-6 pb-2 text-left">
            <DialogTitle className="text-2xl font-bold text-foreground">
              Editar Cliente
            </DialogTitle>
            <DialogDescription className="text-base font-medium text-muted-foreground">
              Modifica los datos del local seleccionado.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6 px-6 pb-6"
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
                      <Input {...field} className="h-12 rounded-xl" />
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
                      <Input {...field} className="h-12 rounded-xl" />
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
                        className="h-12 rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-xl sm:px-8"
                  >
                    Cancelar
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending
                    ? "Guardando..."
                    : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button/button";
import { Card } from "@/components/ui/Card/card";
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
import FormField from "@/components/ui/Form/form_field";
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateClientDto>({
    resolver: zodResolver(UpdateClientDtoSchema),
    defaultValues: {
      localName: "",
      address: "",
      phone: "",
      phoneId: "",
    },
  });

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
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pt-8 sm:px-6">
        {/* HEADER: Modern & Categorized */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-200">
              <Users className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Directorio de Clientes
              </h1>
              <p className="text-sm font-medium text-slate-500">
                {clients.length} locales registrados
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
            <Button
              variant="primary"
              onClick={() => navigate("/client/new")}
              className="group h-12 w-full rounded-md bg-slate-900 text-white shadow-xl shadow-slate-200 transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] sm:h-11 sm:w-auto sm:px-8"
            >
              <Plus className="mr-2 size-5 transition-transform group-hover:rotate-90" />
              Nuevo Cliente
            </Button>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <Popover open={isFilterOpen} onOpenChange={setFilterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isFilterOpen}
                    className="h-12 w-full justify-between bg-white sm:h-11 sm:w-[260px]"
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
                  className="w-[calc(100vw-32px)] max-w-4xl p-0 sm:w-[var(--radix-popover-trigger-width)]"
                  align="start"
                  sideOffset={4}
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
                  variant="outline"
                  onClick={() => setSelectedClientId("")}
                  className="w-full border-slate-300 bg-white text-slate-700 hover:bg-slate-50 sm:w-auto"
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
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2 className="size-10 animate-spin text-amber-500 mb-4" />
              <p className="font-bold">Cargando directorio...</p>
            </div>
          )}

          {error && (
            <div className="col-span-full rounded-[2.5rem] border border-rose-100 bg-rose-50 p-12 text-center text-rose-600">
              <AlertCircle className="mx-auto size-10 mb-4 opacity-50" />
              <p className="font-bold">Error al cargar clientes</p>
              <p className="mt-1 text-sm opacity-80">
                Por favor intenta de nuevo más tarde.
              </p>
            </div>
          )}

          {/* ESTADO VACÍO */}
          {!isPending && !error && !hasClients && (
            <div className="col-span-full flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-200 bg-white/50 p-20 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-300 mb-6">
                <Store className="size-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                Sin clientes aún
              </h3>
              <p className="mt-2 text-slate-500 font-medium max-w-xs mx-auto">
                Registra tu primer local comercial para empezar a tomar pedidos.
              </p>
            </div>
          )}

          {/* LISTADO DE TARJETAS */}
          {visibleClients.map((client) => (
            <Card
              key={client.id}
              className="group relative flex flex-col overflow-hidden rounded-[2.5rem] border-0 bg-white p-6 shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-xl hover:shadow-slate-200/50"
            >
              <div className="flex flex-col gap-6">
                {/* Top: Nombre y Acciones */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                      <Store className="size-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600/80">
                        {client.address && client.address.includes("Chile")
                          ? "Cliente Nacional"
                          : "Local Comercial"}
                      </span>
                      <h3 className="text-xl font-black leading-tight text-slate-900 text-left line-clamp-1">
                        {client.localName || "Cliente sin nombre"}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      onClick={() => handleEdit(client)}
                    >
                      <PencilLine className="size-4" />
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-700"
                          onClick={(e) => e.stopPropagation()} // Evita seleccionar la card al abrir el diálogo
                          aria-label="Eliminar cliente"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </DialogTrigger>
                      <DialogContent onClick={(e) => e.stopPropagation()}>
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
                <div className="grid grid-cols-1 gap-2 rounded-[1.5rem] bg-slate-50/80 p-5 ring-1 ring-slate-100/50">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                      <Phone className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-left mb-0.5">
                        Contacto
                      </p>
                      <p className="truncate text-base font-black text-slate-900 text-left">
                        {client.phone || "No registrado"}
                      </p>
                    </div>
                  </div>
                  <div className="h-px bg-slate-200/50 my-1 mx-2" />
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                      <MapPin className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-left mb-0.5">
                        Ubicación
                      </p>
                      <p className="truncate text-base font-bold text-slate-600 text-left">
                        {client.address || "Sin dirección registrada"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {/* Sentinel for infinite scroll */}
          {hasMore && (
            <div
              ref={loadMoreRef}
              className="col-span-full h-20 flex items-center justify-center"
            >
              <Loader2 className="size-8 animate-spin text-amber-500" />
            </div>
          )}
        </section>
      </div>

      {/* DIALOG DE EDICIÓN - Optimizado para móvil */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditingClient(null);
        }}
      >
        <DialogContent className="">
          <DialogHeader className="p-8 pb-4 text-left shrink-0">
            <DialogTitle className="text-2xl font-black text-slate-900">
              Editar Cliente
            </DialogTitle>
            <DialogDescription className="text-base font-medium text-slate-500">
              Modifica los datos del local seleccionado.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6 px-8">
              <FormField
                label="Nombre del Local"
                error={errors.localName?.message}
                labelClassName="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2"
              >
                <Input
                  {...register("localName")}
                  className="h-14 rounded-2xl bg-slate-50 border-0 ring-1 ring-slate-200"
                />
              </FormField>
              <FormField
                label="Dirección"
                error={errors.address?.message}
                labelClassName="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2"
              >
                <Input
                  {...register("address")}
                  className="h-14 rounded-2xl bg-slate-50 border-0 ring-1 ring-slate-200"
                />
              </FormField>
              <FormField
                label="Teléfono"
                error={errors.phone?.message}
                labelClassName="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2"
              >
                <Input
                  {...register("phone")}
                  inputMode="tel"
                  className="h-14 rounded-2xl bg-slate-50 border-0 ring-1 ring-slate-200"
                />
              </FormField>
              <div className="flex flex-col sm:flex-row gap-2 justify-end py-4">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-14 w-full rounded-2xl font-bold sm:h-12 sm:w-auto sm:px-8"
                  >
                    Cancelar
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  variant="primary"
                  className="h-14 w-full rounded-2xl font-bold bg-slate-900 sm:h-12 sm:w-auto sm:px-8"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending
                    ? "Guardando..."
                    : "Guardar Cambios"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

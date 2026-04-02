"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, ShoppingBag, ChevronsUpDown, Check, X } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useState, useMemo } from "react";

import { Button } from "@/components/ui/Button/button";
import { deleteOrder } from "@/features/orders/api/delete-order";
import {
  getOrders,
  type OrderListItem,
  type OrdersResponse,
} from "@/features/orders/api/get-orders";
import {
  type OrderStatus,
  updateOrderStatus,
} from "@/features/orders/api/update-order-status";
import OrderCard from "@/features/orders/components/OrderCard";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function OrdersListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // UI State
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(""); // This stores the stringified orderId

  // Data Fetching
  const { data, isPending, error } = useQuery<OrdersResponse>({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  // Filter Logic: Only show the selected order if a value exists
  const filteredOrders = useMemo(() => {
    if (!value || !data?.orders) return data?.orders ?? [];
    return data.orders.filter((order) => String(order.orderId) === value);
  }, [data, value]);

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (payload: { orderId: number; order: OrderListItem }) =>
      deleteOrder(payload.orderId),
    onSuccess: () => {
      toast.success("Pedido eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (mutationError) => {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "No se pudo eliminar el pedido.";
      toast.error(message);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (payload: { orderId: number; status: OrderStatus }) =>
      updateOrderStatus(payload.orderId, payload.status),
    onSuccess: () => {
      toast.success("Estado actualizado");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => {
      toast.error("Error al actualizar estado");
    },
  });

  const handleDelete = (order: OrderListItem) => {
    if (deleteMutation.isPending) return;
    deleteMutation.mutate({ orderId: order.orderId, order });
  };

  const handleStatusChange = (orderId: number, newStatus: OrderStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pt-8 sm:px-6">
        {/* HEADER SECTION */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-200">
              <ShoppingBag className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Lista de Pedidos
              </h1>
              <p className="text-sm font-medium text-slate-500">
                {data?.orders.length ?? 0} registros encontrados
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
            <Button
              onClick={() => navigate("/order/new")}
              className="group h-10 w-full rounded-md bg-slate-900 text-white shadow-lg transition-all hover:bg-slate-800 sm:w-auto"
            >
              <Plus className="mr-2 size-4 transition-transform group-hover:rotate-90" />
              Nuevo Pedido
            </Button>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="h-10 w-full justify-between border-slate-200 bg-white shadow-none sm:w-[240px]"
                  >
                    <span className="truncate">
                      {value && data?.orders
                        ? (data.orders.find((f) => String(f.orderId) === value)
                            ?.localName ?? `Pedido #${value}`)
                        : "Filtrar pedido..."}
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
                        {data?.orders.map((order) => (
                          <CommandItem
                            key={order.orderId}
                            value={order.localName ?? `Pedido ${order.orderId}`}
                            onSelect={() => {
                              const strId = String(order.orderId);
                              setValue(strId === value ? "" : strId);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                value === String(order.orderId)
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {order.localName ?? `Pedido #${order.orderId}`}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {value && (
                <Button
                  variant="outline"
                  onClick={() => setValue("")}
                  className="w-full border-slate-200 bg-white text-slate-700 shadow-none hover:bg-slate-50 sm:w-auto"
                >
                  <X className="mr-2 h-4 w-4" />
                  Limpiar
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* FEEDBACK STATES */}
        {isPending && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="size-12 animate-spin rounded-full border-4 border-slate-200 border-t-rose-600 mb-4" />
            <p className="font-bold tracking-tight">Cargando pedidos...</p>
          </div>
        )}

        {error && (
          <div className="rounded-[2rem] border border-rose-100 bg-rose-50 p-8 text-center">
            <p className="font-bold text-rose-600">Error al cargar la lista</p>
            <p className="mt-1 text-sm text-rose-500/80">
              Por favor intenta de nuevo más tarde.
            </p>
          </div>
        )}

        {!isPending && !error && data?.orders.length === 0 && (
          <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white/50 p-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-300 mb-4">
              <ShoppingBag className="size-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No hay pedidos</h3>
          </div>
        )}

        {/* LIST SECTION */}
        <section className="space-y-4">
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
            {filteredOrders?.map((order) => (
              <OrderCard
                key={order.orderId}
                id={order.orderId}
                localName={order.localName ?? "Cliente Local"}
                status={order.status}
                createdAt={order.createdAt}
                items={order.lines.map((item) => ({
                  name: item.productName ?? "Producto",
                  quantity: item.quantity,
                  pricePerUnit: item.pricePerUnit,
                  buyPriceSupplier: item.buyPriceSupplier,
                }))}
                onEdit={(orderId) => navigate(`/order/${orderId}/edit`)}
                onDelete={() => handleDelete(order)}
                onStatusChange={handleStatusChange}
                isSelected={value === String(order.orderId)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

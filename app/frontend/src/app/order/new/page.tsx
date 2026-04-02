import { Button } from "@/components/ui/Button/button";
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
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FormField from "@/components/ui/Form/form_field";
import Input from "@/components/ui/Input/input";
import httpClient from "@/lib/api-provider";
import type { Client } from "@/features/client/api/client.schema";
import { createOrder } from "@/features/orders/api/create-order";
import type { OrderCreateDto } from "@/features/orders/api/order.schema";
import type { Product } from "@/features/orders/api/product.schema";
import { cn } from "@/lib/utils";
import { formatChileanPeso } from "@/utils/format-currency";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ChevronRight,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Store,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import z from "zod";

const schema = z.object({
  clientId: z.number("El cliente es obligatorio"),
  item: z
    .string("El producto es obligatorio")
    .nonempty("El producto es obligatorio"),
  quantity: z.string().nonempty("La cantidad debe ser al menos 1"),
  pricePerUnit: z.string().nonempty("El precio es obligatorio"),
});

type FormFields = z.infer<typeof schema>;
type ProductQuery = { products: Product[] };
type ClientQuery = { clients: Client[] };

export default function OrdersPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
  });

  const {
    isPending: productsPending,
    error: productsError,
    data: productsData,
  } = useQuery<ProductQuery>({
    queryKey: ["products"],
    queryFn: () => httpClient.get("/products").then((res) => res.data),
  });

  const { isPending, error, data } = useQuery<ClientQuery>({
    queryKey: ["clients"],
    queryFn: () => httpClient.get("/clients").then((res) => res.data),
  });

  const isLoadingData = isPending || productsPending;
  const isErrorData = error || productsError;
  const isSuccessData = data || productsData;

  const [selectClient, setSelectClient] = useState<Client | null>(null);
  const [isClientOpen, setClientOpen] = useState(false);

  const [selectProduct, setSelectProduct] = useState<Product | null>(null);
  const [isProductOpen, setProductOpen] = useState(false);
  const mutation = useMutation({ mutationFn: createOrder });

  const [order, setOrder] = useState<OrderCreateDto>({
    clientId: 0,
    items: [],
  });

  const orderItems = order.items.map((item) => {
    const product = productsData?.products.find(
      (entry) => entry.id === item.productId,
    );
    return {
      ...item,
      name: product?.name ?? "Producto",
    };
  });

  const orderTotal = order.items.reduce(
    (total, item) => total + item.pricePerUnit * item.quantity,
    0,
  );

  const handleRemoveItem = (productId: number) => {
    setOrder((prevOrder) => ({
      ...prevOrder,
      items: prevOrder.items.filter((item) => item.productId !== productId),
    }));
  };

  const handleCreateOrder = () => {
    if (order.items.length === 0) {
      toast.error("Debes agregar al menos un producto");
      return;
    }

    mutation.mutate(order, {
      onSuccess: () => {
        navigate("/order", {
          replace: true,
          state: { toast: "Pedido manual creado con éxito" },
        });
      },
      onError: () => {
        toast.error("No se pudo crear el pedido");
      },
    });
  };

  const onSubmit = handleSubmit((data) => {
    const pricePerUnit = Number(data.pricePerUnit) || 0;
    const quantity = Number(data.quantity) || 0;

    const productIndex = order.items.findIndex(
      (item) => item.productId === selectProduct?.id,
    );

    if (productIndex !== -1) {
      const newItems = [...order.items];
      newItems[productIndex].quantity += quantity;
      newItems[productIndex].pricePerUnit = pricePerUnit;
      setOrder({
        ...order,
        items: newItems,
      });
    } else {
      setOrder({
        ...order,
        items: [
          ...order.items,
          {
            productId: selectProduct?.id || 0,
            quantity,
            pricePerUnit,
          },
        ],
      });
    }

    // Reset product selection but keep client
    setSelectProduct(null);
    setValue("item", "");
    setValue("quantity", "");
    setValue("pricePerUnit", "");
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pt-8 sm:px-6">
        {isLoadingData && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="size-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600 mb-4" />
            <p className="font-bold">Cargando datos del sistema...</p>
          </div>
        )}

        {isErrorData && (
          <div className="rounded-[2.5rem] border border-rose-100 bg-rose-50 p-12 text-center text-rose-600">
            <AlertCircle className="mx-auto size-12 mb-4 opacity-50" />
            <p className="text-xl font-black">Error de Sincronización</p>
            <p className="mt-2 text-sm font-medium opacity-80">
              No pudimos cargar la lista de productos o clientes.
            </p>
          </div>
        )}

        {isSuccessData && !isLoadingData && !isErrorData && (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start w-full max-w-full overflow-hidden">
            {/* LADO IZQUIERDO: FORMULARIO */}
            <div className="space-y-6 min-w-0 w-full">
              <header className="space-y-1">
                <h1 className="text-3xl font-black tracking-tight text-slate-900">
                  Crear Pedido Manual
                </h1>
                <p className="text-slate-500 font-medium">
                  Configura los detalles del pedido para el cliente.
                </p>
              </header>

              <form onSubmit={onSubmit} className="space-y-6">
                {/* SELECCIÓN CLIENTE */}
                <div className="rounded-[2rem] border-0 bg-white p-8 shadow-sm ring-1 ring-slate-100 w-full overflow-hidden">
                  <Dialog open={isClientOpen} onOpenChange={setClientOpen}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="group w-full text-left transition-all active:scale-[0.99]"
                      >
                        <FormField
                          label="Cliente / Local"
                          error={errors.clientId?.message}
                          labelClassName="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2"
                        >
                          <div
                            className={cn(
                              "flex h-14 w-full items-center justify-between rounded-2xl border-0 bg-slate-50 px-5 transition-all ring-1 ring-slate-200 hover:ring-indigo-300",
                              selectClient && "bg-indigo-50 ring-indigo-200",
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <Store
                                className={cn(
                                  "size-5",
                                  selectClient
                                    ? "text-indigo-600"
                                    : "text-slate-400",
                                )}
                              />
                              <span
                                className={cn(
                                  "font-bold",
                                  selectClient
                                    ? "text-indigo-900"
                                    : "text-slate-400",
                                )}
                              >
                                {selectClient?.localName ??
                                  "Seleccionar local..."}
                              </span>
                            </div>
                            <ChevronRight className="size-4 text-slate-300" />
                          </div>
                        </FormField>
                      </button>
                    </DialogTrigger>
                    <input
                      type="hidden"
                      {...register("clientId", { valueAsNumber: true })}
                    />
                    <DialogContent className="lg:max-w-4xl lg:h-10/12 fixed inset-0 z-50 flex h-full w-full  max-w-none translate-x-0 translate-y-0 flex-col border-0 bg-white p-0 transition-all sm:left-[50%] sm:top-[50%] sm:h-auto sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-[2.5rem] sm:border sm:shadow-2xl overflow-hidden">
                      <DialogHeader className="bg-slate-900 p-8 text-white">
                        <DialogTitle className="text-2xl font-black">
                          Seleccionar Cliente
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 font-medium">
                          Busca el local comercial para este despacho.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex-1 overflow-hidden p-0 sm:p-4">
                        <Command className="flex h-full flex-col border-0">
                          <div className="flex items-center border-b border-slate-100 px-3">
                            <CommandInput
                              placeholder="Filtrar por nombre..."
                              className="h-12 border-0 focus:ring-0"
                            />
                          </div>
                          <CommandList className="flex-1 max-h-none  py-2">
                            <CommandEmpty className="py-6 text-center text-sm font-medium text-slate-400">
                              No se encontraron clientes.
                            </CommandEmpty>
                            <CommandGroup>
                              {data.clients.map((client: Client) => (
                                <CommandItem
                                  key={client.id}
                                  value={client.localName}
                                  onSelect={() => {
                                    setSelectClient(client);
                                    setValue("clientId", Number(client.id), {
                                      shouldValidate: true,
                                    });
                                    setOrder((prev) => ({
                                      ...prev,
                                      clientId: Number(client.id),
                                    }));
                                    setClientOpen(false);
                                  }}
                                  className="rounded-xl px-4 py-3 aria-selected:bg-indigo-50 aria-selected:text-indigo-900"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                      <Store className="size-4" />
                                    </div>
                                    <span className="font-bold">
                                      {client.localName}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* SELECCIÓN PRODUCTO */}
                <div className="rounded-[2rem] border-0 bg-white p-8 shadow-sm ring-1 ring-slate-100 w-full overflow-hidden">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                    <Plus className="size-4" />
                    Agregar Productos
                  </h3>

                  <div className="grid gap-6">
                    <Dialog open={isProductOpen} onOpenChange={setProductOpen}>
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className="w-full text-left active:scale-[0.99] transition-transform"
                        >
                          <FormField
                            label="Producto"
                            error={errors.item?.message}
                            labelClassName="text-xs font-bold text-slate-700 mb-1.5"
                          >
                            <div
                              className={cn(
                                "flex h-12 w-full items-center justify-between rounded-xl bg-slate-50 px-4 ring-1 ring-slate-200",
                                selectProduct &&
                                  "bg-indigo-50 ring-indigo-200  text-overflow-ellipsis",
                              )}
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <Package
                                  className={cn(
                                    "size-4 shrink-0",
                                    selectProduct
                                      ? "text-indigo-600"
                                      : "text-slate-400",
                                  )}
                                />
                                <span
                                  className={cn(
                                    "text-sm font-medium truncate block min-w-0 flex-1 text-overflow-ellipsis",
                                    selectProduct
                                      ? "text-indigo-900"
                                      : "text-slate-400",
                                  )}
                                >
                                  {selectProduct?.name ?? "Buscar producto..."}
                                </span>
                              </div>
                              <Search className="size-4 text-slate-300 shrink-0 ml-2" />
                            </div>
                          </FormField>
                        </button>
                      </DialogTrigger>
                      <input type="hidden" {...register("item")} />
                      <DialogContent className="lg:max-w-4xl lg:h-10/12 fixed inset-0 z-50 flex h-full w-full max-w-none translate-x-0 translate-y-0 flex-col border-0 bg-white p-0 transition-all sm:left-[50%] sm:top-[50%] sm:h-auto sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-[2.5rem] sm:border sm:shadow-2xl overflow-hidden">
                        <DialogHeader className="bg-slate-900 p-8 text-white">
                          <DialogTitle className="text-2xl font-black">
                            Catálogo de Productos
                          </DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-hidden p-0 sm:p-4 lg:h-full">
                          <Command className="flex h-full flex-col border-0 ">
                            <CommandInput
                              placeholder="Buscar por nombre"
                              className="h-12 border-0"
                            />
                            <CommandList className="flex-1 max-h-none lg:h-full py-2 ">
                              <CommandEmpty className="py-6 text-center text-sm font-medium text-slate-400">
                                No hay resultados.
                              </CommandEmpty>
                              <CommandGroup>
                                {productsData?.products.map(
                                  (product: Product) => (
                                    <CommandItem
                                      key={product.id}
                                      value={product.name}
                                      onSelect={() => {
                                        setSelectProduct(product);
                                        setValue("item", product.name, {
                                          shouldValidate: true,
                                        });
                                        setValue(
                                          "pricePerUnit",
                                          String(product.sellPriceClient),
                                          { shouldValidate: true },
                                        );
                                        setProductOpen(false);
                                      }}
                                      className="rounded-xl px-4 py-3"
                                    >
                                      <div className="flex items-center justify-between w-full gap-4 overflow-hidden">
                                        <span className="font-bold truncate block min-w-0 flex-1">
                                          {product.name}
                                        </span>
                                        <span className="text-xs font-black text-indigo-600 shrink-0">
                                          {formatChileanPeso(
                                            product.sellPriceClient,
                                          )}
                                        </span>
                                      </div>
                                    </CommandItem>
                                  ),
                                )}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        label="Precio Unitario"
                        error={errors.pricePerUnit?.message}
                        labelClassName="text-xs font-bold text-slate-700 mb-1.5"
                      >
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                            $
                          </span>
                          <Input
                            registration={register("pricePerUnit")}
                            className="h-12 rounded-xl pl-8 bg-slate-50 ring-1 ring-slate-200 focus:ring-indigo-300"
                            placeholder="0"
                            type="number"
                          />
                        </div>
                      </FormField>

                      <FormField
                        label="Cantidad"
                        error={errors.quantity?.message}
                        labelClassName="text-xs font-bold text-slate-700 mb-1.5"
                      >
                        <Input
                          registration={register("quantity")}
                          className="h-12 rounded-xl bg-slate-50 ring-1 ring-slate-200 focus:ring-indigo-300"
                          placeholder="1"
                          type="number"
                        />
                      </FormField>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      className="h-14 w-full rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 font-bold"
                    >
                      <Plus className="mr-2 size-5" />
                      Agregar al Carrito
                    </Button>
                  </div>
                </div>
              </form>
            </div>

            {/* LADO DERECHO: RESUMEN / SIDEBAR */}
            <aside className="lg:sticky lg:top-24 min-w-0 w-full overflow-hidden">
              <div className="rounded-[2.5rem] border-0 bg-white shadow-2xl shadow-slate-200/50 ring-1 ring-slate-100 overflow-hidden w-full">
                <div className="bg-slate-900 p-6 text-white">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="size-5 text-indigo-400" />
                    <h2 className="text-lg font-black tracking-tight">
                      Resumen de Carrito
                    </h2>
                  </div>
                </div>

                <div className="p-6">
                  {orderItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
                      <ShoppingCart className="size-12 mb-3" />
                      <p className="text-sm font-bold">Carrito vacío</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-auto pr-2 custom-scrollbar">
                      {orderItems.map((item) => (
                        <div
                          key={item.productId}
                          className="group relative rounded-2xl bg-slate-50 p-4 transition-all hover:bg-white hover:ring-1 hover:ring-slate-100"
                        >
                          <div className="flex w-full justify-between items-start gap-4 overflow-hidden">
                            <div className="min-w-0 flex-1 pr-2">
                              <p className="font-black text-slate-900 truncate block w-full">
                                {item.name}
                              </p>
                              <p className="text-xs font-bold text-slate-400 mt-1 truncate block">
                                {item.quantity} un. ×{" "}
                                {formatChileanPeso(item.pricePerUnit)}
                              </p>
                            </div>
                            <span className="font-black text-indigo-600 shrink-0 text-right">
                              {formatChileanPeso(
                                item.pricePerUnit * item.quantity,
                              )}
                            </span>
                          </div>
                          <div className="mt-3 flex justify-end border-t border-slate-100/50 pt-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.productId)}
                              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-700"
                            >
                              <Trash2 className="size-3.5" />
                              Eliminar item
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-8 border-t border-slate-100 pt-6">
                    <div className="flex items-end justify-between mb-8">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">
                          Total del Pedido
                        </span>
                        <div className="text-3xl font-black tracking-tighter text-slate-900">
                          {formatChileanPeso(orderTotal)}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleCreateOrder}
                      variant="primary"
                      disabled={mutation.isPending || orderItems.length === 0}
                      className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-lg transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-200"
                    >
                      {mutation.isPending
                        ? "Confirmando..."
                        : "Confirmar Pedido"}
                    </Button>

                    <p className="mt-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Se enviará notificación al cliente
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
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
import FormField from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
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
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pt-8 sm:px-6">
        {isLoadingData && (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <div className="size-12 animate-spin rounded-full border-4 border-border border-t-primary mb-4" />
            <p className="font-bold">Cargando datos del sistema...</p>
          </div>
        )}

        {isErrorData && (
          <div className="rounded-[2.5rem] border border-destructive/20 bg-destructive/10 p-12 text-center text-destructive">
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
                <h1 className="text-3xl font-black tracking-tight text-foreground">
                  Crear Pedido Manual
                </h1>
                <p className="text-muted-foreground font-medium">
                  Configura los detalles del pedido para el cliente.
                </p>
              </header>

              <form onSubmit={onSubmit} className="space-y-6">
                {/* SELECCIÓN CLIENTE */}
                <div className="rounded-[2rem] border-0 bg-card p-8 shadow-sm ring-1 ring-border w-full overflow-hidden">
                  <Dialog open={isClientOpen} onOpenChange={setClientOpen}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="group w-full text-left transition-all active:scale-[0.99]"
                      >
                        <FormField
                          label="Cliente / Local"
                          error={errors.clientId?.message}
                          labelClassName="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2"
                        >
                          <div
                            className={cn(
                              "flex h-14 w-full items-center justify-between rounded-2xl border-0 bg-muted px-5 transition-all ring-1 ring-border hover:ring-primary/30",
                              selectClient && "bg-primary/10 ring-primary/30",
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <Store
                                className={cn(
                                  "size-5",
                                  selectClient
                                    ? "text-primary"
                                    : "text-muted-foreground",
                                )}
                              />
                              <span
                                className={cn(
                                  "font-bold",
                                  selectClient
                                    ? "text-foreground"
                                    : "text-muted-foreground",
                                )}
                              >
                                {selectClient?.localName ??
                                  "Seleccionar local..."}
                              </span>
                            </div>
                            <ChevronRight className="size-4 text-muted-foreground/50" />
                          </div>
                        </FormField>
                      </button>
                    </DialogTrigger>
                    <input
                      type="hidden"
                      {...register("clientId", { valueAsNumber: true })}
                    />
                    <DialogContent className="lg:max-w-4xl lg:h-10/12 fixed inset-0 z-50 flex h-full w-full  max-w-none translate-x-0 translate-y-0 flex-col border-0 bg-card p-0 transition-all sm:left-[50%] sm:top-[50%] sm:h-auto sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-[2.5rem] sm:border sm:shadow-2xl overflow-hidden">
                      <DialogHeader className="bg-secondary p-8">
                        <DialogTitle className="text-2xl font-black text-secondary-foreground">
                          Seleccionar Cliente
                        </DialogTitle>
                        <DialogDescription className="text-secondary-foreground/60 font-medium">
                          Busca el local comercial para este despacho.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex-1 overflow-hidden p-0 sm:p-4">
                        <Command className="flex h-full flex-col border-0">
                          <div className="flex items-center border-b border-border px-3">
                            <CommandInput
                              placeholder="Filtrar por nombre..."
                              className="h-12 border-0 focus:ring-0"
                            />
                          </div>
                          <CommandList className="flex-1 max-h-none  py-2">
                            <CommandEmpty className="py-6 text-center text-sm font-medium text-muted-foreground">
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
                                  className="rounded-xl px-4 py-3 aria-selected:bg-primary/10 aria-selected:text-foreground"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
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
                <div className="rounded-[2rem] border-0 bg-card p-8 shadow-sm ring-1 ring-border w-full overflow-hidden">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
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
                            labelClassName="text-xs font-bold text-muted-foreground mb-1.5"
                          >
                            <div
                              className={cn(
                                "flex h-12 w-full items-center justify-between rounded-xl bg-muted px-4 ring-1 ring-border",
                                selectProduct &&
                                  "bg-primary/10 ring-primary/30 text-overflow-ellipsis",
                              )}
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <Package
                                  className={cn(
                                    "size-4 shrink-0",
                                    selectProduct
                                      ? "text-primary"
                                      : "text-muted-foreground",
                                  )}
                                />
                                <span
                                  className={cn(
                                    "text-sm font-medium truncate block min-w-0 flex-1 text-overflow-ellipsis",
                                    selectProduct
                                      ? "text-foreground"
                                      : "text-muted-foreground",
                                  )}
                                >
                                  {selectProduct?.name ?? "Buscar producto..."}
                                </span>
                              </div>
                              <Search className="size-4 text-muted-foreground/50 shrink-0 ml-2" />
                            </div>
                          </FormField>
                        </button>
                      </DialogTrigger>
                      <input type="hidden" {...register("item")} />
                      <DialogContent className="lg:max-w-4xl lg:h-10/12 fixed inset-0 z-50 flex h-full w-full max-w-none translate-x-0 translate-y-0 flex-col border-0 bg-card p-0 transition-all sm:left-[50%] sm:top-[50%] sm:h-auto sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-[2.5rem] sm:border sm:shadow-2xl overflow-hidden">
                        <DialogHeader className="bg-secondary p-8">
                          <DialogTitle className="text-2xl font-black text-secondary-foreground">
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
                              <CommandEmpty className="py-6 text-center text-sm font-medium text-muted-foreground">
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
                                        <span className="text-xs font-black text-primary shrink-0">
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
                        labelClassName="text-xs font-bold text-muted-foreground mb-1.5"
                      >
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">
                            $
                          </span>
                          <Input
                            {...register("pricePerUnit")}
                            className="h-12 rounded-xl pl-8 bg-muted ring-1 ring-border focus:ring-primary/30"
                            placeholder="0"
                            type="number"
                          />
                        </div>
                      </FormField>

                      <FormField
                        label="Cantidad"
                        error={errors.quantity?.message}
                        labelClassName="text-xs font-bold text-muted-foreground mb-1.5"
                      >
                        <Input
                          {...register("quantity")}
                          className="h-12 rounded-xl bg-muted ring-1 ring-border focus:ring-primary/30"
                          placeholder="1"
                          type="number"
                        />
                      </FormField>
                    </div>

                    <Button
                      type="submit"
                      size="action"
                      className="w-full"
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
              <div className="rounded-[2.5rem] border-0 bg-card shadow-2xl ring-1 ring-border overflow-hidden w-full">
                <div className="bg-secondary p-6">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="size-5 text-primary-foreground/70" />
                    <h2 className="text-lg font-black tracking-tight text-secondary-foreground">
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
                          className="group relative rounded-2xl bg-muted p-4 transition-all hover:bg-card hover:ring-1 hover:ring-border"
                        >
                          <div className="flex w-full justify-between items-start gap-4 overflow-hidden">
                            <div className="min-w-0 flex-1 pr-2">
                              <p className="font-black text-foreground truncate block w-full">
                                {item.name}
                              </p>
                              <p className="text-xs font-bold text-muted-foreground mt-1 truncate block">
                                {item.quantity} un. ×{" "}
                                {formatChileanPeso(item.pricePerUnit)}
                              </p>
                            </div>
                            <span className="font-black text-primary shrink-0 text-right">
                              {formatChileanPeso(
                                item.pricePerUnit * item.quantity,
                              )}
                            </span>
                          </div>
                          <div className="mt-3 flex justify-end border-t border-border/50 pt-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              type="button"
                              onClick={() => handleRemoveItem(item.productId)}
                              className="h-auto p-0 text-[10px] font-black uppercase tracking-widest text-destructive hover:text-destructive/80 hover:bg-transparent"
                            >
                              <Trash2 className="size-3.5 mr-2" />
                              Eliminar item
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-8 border-t border-border pt-6">
                    <div className="flex items-end justify-between mb-8">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block mb-1">
                          Total del Pedido
                        </span>
                        <div className="text-3xl font-black tracking-tighter text-foreground">
                          {formatChileanPeso(orderTotal)}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleCreateOrder}
                      variant="secondary"
                      size="action"
                      disabled={mutation.isPending || orderItems.length === 0}
                      className="w-full"
                    >
                      {mutation.isPending
                        ? "Confirmando..."
                        : "Confirmar Pedido"}
                    </Button>

                    <p className="mt-4 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
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

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
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FormField from "@/components/ui/Form/form_field";
import Input from "@/components/ui/Input/input";
import httpClient from "@/lib/api-provider";
import type { Client } from "@/features/client/api/client.schema";
import { getOrder, type OrderDetail } from "@/features/orders/api/get-order";
import type { OrderCreateDto } from "@/features/orders/api/order.schema";
import type { Product } from "@/features/orders/api/product.schema";
import { updateOrder } from "@/features/orders/api/update-order";
import { cn } from "@/lib/utils";
import { formatChileanPeso } from "@/utils/format-currency";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Package,
  Plus,
  Save,
  Search,
  ShoppingCart,
  Store,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
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

export default function OrdersEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const orderId = Number(id);
  const isOrderIdValid = Number.isFinite(orderId) && orderId > 0;

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

  const {
    isPending: clientsPending,
    error: clientsError,
    data: clientsData,
  } = useQuery<ClientQuery>({
    queryKey: ["clients"],
    queryFn: () => httpClient.get("/clients").then((res) => res.data),
  });

  const {
    isPending: orderPending,
    error: orderError,
    data: orderData,
  } = useQuery<OrderDetail>({
    queryKey: ["orders", orderId],
    queryFn: () => getOrder(orderId),
    enabled: isOrderIdValid,
  });

  const isLoadingData = productsPending || clientsPending || orderPending;
  const isErrorData = productsError || clientsError || orderError;
  const isSuccessData = orderData && productsData && clientsData;

  const [selectClient, setSelectClient] = useState<Client | null>(null);

  const [selectProduct, setSelectProduct] = useState<Product | null>(null);
  const [isProductOpen, setProductOpen] = useState(false);

  const [order, setOrder] = useState<OrderCreateDto>({
    clientId: 0,
    items: [],
  });
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (!orderData || hasInitialized) {
      return;
    }

    setOrder((prev) => ({
      ...prev,
      clientId: orderData.clientId,
      items: orderData.lines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
        pricePerUnit: line.pricePerUnit,
      })),
    }));
    setValue("clientId", orderData.clientId, {
      shouldDirty: false,
      shouldValidate: true,
    });
    setHasInitialized(true);
  }, [orderData, hasInitialized, setValue]);

  useEffect(() => {
    if (!orderData || !clientsData?.clients || selectClient) {
      return;
    }

    const clientMatch = clientsData.clients.find(
      (client) => Number(client.id) === orderData.clientId,
    );
    if (clientMatch) {
      setSelectClient(clientMatch);
    }
  }, [orderData, clientsData, selectClient]);

  const updateMutation = useMutation({
    mutationFn: (payload: OrderCreateDto) => updateOrder(orderId, payload),
    onSuccess: () => {
      navigate("/order", {
        replace: true,
        state: { toast: "Pedido actualizado con éxito" },
      });
    },
    onError: () => {
      toast.error("No se pudo actualizar el pedido");
    },
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

  const handleUpdateOrder = () => {
    if (!isOrderIdValid || order.items.length === 0) {
      toast.error("El pedido debe tener al menos un producto");
      return;
    }
    updateMutation.mutate(order);
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
      setOrder({ ...order, items: newItems });
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

    setSelectProduct(null);
    setValue("item", "");
    setValue("quantity", "");
    setValue("pricePerUnit", "");
    toast.success("Producto actualizado en el resumen");
  });

  if (!isOrderIdValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50/50">
        <Card className="rounded-[2.5rem] p-10 text-center max-w-md border-0 shadow-xl shadow-slate-200">
          <div className="bg-rose-50 text-rose-500 rounded-full h-16 w-16 mx-auto flex items-center justify-center mb-6">
            <AlertCircle className="size-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            ID de Pedido Inválido
          </h2>
          <p className="mt-2 font-medium text-slate-500">
            No hemos podido localizar la orden solicitada.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate("/order")}
            className="mt-8 rounded-2xl px-8 h-12"
          >
            Volver a Pedidos
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pt-8 sm:px-6">
        {isLoadingData && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="size-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600 mb-4" />
            <p className="font-bold">Cargando detalles de la orden...</p>
          </div>
        )}

        {isErrorData && (
          <div className="rounded-[2.5rem] border border-rose-100 bg-rose-50 p-12 text-center text-rose-600">
            <AlertCircle className="mx-auto size-12 mb-4 opacity-50" />
            <p className="text-xl font-black">Error al recuperar datos</p>
            <p className="mt-2 text-sm font-medium opacity-80">
              Por favor intenta refrescar la página.
            </p>
          </div>
        )}

        {isSuccessData && !isLoadingData && !isErrorData && (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start w-full max-w-full overflow-hidden">
            {/* LADO IZQUIERDO: EDICIÓN FORMULARIO */}
            <div className="space-y-6 min-w-0 w-full">
              <header className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-black tracking-tight text-slate-900">
                    Editar Pedido
                  </h1>
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    #{orderId}
                  </span>
                </div>
                <p className="text-slate-500 font-medium">
                  Modifica los detalles de este despacho.
                </p>
              </header>

              <form onSubmit={onSubmit} className="space-y-6">
                {/* SELECCIÓN CLIENTE (SOLO LECTURA EN EDICIÓN POR SEGURIDAD DE NEGOCIO) */}
                <div className="rounded-[2rem] border-0 bg-white p-8 shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-md w-full overflow-hidden">
                  <FormField
                    label="Cliente Asignado"
                    labelClassName="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2"
                  >
                    <div className="flex h-14 w-full items-center gap-4 rounded-2xl bg-slate-50 px-5 ring-1 ring-slate-100 border-0">
                      <Store className="size-5 text-slate-300" />
                      <span className="font-bold text-slate-400">
                        {selectClient?.localName ?? "Cargando..."}
                      </span>
                      <div className="ml-auto text-[8px] font-black text-slate-300 uppercase tracking-widest border border-slate-200 px-2 py-1 rounded-md">
                        ID: {orderData.clientId}
                      </div>
                    </div>
                  </FormField>
                </div>

                {/* GESTIÓN DE PRODUCTOS */}
                <div className="rounded-[2rem] border-0 bg-white p-8 shadow-sm ring-1 ring-slate-100 w-full overflow-hidden">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                    <Plus className="size-4" />
                    Actualizar Catálogo
                  </h3>

                  <div className="grid gap-6">
                    <Dialog open={isProductOpen} onOpenChange={setProductOpen}>
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className="w-full text-left active:scale-[0.99] transition-transform"
                        >
                          <FormField
                            label="Reemplazar o Agregar Producto"
                            error={errors.item?.message}
                            labelClassName="text-xs font-bold text-slate-700 mb-1.5"
                          >
                            <div
                              className={cn(
                                "flex h-12 w-full items-center justify-between rounded-xl bg-slate-50 px-4 ring-1 ring-slate-200",
                                selectProduct && "bg-indigo-50 ring-indigo-200",
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
                                    "text-sm font-medium truncate block min-w-0 flex-1",
                                    selectProduct
                                      ? "text-indigo-900"
                                      : "text-slate-400",
                                  )}
                                >
                                  {selectProduct?.name ?? "Buscar productos..."}
                                </span>
                              </div>
                              <Search className="size-4 text-slate-300 shrink-0 ml-2" />
                            </div>
                          </FormField>
                        </button>
                      </DialogTrigger>
                      <input type="hidden" {...register("item")} />
                      <DialogContent className="fixed inset-0 z-50 flex h-full w-full max-w-none translate-x-0 translate-y-0 flex-col border-0 bg-white p-0 transition-all sm:left-[50%] sm:top-[50%] sm:h-auto sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-[2.5rem] sm:border sm:shadow-2xl overflow-hidden">
                        <DialogHeader className="bg-slate-900 p-8 text-white">
                          <DialogTitle className="text-2xl font-black tracking-tight">
                            Seleccionar Producto
                          </DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-hidden p-0 sm:p-4">
                          <Command className="flex h-full flex-col border-0">
                            <CommandInput
                              placeholder="Filtrar por nombre o categoría..."
                              className="h-12 border-0"
                            />
                            <CommandList className="flex-1 max-h-none sm:max-h-[300px] py-2">
                              <CommandEmpty className="py-6 text-center text-sm font-medium text-slate-400 uppercase tracking-widest">
                                Sin resultados
                              </CommandEmpty>
                              <CommandGroup>
                                {productsData.products.map(
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
                                        <span className="font-bold text-slate-700 truncate block min-w-0 flex-1">
                                          {product.name}
                                        </span>
                                        <span className="text-[10px] font-black tracking-widest text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md shrink-0">
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
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-300 group-focus-within:text-indigo-400">
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
                      Actualizar Línea
                    </Button>
                  </div>
                </div>
              </form>
            </div>

            {/* LADO DERECHO: RESUMEN / ESTADO FINAL */}
            <aside className="lg:sticky lg:top-24 min-w-0 w-full overflow-hidden">
              <div className="rounded-[2.5rem] border-0 bg-white shadow-2xl shadow-slate-200/50 ring-1 ring-slate-100 overflow-hidden w-full">
                <div className="bg-indigo-900 px-8 py-6 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="size-5 text-indigo-300" />
                    <h2 className="text-lg font-black tracking-tight">
                      Resumen Final
                    </h2>
                  </div>
                  <Package className="size-5 opacity-30" />
                </div>

                <div className="p-8">
                  {orderItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-300">
                      <ShoppingCart className="size-10 mb-2 opacity-20" />
                      <p className="text-sm font-bold uppercase tracking-widest leading-tight">
                        El pedido está
                        <br />
                        vacío ahora
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[350px] overflow-auto pr-2 custom-scrollbar">
                      {orderItems.map((item) => (
                        <div
                          key={item.productId}
                          className="group relative rounded-2xl bg-slate-50/50 p-4 ring-1 ring-slate-100 transition-all hover:bg-white hover:ring-indigo-100"
                        >
                          <div className="flex justify-between items-start gap-4 overflow-hidden">
                            <div className="min-w-0 flex-1 pr-4">
                              <p className="font-black text-slate-900 truncate block">
                                {item.name}
                              </p>
                              <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">
                                {item.quantity} un. ×{" "}
                                {formatChileanPeso(item.pricePerUnit)}
                              </p>
                            </div>
                            <span className="font-black text-slate-900 shrink-0">
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

                  <div className="mt-8 border-t border-slate-100 pt-8">
                    <div className="flex items-end justify-between mb-8">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">
                          Monto Total
                        </span>
                        <div className="text-4xl font-black tracking-tighter text-indigo-900">
                          {formatChileanPeso(orderTotal)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Button
                        onClick={handleUpdateOrder}
                        variant="primary"
                        disabled={
                          updateMutation.isPending || orderItems.length === 0
                        }
                        className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-lg transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-200"
                      >
                        {updateMutation.isPending ? (
                          "Guardando..."
                        ) : (
                          <>
                            <Save className="mr-2 size-5" />
                            Actualizar Pedido
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => navigate("/order")}
                        variant="ghost"
                        className="h-10 text-slate-400 font-bold text-xs uppercase tracking-widest"
                      >
                        <X className="mr-1 size-3" />
                        Descartar cambios
                      </Button>
                    </div>
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

import { Button } from "@/components/ui/button";
import type { Client } from "@/features/client/api/client.schema";
import { type OrderDetail } from "@/features/orders/api/get-order";
import { type OrdersResponse } from "@/features/orders/api/get-orders";
import {
  queryKeys,
  queryFns,
  type ProductsResponse,
} from "@/features/orders/config/constants";
import type { OrderCreateDto } from "@/features/orders/api/order.schema";
import type { Product } from "@/features/orders/api/product.schema";
import { updateOrder } from "@/features/orders/api/update-order";
import { useOrderDraftStore } from "@/features/orders/state/use-order-draft";
import { cn } from "@/lib/utils";
import { formatChileanPeso } from "@/utils/format-currency";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Barcode,
  CheckCircle,
  Loader2,
  Minus,
  Package,
  Plus,
  Search,
  Store,
  Trash2,
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
type ClientQuery = { clients: Client[] };

export default function OrdersEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const orderId = Number(id);
  const isOrderIdValid = Number.isFinite(orderId) && orderId > 0;
  const { draft, setDraft, clearDraft } = useOrderDraftStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
  });

  const {
    isPending: productsPending,
    error: productsError,
    data: productsData,
  } = useQuery<ProductsResponse>({
    queryKey: queryKeys.products,
    queryFn: queryFns.products,
  });

  const {
    isPending: clientsPending,
    error: clientsError,
    data: clientsData,
  } = useQuery<ClientQuery>({
    queryKey: queryKeys.clients,
    queryFn: queryFns.clients,
  });

  const {
    isPending: orderPending,
    error: orderError,
    data: orderData,
  } = useQuery<OrderDetail>({
    queryKey: queryKeys.order(orderId),
    queryFn: queryFns.order(orderId),
    enabled: isOrderIdValid,
  });

  const isLoadingData = productsPending || clientsPending || orderPending;
  const isErrorData = productsError || clientsError || orderError;
  const isSuccessData = orderData && productsData && clientsData;
  const queryClient = useQueryClient();

  const [selectClient, setSelectClient] = useState<Client | null>(null);
  const [selectProduct, setSelectProduct] = useState<Product | null>(null);
  const [order, setOrder] = useState<OrderCreateDto>({ clientId: 0, items: [] });
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (!orderData || hasInitialized) return;

    const d = draft;
    if (d) {
      if (d.order) setOrder(d.order);
      if (d.selectProduct !== undefined) {
        setSelectProduct(d.selectProduct);
        if (d.selectProduct) {
          setValue("item", d.selectProduct.name, { shouldValidate: true });
          setValue("pricePerUnit", String(d.selectProduct.sellPriceClient), { shouldValidate: true });
        }
      }
      if (d.formValues?.quantity) setValue("quantity", d.formValues.quantity);
      setValue("clientId", d.order?.clientId ?? orderData.clientId, { shouldValidate: true });
      clearDraft();
      setHasInitialized(true);
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
    setValue("clientId", orderData.clientId, { shouldDirty: false, shouldValidate: true });
    setHasInitialized(true);
  }, [orderData, hasInitialized, setValue, draft, clearDraft]);

  useEffect(() => {
    if (!orderData || !clientsData?.clients || selectClient) return;
    const clientMatch = clientsData.clients.find(
      (client) => Number(client.id) === orderData.clientId,
    );
    if (clientMatch) setSelectClient(clientMatch);
  }, [orderData, clientsData, selectClient]);

  const updateMutation = useMutation({
    mutationFn: (payload: OrderCreateDto) => updateOrder(orderId, payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.orders });
      await queryClient.cancelQueries({ queryKey: queryKeys.order(orderId) });

      const snapshotList = queryClient.getQueryData<OrdersResponse>(queryKeys.orders);
      const snapshotDetail = queryClient.getQueryData<OrderDetail>(queryKeys.order(orderId));

      const optimisticLines = payload.items.map((item) => ({
        lineId: 0,
        productId: item.productId,
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit,
        lineTotal: item.pricePerUnit * item.quantity,
        productName: productsData?.products.find((p) => p.id === item.productId)?.name ?? null,
        buyPriceSupplier: 0,
      }));

      queryClient.setQueryData<OrdersResponse>(queryKeys.orders, (old) => {
        if (!old) return old;
        return {
          orders: old.orders.map((o) =>
            o.orderId === orderId ? { ...o, lines: optimisticLines } : o,
          ),
        };
      });

      queryClient.setQueryData<OrderDetail>(queryKeys.order(orderId), (old) => {
        if (!old) return old;
        return { ...old, lines: optimisticLines };
      });

      return { snapshotList, snapshotDetail };
    },
    onError: (_, __, context) => {
      if (context?.snapshotList) queryClient.setQueryData(queryKeys.orders, context.snapshotList);
      if (context?.snapshotDetail) queryClient.setQueryData(queryKeys.order(orderId), context.snapshotDetail);
      toast.error("No se pudo actualizar el pedido");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
      queryClient.invalidateQueries({ queryKey: queryKeys.order(orderId) });
      navigate("/order", { replace: true, state: { toast: "Pedido actualizado con éxito" } });
    },
  });

  const orderItems = order.items.map((item) => {
    const product = productsData?.products.find((p) => p.id === item.productId);
    return { ...item, name: product?.name ?? "Producto" };
  });

  const orderTotal = order.items.reduce(
    (total, item) => total + item.pricePerUnit * item.quantity,
    0,
  );

  const quantityValue = watch("quantity");

  const handleRemoveItem = (productId: number) => {
    setOrder((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.productId !== productId),
    }));
  };

  const handleUpdateOrder = () => {
    if (!isOrderIdValid || order.items.length === 0) {
      toast.error("El pedido debe tener al menos un producto");
      return;
    }
    updateMutation.mutate(order);
  };

  const saveDraftAndNavigate = (to: string) => {
    const currentDraft = {
      order,
      selectProduct,
      formValues: {
        pricePerUnit: watch("pricePerUnit") ?? "",
        quantity: watch("quantity") ?? "",
        item: watch("item") ?? "",
      },
    };
    setDraft(currentDraft);
    navigate(to, { state: currentDraft });
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
          { productId: selectProduct?.id || 0, quantity, pricePerUnit },
        ],
      });
    }

    setSelectProduct(null);
    setValue("item", "");
    setValue("quantity", "");
    setValue("pricePerUnit", "");
  });

  if (!isOrderIdValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-10 text-center max-w-md">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 mx-auto mb-4">
            <AlertCircle className="size-7 text-destructive" />
          </div>
          <h2 className="text-xl font-black text-foreground">ID de Pedido Inválido</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            No se pudo localizar la orden solicitada.
          </p>
          <Button onClick={() => navigate("/order")} className="mt-6 rounded-xl h-11 px-8">
            Volver a Pedidos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {isLoadingData && (
        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
          <div className="size-10 animate-spin rounded-full border-4 border-border border-t-primary mb-4" />
          <p className="font-bold text-sm">Cargando detalles...</p>
        </div>
      )}

      {isErrorData && (
        <div className="mx-auto max-w-md p-6 mt-12">
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-10 text-center text-destructive">
            <AlertCircle className="mx-auto size-10 mb-3 opacity-50" />
            <p className="text-lg font-black">Error al recuperar datos</p>
            <p className="mt-1 text-sm opacity-70">Intentá refrescar la página.</p>
          </div>
        </div>
      )}

      {isSuccessData && !isLoadingData && !isErrorData && (
        <div className="mx-auto w-full max-w-lg px-4 pt-5 pb-40 sm:px-5 flex flex-col gap-5">

          {/* HEADER con cliente inline */}
          <div className="flex items-center gap-3 px-1">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
              <Store className="size-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-black tracking-tight text-foreground truncate">
                {selectClient?.localName ?? "Cargando..."}
              </p>
              <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                Pedido #{orderId}
              </p>
            </div>
          </div>

          {/* CONFIGURAR ITEM */}
          <div className="rounded-2xl border border-border bg-card shadow-sm dark:shadow-none overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
              <h3 className="text-base font-black text-foreground">Configurar Item</h3>
              <Barcode className="size-4 text-muted-foreground/30" />
            </div>

            <form onSubmit={onSubmit} className="p-4 flex flex-col gap-4">
              {/* Selector de producto */}
              <button
                type="button"
                onClick={() => saveDraftAndNavigate(`/order/${orderId}/edit/select-product`)}
                className={cn(
                  "w-full flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-all active:scale-[0.99]",
                  selectProduct
                    ? "border-primary/30 bg-primary/5"
                    : "border-border/50 bg-muted/30 hover:border-border",
                )}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
                    <Package className={cn("size-4", selectProduct ? "text-primary" : "text-muted-foreground/50")} />
                  </div>
                  <span className={cn("text-base truncate", selectProduct ? "text-foreground font-bold" : "text-muted-foreground/60")}>
                    {selectProduct?.name ?? "Buscar producto..."}
                  </span>
                </div>
                <Search className="size-4 text-muted-foreground/40 shrink-0 ml-2" />
              </button>

              {errors.item && (
                <p className="text-xs font-bold text-destructive -mt-2 pl-1">{errors.item.message}</p>
              )}

              {/* Precio + Cantidad */}
              <div className="flex gap-3">
                {/* Precio */}
                <div className="relative flex-1">
                  <label className="absolute -top-2 left-3 bg-card px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
                    Precio
                  </label>
                  <div className="relative flex items-center rounded-xl border border-border/50 bg-muted/30 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all overflow-hidden">
                    <span className="pl-4 text-muted-foreground/50 font-mono text-sm pointer-events-none shrink-0">$</span>
                    <input
                      {...register("pricePerUnit")}
                      type="number"
                      placeholder="0"
                      className="w-full bg-transparent px-2 py-3.5 text-foreground text-base focus:outline-none placeholder:text-muted-foreground/30"
                    />
                  </div>
                  {errors.pricePerUnit && (
                    <p className="text-[10px] font-bold text-destructive mt-1 pl-1">{errors.pricePerUnit.message}</p>
                  )}
                </div>

                {/* Cantidad con +/- */}
                <div className="relative w-36">
                  <label className="absolute -top-2 left-3 bg-card px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
                    Cant.
                  </label>
                  <div className="flex items-center rounded-xl border border-border/50 bg-muted/30 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        const v = Math.max(1, Number(quantityValue || 1) - 1);
                        setValue("quantity", String(v));
                      }}
                      className="flex h-full w-11 items-center justify-center text-muted-foreground/50 hover:text-foreground active:bg-muted/60 transition-colors shrink-0 py-3.5"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <input
                      {...register("quantity")}
                      type="number"
                      placeholder="1"
                      className="w-full bg-transparent text-center text-foreground text-base focus:outline-none placeholder:text-muted-foreground/30 py-3.5"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const v = Number(quantityValue || 0) + 1;
                        setValue("quantity", String(v));
                      }}
                      className="flex h-full w-11 items-center justify-center text-muted-foreground/50 hover:text-foreground active:bg-muted/60 transition-colors shrink-0 py-3.5"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  {errors.quantity && (
                    <p className="text-[10px] font-bold text-destructive mt-1 pl-1">{errors.quantity.message}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20"
              >
                <Plus className="mr-2 size-4" />
                Agregar al Pedido
              </Button>
            </form>
          </div>

          {/* LISTA DE ITEMS */}
          {orderItems.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1 mb-1">
                <h3 className="text-sm font-black uppercase tracking-[0.15em] text-muted-foreground/60">
                  Items del Pedido
                </h3>
                <span className="bg-muted/50 text-muted-foreground/60 text-[11px] px-2 py-0.5 rounded-full font-black">
                  {orderItems.length}
                </span>
              </div>

              {orderItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between py-3.5 px-4 bg-card border border-border/40 shadow-sm dark:shadow-none rounded-xl"
                >
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-3">
                    <span className="font-bold text-base text-foreground truncate">{item.name}</span>
                    <span className="text-sm text-muted-foreground/70 font-mono">
                      {item.quantity} × {formatChileanPeso(item.pricePerUnit)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="font-black text-base text-foreground font-mono">
                      {formatChileanPeso(item.pricePerUnit * item.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.productId)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all"
                    >
                      <Trash2 className="size-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* EMPTY STATE */}
          {orderItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border/30 rounded-2xl text-muted-foreground/30">
              <Package className="size-8 mb-2" />
              <p className="text-sm font-bold">El pedido está vacío</p>
            </div>
          )}
        </div>
      )}

      {/* FOOTER STICKY */}
      {isSuccessData && !isLoadingData && !isErrorData && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border/50 px-4 pt-4 pb-6 sm:max-w-lg sm:mx-auto">
          <div className="flex items-end justify-between mb-4 px-1">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mb-0.5">
                Total del Pedido
              </p>
              <p className="text-sm text-muted-foreground/60">
                {orderItems.length} {orderItems.length === 1 ? "ítem" : "ítems"}
              </p>
            </div>
            <div className="flex items-start gap-1">
              <span className="text-primary font-bold text-lg mt-1">$</span>
              <span className="text-4xl font-black tracking-tighter text-foreground leading-none">
                {orderTotal.toLocaleString("es-CL")}
              </span>
            </div>
          </div>

          <Button
            onClick={handleUpdateOrder}
            disabled={updateMutation.isPending || orderItems.length === 0}
            className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-base shadow-lg shadow-primary/20 disabled:opacity-40"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 size-5" />
                Actualizar Pedido
              </>
            )}
          </Button>

          <button
            onClick={() => navigate("/order")}
            className="w-full mt-2 text-xs font-bold text-muted-foreground/40 py-2 hover:text-muted-foreground/70 transition-colors"
          >
            Descartar cambios
          </button>
        </div>
      )}
    </div>
  );
}

import { Button } from "@/components/ui/button";
import type { Client } from "@/features/client/api/client.schema";
import { createOrder } from "@/features/orders/api/create-order";
import type { OrderCreateDto } from "@/features/orders/api/order.schema";
import type { Product } from "@/features/orders/api/product.schema";
import { type OrderListItem, type OrdersResponse } from "@/features/orders/api/get-orders";
import {
  queryKeys,
  queryFns,
  type ProductsResponse,
} from "@/features/orders/config/constants";
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
import { useLocation, useNavigate } from "react-router";
import { useOrderDraftStore } from "@/features/orders/state/use-order-draft";
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

export default function OrdersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormFields>({ resolver: zodResolver(schema) });

  const {
    isPending: productsPending,
    error: productsError,
    data: productsData,
  } = useQuery<ProductsResponse>({
    queryKey: queryKeys.products,
    queryFn: queryFns.products,
  });

  const { isPending, error, data } = useQuery<ClientQuery>({
    queryKey: queryKeys.clients,
    queryFn: queryFns.clients,
  });

  const isLoadingData = isPending || productsPending;
  const isErrorData = error || productsError;
  const isSuccessData = data || productsData;

  const [selectClient, setSelectClient] = useState<Client | null>(null);
  const [selectProduct, setSelectProduct] = useState<Product | null>(null);
  const { draft, clearDraft, setDraft } = useOrderDraftStore();
  const mutation = useMutation({ mutationFn: createOrder });

  const [order, setOrder] = useState<OrderCreateDto>({
    clientId: 0,
    items: [],
  });

  // Restore state when returning from select pages or via back button
  useEffect(() => {
    type NavState = {
      order?: OrderCreateDto;
      selectClient?: Client | null;
      selectProduct?: Product | null;
      formValues?: { pricePerUnit: string; quantity: string; item: string };
      selectedClient?: Client;
      selectedProduct?: Product;
    };

    const state = location.state as NavState | null;

    if (!state) {
      const d = draft;
      if (d) {
        if (d.order) setOrder(d.order);
        if (d.selectClient !== undefined) {
          setSelectClient(d.selectClient);
          if (d.selectClient) {
            setValue("clientId", Number(d.selectClient.id), { shouldValidate: true });
            setOrder((prev) => ({ ...prev, clientId: Number(d.selectClient!.id) }));
          }
        }
        if (d.selectProduct !== undefined) {
          setSelectProduct(d.selectProduct);
          if (d.selectProduct) {
            setValue("item", d.selectProduct.name);
            setValue("pricePerUnit", String(d.selectProduct.sellPriceClient));
          }
        }
        if (d.formValues?.quantity) setValue("quantity", d.formValues.quantity);
        clearDraft();
      }
      return;
    }

    if (state.order) setOrder(state.order);
    if (state.selectProduct !== undefined) {
      setSelectProduct(state.selectProduct);
      if (state.selectProduct) {
        setValue("item", state.selectProduct.name);
        setValue("pricePerUnit", String(state.selectProduct.sellPriceClient));
      }
    }
    if (state.formValues?.quantity)
      setValue("quantity", state.formValues.quantity);

    if (state.selectedClient) {
      setSelectClient(state.selectedClient);
      setValue("clientId", Number(state.selectedClient.id), {
        shouldValidate: true,
      });
      setOrder((prev) => ({
        ...prev,
        clientId: Number(state.selectedClient!.id),
      }));
    } else if (state.selectClient !== undefined) {
      setSelectClient(state.selectClient);
      if (state.selectClient)
        setValue("clientId", Number(state.selectClient.id));
    }

    if (state.selectedProduct) {
      setSelectProduct(state.selectedProduct);
      setValue("item", state.selectedProduct.name, { shouldValidate: true });
      setValue("pricePerUnit", String(state.selectedProduct.sellPriceClient), {
        shouldValidate: true,
      });
    }

    navigate(location.pathname, { replace: true, state: null });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const saveDraftAndNavigate = (to: string) => {
    const currentDraft = {
      order,
      selectClient,
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

  const handleCreateOrder = () => {
    if (order.items.length === 0) {
      toast.error("Debes agregar al menos un producto");
      return;
    }
    mutation.mutate(order, {
      onSuccess: (created) => {
        clearDraft();

        const optimisticOrder: OrderListItem = {
          orderId: created.id,
          purchaseOrderId: created.purchaseOrderId,
          createdAt: created.createdAt,
          status: created.status,
          localName: selectClient?.localName ?? null,
          phone: selectClient?.phone ?? null,
          address: selectClient?.address ?? null,
          lines: order.items.map((item) => ({
            lineId: 0,
            productId: item.productId,
            quantity: item.quantity,
            pricePerUnit: item.pricePerUnit,
            lineTotal: item.pricePerUnit * item.quantity,
            productName: productsData?.products.find((p) => p.id === item.productId)?.name ?? null,
            buyPriceSupplier: 0,
          })),
        };

        queryClient.setQueryData<OrdersResponse>(queryKeys.orders, (old) => ({
          orders: [optimisticOrder, ...(old?.orders ?? [])],
        }));
        queryClient.invalidateQueries({ queryKey: queryKeys.orders });

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

  return (
    <div className="min-h-screen bg-background">
      {/* Loading */}
      {isLoadingData && (
        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
          <div className="size-10 animate-spin rounded-full border-4 border-border border-t-primary mb-4" />
          <p className="font-bold text-sm">Cargando datos...</p>
        </div>
      )}

      {/* Error */}
      {isErrorData && (
        <div className="mx-auto max-w-md p-6 mt-12">
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-10 text-center text-destructive">
            <AlertCircle className="mx-auto size-10 mb-3 opacity-50" />
            <p className="text-lg font-black">Error de Sincronización</p>
            <p className="mt-1 text-sm opacity-70">
              No se pudo cargar productos o clientes.
            </p>
          </div>
        </div>
      )}

      {isSuccessData && !isLoadingData && !isErrorData && (
        <div className="mx-auto w-full max-w-lg px-4 pt-5 pb-40 sm:px-5 flex flex-col gap-5">
          {/* 1. CLIENT SELECTOR */}
          <button
            type="button"
            onClick={() => saveDraftAndNavigate("/order/new/select-client")}
            className={cn(
              "w-full rounded-2xl p-4 flex items-center justify-between border transition-all active:scale-[0.98] relative overflow-hidden text-left",
              selectClient
                ? "border-primary/40 bg-primary/5"
                : "border-primary/30 bg-primary/[0.04] hover:bg-primary/[0.07] hover:border-primary/50",
            )}
          >
            {/* Glow ring when empty */}
            {!selectClient && (
              <div className="absolute inset-0 rounded-2xl ring-1 ring-primary/20 animate-pulse pointer-events-none" />
            )}
            {selectClient && (
              <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
            )}
            <div className="flex items-center gap-3 relative z-10 flex-1 min-w-0">
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border",
                  selectClient
                    ? "bg-background border-primary/30 text-primary"
                    : "bg-primary/10 border-primary/20 text-primary",
                )}
              >
                <Store className="size-5" />
              </div>
              <div className="min-w-0 flex flex-col">
                {selectClient ? (
                  <>
                    <p className="text-xs font-bold uppercase tracking-widest text-primary mb-0.5">
                      Cliente Asignado
                    </p>
                    <p className="text-base font-bold text-foreground truncate">
                      {selectClient.localName}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-0.5">
                      Paso 1 — Requerido
                    </p>
                    <p className="text-base font-bold text-foreground/70">
                      Seleccionar cliente...
                    </p>
                  </>
                )}
              </div>
            </div>
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full ml-2 relative z-10",
                selectClient
                  ? "bg-primary/20 text-primary"
                  : "bg-primary/15 text-primary",
              )}
            >
              <Plus className={cn("size-3.5", selectClient && "rotate-45")} />
            </div>
          </button>

          {/* 2. ADD PRODUCT CARD */}
          <div
            className={cn(
              "rounded-2xl border bg-card shadow-sm overflow-hidden transition-all duration-200",
              selectClient ? "border-border/40" : "border-border/20 opacity-50",
            )}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
              <h3 className="text-base font-black text-foreground">
                Configurar Item
              </h3>
              {!selectClient ? (
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/40">
                  Seleccioná un cliente primero
                </span>
              ) : (
                <Barcode className="size-4 text-muted-foreground/30" />
              )}
            </div>

            <form onSubmit={onSubmit} className="p-4 flex flex-col gap-4">
              {/* Product search trigger */}
              <button
                type="button"
                onClick={() => {
                  if (!selectClient) {
                    toast.error("Seleccioná un cliente primero");
                    return;
                  }
                  saveDraftAndNavigate("/order/new/select-product");
                }}
                className={cn(
                  "w-full flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-all active:scale-[0.99]",
                  selectProduct
                    ? "border-primary/30 bg-primary/5"
                    : "border-border/50 bg-muted/30 hover:border-border",
                )}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
                    <Package
                      className={cn(
                        "size-4",
                        selectProduct
                          ? "text-primary"
                          : "text-muted-foreground/50",
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-base truncate",
                      selectProduct
                        ? "text-foreground font-bold"
                        : "text-muted-foreground/60",
                    )}
                  >
                    {selectProduct?.name ?? "Buscar producto..."}
                  </span>
                </div>
                <Search className="size-4 text-muted-foreground/40 shrink-0 ml-2" />
              </button>

              {errors.item && (
                <p className="text-xs font-bold text-destructive -mt-2 pl-1">
                  {errors.item.message}
                </p>
              )}

              {/* Price + Qty */}
              <div className="flex gap-3">
                {/* Price */}
                <div className="relative flex-1">
                  <label className="absolute -top-2 left-3 bg-card px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
                    Precio
                  </label>
                  <div className="relative flex items-center rounded-xl border border-border/50 bg-muted/30 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all overflow-hidden">
                    <span className="pl-4 text-muted-foreground/50 font-mono text-sm pointer-events-none shrink-0">
                      $
                    </span>
                    <input
                      {...register("pricePerUnit")}
                      type="number"
                      placeholder="0"
                      className="w-full bg-transparent px-2 py-3.5 text-foreground text-base focus:outline-none placeholder:text-muted-foreground/30"
                    />
                  </div>
                  {errors.pricePerUnit && (
                    <p className="text-[10px] font-bold text-destructive mt-1 pl-1">
                      {errors.pricePerUnit.message}
                    </p>
                  )}
                </div>

                {/* Qty with +/- */}
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
                    <p className="text-[10px] font-bold text-destructive mt-1 pl-1">
                      {errors.quantity.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={!selectClient}
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 disabled:opacity-40 disabled:pointer-events-none"
              >
                <Plus className="mr-2 size-4" />
                Agregar al Pedido
              </Button>
            </form>
          </div>

          {/* 3. CART ITEMS */}
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
                  className="flex items-center justify-between py-3.5 px-4 bg-card border border-border/40 shadow-sm rounded-xl"
                >
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-3">
                    <span className="font-bold text-base text-foreground truncate">
                      {item.name}
                    </span>
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

          {/* Empty cart nudge */}
          {orderItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border/30 rounded-2xl text-muted-foreground/30">
              <Package className="size-8 mb-2" />
              <p className="text-sm font-bold">El pedido está vacío</p>
            </div>
          )}
        </div>
      )}

      {/* STICKY BOTTOM — total + confirm */}
      {isSuccessData && !isLoadingData && !isErrorData && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border/50 px-4 pt-4 pb-6 sm:max-w-lg sm:mx-auto">
          <div className="flex items-end justify-between mb-4 px-1">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mb-0.5">
                Total a Cobrar
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
            onClick={handleCreateOrder}
            disabled={mutation.isPending || orderItems.length === 0}
            className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-base shadow-lg shadow-primary/20 disabled:opacity-40"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Confirmando...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 size-5" />
                Confirmar Pedido
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

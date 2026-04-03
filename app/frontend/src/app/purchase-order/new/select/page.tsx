import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";

import {
  addSelectedPurchaseOrder,
  removeSelectedPurchaseOrder,
  selectedPurchaseOrder,
} from "@/app/purchaseOrderSlice";
import { Button } from "@/components/ui/button";
import {
  getOrders,
  type OrderListItem,
} from "@/features/orders/api/get-orders";
import OrderCard from "@/features/orders/components/OrderCard";
import { useAppSelector } from "@/hooks/redux.hooks";

import { ArrowRight, Package, ShoppingCart } from "lucide-react";

export default function PurchaseOrderSelectPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedOrders = useAppSelector(selectedPurchaseOrder);

  const {
    data: ordersData,
    isPending,
    error,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const ordersDataFiltered = ordersData?.orders.filter(
    (order) => order.purchaseOrderId === null,
  );

  const handleToggleOrder = (order: OrderListItem) => {
    const isSelected = selectedOrders.some(
      (selected) => selected.orderId === order.orderId,
    );
    if (isSelected) {
      dispatch(removeSelectedPurchaseOrder(order));
      return;
    }
    dispatch(addSelectedPurchaseOrder(order));
  };

  const handleGoToSummary = () => {
    if (selectedOrders.length === 0) {
      return;
    }
    navigate("/purchase-order/new/summary");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Seleccionar Pedidos
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Elige los pedidos que deseas consolidar en una nueva orden de compra
          para tu proveedor.
        </p>
      </div>

      <section className="relative pb-24 sm:pb-0">
        <div className="flex flex-col gap-4">
          <div className="hidden sm:flex sm:items-center sm:justify-between sm:rounded-2xl sm:bg-card sm:p-4 sm:shadow-sm sm:border sm:border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShoppingCart className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {selectedOrders.length} pedidos seleccionados
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedOrders.length > 0
                    ? "Listo para consolidar"
                    : "Selecciona al menos uno"}
                </p>
              </div>
            </div>
            <Button
              onClick={handleGoToSummary}
              disabled={selectedOrders.length === 0}
              className="px-6"
            >
              Confirmar selección
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>

          {isPending && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <div className="size-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary mb-4" />
              <p>Cargando pedidos...</p>
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-destructive/10 bg-destructive/5 p-8 text-center text-destructive">
              <p className="font-semibold">Error al cargar los pedidos</p>
              <p className="mt-1 text-sm opacity-80">
                Por favor, intenta nuevamente más tarde.
              </p>
            </div>
          )}

          {!isPending && !error && ordersDataFiltered?.length === 0 && (
            <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
              <Package className="mx-auto size-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                No hay pedidos pendientes
              </h3>
              <p className="mt-2 text-muted-foreground">
                Todos los pedidos ya están asociados a una orden de compra o no
                hay registros.
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {ordersDataFiltered?.map((order) => (
              <OrderCard
                key={order.orderId}
                id={order.orderId}
                localName={order.localName ?? "Local"}
                status="pending"
                createdAt={order.createdAt}
                items={order.lines.map((item) => ({
                  name: item.productName ?? "Producto",
                  quantity: item.quantity,
                  pricePerUnit: item.pricePerUnit,
                  buyPriceSupplier: item.buyPriceSupplier,
                }))}
                isSelected={selectedOrders.some(
                  (selected) => selected.orderId === order.orderId,
                )}
                onClick={() => handleToggleOrder(order)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* STICKY BOTTOM BAR FOR MOBILE */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 p-4 backdrop-blur-lg sm:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Seleccionados
            </span>
            <span className="text-lg font-bold text-foreground">
              {selectedOrders.length} Pedidos
            </span>
          </div>
          <Button
            onClick={handleGoToSummary}
            disabled={selectedOrders.length === 0}
            className="flex-1 h-12 shadow-lg shadow-primary/10"
          >
            Siguiente
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo } from "react";
import { Outlet, useLocation } from "react-router";

import Navbar from "@/components/navbar/navbar";
import { Toaster } from "@/components/ui/sonner";

type NavbarConfig = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
  action?: React.ReactNode;
};

export default function Layout() {
  const location = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    scrollToTop();
    const rafId = window.requestAnimationFrame(scrollToTop);
    const timeoutId = window.setTimeout(scrollToTop, 0);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
    };
  }, [location.key]);

  const navbarConfig = useMemo<NavbarConfig>(() => {
    if (
      location.pathname.startsWith("/order/") &&
      location.pathname.endsWith("/edit")
    ) {
      return {
        title: "Editar pedido",
        showBack: true,
      };
    }
    if (location.pathname.startsWith("/order/")) {
      return {
        title: "Detalle del pedido",
        showBack: true,
      };
    }
    if (
      location.pathname.startsWith("/purchase-order/") &&
      !location.pathname.startsWith("/purchase-order/new")
    ) {
      return {
        title: "Detalle orden de compra",
        showBack: true,
      };
    }
    if (location.pathname.startsWith("/purchase-order/new")) {
      return {
        title: "Orden de compra",
        showBack: true,
      };
    }
    switch (location.pathname) {
      case "/order":
        return {
          title: "Pedidos",
          showBack: true,
          backTo: "/",
        };
      case "/order/new":
        return {
          title: "Nuevo pedido manual",
          showBack: true,
        };
      case "/purchase-order":
        return {
          title: "Ordenes de compra",
          showBack: true,
          backTo: "/",
        };
      case "/client/new":
        return {
          title: "Nuevo cliente",
          showBack: true,
        };
      case "/client":
        return {
          title: "Clientes",
          showBack: true,
          backTo: "/",
        };
      case "/stats":
        return {
          title: "Estadísticas",
          showBack: true,
        };
      default:
        return {
          title: "Panel Principal",
          subtitle: "Vasvani App",
        };
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      <Toaster />
      <Navbar
        title={navbarConfig.title}
        subtitle={navbarConfig.subtitle}
        showBack={navbarConfig.showBack}
        backTo={navbarConfig.backTo}
        action={navbarConfig.action}
      />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

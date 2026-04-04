import { cn } from "@/lib/utils";
import { BarChart3, Home, Package, ShoppingBag, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Inicio" },
  { href: "/order", icon: ShoppingBag, label: "Ventas" },
  { href: "/purchase-order", icon: Package, label: "Compras" },
  { href: "/client", icon: Users, label: "Clientes" },
  { href: "/stats", icon: BarChart3, label: "Stats" },
];

export default function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-xl safe-area-bottom">
      <div className="flex items-center justify-around px-1 h-16">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl min-w-[56px] min-h-[44px] transition-all duration-200 touch-manipulation",
                active ? "text-crimson" : "text-muted-foreground",
              )}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-crimson" />
              )}
              <item.icon
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  active && "scale-110",
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-bold tracking-wide",
                  active ? "text-crimson" : "text-muted-foreground/70",
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

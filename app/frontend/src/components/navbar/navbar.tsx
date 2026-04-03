import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";

type NavbarProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  showBack?: boolean;
  backTo?: string;
  className?: string;
};

export default function Navbar({
  title,
  subtitle,
  action,
  showBack = false,
  backTo,
  className,
}: NavbarProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl transition-all duration-300",
        className,
      )}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 h-16 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-9 w-9 rounded-full hover:bg-accent"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </Button>
          )}
          <div className="min-w-0">
            {subtitle && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80 leading-none mb-1">
                {subtitle}
              </p>
            )}
            <h1 className="truncate text-lg font-bold tracking-tight text-foreground sm:text-xl">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9 rounded-full hover:bg-accent"
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          {action && <div className="flex items-center">{action}</div>}
        </div>
      </div>
    </nav>
  );
}

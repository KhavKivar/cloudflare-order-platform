import { ChevronLeft } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router";

import { cn } from "@/lib/utils";

type BackButtonProps = React.ComponentProps<"button"> & {
  label?: string;
  fallbackTo?: string;
  iconOnly?: boolean;
};

function BackButton({
  label = "Volver",
  fallbackTo,
  iconOnly = false,
  onClick,
  ...props
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);

    console.log(fallbackTo);
    console.log(window.history.length);

    if (event.defaultPrevented) {
      return;
    }
    if (fallbackTo) {
      navigate(fallbackTo);
      return;
    }
    navigate(-1);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "cursor-pointer ",
        iconOnly
          ? "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-white/80 text-sm text-slate-700 shadow-sm transition hover:border-border hover:text-slate-900"
          : "inline-flex cursor-pointer items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:text-slate-900",
        props.className,
      )}
      {...props}
    >
      <div className="flex justify-center">
        <ChevronLeft className="h-4 w-4" />
        {!iconOnly && label}
      </div>
    </button>
  );
}

export { BackButton };

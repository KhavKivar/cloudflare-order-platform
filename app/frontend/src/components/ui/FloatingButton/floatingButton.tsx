import * as React from "react";

import { Button } from "@/components/ui/Button/button";
import { cn } from "@/lib/utils";

type FloatingButtonProps = React.ComponentProps<typeof Button> & {
  label: string;
  title?: string;
};

function FloatingButton({
  label,
  title,
  className,
  children,
  ...props
}: FloatingButtonProps) {
  return (
    <Button
      aria-label={label}
      title={title ?? label}
      className={cn(
        "fixed bottom-6 right-6 bg-primary inline-flex h-14 w-14 rounded-full text-2xl font-semibold shadow-lg transition hover:-translate-y-0.5",
        className,
      )}
      {...props}
    >
      {children ?? "+"}
    </Button>
  );
}

export { FloatingButton };

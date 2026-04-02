import * as React from "react";

import { cn } from "@/lib/utils";

type CardProps = React.ComponentProps<"div">;

function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-card/80 p-10 text-center ",
        className,
      )}
      {...props}
    />
  );
}

export { Card };

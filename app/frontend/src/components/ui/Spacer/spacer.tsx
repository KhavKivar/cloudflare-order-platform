import { cn } from "@/lib/utils";

type SpacerProps = {
  size?: number | string;
  axis?: "vertical" | "horizontal";
  className?: string;
};

function Spacer({ size = 16, axis = "vertical", className }: SpacerProps) {
  const dimension = typeof size === "number" ? `${size}px` : size;

  return (
    <div
      aria-hidden="true"
      className={cn(axis === "vertical" ? "w-full" : "h-full", className)}
      style={axis === "vertical" ? { height: dimension } : { width: dimension }}
    />
  );
}

export { Spacer };

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      position="bottom-center"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group border shadow-lg rounded-md flex items-center p-4",
          title: "font-semibold",
          description: "text-sm opacity-90",
          success: "!bg-emerald-600 !text-white !border-emerald-700",
          error: "!bg-red-600 !text-white !border-red-700",
          info: "!bg-blue-600 !text-white !border-blue-700",
          warning: "!bg-amber-500 !text-white !border-amber-600",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };

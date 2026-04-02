import { cn } from "@/utils/cn";

interface SubHeaderProps {
  text: string;
  className?: string;
}

export default function SubHeader(subHeaderProps: SubHeaderProps) {
  const { text, className } = subHeaderProps;
  const baseStyle =
    "text-sm font-semibold uppercase tracking-[0.3em] text-accent-foreground";

  return <p className={cn(baseStyle, className)}>{text}</p>;
}

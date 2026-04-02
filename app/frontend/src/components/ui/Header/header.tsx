import { cn } from "@/utils/cn";

interface HeaderProps {
  text: string;
  className?: string;
}

export default function SubHeader(headerProps: HeaderProps) {
  const { text, className } = headerProps;
  const baseStyle = "text-4xl font-semibold text-foreground";

  return <p className={cn(baseStyle, className)}>{text}</p>;
}

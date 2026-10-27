import { cn } from "@/lib/utils/cn";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "danger" | "warning" | "accent";
  size?: "sm" | "md";
  children: React.ReactNode;
}

function Badge({
  className,
  variant = "default",
  size = "sm",
  children,
  ...props
}: BadgeProps) {
  const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "bg-primary text-white",
    success: "bg-accent text-black",
    danger: "bg-hotpink text-black",
    warning: "bg-accent text-black",
    accent: "bg-accent text-black",
  };

  const sizes: Record<NonNullable<BadgeProps["size"]>, string> = {
    sm: "text-[10px] px-2 py-1",
    md: "text-xs px-3 py-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-black uppercase tracking-widest border-[2px] border-black",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge };

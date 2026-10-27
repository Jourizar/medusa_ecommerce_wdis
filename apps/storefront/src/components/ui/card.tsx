import { cn } from "@/lib/utils/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glass?: boolean;
}

function Card({
  className,
  hoverable = false,
  glass: _glass = true,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-cream border-[4px] border-black shadow-[6px_6px_0_0_#000] overflow-hidden",
        hoverable && "brutal-block-hover cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-5 pt-5 pb-4 border-b-[3px] border-black", className)}
      {...props}
    />
  );
}

function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-5", className)} {...props} />;
}

function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-5 pt-4 pb-5 border-t-[3px] border-black", className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardContent, CardFooter };

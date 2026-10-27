import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, type = "text", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-black uppercase tracking-widest text-black mb-2"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-black pointer-events-none">
              {icon}
            </div>
          )}

          <input
            id={inputId}
            type={type}
            className={cn(
              "w-full bg-cream border-[3px] border-black text-black h-12 px-4 font-medium",
              "placeholder:text-muted",
              "focus:outline-none focus:shadow-[4px_4px_0_0_#000] focus:-translate-x-[2px] focus:-translate-y-[2px]",
              "transition-[transform,box-shadow] duration-100",
              "disabled:opacity-50 disabled:pointer-events-none",
              icon && "pl-10",
              error && "border-hotpink",
              className
            )}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-2 text-xs font-bold uppercase tracking-wider text-hotpink"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };

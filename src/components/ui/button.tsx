import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-ink text-cream hover:bg-ink-soft shadow-[0_8px_24px_-8px_rgba(17,17,17,0.4)]",
        gold: "bg-gold text-ink hover:bg-gold-dark shadow-[0_8px_24px_-8px_rgba(212,175,55,0.5)]",
        outline:
          "border border-ink/15 bg-transparent text-ink hover:bg-ink hover:text-cream",
        ghost: "bg-transparent text-ink hover:bg-ink/5",
        soft: "bg-beige text-ink hover:bg-ink/5",
        link: "text-ink underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 rounded-[14px]",
        sm: "h-10 px-4 rounded-[12px] text-[13px]",
        lg: "h-14 px-8 rounded-[16px] text-base",
        icon: "h-12 w-12 rounded-[14px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

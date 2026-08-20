import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:-translate-y-0.5 hover:bg-[#3f6c8b] hover:shadow-md",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:-translate-y-0.5 hover:bg-[#95bdd7]",
        accent: "bg-accent text-accent-foreground shadow-sm hover:-translate-y-0.5 hover:bg-[#f1dc88] hover:shadow-md",
        destructive: "bg-destructive text-destructive-foreground hover:bg-red-700",
        outline: "border border-border bg-background hover:border-primary/40 hover:bg-muted hover:text-primary",
        ghost: "hover:bg-muted hover:text-primary",
        link: "h-auto rounded-none p-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 rounded-md px-3",
        lg: "h-13 rounded-xl px-7 text-base",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

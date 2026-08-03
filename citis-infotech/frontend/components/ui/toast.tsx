"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitive.Provider;
const ToastViewport = React.forwardRef<React.ElementRef<typeof ToastPrimitive.Viewport>, React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>>(
  ({ className, ...props }, ref) => <ToastPrimitive.Viewport ref={ref} className={cn("fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:top-auto sm:bottom-0 sm:max-w-sm sm:flex-col", className)} {...props} />,
);
ToastViewport.displayName = "ToastViewport";
const toastVariants = cva("group pointer-events-auto relative flex w-full items-start justify-between gap-4 overflow-hidden rounded-xl border bg-card p-4 pr-8 text-card-foreground shadow-xl transition-all", {
  variants: {
    variant: {
      default: "border-border",
      success: "border-success/40 bg-green-50 dark:bg-green-950",
      destructive: "border-destructive/40 bg-red-50 text-red-950 dark:bg-red-950 dark:text-red-50",
    },
  },
  defaultVariants: { variant: "default" },
});
const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitive.Root>, React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> & VariantProps<typeof toastVariants>>(
  ({ className, variant, ...props }, ref) => <ToastPrimitive.Root ref={ref} className={cn(toastVariants({ variant }), className)} {...props} />,
);
Toast.displayName = "Toast";
const ToastAction = React.forwardRef<React.ElementRef<typeof ToastPrimitive.Action>, React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>>(
  ({ className, ...props }, ref) => <ToastPrimitive.Action ref={ref} className={cn("inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium hover:bg-muted", className)} {...props} />,
);
ToastAction.displayName = "ToastAction";
const ToastClose = React.forwardRef<React.ElementRef<typeof ToastPrimitive.Close>, React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>>(
  ({ className, ...props }, ref) => <ToastPrimitive.Close ref={ref} className={cn("absolute top-3 right-3 rounded-md p-1 text-muted-foreground opacity-70 hover:opacity-100", className)} toast-close="" {...props}><X className="size-4" /></ToastPrimitive.Close>,
);
ToastClose.displayName = "ToastClose";
const ToastTitle = React.forwardRef<React.ElementRef<typeof ToastPrimitive.Title>, React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>>(
  ({ className, ...props }, ref) => <ToastPrimitive.Title ref={ref} className={cn("font-heading text-sm font-semibold", className)} {...props} />,
);
ToastTitle.displayName = "ToastTitle";
const ToastDescription = React.forwardRef<React.ElementRef<typeof ToastPrimitive.Description>, React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>>(
  ({ className, ...props }, ref) => <ToastPrimitive.Description ref={ref} className={cn("mt-1 text-sm text-muted-foreground", className)} {...props} />,
);
ToastDescription.displayName = "ToastDescription";

export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction };

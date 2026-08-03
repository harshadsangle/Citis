"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;
const SelectTrigger = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>>(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger ref={ref} className={cn("flex h-11 w-full items-center justify-between rounded-lg border border-input bg-background px-3.5 py-2 text-sm shadow-xs focus:ring-2 focus:ring-ring/20 focus:outline-none disabled:opacity-50 [&>span]:line-clamp-1", className)} {...props}>
      {children}<SelectPrimitive.Icon asChild><ChevronDown className="size-4 opacity-60" /></SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  ),
);
SelectTrigger.displayName = "SelectTrigger";
const SelectContent = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Content>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>>(
  ({ className, children, position = "popper", ...props }, ref) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content ref={ref} position={position} className={cn("relative z-50 max-h-80 min-w-32 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-xl data-[state=open]:animate-in", position === "popper" && "data-[side=bottom]:translate-y-1", className)} {...props}>
        <SelectPrimitive.ScrollUpButton className="flex h-7 items-center justify-center"><ChevronUp className="size-4" /></SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className="p-1.5">{children}</SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex h-7 items-center justify-center"><ChevronDown className="size-4" /></SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  ),
);
SelectContent.displayName = "SelectContent";
const SelectLabel = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Label>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>>(
  ({ className, ...props }, ref) => <SelectPrimitive.Label ref={ref} className={cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground", className)} {...props} />,
);
SelectLabel.displayName = "SelectLabel";
const SelectItem = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Item>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>>(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item ref={ref} className={cn("relative flex w-full cursor-default items-center rounded-md py-2 pr-8 pl-2 text-sm outline-none focus:bg-muted focus:text-primary data-[disabled]:opacity-50", className)} {...props}>
      <span className="absolute right-2"><SelectPrimitive.ItemIndicator><Check className="size-4" /></SelectPrimitive.ItemIndicator></span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  ),
);
SelectItem.displayName = "SelectItem";
const SelectSeparator = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>>(
  ({ className, ...props }, ref) => <SelectPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />,
);
SelectSeparator.displayName = "SelectSeparator";

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator };

"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;
const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(
  ({ className, ...props }, ref) => <TabsPrimitive.List ref={ref} className={cn("inline-flex h-11 items-center rounded-lg bg-muted p-1 text-muted-foreground", className)} {...props} />,
);
TabsList.displayName = "TabsList";
const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(
  ({ className, ...props }, ref) => <TabsPrimitive.Trigger ref={ref} className={cn("inline-flex h-full items-center justify-center rounded-md px-4 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm", className)} {...props} />,
);
TabsTrigger.displayName = "TabsTrigger";
const TabsContent = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>>(
  ({ className, ...props }, ref) => <TabsPrimitive.Content ref={ref} className={cn("mt-5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", className)} {...props} />,
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };

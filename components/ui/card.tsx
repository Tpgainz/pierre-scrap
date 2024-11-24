import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils/cn";

const cardVariants = cva("rounded-lg border shadow-sm transition-colors", {
  variants: {
    variant: {
      default: "bg-card text-card-foreground",
      outline: "border border-input bg-background text-muted-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      destructive: "bg-destructive text-destructive-foreground",
      danger: "border-destructive text-destructive",
      ghost: "bg-transparent text-card-foreground",
      yellow: "bg-yellow-500 text-yellow-900",
      defaultGreenOutline:
        "border border-green-500  bg-background  hover:text-accent-foreground",
      greenOutline: "border border-green-500 hover:text-accent-foreground",
      redOutline: "border border-red-500 /20 /50 hover:text-accent-foreground",
      defaultRedOutline:
        "border border-red-500  bg-background  hover:text-accent-foreground",

      yellowOutline: "border border-yellow-500 hover:text-accent-foreground",
      defaultYellowOutline:
        "border border-yellow-500 bg-background   hover:text-accent-foreground",
      blueOutline: "border border-blue-500 hover:text-accent-foreground",
      defaultBlueOutline:
        "border border-blue-500 bg-background   hover:text-accent-foreground",
    },
    size: {
      default: "p-4",
      sm: "p-2",
      lg: "p-6",
      xl: "p-8",
    },
    shadow: {
      none: "shadow-none",
      sm: "shadow-sm",
      md: "shadow-md",
      lg: "shadow-lg",
      xl: "shadow-xl",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    shadow: "sm",
  },
});
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

// Create the Card component
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, shadow, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        ref={ref}
        className={cn(cardVariants({ variant, size, shadow, className }))}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};

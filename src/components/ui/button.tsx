import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const variants = {
  /** Caramel: the main action. */
  primary: "btn-primary",
  /** Beige: companion action. */
  secondary: "btn-secondary",
  /** Cream: light action on photos and dark surfaces. */
  cream: "btn-cream",
  /** Espresso: solid dark action on light imagery. */
  dark: "btn-dark",
  /** Outline: low-emphasis action. */
  outline: "btn-outline",
  /** Text only. */
  ghost: "btn-ghost",
} as const;

const sizes = {
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
  /** Circular, icon only. Requires an aria-label. */
  icon: "btn-icon",
} as const;

type ButtonStyleProps = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  /** "pill" forces fully rounded ends; "default" uses the control radius. */
  shape?: "default" | "pill";
  fullWidth?: boolean;
};

export function buttonClasses({ variant = "primary", size = "md", shape = "default", fullWidth }: ButtonStyleProps) {
  return cn("btn", variants[variant], sizes[size], shape === "pill" && "btn-pill", fullWidth && "w-full");
}

type ButtonProps = ComponentProps<"button"> & ButtonStyleProps;

export function Button({ variant, size, shape, fullWidth, className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonClasses({ variant, size, shape, fullWidth }), className)}
      {...props}
    />
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & ButtonStyleProps;

export function ButtonLink({ variant, size, shape, fullWidth, className, ...props }: ButtonLinkProps) {
  return (
    <Link className={cn(buttonClasses({ variant, size, shape, fullWidth }), className)} {...props} />
  );
}

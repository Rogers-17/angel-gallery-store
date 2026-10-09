import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const variants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  inverse: "btn-inverse",
  dark: "btn-dark",
  ghost: "btn-ghost",
} as const;

const sizes = {
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
} as const;

type ButtonStyleProps = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  /** "pill" forces fully rounded ends; "default" follows the theme radius. */
  shape?: "default" | "pill";
  fullWidth?: boolean;
};

function buttonClasses({ variant = "primary", size = "md", shape = "default", fullWidth }: ButtonStyleProps) {
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

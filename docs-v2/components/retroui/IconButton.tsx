import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "primary" | "outline" | "link";
}

export function IconButton({
  children,
  size = "md",
  className = "",
  variant = "primary",
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: "p-2",
    md: "p-3",
    lg: "p-4",
  };

  const variantClasses = {
    primary:
      "bg-primary text-primary-foreground border-2 border-border hover:bg-primary-hover",
    outline: "bg-transparent text-foreground border-2 border-border",
    link: "bg-transparent text-primary hover:underline",
  };

  return (
    <button
      className={`font-head rounded-(--radius) border-2 border-border shadow-md hover:shadow-xs transition-all ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SignInButtonProps {
  action: () => Promise<void>;
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function SignInButton({
  action,
  children,
  variant = "default",
  size = "lg",
  className,
}: SignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await action();
      // The redirect happens in the server action
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
      // You could add toast notification here
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Button
        type="submit"
        variant={variant}
        size={size}
        className={className}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Signing in...
          </>
        ) : (
          children
        )}
      </Button>
    </form>
  );
}


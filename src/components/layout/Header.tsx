"use client";

import { Logo } from "@/components/icons/Logo";

export function Header() {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 border-b bg-card">
      <div className="container mx-auto flex items-center">
        <Logo className="h-14 w-auto" />
      </div>
    </header>
  );
}

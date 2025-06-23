import { Logo } from "@/components/icons/Logo";

export function Header() {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 border-b bg-card">
      <div className="container mx-auto flex items-center gap-4">
        <Logo />
        <h1 className="text-2xl font-headline font-bold text-foreground">
          Fabrication<span className="text-primary">Calculator</span>
        </h1>
      </div>
    </header>
  );
}

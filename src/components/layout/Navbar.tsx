import Link from "next/link";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { NavbarAuthControls } from "@/components/layout/NavbarAuthControls";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <BrandLogo priority />
          <span className="text-sm font-semibold leading-tight sm:text-base">UAC TEK CLUB</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link>
          <Link href="/about" className="text-muted-foreground hover:text-foreground">About</Link>
          <Link href="/labs" className="text-muted-foreground hover:text-foreground">Labs</Link>
          <Link href="/apply" className="text-muted-foreground hover:text-foreground">Apply</Link>
        </nav>

        <div className="flex items-center gap-2">
          <NavbarAuthControls />
        </div>
      </div>
    </header>
  );
}

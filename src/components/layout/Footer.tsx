import { Code2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container flex flex-col items-center justify-between gap-4 py-8 md:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Code2 className="h-4 w-4 text-primary" />
          <span>TEK Club Management Portal</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Built with Next.js, Prisma, and shadcn/ui.
        </p>
      </div>
    </footer>
  );
}

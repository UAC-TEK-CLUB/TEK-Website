import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 dark:bg-background dark:border-border">
      <div className="container flex flex-col gap-4 py-8">
        <div className="w-fit dark:rounded-md dark:bg-white dark:p-2 dark:shadow-md">
          <Image
            src="/branding/university-of-utah-horizontal.png"
            alt="The University of Utah Asia Campus"
            width={224}
            height={67}
            className="h-[2.45rem] w-auto max-w-[min(100vw-3rem,196px)] object-contain object-left sm:h-[2.8rem] sm:max-w-[224px]"
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="text-xs text-muted-foreground">
            UAC TEK Club · TEK Korea — student chapter at the Asia Campus.
          </p>
          <p className="text-xs text-muted-foreground sm:shrink-0 sm:text-right">
            Built with Next.js, Prisma, and shadcn/ui.
          </p>
        </div>
      </div>
    </footer>
  );
}

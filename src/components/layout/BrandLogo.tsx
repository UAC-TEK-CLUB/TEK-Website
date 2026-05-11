import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  /** Tailwind height + optional width; default sized for the navbar */
  className?: string;
  priority?: boolean;
};

export function BrandLogo({
  className = "h-9 w-auto max-h-9",
  priority,
}: Props) {
  return (
    <span className={cn("inline-flex shrink-0 items-center", className)}>
      <Image
        src="/branding/tek-korea-logo.png"
        alt="TEK Korea"
        width={240}
        height={240}
        className="h-full w-auto object-contain dark:hidden"
        priority={priority}
      />
      <Image
        src="/branding/tek-korea-logo-dark.png"
        alt="TEK Korea"
        width={240}
        height={240}
        className="hidden h-full w-auto object-contain dark:block"
        priority={priority}
      />
    </span>
  );
}

import Image from "next/image";

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
    <Image
      src="/branding/tek-korea-logo.png"
      alt="TEK Korea"
      width={240}
      height={240}
      className={`object-contain ${className}`}
      priority={priority}
    />
  );
}

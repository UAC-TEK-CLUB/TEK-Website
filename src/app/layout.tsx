import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TEK Club Portal",
  description: "Member portal for the TEK university coding club",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}

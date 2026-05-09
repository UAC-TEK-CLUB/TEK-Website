import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UAC TEK Club",
  description:
    "Official portal for the UAC TEK Club — University of Utah Asia Campus coding & analytics society.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}

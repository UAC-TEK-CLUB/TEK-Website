import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "UAC TEK",
    template: "%s | UAC TEK",
  },
  description:
    "Official portal for UAC TEK — University of Utah Asia Campus coding & analytics society.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}

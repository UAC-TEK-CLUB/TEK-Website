import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";
import { auth } from "@/lib/auth";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "UAC TEK",
    template: "%s | UAC TEK",
  },
  description:
    "Official portal for UAC TEK — University of Utah Asia Campus coding & analytics society.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-background text-foreground antialiased">
        <AuthProvider session={session}>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

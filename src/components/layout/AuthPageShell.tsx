import { BrandLogo } from "@/components/layout/BrandLogo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthPageShell({
  title,
  description,
  children,
  footer,
  cardClassName = "w-full max-w-md",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  cardClassName?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <Card className={cardClassName}>
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center">
            <BrandLogo className="h-14 w-auto max-h-14" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent>
          {children}
          {footer}
        </CardContent>
      </Card>
    </div>
  );
}

import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inconsolata } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { GlobalErrorBoundary } from "@/components/global-error-boundary";
import { I18nProvider } from "@/components/i18n-provider";
import { Toaster } from "@/components/ui/sonner";
import { syncAppUser } from "@/lib/sync-app-user";
import "@/i18n";
import "./globals.css";

const inconsolata = Inconsolata({
  variable: "--font-inconsolata",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DAG Runner",
  description: "Manage and execute your directed acyclic graphs",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await syncAppUser();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={{ padding: 0, margin: 0, overflow: "hidden" }}
    >
      <body
        className={`${inconsolata.variable} antialiased`}
        style={{ padding: 0, margin: 0 }}
      >
        <ClerkProvider>
          <I18nProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              disableTransitionOnChange
            >
              <GlobalErrorBoundary>{children}</GlobalErrorBoundary>
              <Toaster />
            </ThemeProvider>
          </I18nProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

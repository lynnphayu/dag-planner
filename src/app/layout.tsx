import type { Metadata } from "next";
import { Inconsolata } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { I18nProvider } from "@/components/i18n-provider";
import { ModeToggle } from "@/components/theme-swticher";
import { Toaster } from "@/components/ui/sonner";
import "@/i18n";
import "./globals.css";

const inconsolata = Inconsolata({
  variable: "--font-inconsolata",
});

export const metadata: Metadata = {
  title: "DAG Runner",
  description: "Manage and execute your directed acyclic graphs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <I18nProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            disableTransitionOnChange
          >
            <div className="absolute right-4 top-4 z-10">
              <ModeToggle />
            </div>
            {children}
            <Toaster />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}

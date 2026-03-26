import { Workflow } from "lucide-react";
import { HomeClient } from "@/app/components/home";
import { ModeToggle } from "@/components/theme-swticher";
import client from "@/lib/client";

export default async function Home() {
  const dags = await client.fetchDAGs();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Workflow className="h-4 w-4" />
            </div>
            <span className="font-semibold text-sm tracking-tight">
              DAG Runner
            </span>
          </div>
          <ModeToggle />
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <HomeClient dags={dags} />
      </main>
    </div>
  );
}

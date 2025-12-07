import { HomeClient } from "@/app/components/home";
import client from "@/lib/client";
import { CreateDAG } from "./components/creat-dag";

export default async function Home() {
  const { data, error } = await client.fetchDAGs();
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">DAG Runner</h1>
            <p className="text-muted-foreground mt-2">
              Manage and execute your directed acyclic graphs
            </p>
          </div>

          <CreateDAG />
        </div>
        <HomeClient dags={data} error={error} />
      </div>
    </div>
  );
}

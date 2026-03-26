import { auth } from "@clerk/nextjs/server";
import { FlowEditorComposer } from "@/app/flow/[id]/components/composer";
import { createClient } from "@/lib/client";

type FlowPageParams = { params: Promise<{ id: string }> };

export default async function FlowPage({ params }: FlowPageParams) {
  const { id } = await params;
  const token = await auth().then((a) => a.getToken());
  const client = createClient(
    token ? { Authorization: `Bearer ${token}` } : undefined,
  );
  const [dag, tables, versions] = await Promise.all([
    client.fetchDAG(id),
    client.fetchTablesWithDetails(),
    client.fetchDAGVersions(id),
  ]);

  return <FlowEditorComposer hydrate={{ dag, tables, versions }} />;
}

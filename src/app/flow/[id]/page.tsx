import { FlowEditorComposer } from "@/app/flow/[id]/components/composer";
import client from "@/lib/client";

type FlowPageParams = { params: Promise<{ id: string }> };

export default async function FlowPage({ params }: FlowPageParams) {
  const { id } = await params;
  const [dag, tables, versions] = await Promise.all([
    client.fetchDAG(id),
    client.fetchTablesWithDetails(),
    client.fetchDAGVersions(id),
  ]);

  return <FlowEditorComposer hydrate={{ dag, tables, versions }} />;
}

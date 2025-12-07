import { FlowEditorComposer } from "@/app/flow/[id]/components/composer";
import client from "@/lib/client";

type FlowPageParams = { params: Promise<{ id: string }> };

export default async function FlowPage({ params }: FlowPageParams) {
  const { id } = await params;
  const [
    { data: dag, error: dagError },
    { data: tables, error: tablesError },
    { data: versions, error: versionsError },
  ] = await Promise.all([
    client.fetchDAG(id),
    client.fetchTables(),
    client.fetchDAGVersions(id),
  ]);

  if (dagError || tablesError || versionsError)
    return <div>Error loading DAG</div>;
  if (!dag) return <div>DAG not found</div>;
  return <FlowEditorComposer hydrate={{ dag, tables, versions }} />;
}

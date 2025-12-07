import { FlowEditorComposer } from "@/app/flow/[id]/components/composer";
import client from "@/lib/client";

type FlowPageParams = { params: { id: string } };

export default async function FlowPage({ params }: FlowPageParams) {
  const [
    { data: dag, error: dagError },
    { data: tables, error: tablesError },
    { data: versions, error: versionsError },
  ] = await Promise.all([
    client.fetchDAG(params.id),
    client.fetchTables(),
    client.fetchDAGVersions(params.id),
  ]);

  if (dagError || tablesError || versionsError)
    return <div>Error loading DAG</div>;
  if (!dag) return <div>DAG not found</div>;
  return <FlowEditorComposer hydrate={{ dag, tables, versions }} />;
}

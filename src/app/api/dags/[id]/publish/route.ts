import { serverAPIConfig } from "@/config/api";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return fetch(serverAPIConfig.ENDPOINTS.DAGS.PUBLISH(id), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
}

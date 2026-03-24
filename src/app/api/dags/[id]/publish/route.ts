import { getAPIConfig } from "@/config/api";
const API_CONFIG = getAPIConfig()();
export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;
  return fetch(API_CONFIG.ENDPOINTS.DAGS.PUBLISH(id), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
}

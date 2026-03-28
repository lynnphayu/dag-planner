import { serverAPIConfig } from "@/config/api";
import { authenticatedFetch, withAuth } from "@/lib/auth";

export const GET = withAuth<"/api/dags/[id]/versions">(
  async (_request, { params, user }) => {
    const { id } = await params;
    return fetch(serverAPIConfig.ENDPOINTS.DAGS.VERSIONS(id), {
      headers: { "x-user-id": user.userId },
    });
  },
);

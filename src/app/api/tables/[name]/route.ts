import { serverAPIConfig } from "@/config/api";
import { authenticatedFetch, withAuth } from "@/lib/auth";

export const GET = withAuth<"/api/tables/[name]">(
  async (_request, { params, user }) => {
    const { name } = await params;
    return fetch(serverAPIConfig.ENDPOINTS.TABLES.DETAIL(name), {
      headers: { "x-user-id": user.userId },
    });
  },
);

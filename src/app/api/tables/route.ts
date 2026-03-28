import { serverAPIConfig } from "@/config/api";
import { authenticatedFetch, withAuth } from "@/lib/auth";

export const GET = withAuth<"/api/tables">(async (_request, { user }) => {
  return fetch(serverAPIConfig.ENDPOINTS.TABLES.LIST, {
    headers: { "x-user-id": user.userId },
  });
});

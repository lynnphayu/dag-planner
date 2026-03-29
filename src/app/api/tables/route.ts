import { serverAPIConfig } from "@/config/api";
import { withAuth } from "@/lib/auth";

export const GET = withAuth<"/api/tables">(async (_request, { user }) => {
  return fetch(serverAPIConfig.ENDPOINTS.TABLES.LIST, {
    headers: { "x-user-id": user.userId },
  });
});

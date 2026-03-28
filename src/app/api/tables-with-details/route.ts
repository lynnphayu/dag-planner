import { serverAPIConfig } from "@/config/api";
import { authenticatedFetch, withAuth } from "@/lib/auth";

export const GET = withAuth<"/api/tables-with-details">(
  async (_request, { user }) => {
    const tables = await fetch(serverAPIConfig.ENDPOINTS.TABLES.LIST, {
      headers: { "x-user-id": user.userId },
    }).then((res) => res.json() as Promise<{ data: string[] | null }>);
    const tablesWithDetails = await Promise.all(
      (tables.data || []).map(async (table) => {
        const details = await fetch(
          serverAPIConfig.ENDPOINTS.TABLES.DETAIL(table),
          { headers: { "x-user-id": user.userId } },
        );
        const detailsJson = (await details.json()) as Record<string, string>;
        const columns = Object.entries(detailsJson).map(([name, type]) => ({
          name,
          type,
        }));
        return {
          name: table,
          columns,
        };
      }),
    );
    return Response.json(tablesWithDetails);
  },
);

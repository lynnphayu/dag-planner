import type { NextRequest } from "next/server";
import { serverAPIConfig } from "@/config/api";

export async function GET(_request: NextRequest) {
  const tables = await fetch(serverAPIConfig.ENDPOINTS.TABLES.LIST).then(
    (res) => res.json() as Promise<{ data: string[] | null }>,
  );
  const tablesWithDetails = await Promise.all(
    (tables.data || []).map(async (table) => {
      const details = await fetch(
        serverAPIConfig.ENDPOINTS.TABLES.DETAIL(table),
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
}

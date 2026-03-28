import { serverAPIConfig } from "@/config/api";
import { withAuth } from "@/lib/auth";

export const POST = withAuth<"/api/dags/[id]/publish">(
  async (_request, { params, user }) => {
    const { id } = await params;
    return fetch(serverAPIConfig.ENDPOINTS.DAGS.PUBLISH(id), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": user.userId,
      },
    });
  },
);

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { AppRouteHandlerRoutes } from "../../.next/types/routes";

export type AuthenticatedUser = {
  userId: string;
};

export function withAuth<R extends AppRouteHandlerRoutes>(
  handler: (
    request: NextRequest,
    context: RouteContext<R> & { user: AuthenticatedUser },
  ) => Promise<Response>,
): (request: NextRequest, context: RouteContext<R>) => Promise<Response> {
  return async (request, context) => {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(request, { ...context, user: { userId } });
  };
}

export function authenticatedFetch(
  url: string,
  user: AuthenticatedUser,
  init?: RequestInit,
): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: { ...init?.headers, "x-user-id": user.userId },
  });
}

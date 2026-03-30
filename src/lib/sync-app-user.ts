import { currentUser } from "@clerk/nextjs/server";
import { runEnsureAppUser } from "@/lib/ensure-app-user";

export async function syncAppUser(): Promise<void> {
  const user = await currentUser();
  if (!user) return;

  const email = user.primaryEmailAddress?.emailAddress;
  if (!email) return;

  await runEnsureAppUser({ clerkUserId: user.id, email });
}

import { Effect } from "effect";
import { serverEnv } from "@/config/env";
import { UserRepository, UserRepositoryLive } from "@/db/layer";
import type { UserRepositoryApi } from "@/db/repositories/user-repository";
import { RepositoryError } from "@/db/repository-error";
import type { User } from "@/db/schema";

function isUniqueViolation(cause: unknown): boolean {
  return (
    typeof cause === "object" &&
    cause !== null &&
    "code" in cause &&
    (cause as { code: string }).code === "23505"
  );
}

const loadUserAfterUniqueRace = (
  repo: UserRepositoryApi,
  email: string,
): Effect.Effect<User, RepositoryError> =>
  repo.retrieve({ by: "email", email }).pipe(
    Effect.flatMap((user) =>
      user
        ? Effect.succeed(user)
        : Effect.fail(
            new RepositoryError({
              cause: new Error("User row missing after concurrent insert"),
            }),
          ),
    ),
  );

export const ensureAppUserWithDb = (input: {
  email: string;
  clerkUserId: string;
}): Effect.Effect<User, RepositoryError, UserRepository> =>
  Effect.gen(function* () {
    const repo = yield* UserRepository;
    if (!input.clerkUserId) {
      return yield* Effect.fail(
        new RepositoryError({
          cause: new Error("Clerk user id is required to sync app user"),
        }),
      );
    }
    const existing = yield* repo.retrieve({ by: "email", email: input.email });
    if (existing) {
      return existing;
    }
    return yield* repo
      .create({
        userId: input.clerkUserId,
        email: input.email,
      })
      .pipe(
        Effect.catchIf(
          (e: RepositoryError) => isUniqueViolation(e.cause),
          () => loadUserAfterUniqueRace(repo, input.email),
        ),
      );
  });

export const ensureAppUser = (input: {
  email: string;
  clerkUserId: string;
}): Effect.Effect<User | null, RepositoryError, UserRepository> =>
  Effect.flatMap(
    Effect.sync(() => serverEnv.DATABASE_URL),
    (url) => (url ? ensureAppUserWithDb(input) : Effect.succeed(null)),
  );

export function runEnsureAppUser(input: {
  email: string;
  clerkUserId: string;
}): Promise<User | null> {
  if (!serverEnv.DATABASE_URL) {
    return Promise.resolve(null);
  }
  return Effect.runPromise(
    ensureAppUserWithDb(input).pipe(Effect.provide(UserRepositoryLive)),
  );
}

export { RepositoryError as EnsureUserError };

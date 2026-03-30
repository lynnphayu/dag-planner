import { eq } from "drizzle-orm";
import { Effect } from "effect";
import type { Db } from "@/db/client";
import { RepositoryError } from "@/db/repository-error";
import type { NewUser, User } from "@/db/schema";
import { users } from "@/db/schema";

export type UserRetrieveQuery =
  | { readonly by: "id"; readonly id: string }
  | { readonly by: "email"; readonly email: string };

export type UserUpdatePatch = Partial<Pick<NewUser, "email" | "userId">>;

export type UserCreateInput = Pick<NewUser, "email" | "userId">;

export interface UserRepositoryApi {
  readonly retrieve: (
    query: UserRetrieveQuery,
  ) => Effect.Effect<User | null, RepositoryError>;
  readonly create: (
    input: UserCreateInput,
  ) => Effect.Effect<User, RepositoryError>;
  readonly update: (
    id: string,
    patch: UserUpdatePatch,
  ) => Effect.Effect<User, RepositoryError>;
  readonly delete: (id: string) => Effect.Effect<void, RepositoryError>;
}

export function makeUserRepository(db: Db): UserRepositoryApi {
  return {
    retrieve: (query) =>
      Effect.tryPromise({
        try: () =>
          query.by === "id"
            ? db.select().from(users).where(eq(users.id, query.id)).limit(1)
            : db
                .select()
                .from(users)
                .where(eq(users.email, query.email))
                .limit(1),
        catch: (cause) => new RepositoryError({ cause }),
      }).pipe(Effect.map((rows) => rows[0] ?? null)),

    create: (input) =>
      Effect.tryPromise({
        try: () =>
          db
            .insert(users)
            .values({
              userId: input.userId,
              email: input.email,
            })
            .returning(),
        catch: (cause) => new RepositoryError({ cause }),
      }).pipe(
        Effect.flatMap((rows) => {
          const row = rows[0];
          return row
            ? Effect.succeed(row)
            : Effect.fail(
                new RepositoryError({
                  cause: new Error("Create returned no rows"),
                }),
              );
        }),
      ),

    update: (id, patch) =>
      Effect.tryPromise({
        try: () =>
          db.update(users).set(patch).where(eq(users.id, id)).returning(),
        catch: (cause) => new RepositoryError({ cause }),
      }).pipe(
        Effect.flatMap((rows) => {
          const row = rows[0];
          return row
            ? Effect.succeed(row)
            : Effect.fail(
                new RepositoryError({
                  cause: new Error("Update affected no rows"),
                }),
              );
        }),
      ),

    delete: (id) =>
      Effect.tryPromise({
        try: () => db.delete(users).where(eq(users.id, id)),
        catch: (cause) => new RepositoryError({ cause }),
      }).pipe(Effect.asVoid),
  };
}

import { Data } from "effect";

export class RepositoryError extends Data.TaggedError("RepositoryError")<{
  readonly cause: unknown;
}> {}

import { Context, Layer } from "effect";
import { getDb } from "@/db/client";
import {
  makeUserRepository,
  type UserRepositoryApi,
} from "@/db/repositories/user-repository";

export class UserRepository extends Context.Tag("app/UserRepository")<
  UserRepository,
  UserRepositoryApi
>() {}

export const UserRepositoryLive = Layer.sync(UserRepository, () =>
  makeUserRepository(getDb()),
);

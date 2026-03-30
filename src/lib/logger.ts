import "server-only";

import pino from "pino";
import { serverEnv } from "@/config/env";

const isDev = serverEnv.NODE_ENV === "development";

export const logger = pino({
  level: serverEnv.LOG_LEVEL,
  base: {
    service: "dag-runner",
    env: serverEnv.NODE_ENV,
  },
  ...(isDev
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        },
      }
    : {}),
});

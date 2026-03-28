import { z } from "zod";

const serverEnvSchema = z.object({
  BACKEND_API_URL: z.string().url().default("http://localhost:3030/v1"),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:3005/api"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

function validate<S extends z.ZodTypeAny>(
  schema: S,
  data: unknown,
): z.infer<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Environment validation failed:\n${formatted}`);
  }
  return result.data;
}

export const serverEnv = validate(serverEnvSchema, {
  BACKEND_API_URL: process.env.BACKEND_API_URL,
  NODE_ENV: process.env.NODE_ENV,
});

export const clientEnv = validate(clientEnvSchema, {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

import { serverEnv } from "./env";

const port = process.env.PORT ?? "3005";
const internalAPIBase = `http://localhost:${port}/api`;

const buildEndpoints = (baseUrl: string) => ({
  BASE_URL: baseUrl,
  ENDPOINTS: {
    TABLES: {
      WITH_DETAILS: `${baseUrl}/tables-with-details`,
      LIST: `${baseUrl}/tables`,
      DETAIL: (name: string) => `${baseUrl}/tables/${name}`,
    },
    DAGS: {
      LIST: `${baseUrl}/dags`,
      DETAIL: (id: string) => `${baseUrl}/dags/${id}`,
      EXECUTE: (id: string) => `${baseUrl}/dags/${id}/execute`,
      PUBLISH: (id: string) => `${baseUrl}/dags/${id}/publish`,
      VERSIONS: (id: string) => `${baseUrl}/dags/${id}/versions`,
    },
  },
});

export const serverAPIConfig = buildEndpoints(serverEnv.BACKEND_API_URL);
export const clientAPIConfig = buildEndpoints("/api");
export const internalClientAPIConfig = buildEndpoints(internalAPIBase);

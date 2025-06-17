export const API_CONFIG = {
  BASE_URL: "http://localhost:8080/v1",
  ENDPOINTS: {
    DAGS: {
      LIST: "http://localhost:8080/v1/dags",
      DETAIL: (id: string) => `http://localhost:8080/v1/dags/${id}`,
      EXECUTE: (id: string) => `http://localhost:8080/v1/dags/${id}/execute`,
    },
  },
} as const;

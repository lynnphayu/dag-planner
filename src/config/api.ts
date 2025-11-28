export const getAPIConfig = (baseUrl?: string) => {
  const BASE_URL = baseUrl || "http://localhost:8888/v1";
  return () =>
    ({
      BASE_URL,
      ENDPOINTS: {
        TABLES: {
          LIST: `${BASE_URL}/tables`,
          DETAIL: (name: string) => `${BASE_URL}/tables/${name}`,
        },
        DAGS: {
          LIST: `${BASE_URL}/dags`,
          DETAIL: (id: string) => `${BASE_URL}/dags/${id}`,
          EXECUTE: (id: string) => `${BASE_URL}/dags/${id}/execute`,
        },
        ADAPTERS: {
          LIST: `${BASE_URL}/adapters`,
          DETAIL: (id: string) => `${BASE_URL}/adapters/${id}`,
        },
      },
    }) as const;
};

export default getAPIConfig()();

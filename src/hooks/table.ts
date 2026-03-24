import useSWR from "swr";
import { getAPIConfig } from "@/config/api";

const API_CONFIG = getAPIConfig("http://localhost:3005/api")();
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useTables = () =>
  useSWR<{ data: string[] }>(API_CONFIG.ENDPOINTS.TABLES.WITH_DETAILS, fetcher);

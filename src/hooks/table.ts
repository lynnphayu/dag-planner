import useSWR from "swr";
import { clientAPIConfig } from "@/config/api";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useTables = () =>
  useSWR<{ data: string[] }>(
    clientAPIConfig.ENDPOINTS.TABLES.WITH_DETAILS,
    fetcher,
  );

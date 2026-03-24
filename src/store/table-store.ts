import { create } from "zustand";

export interface Table {
  name: string;
  columns: { name: string; type: string }[];
}
export type Tables = Table[];
interface TableStore {
  tables: Tables;
  selectedTable: Table | null;
}

interface TableActions {
  setSelectedTable: (tableName: string) => void;
  setTables: (tables: Tables) => void;
}

export const useTableStore = create<TableStore & TableActions>((set, get) => ({
  tables: [],
  selectedTable: null,

  setSelectedTable: (tableName: string) => {
    const table = get().tables.find((table) => table.name === tableName);
    if (table) set({ selectedTable: table });
  },
  setTables: (tables: Tables) => {
    set({ tables });
  },
}));

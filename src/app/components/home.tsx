"use client";

import { Search, Workflow } from "lucide-react";
import { CreateDAG } from "@/app/components/creat-dag";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DAGCard } from "@/components/dag-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DAGModel } from "@/hooks/dag";

interface HomeClientProps {
  dags: DAGModel[];
  error?: string;
}

const STATUS_FILTERS = ["all", "published", "draft"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

export function HomeClient({ dags, error }: HomeClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const stats = useMemo(() => {
    const published = dags.filter((d) => d.status === "published").length;
    return { total: dags.length, published, draft: dags.length - published };
  }, [dags]);

  const filtered = useMemo(
    () =>
      dags
        .filter((d) => statusFilter === "all" || d.status === statusFilter)
        .filter(
          (d) =>
            !search ||
            d.name?.toLowerCase().includes(search.toLowerCase()) ||
            d.id.toLowerCase().includes(search.toLowerCase()),
        ),
    [dags, search, statusFilter],
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg text-destructive">Error loading DAGs</p>
        <p className="text-sm text-muted-foreground mt-1.5">{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => router.refresh()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {(
          [
            { label: "Total", value: stats.total },
            { label: "Published", value: stats.published },
            { label: "Draft", value: stats.draft },
          ] as const
        ).map(({ label, value }) => (
          <div key={label} className="rounded-lg border bg-card px-4 py-3">
            <p className="text-2xl font-bold tabular-nums">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search DAGs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-0.5 rounded-lg border bg-muted/40 p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1 text-xs rounded-md transition-colors capitalize ${
                statusFilter === f
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <CreateDAG />
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((dag) => (
            <DAGCard
              key={dag.id}
              dag={dag}
              onClick={(id) => router.push(`/flow/${id}`)}
            />
          ))}
        </div>
      ) : dags.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <Workflow className="h-14 w-14 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-semibold">No DAGs yet</h2>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">
            Create your first DAG to start building complex workflows with
            multiple steps and dependencies.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <p className="text-sm text-muted-foreground">
            No DAGs match your search.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}

import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { Badge } from "@/components/ui/badge";
import { DialogHeader } from "@/components/ui/dialog";
import type { DAGVersion } from "@/hooks/dag";

interface VersionsDialogProps {
  versions: DAGVersion[];
}

export function VersionsDialogContent({ versions }: VersionsDialogProps) {
  if (!versions || versions.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No versions found.
      </div>
    );
  }
  return (
    <>
      <DialogHeader>
        <DialogTitle>Versions</DialogTitle>
        <DialogDescription>
          All available versions for this DAG.
        </DialogDescription>
      </DialogHeader>
      <div className="max-h-[50vh] overflow-auto space-y-2">
          <ul className="space-y-2">
            {versions
              .slice()
              .sort((a, b) =>
                a.version === b.version
                  ? b.subversion - a.subversion
                  : b.version - a.version,
              )
              .map((v) => (
                <li
                  key={`${v.version}.${v.subversion}`}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">
                      v{v.version}.{v.subversion}
                    </Badge>
                    <span className="text-sm">
                      {v.createdAt
                        ? new Date(v.createdAt).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {v.status ? (
                      <Badge
                        variant={
                          v.status.toLowerCase() === "published"
                            ? "default"
                            : "outline"
                        }
                      >
                        {v.status}
                      </Badge>
                    ) : null}
                  </div>
                </li>
              ))}
          </ul>
      </div>
    </>
  );
}

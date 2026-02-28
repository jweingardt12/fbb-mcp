import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { TeamLogo } from "../shared/team-logo";

interface Transaction {
  player: string;
  type: string;
  team?: string;
  date?: string;
  description?: string;
}

interface ProspectsData {
  type: string;
  transactions: Transaction[];
}

function typeColor(type: string): string {
  const t = type.toLowerCase();
  if (t.indexOf("call") >= 0 || t.indexOf("recall") >= 0) return "bg-green-500/20 text-green-700 dark:text-green-400";
  if (t.indexOf("option") >= 0 || t.indexOf("assign") >= 0) return "bg-orange-500/20 text-orange-700 dark:text-orange-400";
  if (t.indexOf("dfa") >= 0 || t.indexOf("release") >= 0) return "bg-red-500/20 text-red-700 dark:text-red-400";
  return "bg-muted text-muted-foreground";
}

export function ProspectsView({ data, app, navigate }: { data: ProspectsData; app: any; navigate: (data: any) => void }) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Prospect Watch</h2>
      <p className="text-xs text-muted-foreground">Recent call-ups and roster moves that could impact fantasy</p>

      {(data.transactions || []).length === 0 ? (
        <p className="text-sm text-muted-foreground">No recent prospect moves found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Player</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="hidden sm:table-cell">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data.transactions || []).map(function(t, i) {
              return (
                <TableRow key={i}>
                  <TableCell>
                    <Badge variant="secondary" className={"text-xs " + typeColor(t.type)}>{t.type}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{t.player}</TableCell>
                  <TableCell className="text-sm">
                    <span className="flex items-center gap-1">
                      <TeamLogo abbrev={t.team} />
                      {t.team || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{t.description || "—"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

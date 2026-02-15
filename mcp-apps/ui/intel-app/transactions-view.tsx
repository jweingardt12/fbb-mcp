import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { useCallTool } from "../shared/use-call-tool";
import { TeamLogo } from "../shared/team-logo";
import { Button } from "../components/ui/button";
import { Loader2 } from "lucide-react";

interface Transaction {
  player: string;
  type: string;
  team?: string;
  date?: string;
  description?: string;
}

interface TransactionsData {
  type: string;
  days?: number;
  transactions: Transaction[];
}

function typeColor(type: string): string {
  const t = type.toLowerCase();
  if (t.indexOf("il") >= 0 || t.indexOf("injured") >= 0) return "bg-red-500/20 text-red-700 dark:text-red-400";
  if (t.indexOf("call") >= 0 || t.indexOf("recall") >= 0) return "bg-green-500/20 text-green-700 dark:text-green-400";
  if (t.indexOf("trade") >= 0) return "bg-purple-500/20 text-purple-700 dark:text-purple-400";
  if (t.indexOf("dfa") >= 0 || t.indexOf("release") >= 0) return "bg-orange-500/20 text-orange-700 dark:text-orange-400";
  return "bg-muted text-muted-foreground";
}

export function TransactionsView({ data, app, navigate }: { data: TransactionsData; app: any; navigate: (data: any) => void }) {
  const { callTool, loading } = useCallTool(app);

  const handleRefresh = async function(days: number) {
    const result = await callTool("fantasy_transactions", { days: days });
    if (result) navigate(result.structuredContent);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">MLB Transactions</h2>
          <p className="text-xs text-muted-foreground">{"Last " + (data.days || 7) + " days"}</p>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={function() { handleRefresh(3); }} disabled={loading}>3d</Button>
          <Button size="sm" variant="outline" onClick={function() { handleRefresh(7); }} disabled={loading}>7d</Button>
          <Button size="sm" variant="outline" onClick={function() { handleRefresh(14); }} disabled={loading}>14d</Button>
        </div>
      </div>

      <div className="relative">
        {loading && (
          <div className="loading-overlay">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {(data.transactions || []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No transactions found.</p>
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
                      <Badge variant="secondary" className={"text-[10px] " + typeColor(t.type)}>{t.type}</Badge>
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
    </div>
  );
}

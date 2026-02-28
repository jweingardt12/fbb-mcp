import { Button } from "../components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { useCallTool } from "../shared/use-call-tool";
import { ChevronLeft, ChevronRight, Loader2 } from "@/shared/icons";

interface PastTeamEntry {
  name: string;
  manager: string;
  moves: number;
  trades: number;
}

interface PastTeamsData {
  year: number;
  teams: PastTeamEntry[];
}

export function PastTeamsView({ data, app, navigate }: { data: PastTeamsData; app: any; navigate: (data: any) => void }) {
  const { callTool, loading } = useCallTool(app);

  const changeYear = async (year: number) => {
    const result = await callTool("yahoo_past_teams", { year });
    if (result) {
      navigate(result.structuredContent);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <Button variant="outline" size="sm" disabled={data.year <= 2011 || loading} onClick={() => changeYear(data.year - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">Teams - {data.year}</h2>
        <Button variant="outline" size="sm" disabled={data.year >= 2026 || loading} onClick={() => changeYear(data.year + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="relative">
        {loading && (
          <div className="loading-overlay">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team</TableHead>
              <TableHead className="hidden sm:table-cell">Manager</TableHead>
              <TableHead className="text-right">Moves</TableHead>
              <TableHead className="text-right">Trades</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data.teams || []).map((t) => (
              <TableRow key={t.name}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{t.manager}</TableCell>
                <TableCell className="text-right font-mono">{t.moves}</TableCell>
                <TableCell className="text-right font-mono">{t.trades}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

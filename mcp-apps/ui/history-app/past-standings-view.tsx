import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { useCallTool } from "../shared/use-call-tool";
import { ChevronLeft, ChevronRight, Loader2, Trophy } from "@/shared/icons";

interface PastStandingsEntry {
  rank: number;
  team_name: string;
  manager: string;
  record: string;
}

interface PastStandingsData {
  year: number;
  standings: PastStandingsEntry[];
}

export function PastStandingsView({ data, app, navigate }: { data: PastStandingsData; app: any; navigate: (data: any) => void }) {
  const { callTool, loading } = useCallTool(app);

  const changeYear = async (year: number) => {
    const result = await callTool("yahoo_past_standings", { year });
    if (result) {
      navigate(result.structuredContent);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <Button variant="outline" size="sm" disabled={data.year <= 2011 || loading} onClick={() => changeYear(data.year - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">Standings - {data.year}</h2>
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
              <TableHead className="w-12">#</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="hidden sm:table-cell">Manager</TableHead>
              <TableHead className="text-center">Record</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data.standings || []).map((s) => (
              <TableRow key={s.rank}>
                <TableCell>
                  <span className="flex items-center gap-1">
                    <Badge variant={s.rank <= 3 ? "default" : "secondary"} className="text-xs">{s.rank}</Badge>
                    {s.rank <= 3 && <Trophy size={14} className="text-amber-500" />}
                  </span>
                </TableCell>
                <TableCell className="font-medium">{s.team_name}</TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{s.manager}</TableCell>
                <TableCell className="text-center font-mono">{s.record}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

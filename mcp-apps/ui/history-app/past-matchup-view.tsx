import { Button } from "../components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { useCallTool } from "../shared/use-call-tool";
import { ChevronLeft, ChevronRight, Loader2 } from "@/shared/icons";

interface PastMatchupEntry {
  team1: string;
  team2: string;
  score: string;
  status: string;
}

interface PastMatchupData {
  year: number;
  week: number;
  matchups: PastMatchupEntry[];
}

export function PastMatchupView({ data, app, navigate }: { data: PastMatchupData; app: any; navigate: (data: any) => void }) {
  const { callTool, loading } = useCallTool(app);

  const changeYear = async (year: number) => {
    const result = await callTool("yahoo_past_matchup", { year, week: data.week });
    if (result) {
      navigate(result.structuredContent);
    }
  };

  const changeWeek = async (week: number) => {
    const result = await callTool("yahoo_past_matchup", { year: data.year, week });
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
        <h2 className="text-lg font-semibold">{data.year}</h2>
        <Button variant="outline" size="sm" disabled={data.year >= 2026 || loading} onClick={() => changeYear(data.year + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center justify-between mb-3">
        <Button variant="outline" size="sm" disabled={data.week <= 1 || loading} onClick={() => changeWeek(data.week - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">Week {data.week}</span>
        <Button variant="outline" size="sm" disabled={data.week >= 22 || loading} onClick={() => changeWeek(data.week + 1)}>
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
              <TableHead>Team 1</TableHead>
              <TableHead className="text-center">Score</TableHead>
              <TableHead>Team 2</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data.matchups || []).map((m, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{m.team1}</TableCell>
                <TableCell className="text-center">
                  <span className="font-mono">{m.score}</span>
                </TableCell>
                <TableCell className="font-medium">{m.team2}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

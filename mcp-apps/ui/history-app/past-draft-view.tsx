import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { useCallTool } from "../shared/use-call-tool";
import { ChevronLeft, ChevronRight, Loader2 } from "@/shared/icons";

interface PastDraftPick {
  round: number;
  pick: number;
  player_name: string;
  team_name: string;
}

interface PastDraftData {
  year: number;
  picks: PastDraftPick[];
}

export function PastDraftView({ data, app, navigate }: { data: PastDraftData; app: any; navigate: (data: any) => void }) {
  const { callTool, loading } = useCallTool(app);

  const changeYear = async (year: number) => {
    const result = await callTool("yahoo_past_draft", { year, count: 25 });
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
        <h2 className="text-lg font-semibold">Draft - {data.year}</h2>
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
              <TableHead className="w-12">Rd</TableHead>
              <TableHead className="hidden sm:table-cell w-14">Pick</TableHead>
              <TableHead>Player</TableHead>
              <TableHead>Team</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data.picks || []).map((p) => (
              <TableRow key={p.round + "-" + p.pick}>
                <TableCell className="font-mono text-xs">{p.round}</TableCell>
                <TableCell className="hidden sm:table-cell font-mono text-xs">{p.pick}</TableCell>
                <TableCell className="font-medium">{p.player_name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{p.team_name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-xs text-muted-foreground mt-2">{(data.picks || []).length} picks</p>
      </div>
    </div>
  );
}

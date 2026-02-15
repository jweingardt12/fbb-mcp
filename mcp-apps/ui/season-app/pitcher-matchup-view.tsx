import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { TeamLogo } from "../shared/team-logo";

interface PitcherMatchupEntry {
  name: string;
  player_id: string;
  mlb_team: string;
  next_start_date: string;
  opponent: string;
  home_away: string;
  opp_avg: number;
  opp_obp: number;
  opp_k_pct: number;
  opp_woba: number;
  matchup_grade: string;
  two_start: boolean;
}

interface PitcherMatchupData {
  week: number;
  start_date: string;
  end_date: string;
  pitchers: PitcherMatchupEntry[];
}

function gradeColor(grade: string): string {
  switch (grade) {
    case "A": return "bg-green-600 text-white";
    case "B": return "bg-blue-600 text-white";
    case "C": return "bg-yellow-600 text-white";
    case "D": return "bg-orange-600 text-white";
    case "F": return "bg-red-600 text-white";
    default: return "";
  }
}

// Sort by grade quality (A first)
var GRADE_ORDER: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, F: 4 };

export function PitcherMatchupView({ data }: { data: PitcherMatchupData }) {
  var pitchers = (data.pitchers || []).slice().sort((a, b) => {
    var aOrd = GRADE_ORDER[a.matchup_grade] != null ? GRADE_ORDER[a.matchup_grade] : 5;
    var bOrd = GRADE_ORDER[b.matchup_grade] != null ? GRADE_ORDER[b.matchup_grade] : 5;
    return aOrd - bOrd;
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Pitcher Matchups</h2>
        <p className="text-xs text-muted-foreground">
          Week {data.week} ({data.start_date} to {data.end_date})
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pitcher</TableHead>
            <TableHead className="hidden sm:table-cell">Team</TableHead>
            <TableHead>Next Start</TableHead>
            <TableHead>Opponent</TableHead>
            <TableHead className="hidden sm:table-cell text-right">AVG</TableHead>
            <TableHead className="hidden sm:table-cell text-right">OBP</TableHead>
            <TableHead className="hidden sm:table-cell text-right">K%</TableHead>
            <TableHead className="text-center">Grade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pitchers.map((p) => (
            <TableRow key={p.player_id + "-" + p.next_start_date}>
              <TableCell className="font-medium">
                <span className="flex items-center gap-1.5">
                  {p.name}
                  {p.two_start && <Badge className="text-[10px] bg-purple-600 text-white">2S</Badge>}
                </span>
              </TableCell>
              <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <TeamLogo abbrev={p.mlb_team} />
                  {p.mlb_team}
                </span>
              </TableCell>
              <TableCell className="font-mono text-xs">{p.next_start_date}</TableCell>
              <TableCell>
                <span className="text-sm flex items-center gap-1">
                  {p.home_away === "home" ? "vs " : "@ "}
                  <TeamLogo abbrev={p.opponent} />
                  {p.opponent}
                </span>
              </TableCell>
              <TableCell className="hidden sm:table-cell text-right font-mono text-xs">
                {typeof p.opp_avg === "number" ? p.opp_avg.toFixed(3) : "-"}
              </TableCell>
              <TableCell className="hidden sm:table-cell text-right font-mono text-xs">
                {typeof p.opp_obp === "number" ? p.opp_obp.toFixed(3) : "-"}
              </TableCell>
              <TableCell className="hidden sm:table-cell text-right font-mono text-xs">
                {typeof p.opp_k_pct === "number" ? (p.opp_k_pct * 100).toFixed(1) + "%" : "-"}
              </TableCell>
              <TableCell className="text-center">
                <Badge className={"text-xs " + gradeColor(p.matchup_grade)}>{p.matchup_grade}</Badge>
              </TableCell>
            </TableRow>
          ))}
          {pitchers.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                No pitcher matchup data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

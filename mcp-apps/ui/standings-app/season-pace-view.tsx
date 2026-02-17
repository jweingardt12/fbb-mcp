import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Tooltip } from "../components/ui/tooltip";
import { Info } from "@/shared/icons";
import { formatFixed } from "../shared/number-format";

interface SeasonPaceTeam {
  rank: number;
  name: string;
  wins: number;
  losses: number;
  ties: number;
  weeks_played: number;
  remaining_weeks: number;
  win_pct: number;
  projected_wins: number;
  projected_losses: number;
  is_my_team: boolean;
  playoff_status: string;
  magic_number: number;
  team_logo?: string;
  manager_image?: string;
}

interface SeasonPaceData {
  current_week: number;
  end_week: number;
  playoff_teams: number;
  teams: SeasonPaceTeam[];
}

function StatusBadge({ status }: { status: string }) {
  if (status === "in") return <Badge className="text-[10px] bg-sem-success">In</Badge>;
  if (status === "bubble") return <Badge className="text-[10px] bg-sem-warning">Bubble</Badge>;
  if (status === "out") return <Badge variant="destructive" className="text-[10px]">Out</Badge>;
  return <Badge variant="secondary" className="text-[10px]">{status}</Badge>;
}

export function SeasonPaceView({ data }: { data: SeasonPaceData }) {
  var teams = data.teams || [];
  var progressPct = data.end_week > 0 ? Math.round((data.current_week / data.end_week) * 100) : 0;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          Season Pace
          <Badge variant="secondary" className="text-xs">Week {data.current_week}/{data.end_week}</Badge>
          <Badge variant="outline" className="text-xs">{data.playoff_teams} playoff spots</Badge>
        </h2>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Season Progress</span>
          <span>{progressPct}% complete</span>
        </div>
        <Progress value={progressPct} className="h-2" />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Team</TableHead>
            <TableHead className="text-center">Record</TableHead>
            <TableHead className="text-right hidden sm:table-cell">Win%</TableHead>
            <TableHead className="text-right">Proj W</TableHead>
            <TableHead className="text-right hidden sm:table-cell">
              <Tooltip content="Wins needed to clinch a playoff spot, assuming the team on the bubble wins out.">
                <span className="flex items-center gap-1 justify-end cursor-help">
                  Magic#
                  <Info size={12} />
                </span>
              </Tooltip>
            </TableHead>
            <TableHead className="text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((t, idx) => {
            var showPlayoffLine = t.rank === data.playoff_teams && idx < teams.length - 1;
            return (
              <TableRow
                key={t.name}
                className={
                  (t.is_my_team ? "border-l-2 border-primary bg-primary/5 " : "")
                  + (showPlayoffLine ? "border-b-2 border-dashed border-muted-foreground/30" : "")
                }
              >
                <TableCell className="font-mono text-sm text-muted-foreground">{t.rank}</TableCell>
                <TableCell className={"font-medium" + (t.is_my_team ? " text-primary" : "")}>
                  <span className="flex items-center" style={{ gap: "6px" }}>
                    {t.team_logo && <img src={t.team_logo} alt="" width={20} height={20} className="rounded-sm" style={{ flexShrink: 0 }} />}
                    {t.name}
                  </span>
                </TableCell>
                <TableCell className="text-center font-mono text-sm">
                  {t.wins}-{t.losses}{t.ties > 0 ? "-" + t.ties : ""}
                </TableCell>
                <TableCell className="text-right font-mono text-sm hidden sm:table-cell">{formatFixed(t.win_pct * 100, 1, "0.0")}%</TableCell>
                <TableCell className="text-right font-mono text-sm font-semibold">{t.projected_wins}</TableCell>
                <TableCell className="text-right font-mono text-sm hidden sm:table-cell">
                  {t.magic_number > 0 ? t.magic_number : "-"}
                </TableCell>
                <TableCell className="text-center"><StatusBadge status={t.playoff_status} /></TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

import * as React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

interface StandingsEntry {
  rank: number;
  name: string;
  wins: number;
  losses: number;
  ties?: number;
  points_for?: string;
  team_logo?: string;
  manager_image?: string;
}

const MY_TEAM = "You Can Clip These Wings";

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Badge className="text-xs bg-sem-warning">{rank}</Badge>;
  if (rank === 2) return <Badge className="text-xs bg-sem-neutral">{rank}</Badge>;
  if (rank === 3) return <Badge className="text-xs bg-sem-info">{rank}</Badge>;
  return <Badge variant="secondary" className="text-xs">{rank}</Badge>;
}

function WinLossBar({ wins, losses }: { wins: number; losses: number }) {
  const total = wins + losses;
  if (total === 0) return null;
  const winPct = (wins / total) * 100;
  return (
    <div className="flex h-1.5 w-16 rounded-full overflow-hidden bg-muted">
      <div className="bg-green-500 rounded-l-full" style={{ width: winPct + "%" }} />
      <div className="bg-red-400 rounded-r-full" style={{ width: (100 - winPct) + "%" }} />
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={"transition-transform " + (open ? "rotate-180" : "")}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function PointsDistributionChart({ standings, playoffLine }: { standings: StandingsEntry[]; playoffLine: number }) {
  // Sort by points descending for the chart
  const sorted = [...standings]
    .filter((s) => s.points_for)
    .sort((a, b) => parseFloat(b.points_for || "0") - parseFloat(a.points_for || "0"));

  const chartData = sorted.map((s) => ({
    name: s.name.length > 18 ? s.name.slice(0, 16) + ".." : s.name,
    points: parseFloat(s.points_for || "0"),
    isMyTeam: s.name === MY_TEAM,
    inPlayoffs: s.rank <= playoffLine,
  }));

  // Find the points value at the playoff cutoff to draw a reference line
  const playoffCutoffTeam = standings.find((s) => s.rank === playoffLine);
  const cutoffPoints = playoffCutoffTeam ? parseFloat(playoffCutoffTeam.points_for || "0") : 0;

  const chartHeight = Math.max(250, chartData.length * 32);

  return (
    <div style={{ width: "100%", height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis
            type="category"
            dataKey="name"
            width={130}
            tick={{ fontSize: 11 }}
          />
          {cutoffPoints > 0 && (
            <ReferenceLine
              x={cutoffPoints}
              stroke="var(--sem-neutral)"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{ value: "Playoff line", position: "top", fontSize: 10, fill: "var(--sem-neutral)" }}
            />
          )}
          <Bar dataKey="points" radius={[0, 4, 4, 0]} barSize={20}>
            {chartData.map((entry, idx) => {
              let fill = entry.inPlayoffs ? "var(--sem-success)" : "var(--sem-risk)";
              if (entry.isMyTeam) fill = "hsl(var(--primary))";
              return <Cell key={"cell-" + idx} fill={fill} fillOpacity={entry.isMyTeam ? 1 : 0.7} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StandingsView({ data }: { data: { standings: StandingsEntry[]; playoff_teams?: number } }) {
  const [showDistribution, setShowDistribution] = React.useState(false);
  const playoffLine = data.playoff_teams || 6;
  const hasTies = data.standings.some((s) => s.ties);
  const hasPoints = data.standings.some((s) => s.points_for);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-3">League Standings</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-center">Record</TableHead>
              <TableHead className="hidden sm:table-cell w-20"></TableHead>
              {hasPoints && <TableHead className="text-right">Points</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data.standings || []).map((s, idx) => {
              const isMyTeam = s.name === MY_TEAM;
              const showPlayoffLine = s.rank === playoffLine && idx < (data.standings || []).length - 1;
              return (
                <TableRow
                  key={s.rank}
                  className={
                    (isMyTeam ? "border-l-2 border-primary bg-primary/5 " : "")
                    + (showPlayoffLine ? "border-b-2 border-dashed border-muted-foreground/30" : "")
                  }
                >
                  <TableCell><RankBadge rank={s.rank} /></TableCell>
                  <TableCell className={"font-medium" + (isMyTeam ? " text-primary" : "")}>
                    <span className="flex items-center" style={{ gap: "6px" }}>
                      {s.team_logo && <img src={s.team_logo} alt="" width={20} height={20} className="rounded-sm" style={{ flexShrink: 0 }} />}
                      {s.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-mono text-sm">
                    {s.wins}-{s.losses}{hasTies ? "-" + (s.ties || 0) : ""}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <WinLossBar wins={s.wins} losses={s.losses} />
                  </TableCell>
                  {hasPoints && <TableCell className="text-right font-mono font-medium">{s.points_for || "-"}</TableCell>}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Points Distribution Chart (collapsible) */}
      {hasPoints && (
        <Card>
          <CardContent className="p-4">
            <button
              onClick={() => setShowDistribution(!showDistribution)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">Points Distribution</h3>
                <div className="flex items-center gap-1.5 ml-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-sm bg-green-500 opacity-70" />
                  <span className="text-[10px] text-muted-foreground">Playoff</span>
                  <span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-500 opacity-70 ml-1" />
                  <span className="text-[10px] text-muted-foreground">Out</span>
                </div>
              </div>
              <ChevronIcon open={showDistribution} />
            </button>
            {showDistribution && (
              <div className="mt-3">
                <PointsDistributionChart standings={data.standings} playoffLine={playoffLine} />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { Fragment } from "react";
import { Badge } from "../components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { mlbHeadshotUrl } from "../shared/mlb-images";
import { TeamLogo } from "../shared/team-logo";
import { BarChart3, Loader2 } from "@/shared/icons";
import { useCallTool } from "../shared/use-call-tool";
import { ZScoreBar, ZScoreExplainer, getTier } from "../shared/z-score";
import { IntelBadge } from "../shared/intel-badge";
import { PlayerName } from "../shared/player-name";

interface RankingEntry {
  rank: number;
  name: string;
  team?: string;
  position?: string;
  z_score: number;
  mlb_id?: number;
  intel?: any;
}

interface RankingsData {
  pos_type: string;
  count: number;
  source: string;
  players: RankingEntry[];
}

export function RankingsView({ data, app, navigate }: { data: RankingsData; app: any; navigate: (content: any) => void }) {
  const { callTool, loading } = useCallTool(app);
  const label = data.pos_type === "P" ? "Pitcher" : "Hitter";
  let lastTier = "";
  const chartData = (data.players || []).slice(0, 15).map((p) => ({
    name: p.name.length > 12 ? p.name.slice(0, 12) + "..." : p.name,
    z_score: p.z_score,
  }));

  const handleTabChange = async (newValue: string) => {
    const result = await callTool("yahoo_rankings", { pos_type: newValue, count: data.count || 25 });
    if (result) {
      navigate(result.structuredContent);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 size={18} />
        <h2 className="text-lg font-semibold">{label} Rankings</h2>
        <Badge variant="secondary">{data.source}</Badge>
        <span className="text-xs text-muted-foreground">Top {data.count}</span>
      </div>

      <ZScoreExplainer />

      <Tabs value={data.pos_type || "B"} onValueChange={handleTabChange} className="mb-4 mt-2">
        <TabsList>
          <TabsTrigger value="B">Batters</TabsTrigger>
          <TabsTrigger value="P">Pitchers</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative">
        {loading && (
          <div className="loading-overlay">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {chartData.length > 0 && (
          <div className="mb-4 h-36 sm:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-35} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "6px", fontSize: "12px" }} />
                <Bar dataKey="z_score" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="hidden sm:table-cell">Team</TableHead>
              <TableHead>Pos</TableHead>
              <TableHead className="text-right">Z-Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data.players || []).map(function (p) {
              const tier = getTier(p.z_score);
              const showDivider = lastTier !== "" && tier !== lastTier;
              lastTier = tier;
              return (
                <Fragment key={p.rank}>
                  {showDivider && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-0.5 px-0">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-px bg-border" />
                          <span className="text-xs text-muted-foreground">{tier} Tier</span>
                          <div className="flex-1 h-px bg-border" />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell className="font-mono text-xs">{p.rank}</TableCell>
                    <TableCell className="font-medium">
                      <span className="flex items-center" style={{ gap: "4px" }}>
                        {p.mlb_id && <img src={mlbHeadshotUrl(p.mlb_id)} alt="" className="w-6 h-6 rounded-full bg-muted object-cover flex-shrink-0" />}
                        <PlayerName name={p.name} mlbId={p.mlb_id} app={app} navigate={navigate} context="default" showHeadshot={false} />
                        {p.intel && <IntelBadge intel={p.intel} size="sm" />}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      <span className="flex items-center" style={{ gap: "4px" }}>
                        <TeamLogo abbrev={p.team} />
                        {p.team || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {p.position && <Badge variant="outline" className="text-xs">{p.position}</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <ZScoreBar z={p.z_score} />
                    </TableCell>
                  </TableRow>
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

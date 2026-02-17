import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { mlbHeadshotUrl } from "../shared/mlb-images";
import { IntelBadge } from "../shared/intel-badge";
import { PlayerName } from "../shared/player-name";
import { formatFixed } from "../shared/number-format";

interface DraftRecommendation {
  name: string;
  position?: string;
  positions?: string[];
  z_score: number | null;
  pos_type?: string;
  mlb_id?: number;
  intel?: any;
}

interface DraftRecommendData {
  round: number;
  strategy?: string;
  recommendation?: string;
  hitters?: DraftRecommendation[];
  pitchers?: DraftRecommendation[];
  top_hitters?: DraftRecommendation[];
  top_pitchers?: DraftRecommendation[];
  hitters_count?: number;
  pitchers_count?: number;
  top_pick?: { name: string; type: string; z_score: number | null } | null;
}

function getTier(z: number | null): string {
  if (z == null) return "?";
  if (z >= 2.0) return "Elite";
  if (z >= 1.0) return "Strong";
  if (z >= 0) return "Average";
  return "Below";
}

function tierColor(z: number | null): string {
  if (z == null) return "bg-muted";
  if (z >= 2.0) return "bg-green-500";
  if (z >= 1.0) return "bg-blue-500";
  if (z >= 0) return "bg-yellow-500";
  return "bg-red-400";
}

function ZScoreBar({ z }: { z: number | null }) {
  if (z == null) return <span className="text-xs text-muted-foreground">N/A</span>;
  // Scale: -1 to 4 mapped to 0-100%
  const pct = Math.max(0, Math.min(100, ((z + 1) / 5) * 100));
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex h-1.5 w-12 rounded-full overflow-hidden bg-muted">
        <div className={"rounded-full " + tierColor(z)} style={{ width: pct + "%" }} />
      </div>
      <span className="font-mono text-xs">{formatFixed(z, 2, "0.00")}</span>
    </div>
  );
}

function PlayerList({ players, showTopHighlight, app, navigate }: { players: DraftRecommendation[]; showTopHighlight: boolean; app?: any; navigate?: (data: any) => void }) {
  let lastTier = "";

  return (
    <div className="space-y-0.5">
      {players.map(function (p, i) {
        const tier = getTier(p.z_score);
        const showDivider = i > 0 && tier !== lastTier;
        lastTier = tier;
        const posDisplay = p.positions ? p.positions.join(", ") : (p.position || "?");
        const isTop = i === 0 && showTopHighlight;

        return (
          <div key={p.name}>
            {showDivider && (
              <div className="flex items-center gap-2 py-1">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] text-muted-foreground">{tier}</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            )}
            <div className={"flex items-center gap-2 py-1 px-1.5 rounded " + (isTop ? "bg-primary/10 border border-primary/30" : "")}>
              {p.mlb_id && <img src={mlbHeadshotUrl(p.mlb_id)} alt="" className="w-6 h-6 rounded-full bg-muted object-cover flex-shrink-0" />}
              <span className={"text-sm flex-1 truncate " + (isTop ? "font-semibold" : "font-medium")}><PlayerName name={p.name} mlbId={p.mlb_id} app={app} navigate={navigate} context="draft" /></span>
              {p.intel && <IntelBadge intel={p.intel} size="sm" />}
              <Badge variant="outline" className="text-[10px] shrink-0">{posDisplay}</Badge>
              <ZScoreBar z={p.z_score} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DraftRecommendView({ data, app, navigate }: { data: DraftRecommendData; app?: any; navigate?: (data: any) => void }) {
  const strategy = data.recommendation || data.strategy || "";
  const hitters = data.top_hitters || data.hitters || [];
  const pitchers = data.top_pitchers || data.pitchers || [];
  const hittersFirst = strategy.toLowerCase().includes("hitter");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Round {data.round} Recommendation</CardTitle>
            {data.top_pick && (
              <Badge className="bg-green-600 text-white">{data.top_pick.name}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{strategy}</p>
          {data.hitters_count != null && (
            <p className="text-xs text-muted-foreground mt-1">
              Roster: {data.hitters_count} hitters, {data.pitchers_count} pitchers
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
            Top Hitters
            {hittersFirst && <Badge variant="default" className="text-[10px]">Recommended</Badge>}
          </h3>
          <PlayerList players={hitters.slice(0, 8)} showTopHighlight={hittersFirst} app={app} navigate={navigate} />
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
            Top Pitchers
            {!hittersFirst && <Badge variant="default" className="text-[10px]">Recommended</Badge>}
          </h3>
          <PlayerList players={pitchers.slice(0, 8)} showTopHighlight={!hittersFirst} app={app} navigate={navigate} />
        </div>
      </div>
    </div>
  );
}

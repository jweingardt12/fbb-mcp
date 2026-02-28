import { useState } from "react";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useCallTool } from "../shared/use-call-tool";
import { mlbHeadshotUrl } from "../shared/mlb-images";
import { getTier, ZScoreBar } from "../shared/z-score";
import { IntelBadge } from "../shared/intel-badge";
import { PlayerName } from "../shared/player-name";
import { Loader2 } from "@/shared/icons";

interface BestAvailablePlayer {
  rank: number;
  name: string;
  position?: string;
  positions?: string[];
  z_score: number | null;
  mlb_id?: number;
  intel?: any;
}

interface BestAvailableData {
  pos_type: string;
  count?: number;
  players: BestAvailablePlayer[];
}

const POSITION_FILTERS = ["All", "C", "1B", "2B", "SS", "3B", "OF", "SP", "RP"];

export function BestAvailableView({ data, app, navigate }: { data: BestAvailableData; app?: any; navigate?: (data: any) => void }) {
  const { callTool, loading } = useCallTool(app);
  const [posFilter, setPosFilter] = useState("All");
  const label = data.pos_type === "P" ? "Pitchers" : "Hitters";

  const handleTypeChange = async function (value: string) {
    const result = await callTool("yahoo_best_available", { pos_type: value, count: 25 });
    if (result && result.structuredContent && navigate) {
      navigate(result.structuredContent);
    }
  };

  const filteredPlayers = posFilter === "All"
    ? (data.players || [])
    : (data.players || []).filter(function (p) {
        const positions = p.positions || (p.position ? p.position.split(",") : []);
        return positions.some(function (pos: string) { return pos.trim() === posFilter; });
      });

  let lastTier = "";

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-lg font-semibold">Best Available {label}</h2>
        <span className="text-xs text-muted-foreground">Top {data.count || filteredPlayers.length}</span>
      </div>

      {app && (
        <Tabs defaultValue={data.pos_type || "B"} onValueChange={handleTypeChange} className="mb-2">
          <TabsList>
            <TabsTrigger value="B">Hitters</TabsTrigger>
            <TabsTrigger value="P">Pitchers</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <div className="flex gap-1 flex-wrap mb-2">
        {POSITION_FILTERS.map(function (pos) {
          return (
            <Badge
              key={pos}
              variant={posFilter === pos ? "default" : "outline"}
              className="text-xs cursor-pointer"
              onClick={function () { setPosFilter(pos); }}
            >
              {pos}
            </Badge>
          );
        })}
      </div>

      <div className="relative">
        {loading && (
          <div className="loading-overlay">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        <div className="space-y-0.5">
          {filteredPlayers.map(function (p, i) {
            const tier = getTier(p.z_score);
            const showDivider = i > 0 && tier !== lastTier;
            lastTier = tier;
            const posDisplay = p.positions ? p.positions.join(", ") : (p.position || "?");

            return (
              <div key={p.rank}>
                {showDivider && (
                  <div className="flex items-center gap-2 py-1.5">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">{tier} Tier</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                )}
                <div className={"flex items-center gap-2 py-1.5 px-2 rounded " + (i === 0 ? "bg-primary/10 border border-primary/30" : i % 2 === 0 ? "bg-muted/30" : "")}>
                  <span className="font-mono text-xs text-muted-foreground w-6 text-right">{p.rank}</span>
                  {p.mlb_id && <img src={mlbHeadshotUrl(p.mlb_id)} alt="" className="w-6 h-6 rounded-full bg-muted object-cover flex-shrink-0" />}
                  <span className={"text-sm flex-1 truncate " + (i === 0 ? "font-semibold" : "font-medium")}><PlayerName name={p.name} mlbId={p.mlb_id} app={app} navigate={navigate} context="draft" showHeadshot={false} /></span>
                  {p.intel && <IntelBadge intel={p.intel} size="sm" />}
                  <Badge variant="outline" className="text-xs shrink-0">{posDisplay}</Badge>
                  <ZScoreBar z={p.z_score} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

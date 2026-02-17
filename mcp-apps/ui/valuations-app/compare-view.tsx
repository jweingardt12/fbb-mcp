import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";
import { ArrowRightLeft, TrendingUp, TrendingDown, Users, Loader2, Check } from "@/shared/icons";
import { useCallTool } from "../shared/use-call-tool";
import { ZScoreBadge, ZScoreExplainer } from "../shared/z-score";
import { IntelBadge } from "../shared/intel-badge";
import { PlayerName } from "../shared/player-name";
import { formatFixed, toFiniteNumber } from "../shared/number-format";

interface ComparePlayer {
  name: string;
  z_score: number;
  categories: Record<string, number>;
  intel?: any;
}

interface CompareData {
  player1: ComparePlayer;
  player2: ComparePlayer;
}

interface RosterPlayer {
  name: string;
  player_id?: string;
  position?: string;
  team?: string;
  mlb_id?: number;
}

function winnerBg(z: number): string {
  if (z >= 2.0) return "bg-sem-success-subtle";
  if (z >= 1.0) return "bg-sem-info-subtle";
  if (z >= 0) return "bg-sem-warning-subtle";
  return "bg-sem-risk-subtle";
}

function noop() {}

export function CompareView({ data, app, navigate }: { data: CompareData; app?: any; navigate?: (data: any) => void }) {
  const { callTool, loading } = useCallTool(app || null);
  const [rosterMode, setRosterMode] = useState(false);
  const [roster, setRoster] = useState<RosterPlayer[]>([]);
  const [selectedPlayer1, setSelectedPlayer1] = useState<string | null>(null);
  const [selectedPlayer2, setSelectedPlayer2] = useState<string | null>(null);
  const [rosterLoading, setRosterLoading] = useState(false);

  const nav = navigate || noop;

  const handleLoadRoster = async () => {
    setRosterMode(true);
    setRosterLoading(true);
    setSelectedPlayer1(null);
    setSelectedPlayer2(null);
    try {
      const result = await callTool("yahoo_roster", {});
      if (result && result.structuredContent) {
        var players = (result.structuredContent || {}).players || [];
        setRoster(players);
      }
    } catch (_) {
      // handled by useCallTool
    } finally {
      setRosterLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!selectedPlayer1 || !selectedPlayer2) return;
    var result = await callTool("yahoo_compare", { player1: selectedPlayer1, player2: selectedPlayer2 });
    if (result && result.structuredContent) {
      nav(result.structuredContent);
    }
  };

  const handleSelectPlayer = (name: string, slot: number) => {
    if (slot === 1) {
      setSelectedPlayer1(selectedPlayer1 === name ? null : name);
    } else {
      setSelectedPlayer2(selectedPlayer2 === name ? null : name);
    }
  };

  const allCats = Array.from(new Set([
    ...Object.keys(data.player1.categories || {}),
    ...Object.keys(data.player2.categories || {}),
  ]));

  const chartData = allCats.map((cat) => ({
    category: cat,
    [data.player1.name]: (data.player1.categories || {})[cat] || 0,
    [data.player2.name]: (data.player2.categories || {})[cat] || 0,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Player Comparison</h2>
        <ArrowRightLeft size={18} className="text-muted-foreground" />
      </div>

      {/* Compare from Roster button */}
      {app && (
        <Button variant="outline" onClick={handleLoadRoster} disabled={loading || rosterLoading}>
          {rosterLoading ? <Loader2 size={14} className="animate-spin" /> : <Users size={14} />}
          <span className="ml-1.5">Compare from Roster</span>
        </Button>
      )}

      {/* Roster selection mode */}
      {rosterMode && roster.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Select Two Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Player 1 selection */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Player 1</p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {roster.map((p) => {
                    var isSelected = selectedPlayer1 === p.name;
                    var isOther = selectedPlayer2 === p.name;
                    return (
                      <button
                        key={"p1-" + p.name}
                        onClick={() => handleSelectPlayer(p.name, 1)}
                        disabled={isOther}
                        className={"w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 " + (isSelected ? "bg-primary text-primary-foreground" : isOther ? "opacity-40 cursor-not-allowed" : "hover:bg-muted")}
                      >
                        {isSelected && <Check size={12} />}
                        <span className="font-medium">{p.name}</span>
                        {p.position && <Badge variant="outline" className="text-[10px] ml-auto">{p.position}</Badge>}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Player 2 selection */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Player 2</p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {roster.map((p) => {
                    var isSelected = selectedPlayer2 === p.name;
                    var isOther = selectedPlayer1 === p.name;
                    return (
                      <button
                        key={"p2-" + p.name}
                        onClick={() => handleSelectPlayer(p.name, 2)}
                        disabled={isOther}
                        className={"w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 " + (isSelected ? "bg-primary text-primary-foreground" : isOther ? "opacity-40 cursor-not-allowed" : "hover:bg-muted")}
                      >
                        {isSelected && <Check size={12} />}
                        <span className="font-medium">{p.name}</span>
                        {p.position && <Badge variant="outline" className="text-[10px] ml-auto">{p.position}</Badge>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-3">
              <Button variant="default" onClick={handleCompare} disabled={!selectedPlayer1 || !selectedPlayer2 || loading}>
                {loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRightLeft size={14} />}
                <span className="ml-1.5">Compare</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {rosterMode && rosterLoading && (
        <Card>
          <CardContent className="p-4 flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" />
            <span className="text-sm text-muted-foreground">Loading roster...</span>
          </CardContent>
        </Card>
      )}

      <ZScoreExplainer />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base break-words"><PlayerName name={data.player1.name} app={app} navigate={navigate} context="default" /></CardTitle>
              {data.player1.intel && <IntelBadge intel={data.player1.intel} size="sm" />}
            </div>
          </CardHeader>
          <CardContent>
            <ZScoreBadge z={data.player1.z_score} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base break-words"><PlayerName name={data.player2.name} app={app} navigate={navigate} context="default" /></CardTitle>
              {data.player2.intel && <IntelBadge intel={data.player2.intel} size="sm" />}
            </div>
          </CardHeader>
          <CardContent>
            <ZScoreBadge z={data.player2.z_score} />
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <div className="h-48 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis tick={{ fontSize: 9 }} />
              <Radar name={data.player1.name} dataKey={data.player1.name} stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.3} />
              <Radar name={data.player2.name} dataKey={data.player2.name} stroke="var(--color-destructive)" fill="var(--color-destructive)" fillOpacity={0.3} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mcp-app-scroll-x">
        <div className="grid grid-cols-[minmax(132px,1fr)_minmax(80px,0.8fr)_minmax(80px,0.8fr)] sm:grid-cols-3 gap-2">
          <div className="text-xs font-medium text-muted-foreground">Category</div>
          <div className="text-xs font-medium text-right truncate">{data.player1.name}</div>
          <div className="text-xs font-medium text-right truncate">{data.player2.name}</div>
          {allCats.map((cat) => {
            const v1 = toFiniteNumber((data.player1.categories || {})[cat], 0);
            const v2 = toFiniteNumber((data.player2.categories || {})[cat], 0);
            const p1Wins = v1 > v2;
            const p2Wins = v2 > v1;
            const rowBg = (p1Wins || p2Wins) ? winnerBg(p1Wins ? v1 : v2) : "";
            return (
              <div key={cat} className="contents">
                <div className={"text-sm rounded-l px-1 " + rowBg}>{cat}</div>
                <div className={"text-sm text-right font-mono flex items-center justify-end gap-1 px-1 " + rowBg + " " + (p1Wins ? "font-bold text-primary" : "")}>
                  {formatFixed(v1, 2, "0.00")}
                  {p1Wins && <TrendingUp size={12} className="text-primary" />}
                  {p2Wins && <TrendingDown size={12} className="text-muted-foreground" />}
                </div>
                <div className={"text-sm text-right font-mono flex items-center justify-end gap-1 rounded-r px-1 " + rowBg + " " + (p2Wins ? "font-bold text-primary" : "")}>
                  {formatFixed(v2, 2, "0.00")}
                  {p2Wins && <TrendingUp size={12} className="text-primary" />}
                  {p1Wins && <TrendingDown size={12} className="text-muted-foreground" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

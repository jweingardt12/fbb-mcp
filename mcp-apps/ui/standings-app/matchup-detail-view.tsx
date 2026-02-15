import * as React from "react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { ComparisonBar } from "../shared/comparison-bar";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface MatchupCategory {
  name: string;
  my_value: string;
  opp_value: string;
  result: "win" | "loss" | "tie";
}

interface MatchupDetailData {
  week: string | number;
  my_team: string;
  opponent: string;
  score: { wins: number; losses: number; ties: number };
  categories: MatchupCategory[];
}

const PIE_COLORS: Record<string, string> = { Wins: "#22c55e", Losses: "#ef4444", Ties: "#eab308" };

function getMatchupStatus(isWinning: boolean, isTied: boolean) {
  if (isWinning) return { bg: "bg-green-600", label: "Winning" };
  if (isTied) return { bg: "bg-yellow-500", label: "Tied" };
  return { bg: "bg-red-500", label: "Losing" };
}

function getSwingCategories(categories: MatchupCategory[]) {
  // Compute a closeness score for each category (lower = closer contest)
  const scored = categories.map((c) => {
    const myNum = parseFloat(c.my_value) || 0;
    const oppNum = parseFloat(c.opp_value) || 0;
    const diff = Math.abs(myNum - oppNum);
    const avg = (Math.abs(myNum) + Math.abs(oppNum)) / 2;
    // Ties get closeness 0 (most swing-able), otherwise use relative diff
    const closeness = c.result === "tie" ? 0 : (avg > 0 ? diff / avg : diff);
    return { ...c, closeness };
  });
  // Sort by closeness ascending (closest first), take top 3
  return scored.sort((a, b) => a.closeness - b.closeness).slice(0, 3);
}

function SwingIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3v3a2 2 0 0 1-2 2H3" />
      <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
      <path d="M3 16h3a2 2 0 0 1 2 2v3" />
      <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

function CategoryList({ categories, keyPrefix }: { categories: MatchupCategory[]; keyPrefix?: string }) {
  const prefix = keyPrefix || "";
  return (
    <div className="space-y-3">
      {categories.map((cat, i) => (
        <ComparisonBar
          key={prefix + i + "-" + cat.name}
          label={cat.name}
          leftValue={cat.my_value}
          rightValue={cat.opp_value}
          result={cat.result}
        />
      ))}
    </div>
  );
}

export function MatchupDetailView({ data }: { data: MatchupDetailData }) {
  const [activeTab, setActiveTab] = React.useState("all");

  const score = data.score || { wins: 0, losses: 0, ties: 0 };
  const total = score.wins + score.losses + score.ties;
  const isWinning = score.wins > score.losses;
  const isTied = score.wins === score.losses;
  const status = getMatchupStatus(isWinning, isTied);

  const pieData = [
    { name: "Wins", value: score.wins },
    { name: "Losses", value: score.losses },
    { name: "Ties", value: score.ties },
  ].filter((d) => d.value > 0);

  const allCategories = data.categories || [];
  const battingCategories = allCategories.slice(0, 10);
  const pitchingCategories = allCategories.slice(10, 20);

  // Find close categories (at-risk)
  const closeCategories = allCategories.filter((c) => {
    const diff = Math.abs(parseFloat(c.my_value) - parseFloat(c.opp_value));
    const avg = (Math.abs(parseFloat(c.my_value)) + Math.abs(parseFloat(c.opp_value))) / 2;
    return avg > 0 && diff / avg < 0.15;
  });

  const strongWins = allCategories.filter((c) => c.result === "win");

  // Swing categories: the 2-3 closest categories
  const swingCategories = getSwingCategories(allCategories);

  // Compute sub-scores for batting/pitching
  const battingWins = battingCategories.filter((c) => c.result === "win").length;
  const battingLosses = battingCategories.filter((c) => c.result === "loss").length;
  const pitchingWins = pitchingCategories.filter((c) => c.result === "win").length;
  const pitchingLosses = pitchingCategories.filter((c) => c.result === "loss").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Week {data.week} Matchup</h2>
        <Badge className={"text-sm px-3 py-1 " + status.bg + " text-white"}>
          {status.label} {score.wins}-{score.losses}{score.ties > 0 ? "-" + score.ties : ""}
        </Badge>
      </div>

      {/* Score Ring + Teams */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <p className="font-semibold text-sm truncate">{data.my_team}</p>
              <p className="text-2xl font-bold font-mono text-green-600 dark:text-green-400">{score.wins}</p>
            </div>
            {total > 0 && (
              <div className="w-24 h-24 mx-2 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={25} outerRadius={40} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={PIE_COLORS[entry.name] || "#64748b"} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="flex-1 text-center">
              <p className="font-semibold text-sm truncate">{data.opponent}</p>
              <p className="text-2xl font-bold font-mono text-red-500">{score.losses}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Swing Categories Callout */}
      {swingCategories.length > 0 && (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <SwingIcon />
              <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">Swing Categories</span>
              <span className="text-[10px] text-muted-foreground ml-1">Closest margins - could flip</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {swingCategories.map((c, i) => {
                const resultColor = c.result === "win"
                  ? "bg-green-600/15 text-green-700 dark:text-green-400 border-green-500/30"
                  : c.result === "loss"
                    ? "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"
                    : "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30";
                return (
                  <div key={i + "-" + c.name} className={"flex items-center gap-1.5 rounded-md border px-2 py-1 " + resultColor}>
                    <span className="text-xs font-medium">{c.name}</span>
                    <span className="text-[10px] font-mono opacity-75">{c.my_value + " v " + c.opp_value}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Comparison Bars with Tabs */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Category Breakdown</h3>
              <TabsList className="h-7">
                <TabsTrigger value="all" className="text-xs px-2 py-0.5">All</TabsTrigger>
                <TabsTrigger value="batting" className="text-xs px-2 py-0.5">Batting</TabsTrigger>
                <TabsTrigger value="pitching" className="text-xs px-2 py-0.5">Pitching</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all">
              <CategoryList categories={allCategories} />
            </TabsContent>

            <TabsContent value="batting">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-muted-foreground">Batting:</span>
                <Badge className={"text-[10px] " + (battingWins > battingLosses ? "bg-green-600" : battingWins < battingLosses ? "bg-red-500" : "bg-yellow-500") + " text-white"}>
                  {battingWins + "-" + battingLosses}
                </Badge>
              </div>
              <CategoryList categories={battingCategories} />
            </TabsContent>

            <TabsContent value="pitching">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-muted-foreground">Pitching:</span>
                <Badge className={"text-[10px] " + (pitchingWins > pitchingLosses ? "bg-green-600" : pitchingWins < pitchingLosses ? "bg-red-500" : "bg-yellow-500") + " text-white"}>
                  {pitchingWins + "-" + pitchingLosses}
                </Badge>
              </div>
              <CategoryList categories={pitchingCategories} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Summary Badges */}
      <div className="flex gap-3 flex-wrap">
        {strongWins.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground">Strongest:</span>
            {strongWins.slice(0, 3).map((c, i) => (
              <Badge key={i + "-" + c.name} className="bg-green-600 text-white text-[10px]">{c.name}</Badge>
            ))}
          </div>
        )}
        {closeCategories.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground">At risk:</span>
            {closeCategories.slice(0, 3).map((c, i) => (
              <Badge key={i + "-" + c.name} variant="outline" className="text-[10px] border-yellow-500 text-yellow-600 dark:text-yellow-400">{c.name}</Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BarChart3 } from "@/shared/icons";
import { ZScoreBadge, ZScoreExplainer, tierTextColor } from "../shared/z-score";
import { IntelBadge } from "../shared/intel-badge";
import { IntelPanel } from "../shared/intel-panel";
import { PlayerName } from "../shared/player-name";
import { formatFixed, toFiniteNumber } from "../shared/number-format";

interface ValueCategory {
  category: string;
  z_score: number;
  raw_stat: number | null;
}

interface ValueData {
  name: string;
  team?: string;
  pos?: string;
  player_type?: string;
  z_final: number;
  categories: ValueCategory[];
  intel?: any;
}

function formatRawStat(val: number | null): string {
  if (val == null) return "-";
  if (val >= 0 && val < 1 && val !== 0) return formatFixed(val, 3, "0.000").replace(/^0/, "");
  return String(val);
}

export function ValueView({ data, app, navigate }: { data: ValueData; app?: any; navigate?: (data: any) => void }) {
  const chartData = (data.categories || []).map(function (c) {
    return { name: c.category, z_score: c.z_score };
  });

  const details: string[] = [];
  if (data.team) details.push(data.team);
  if (data.pos) details.push(data.pos);

  return (
    <div className="space-y-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <BarChart3 size={18} />
            <CardTitle><PlayerName name={data.name} app={app} navigate={navigate} context="default" /></CardTitle>
            {details.length > 0 && (
              <Badge variant="outline" className="text-xs">{details.join(" - ")}</Badge>
            )}
            <ZScoreBadge z={data.z_final} />
            {data.intel && <IntelBadge intel={data.intel} size="md" />}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ZScoreExplainer />
          {data.intel && <IntelPanel intel={data.intel} />}
        </CardContent>
      </Card>

      {chartData.length > 0 && (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-35} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "6px", fontSize: "12px" }} />
              <Bar dataKey="z_score" radius={[3, 3, 0, 0]}>
                {chartData.map(function (entry, i) {
                  return <Cell key={i} fill={entry.z_score >= 0 ? "var(--color-primary)" : "var(--color-destructive)"} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {(data.categories || []).map(function (c) {
          return (
            <div key={c.category} className="flex items-center justify-between rounded-md border p-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{c.category}</span>
                {c.raw_stat != null && (
                  <span className="font-mono text-xs text-muted-foreground">{formatRawStat(c.raw_stat)}</span>
                )}
              </div>
              <span className={"font-mono text-sm font-medium " + tierTextColor(c.z_score)}>
                {c.z_score >= 0 ? "+" : ""}{formatFixed(toFiniteNumber(c.z_score, 0), 2, "0.00")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

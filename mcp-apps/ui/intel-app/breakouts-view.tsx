import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useCallTool } from "../shared/use-call-tool";
import { TrendingUp, TrendingDown, Loader2 } from "@/shared/icons";
import { formatFixed } from "../shared/number-format";

interface Candidate {
  name: string;
  woba: number;
  xwoba: number;
  diff: number;
  pa: number;
}

interface BreakoutsData {
  type: string;
  pos_type: string;
  candidates: Candidate[];
}

export function BreakoutsView({ data, app, navigate }: { data: BreakoutsData; app: any; navigate: (data: any) => void }) {
  const { callTool, loading } = useCallTool(app);
  const isBreakouts = data.type === "intel-breakouts";
  const title = isBreakouts ? "Breakout Candidates" : "Bust Candidates";
  const subtitle = isBreakouts
    ? "Players whose expected stats exceed actual — due for positive regression"
    : "Players whose actual stats exceed expected — due for negative regression";
  const Icon = isBreakouts ? TrendingUp : TrendingDown;

  const handleTabChange = async function(value: string) {
    const tool = isBreakouts ? "fantasy_breakout_candidates" : "fantasy_bust_candidates";
    const result = await callTool(tool, { pos_type: value, count: 15 });
    if (result) navigate(result.structuredContent);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Icon size={18} />
          {title} - {data.pos_type === "P" ? "Pitchers" : "Hitters"}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </div>

      <Tabs defaultValue={data.pos_type || "B"} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="B">Hitters</TabsTrigger>
          <TabsTrigger value="P">Pitchers</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative">
        {loading && (
          <div className="loading-overlay">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead className="text-right">wOBA</TableHead>
              <TableHead className="text-right">xwOBA</TableHead>
              <TableHead className="text-right">Diff</TableHead>
              <TableHead className="text-right">PA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data.candidates || []).map(function(c, i) {
              const diffColor = isBreakouts ? "text-green-600 dark:text-green-400" : "text-red-500";
              return (
                <TableRow key={c.name + "-" + i} className={i < 3 ? (isBreakouts ? "bg-green-500/5" : "bg-red-500/5") : ""}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatFixed(c.woba, 3, "0.000")}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatFixed(c.xwoba, 3, "0.000")}</TableCell>
                  <TableCell className={"text-right font-mono text-xs font-semibold " + diffColor}>
                    {(isBreakouts ? "+" : "") + formatFixed(c.diff, 3, "0.000")}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">{c.pa}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        {isBreakouts
          ? "Higher diff = more unlucky. These players are performing below their expected stats and should improve."
          : "Higher diff = more lucky. These players are performing above their expected stats and may regress."}
      </p>
    </div>
  );
}

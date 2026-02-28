import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useCallTool } from "../shared/use-call-tool";
import { ChevronLeft, ChevronRight, Loader2, ArrowRightLeft } from "@/shared/icons";

interface PastTrade {
  team1: string;
  team2: string;
  players1: string[];
  players2: string[];
}

interface PastTradesData {
  year: number;
  trades: PastTrade[];
}

export function PastTradesView({ data, app, navigate }: { data: PastTradesData; app: any; navigate: (data: any) => void }) {
  const { callTool, loading } = useCallTool(app);

  const changeYear = async (year: number) => {
    const result = await callTool("yahoo_past_trades", { year });
    if (result) {
      navigate(result.structuredContent);
    }
  };

  return (
    <div className="space-y-2 animate-fade-in">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" disabled={data.year <= 2011 || loading} onClick={() => changeYear(data.year - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">Trades - {data.year}</h2>
        <Button variant="outline" size="sm" disabled={data.year >= 2026 || loading} onClick={() => changeYear(data.year + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative">
        {loading && (
          <div className="loading-overlay">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {(data.trades || []).length === 0 ? (
          <p className="text-muted-foreground">No trades for this season.</p>
        ) : (
          (data.trades || []).map((t, i) => (
            <Card key={i} className="mb-4 last:mb-0">
              <CardContent className="p-3">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-start">
                  <div>
                    <p className="text-sm font-medium mb-1">{t.team1} sends:</p>
                    {(t.players1 || []).map((p) => (
                      <Badge key={p} variant="outline" className="text-xs mr-1 mb-1">{p}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowRightLeft size={16} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">{t.team2} sends:</p>
                    {(t.players2 || []).map((p) => (
                      <Badge key={p} variant="outline" className="text-xs mr-1 mb-1">{p}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

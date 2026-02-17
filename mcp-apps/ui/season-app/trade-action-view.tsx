import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useCallTool } from "../shared/use-call-tool";
import { CheckCircle, XCircle, ArrowLeft, Loader2 } from "@/shared/icons";

interface TradeActionData {
  type: string;
  success: boolean;
  message: string;
  transaction_key?: string;
}

export function TradeActionView({ data, app, navigate }: { data: TradeActionData; app: any; navigate: (data: any) => void }) {
  const { callTool, loading } = useCallTool(app);

  const labels: Record<string, string> = {
    "propose-trade": "Trade Proposed",
    "accept-trade": "Trade Accepted",
    "reject-trade": "Trade Rejected",
  };
  const title = labels[data.type] || "Trade Action";

  const handleViewTrades = async () => {
    const result = await callTool("yahoo_pending_trades", {});
    if (result && result.structuredContent) {
      navigate(result.structuredContent);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-4 animate-fade-in">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>{title}</CardTitle>
          {data.success
            ? <CheckCircle size={20} className="text-green-500" />
            : <XCircle size={20} className="text-destructive" />
          }
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{data.message}</p>
        {data.transaction_key && (
          <p className="text-xs text-muted-foreground mt-2">{"Transaction: " + data.transaction_key}</p>
        )}
        <div className="mt-4 flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleViewTrades}>
            <ArrowLeft size={14} className="mr-1" />
            View Pending Trades
          </Button>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </CardContent>
    </Card>
  );
}

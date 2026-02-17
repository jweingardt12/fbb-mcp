import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useCallTool } from "../shared/use-call-tool";
import { CheckCircle, XCircle, ArrowLeft, Loader2 } from "@/shared/icons";

interface ActionData {
  type: string;
  success: boolean;
  message: string;
  player_id?: string;
  add_id?: string;
  drop_id?: string;
}

export function ActionView({ data, app, navigate }: { data: ActionData; app: any; navigate: (data: any) => void }) {
  const { callTool, loading } = useCallTool(app);
  const labels: Record<string, string> = { add: "Player Added", drop: "Player Dropped", swap: "Player Swap" };
  const title = labels[data.type] || "Roster Action";

  const handleBackToRoster = async () => {
    const result = await callTool("yahoo_roster", {});
    if (result) {
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
        {data.player_id && <p className="text-xs text-muted-foreground mt-2">{"Player ID: " + data.player_id}</p>}
        {data.add_id && <p className="text-xs text-muted-foreground mt-1">{"Added ID: " + data.add_id}</p>}
        {data.drop_id && <p className="text-xs text-muted-foreground mt-1">{"Dropped ID: " + data.drop_id}</p>}
        <div className="mt-4 flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleBackToRoster}>
            <ArrowLeft size={14} className="mr-1" />
            Back to Roster
          </Button>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </CardContent>
    </Card>
  );
}

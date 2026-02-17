import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useCallTool } from "../shared/use-call-tool";
import { CheckCircle, XCircle, ArrowLeft, Loader2 } from "@/shared/icons";

interface SetLineupMove {
  player_id: string;
  position: string;
  success: boolean;
  error?: string;
}

interface SetLineupData {
  success: boolean;
  moves: SetLineupMove[];
  message: string;
}

export function SetLineupView({ data, app, navigate }: { data: SetLineupData; app: any; navigate: (data: any) => void }) {
  const { callTool, loading } = useCallTool(app);

  const handleViewRoster = async () => {
    const result = await callTool("yahoo_roster", {});
    if (result && result.structuredContent) {
      navigate(result.structuredContent);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-4 animate-fade-in">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Set Lineup</CardTitle>
          {data.success
            ? <CheckCircle size={20} className="text-green-500" />
            : <XCircle size={20} className="text-destructive" />
          }
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {(data.moves || []).map((m, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            {m.success
              ? <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
              : <XCircle size={14} className="text-destructive flex-shrink-0" />
            }
            <span>
              {m.success
                ? "Moved " + m.player_id + " to " + m.position
                : "Error: " + (m.error || "Failed to move " + m.player_id)
              }
            </span>
          </div>
        ))}
        {data.message && <p className="text-xs text-muted-foreground">{data.message}</p>}
        <div className="flex items-center gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={handleViewRoster}>
            <ArrowLeft size={14} className="mr-1" />
            View Roster
          </Button>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </CardContent>
    </Card>
  );
}

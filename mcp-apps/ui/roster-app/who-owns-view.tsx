import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useCallTool } from "../shared/use-call-tool";
import { Search, Loader2 } from "@/shared/icons";

interface WhoOwnsData {
  player_key: string;
  ownership_type: string;
  owner: string;
}

function ownershipBadge(type: string) {
  if (type === "team") return <Badge className="text-xs">Owned</Badge>;
  if (type === "freeagents") return <Badge className="text-xs bg-green-600 text-white">Free Agent</Badge>;
  if (type === "waivers") return <Badge className="text-xs bg-yellow-600 text-white">Waivers</Badge>;
  return <Badge variant="secondary" className="text-xs">{type}</Badge>;
}

export function WhoOwnsView({ data, app, navigate }: { data: WhoOwnsData; app: any; navigate: (data: any) => void }) {
  const { callTool, loading } = useCallTool(app);

  const handleSearch = async () => {
    const result = await callTool("yahoo_free_agents", { pos_type: "B" });
    if (result && result.structuredContent) {
      navigate(result.structuredContent);
    }
  };

  return (
    <Card className="w-full mt-2 animate-slide-up">
      <CardHeader>
        <CardTitle>Player Ownership</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          {ownershipBadge(data.ownership_type)}
          {data.ownership_type === "team" && data.owner && (
            <span className="text-sm font-medium">{data.owner}</span>
          )}
        </div>
        <div className="pt-2 flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSearch}>
            <Search size={14} className="mr-1" />
            Search Players
          </Button>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </CardContent>
    </Card>
  );
}

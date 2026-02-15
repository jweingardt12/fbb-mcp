import { Badge } from "../components/ui/badge";
import { useCallTool } from "../shared/use-call-tool";
import { Loader2, MessageSquare, ArrowUp } from "lucide-react";
import { Button } from "../components/ui/button";

interface RedditPost {
  title: string;
  score: number;
  num_comments: number;
  url?: string;
  flair?: string;
  category?: string;
}

interface RedditData {
  type: string;
  posts: RedditPost[];
}

function flairColor(flair: string | undefined): string {
  if (!flair) return "bg-muted text-muted-foreground";
  const f = flair.toLowerCase();
  if (f.indexOf("hype") >= 0 || f.indexOf("breakout") >= 0) return "bg-green-500/20 text-green-700 dark:text-green-400";
  if (f.indexOf("injury") >= 0) return "bg-red-500/20 text-red-700 dark:text-red-400";
  if (f.indexOf("waiver") >= 0 || f.indexOf("pickup") >= 0) return "bg-blue-500/20 text-blue-700 dark:text-blue-400";
  if (f.indexOf("trade") >= 0) return "bg-purple-500/20 text-purple-700 dark:text-purple-400";
  if (f.indexOf("prospect") >= 0) return "bg-orange-500/20 text-orange-700 dark:text-orange-400";
  return "bg-muted text-muted-foreground";
}

export function RedditView({ data, app, navigate }: { data: RedditData; app: any; navigate: (data: any) => void }) {
  const { callTool, loading } = useCallTool(app);
  const isTrending = data.type === "intel-trending";
  const title = isTrending ? "Trending Players" : "Reddit Fantasy Baseball Buzz";

  const handleRefreshBuzz = async function() {
    const result = await callTool("fantasy_reddit_buzz", {});
    if (result) navigate(result.structuredContent);
  };

  const handleRefreshTrending = async function() {
    const result = await callTool("fantasy_trending_players", {});
    if (result) navigate(result.structuredContent);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleRefreshBuzz} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buzz"}
          </Button>
          <Button size="sm" variant="outline" onClick={handleRefreshTrending} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Trending"}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {(data.posts || []).length === 0 && (
          <p className="text-sm text-muted-foreground">No posts found.</p>
        )}
        {(data.posts || []).map(function(post, i) {
          return (
            <div key={i} className="rounded-lg border p-3 space-y-1.5 hover:bg-muted/30 transition-colors">
              <div className="flex items-start gap-2">
                {post.flair && (
                  <Badge variant="secondary" className={"text-[10px] shrink-0 " + flairColor(post.flair)}>{post.flair}</Badge>
                )}
                <p className="text-sm font-medium leading-tight">{post.title}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <ArrowUp size={12} />
                  {post.score}
                </span>
                <span className="flex items-center gap-0.5">
                  <MessageSquare size={12} />
                  {post.num_comments}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

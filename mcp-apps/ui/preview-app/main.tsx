import React, { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } from "react";
import { fetchViewData, createLiveApp } from "./live-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Lazy-load all view components
// Standings
const StandingsView = lazy(() => import("../standings-app/standings-view").then(m => ({ default: m.StandingsView })));
const MatchupsView = lazy(() => import("../standings-app/matchups-view").then(m => ({ default: m.MatchupsView })));
const MatchupDetailView = lazy(() => import("../standings-app/matchup-detail-view").then(m => ({ default: m.MatchupDetailView })));
const TransactionsView = lazy(() => import("../standings-app/transactions-view").then(m => ({ default: m.TransactionsView })));
const InfoView = lazy(() => import("../standings-app/info-view").then(m => ({ default: m.InfoView })));
const StatCategoriesView = lazy(() => import("../standings-app/stat-categories-view").then(m => ({ default: m.StatCategoriesView })));
const TransactionTrendsView = lazy(() => import("../standings-app/transaction-trends-view").then(m => ({ default: m.TransactionTrendsView })));
const LeaguePulseView = lazy(() => import("../standings-app/league-pulse-view").then(m => ({ default: m.LeaguePulseView })));
const PowerRankingsView = lazy(() => import("../standings-app/power-rankings-view").then(m => ({ default: m.PowerRankingsView })));
const SeasonPaceView = lazy(() => import("../standings-app/season-pace-view").then(m => ({ default: m.SeasonPaceView })));
// Season
const CategoryCheckView = lazy(() => import("../season-app/category-check-view").then(m => ({ default: m.CategoryCheckView })));
const InjuryReportView = lazy(() => import("../season-app/injury-report-view").then(m => ({ default: m.InjuryReportView })));
const WaiverAnalyzeView = lazy(() => import("../season-app/waiver-analyze-view").then(m => ({ default: m.WaiverAnalyzeView })));
const TradeEvalView = lazy(() => import("../season-app/trade-eval-view").then(m => ({ default: m.TradeEvalView })));
const LineupOptimizeView = lazy(() => import("../season-app/lineup-optimize-view").then(m => ({ default: m.LineupOptimizeView })));
const StreamingView = lazy(() => import("../season-app/streaming-view").then(m => ({ default: m.StreamingView })));
const DailyUpdateView = lazy(() => import("../season-app/daily-update-view").then(m => ({ default: m.DailyUpdateView })));
const TradeBuilderView = lazy(() => import("../season-app/trade-builder-view").then(m => ({ default: m.TradeBuilderView })));
const SimulateView = lazy(() => import("../season-app/simulate-view").then(m => ({ default: m.SimulateView })));
const ScoutView = lazy(() => import("../season-app/scout-view").then(m => ({ default: m.ScoutView })));
const MatchupStrategyView = lazy(() => import("../season-app/matchup-strategy-view").then(m => ({ default: m.MatchupStrategyView })));
const SetLineupView = lazy(() => import("../season-app/set-lineup-view").then(m => ({ default: m.SetLineupView })));
const PendingTradesView = lazy(() => import("../season-app/pending-trades-view").then(m => ({ default: m.PendingTradesView })));
const TradeActionView = lazy(() => import("../season-app/trade-action-view").then(m => ({ default: m.TradeActionView })));
const WhatsNewView = lazy(() => import("../season-app/whats-new-view").then(m => ({ default: m.WhatsNewView })));
const TradeFinderView = lazy(() => import("../season-app/trade-finder-view").then(m => ({ default: m.TradeFinderView })));
const WeekPlannerView = lazy(() => import("../season-app/week-planner-view").then(m => ({ default: m.WeekPlannerView })));
const CloserMonitorView = lazy(() => import("../season-app/closer-monitor-view").then(m => ({ default: m.CloserMonitorView })));
const PitcherMatchupView = lazy(() => import("../season-app/pitcher-matchup-view").then(m => ({ default: m.PitcherMatchupView })));
// Draft
const DraftStatusView = lazy(() => import("../draft-app/draft-status-view").then(m => ({ default: m.DraftStatusView })));
const DraftRecommendView = lazy(() => import("../draft-app/draft-recommend-view").then(m => ({ default: m.DraftRecommendView })));
const CheatsheetView = lazy(() => import("../draft-app/cheatsheet-view").then(m => ({ default: m.CheatsheetView })));
const BestAvailableView = lazy(() => import("../draft-app/best-available-view").then(m => ({ default: m.BestAvailableView })));
// Roster
const RosterView = lazy(() => import("../roster-app/roster-view").then(m => ({ default: m.RosterView })));
const FreeAgentsView = lazy(() => import("../roster-app/free-agents-view").then(m => ({ default: m.FreeAgentsView })));
const ActionView = lazy(() => import("../roster-app/action-view").then(m => ({ default: m.ActionView })));
const WhoOwnsView = lazy(() => import("../roster-app/who-owns-view").then(m => ({ default: m.WhoOwnsView })));
// Valuations
const RankingsView = lazy(() => import("../valuations-app/rankings-view").then(m => ({ default: m.RankingsView })));
const CompareView = lazy(() => import("../valuations-app/compare-view").then(m => ({ default: m.CompareView })));
const ValueView = lazy(() => import("../valuations-app/value-view").then(m => ({ default: m.ValueView })));
// MLB
const MlbTeamsView = lazy(() => import("../mlb-app/teams-view").then(m => ({ default: m.TeamsView })));
const MlbRosterView = lazy(() => import("../mlb-app/roster-view").then(m => ({ default: m.RosterView })));
const MlbPlayerView = lazy(() => import("../mlb-app/player-view").then(m => ({ default: m.PlayerView })));
const MlbStatsView = lazy(() => import("../mlb-app/stats-view").then(m => ({ default: m.StatsView })));
const MlbInjuriesView = lazy(() => import("../mlb-app/injuries-view").then(m => ({ default: m.InjuriesView })));
const MlbStandingsView = lazy(() => import("../mlb-app/standings-view").then(m => ({ default: m.StandingsView })));
const MlbScheduleView = lazy(() => import("../mlb-app/schedule-view").then(m => ({ default: m.ScheduleView })));
// History
const LeagueHistoryView = lazy(() => import("../history-app/league-history-view").then(m => ({ default: m.LeagueHistoryView })));
const RecordBookView = lazy(() => import("../history-app/record-book-view").then(m => ({ default: m.RecordBookView })));
const PastStandingsView = lazy(() => import("../history-app/past-standings-view").then(m => ({ default: m.PastStandingsView })));
const PastDraftView = lazy(() => import("../history-app/past-draft-view").then(m => ({ default: m.PastDraftView })));
const PastTeamsView = lazy(() => import("../history-app/past-teams-view").then(m => ({ default: m.PastTeamsView })));
const PastTradesView = lazy(() => import("../history-app/past-trades-view").then(m => ({ default: m.PastTradesView })));
const PastMatchupView = lazy(() => import("../history-app/past-matchup-view").then(m => ({ default: m.PastMatchupView })));
// Intel
const PlayerReportView = lazy(() => import("../intel-app/player-report-view").then(m => ({ default: m.PlayerReportView })));
const BreakoutsView = lazy(() => import("../intel-app/breakouts-view").then(m => ({ default: m.BreakoutsView })));
const RedditView = lazy(() => import("../intel-app/reddit-view").then(m => ({ default: m.RedditView })));
const ProspectsView = lazy(() => import("../intel-app/prospects-view").then(m => ({ default: m.ProspectsView })));
const IntelTransactionsView = lazy(() => import("../intel-app/transactions-view").then(m => ({ default: m.TransactionsView })));

import "../globals.css";

interface ViewDef {
  id: string;
  label: string;
  component: any;
  props?: Record<string, any>;
}

interface ViewGroup {
  name: string;
  views: ViewDef[];
}

function noop() {}

const VIEW_GROUPS: ViewGroup[] = [
  {
    name: "Standings",
    views: [
      { id: "standings", label: "Standings", component: StandingsView },
      { id: "matchups", label: "Matchups", component: MatchupsView },
      { id: "matchup-detail", label: "My Matchup", component: MatchupDetailView },
      { id: "scoreboard", label: "Scoreboard", component: MatchupsView },
      { id: "info", label: "Info", component: InfoView },
      { id: "stat-categories", label: "Stat Categories", component: StatCategoriesView },
      { id: "transactions", label: "Transactions", component: TransactionsView },
      { id: "transaction-trends", label: "Transaction Trends", component: TransactionTrendsView },
      { id: "league-pulse", label: "League Pulse", component: LeaguePulseView },
      { id: "power-rankings", label: "Power Rankings", component: PowerRankingsView },
      { id: "season-pace", label: "Season Pace", component: SeasonPaceView },
    ],
  },
  {
    name: "Season",
    views: [
      { id: "category-check", label: "Category Check", component: CategoryCheckView },
      { id: "injury-report", label: "Injury Report", component: InjuryReportView, props: { app: null, navigate: noop } },
      { id: "waiver-analyze", label: "Waiver Analysis", component: WaiverAnalyzeView, props: { app: null, navigate: noop } },
      { id: "trade-eval", label: "Trade Eval", component: TradeEvalView, props: { app: null, navigate: noop } },
      { id: "lineup-optimize", label: "Lineup Optimize", component: LineupOptimizeView, props: { app: null, navigate: noop } },
      { id: "streaming", label: "Streaming", component: StreamingView, props: { app: null, navigate: noop } },
      { id: "daily-update", label: "Daily Update", component: DailyUpdateView, props: { app: null, navigate: noop } },
      { id: "trade-builder", label: "Trade Builder", component: TradeBuilderView, props: { app: null, navigate: noop } },
      { id: "category-simulate", label: "Category Simulate", component: SimulateView, props: { app: null, navigate: noop } },
      { id: "scout-opponent", label: "Scout Opponent", component: ScoutView, props: { app: null, navigate: noop } },
      { id: "matchup-strategy", label: "Matchup Strategy", component: MatchupStrategyView, props: { app: null, navigate: noop } },
      { id: "set-lineup", label: "Set Lineup", component: SetLineupView, props: { app: null, navigate: noop } },
      { id: "pending-trades", label: "Pending Trades", component: PendingTradesView, props: { app: null, navigate: noop } },
      { id: "trade-action", label: "Trade Action", component: TradeActionView, props: { app: null, navigate: noop } },
      { id: "whats-new", label: "What's New", component: WhatsNewView, props: { app: null, navigate: noop } },
      { id: "trade-finder", label: "Trade Finder", component: TradeFinderView, props: { app: null, navigate: noop } },
      { id: "week-planner", label: "Week Planner", component: WeekPlannerView },
      { id: "closer-monitor", label: "Closer Monitor", component: CloserMonitorView, props: { app: null, navigate: noop } },
      { id: "pitcher-matchup", label: "Pitcher Matchup", component: PitcherMatchupView },
    ],
  },
  {
    name: "Draft",
    views: [
      { id: "draft-status", label: "Draft Status", component: DraftStatusView },
      { id: "draft-recommend", label: "Recommendation", component: DraftRecommendView, props: { app: null, navigate: noop } },
      { id: "best-available", label: "Best Available", component: BestAvailableView, props: { app: null, navigate: noop } },
      { id: "draft-cheatsheet", label: "Cheat Sheet", component: CheatsheetView, props: { app: null, navigate: noop } },
    ],
  },
  {
    name: "Roster",
    views: [
      { id: "roster", label: "My Roster", component: RosterView, props: { app: null, navigate: noop } },
      { id: "free-agents", label: "Free Agents", component: FreeAgentsView, props: { app: null, navigate: noop } },
      { id: "action-add", label: "Action Result", component: ActionView, props: { app: null, navigate: noop } },
      { id: "who-owns", label: "Who Owns", component: WhoOwnsView, props: { app: null, navigate: noop } },
    ],
  },
  {
    name: "Valuations",
    views: [
      { id: "rankings", label: "Rankings", component: RankingsView, props: { app: null, navigate: noop } },
      { id: "compare", label: "Compare", component: CompareView, props: { app: null, navigate: noop } },
      { id: "value", label: "Value", component: ValueView, props: { app: null, navigate: noop } },
    ],
  },
  {
    name: "MLB",
    views: [
      { id: "mlb-teams", label: "Teams", component: MlbTeamsView },
      { id: "mlb-roster", label: "Roster", component: MlbRosterView, props: { app: null, navigate: noop } },
      { id: "mlb-player", label: "Player", component: MlbPlayerView, props: { app: null, navigate: noop } },
      { id: "mlb-stats", label: "Stats", component: MlbStatsView },
      { id: "mlb-injuries", label: "Injuries", component: MlbInjuriesView },
      { id: "mlb-standings", label: "Standings", component: MlbStandingsView },
      { id: "mlb-schedule", label: "Schedule", component: MlbScheduleView },
    ],
  },
  {
    name: "History",
    views: [
      { id: "league-history", label: "League History", component: LeagueHistoryView },
      { id: "record-book", label: "Record Book", component: RecordBookView },
      { id: "past-standings", label: "Past Standings", component: PastStandingsView, props: { app: null, navigate: noop } },
      { id: "past-draft", label: "Past Draft", component: PastDraftView, props: { app: null, navigate: noop } },
      { id: "past-teams", label: "Past Teams", component: PastTeamsView, props: { app: null, navigate: noop } },
      { id: "past-trades", label: "Past Trades", component: PastTradesView, props: { app: null, navigate: noop } },
      { id: "past-matchup", label: "Past Matchup", component: PastMatchupView, props: { app: null, navigate: noop } },
    ],
  },
  {
    name: "Intel",
    views: [
      { id: "intel-player", label: "Player Report", component: PlayerReportView, props: { app: null, navigate: noop } },
      { id: "intel-breakouts", label: "Breakouts", component: BreakoutsView, props: { app: null, navigate: noop } },
      { id: "intel-busts", label: "Busts", component: BreakoutsView, props: { app: null, navigate: noop } },
      { id: "intel-reddit", label: "Reddit Buzz", component: RedditView, props: { app: null, navigate: noop } },
      { id: "intel-trending", label: "Trending", component: RedditView, props: { app: null, navigate: noop } },
      { id: "intel-prospects", label: "Prospects", component: ProspectsView, props: { app: null, navigate: noop } },
      { id: "intel-transactions", label: "Transactions", component: IntelTransactionsView, props: { app: null, navigate: noop } },
    ],
  },
];

// Error boundary to catch view crashes
class ViewErrorBoundary extends React.Component<
  { viewId: string; children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidUpdate(prev: { viewId: string }) {
    if (prev.viewId !== this.props.viewId) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <div className="text-destructive text-base font-semibold mb-2">View crashed</div>
          <p className="text-muted-foreground text-sm mb-1">{this.state.error.message}</p>
          <pre className="text-xs text-muted-foreground bg-muted rounded p-3 max-w-full overflow-x-auto mb-4 text-left">
            {this.state.error.stack}
          </pre>
          <Button size="sm" onClick={() => this.setState({ error: null })}>
            Retry
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mb-3" />
      <p className="text-muted-foreground text-sm">Loading view...</p>
    </div>
  );
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

function DataSourceToggle({ dataSource, setDataSource, className }: {
  dataSource: "mock" | "live";
  setDataSource: (v: "mock" | "live") => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center rounded-lg border border-border bg-muted/60 p-0.5 gap-0.5", className)}>
      <button
        onClick={() => setDataSource("mock")}
        className={cn(
          "h-8 rounded-md px-3 text-sm font-medium transition-all cursor-pointer border-none",
          dataSource === "mock"
            ? "bg-background shadow-sm text-foreground"
            : "bg-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        Mock
      </button>
      <button
        onClick={() => setDataSource("live")}
        className={cn(
          "h-8 rounded-md px-3 text-sm font-medium transition-all cursor-pointer border-none",
          dataSource === "live"
            ? "bg-background shadow-sm text-foreground"
            : "bg-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        Live
      </button>
    </div>
  );
}

function DarkModeToggle({ darkMode, setDarkMode }: { darkMode: boolean; setDarkMode: (v: boolean) => void }) {
  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      className="h-8 w-8 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer shrink-0"
    >
      {darkMode ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function PreviewApp() {
  const [activeView, setActiveView] = useState("matchup-detail");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dataSource, setDataSource] = useState<"mock" | "live">("mock");
  const [liveData, setLiveData] = useState<any>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [liveApp] = useState(() => createLiveApp());
  const [mockData, setMockData] = useState<Record<string, any> | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem("preview-dark") === "1"; } catch { return false; }
  });
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => {
    const activeGroupName = VIEW_GROUPS.find(g => g.views.some(v => v.id === "matchup-detail"));
    const collapsed = new Set<string>();
    for (const g of VIEW_GROUPS) {
      if (g.name !== (activeGroupName ? activeGroupName.name : "")) {
        collapsed.add(g.name);
      }
    }
    return collapsed;
  });

  const activeItemRef = useRef<HTMLButtonElement>(null);
  const sidebarScrollRef = useRef<HTMLDivElement>(null);

  // Scroll active sidebar item into view on mount
  useEffect(() => {
    if (activeItemRef.current && sidebarScrollRef.current) {
      activeItemRef.current.scrollIntoView({ block: "center", behavior: "auto" });
    }
  }, []);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen && window.innerWidth < 640) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [sidebarOpen]);

  // Lazy-load mock data
  useEffect(() => {
    if (dataSource === "mock" && !mockData) {
      import("./mock-data").then(m => setMockData(m.MOCK_DATA));
    }
  }, [dataSource, mockData]);

  // Apply dark mode class and color-scheme to <html>
  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add("dark");
      html.style.colorScheme = "dark";
    } else {
      html.classList.remove("dark");
      html.style.colorScheme = "light";
    }
    try { localStorage.setItem("preview-dark", darkMode ? "1" : "0"); } catch {}
  }, [darkMode]);

  useEffect(() => {
    if (dataSource !== "live") return;
    setLiveLoading(true);
    setLiveError(null);
    setLiveData(null);
    fetchViewData(activeView)
      .then((d) => { setLiveData(d); setLiveLoading(false); })
      .catch((e) => { setLiveError(e.message); setLiveLoading(false); });
  }, [activeView, dataSource]);

  // Memoize derived values
  const { allViews, view, activeGroup } = useMemo(() => {
    const all = VIEW_GROUPS.flatMap((g) => g.views);
    return {
      allViews: all,
      view: all.find((v) => v.id === activeView),
      activeGroup: VIEW_GROUPS.find((g) => g.views.some((v) => v.id === activeView)),
    };
  }, [activeView]);

  const currentData = dataSource === "live" ? liveData : (mockData ? mockData[activeView] : null);
  const handleNavigate = useCallback((newData: any) => setLiveData(newData), []);

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  const handleSelectView = (viewId: string) => {
    setActiveView(viewId);
    setSidebarOpen(false);
    const group = VIEW_GROUPS.find(g => g.views.some(v => v.id === viewId));
    if (group && collapsedGroups.has(group.name)) {
      setCollapsedGroups(prev => {
        const next = new Set(prev);
        next.delete(group.name);
        return next;
      });
    }
  };

  return (
    <div className="preview-shell flex h-[100dvh] -m-3 overflow-hidden bg-background text-foreground" style={{ fontSize: "1rem" }}>
      {/* Mobile top bar */}
      <div
        className="sm:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between gap-2 border-b border-border bg-card/95 px-3 py-2 supports-backdrop-filter:backdrop-blur-md"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer border-none bg-transparent shrink-0"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="text-base leading-none">{sidebarOpen ? "\u2715" : "\u2630"}</span>
          </button>
          <div className="min-w-0">
            <p className="app-kicker leading-none">{activeGroup ? activeGroup.name : "Preview"}</p>
            <p className="text-sm font-semibold truncate">{view ? view.label : "Select a view"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <DataSourceToggle dataSource={dataSource} setDataSource={setDataSource} className="hidden min-[420px]:inline-flex" />
          <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
        </div>
      </div>

      {/* Mobile sidebar overlay backdrop */}
      {sidebarOpen && (
        <div
          className="sm:hidden fixed inset-0 z-40 bg-background/70 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav
        className={
          "w-72 max-w-[86vw] flex-shrink-0 border-r border-border bg-card flex flex-col z-50 "
          + "sm:relative sm:block sm:h-full "
          + (sidebarOpen
            ? "fixed top-0 left-0 bottom-0"
            : "hidden sm:flex")
        }
        style={sidebarOpen ? { paddingTop: "env(safe-area-inset-top)" } : undefined}
      >
        {/* Sidebar header */}
        <div className="flex-shrink-0 border-b border-border px-3 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <button
                className="sm:hidden h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer border-none bg-transparent shrink-0"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="text-base leading-none">{"\u2715"}</span>
              </button>
              <h1 className="text-sm font-bold tracking-wide truncate">Fantasy Preview</h1>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Badge variant="outline" className="text-xs">{allViews.length}</Badge>
              <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
            </div>
          </div>
          <DataSourceToggle dataSource={dataSource} setDataSource={setDataSource} className="w-full" />
        </div>

        {/* Scrollable groups */}
        <div
          ref={sidebarScrollRef}
          className="flex-1 overflow-y-auto overscroll-contain p-2 pb-4"
          style={{ WebkitOverflowScrolling: "touch" } as any}
        >
          {VIEW_GROUPS.map((group) => {
            const isCollapsed = collapsedGroups.has(group.name);
            const isActiveGroup = activeGroup && activeGroup.name === group.name;
            return (
              <div key={group.name} className="mb-1">
                <button
                  onClick={() => toggleGroup(group.name)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-md text-left border-none cursor-pointer transition-colors",
                    "text-xs font-bold uppercase tracking-widest",
                    isActiveGroup
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  <span>{group.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-px font-semibold tabular-nums">
                      {group.views.length}
                    </span>
                    <span className={cn("text-xs transition-transform duration-150", isCollapsed ? "" : "rotate-90")}>
                      {"\u25B6"}
                    </span>
                  </div>
                </button>
                {!isCollapsed && (
                  <div className="mt-0.5 ml-1">
                    {group.views.map((v) => (
                      <button
                        key={v.id}
                        ref={activeView === v.id ? activeItemRef : undefined}
                        onClick={() => handleSelectView(v.id)}
                        className={cn(
                          "block w-full text-left pl-4 pr-3 py-2.5 rounded-r-md text-sm transition-colors mb-px border-none cursor-pointer border-l-2",
                          activeView === v.id
                            ? "bg-primary/10 text-primary font-semibold border-l-primary"
                            : "text-foreground/70 hover:bg-accent/60 hover:text-foreground bg-transparent border-l-transparent"
                        )}
                        style={{ borderLeftStyle: "solid" }}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Main content */}
      <main
        className="flex-1 min-w-0 overflow-y-auto overscroll-contain bg-[color:var(--color-surface-2)] h-full pt-[env(safe-area-inset-top)]"
        style={{ WebkitOverflowScrolling: "touch" } as any}
      >
        <div className="p-3 sm:p-4 pt-14 sm:pt-4">
          <div className="w-full">
            <Card size="sm" className="mb-4">
              <CardContent className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="app-kicker">{activeGroup ? activeGroup.name : "Preview"}</p>
                  <h2 className="truncate text-base font-bold">{view ? view.label : "Select a view"}</h2>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <DataSourceToggle dataSource={dataSource} setDataSource={setDataSource} />
                </div>
              </CardContent>
            </Card>

            {dataSource === "live" && liveLoading ? (
              <LoadingSpinner />
            ) : dataSource === "live" && liveError ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <p className="text-destructive text-sm font-medium">Failed to load live data</p>
                  <p className="text-muted-foreground text-xs mt-1">{liveError}</p>
                </CardContent>
              </Card>
            ) : dataSource === "mock" && !mockData ? (
              <LoadingSpinner />
            ) : view && currentData ? (
              <ViewErrorBoundary key={activeView} viewId={activeView}>
                <Suspense fallback={<LoadingSpinner />}>
                  <ViewRenderer view={view} data={currentData} app={dataSource === "live" ? liveApp : null} navigate={dataSource === "live" ? handleNavigate : noop} />
                </Suspense>
              </ViewErrorBoundary>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <p className="text-muted-foreground text-sm">
                    {dataSource === "live" ? "No API mapping for this view." : "No mock data for this view yet."}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {view ? "View: " + view.id : "Select a view from the sidebar."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ViewRenderer({ view, data, app, navigate }: { view: ViewDef; data: any; app: any; navigate: (d: any) => void }) {
  const Component = view.component;
  const extraProps = { ...(view.props || {}), app, navigate };
  return (
    <div className="mcp-app-root">
      <Component data={data} {...extraProps} />
    </div>
  );
}

import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
createRoot(document.getElementById("root")!).render(<StrictMode><PreviewApp /></StrictMode>);

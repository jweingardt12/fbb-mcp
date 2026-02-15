import { useState, useEffect } from "react";
import { fetchViewData, createLiveApp } from "./live-data";
// Standings
import { StandingsView } from "../standings-app/standings-view";
import { MatchupsView } from "../standings-app/matchups-view";
import { MatchupDetailView } from "../standings-app/matchup-detail-view";
import { TransactionsView } from "../standings-app/transactions-view";
import { InfoView } from "../standings-app/info-view";
import { StatCategoriesView } from "../standings-app/stat-categories-view";
import { TransactionTrendsView } from "../standings-app/transaction-trends-view";
import { LeaguePulseView } from "../standings-app/league-pulse-view";
import { PowerRankingsView } from "../standings-app/power-rankings-view";
import { SeasonPaceView } from "../standings-app/season-pace-view";
// Season
import { CategoryCheckView } from "../season-app/category-check-view";
import { InjuryReportView } from "../season-app/injury-report-view";
import { WaiverAnalyzeView } from "../season-app/waiver-analyze-view";
import { TradeEvalView } from "../season-app/trade-eval-view";
import { LineupOptimizeView } from "../season-app/lineup-optimize-view";
import { StreamingView } from "../season-app/streaming-view";
import { DailyUpdateView } from "../season-app/daily-update-view";
import { TradeBuilderView } from "../season-app/trade-builder-view";
import { SimulateView } from "../season-app/simulate-view";
import { ScoutView } from "../season-app/scout-view";
import { MatchupStrategyView } from "../season-app/matchup-strategy-view";
import { SetLineupView } from "../season-app/set-lineup-view";
import { PendingTradesView } from "../season-app/pending-trades-view";
import { TradeActionView } from "../season-app/trade-action-view";
import { WhatsNewView } from "../season-app/whats-new-view";
import { TradeFinderView } from "../season-app/trade-finder-view";
import { WeekPlannerView } from "../season-app/week-planner-view";
import { CloserMonitorView } from "../season-app/closer-monitor-view";
import { PitcherMatchupView } from "../season-app/pitcher-matchup-view";
// Draft
import { DraftStatusView } from "../draft-app/draft-status-view";
import { DraftRecommendView } from "../draft-app/draft-recommend-view";
import { CheatsheetView } from "../draft-app/cheatsheet-view";
import { BestAvailableView } from "../draft-app/best-available-view";
// Roster
import { RosterView } from "../roster-app/roster-view";
import { FreeAgentsView } from "../roster-app/free-agents-view";
import { ActionView } from "../roster-app/action-view";
import { WhoOwnsView } from "../roster-app/who-owns-view";
// Valuations
import { RankingsView } from "../valuations-app/rankings-view";
import { CompareView } from "../valuations-app/compare-view";
import { ValueView } from "../valuations-app/value-view";
// MLB
import { TeamsView as MlbTeamsView } from "../mlb-app/teams-view";
import { RosterView as MlbRosterView } from "../mlb-app/roster-view";
import { PlayerView as MlbPlayerView } from "../mlb-app/player-view";
import { StatsView as MlbStatsView } from "../mlb-app/stats-view";
import { InjuriesView as MlbInjuriesView } from "../mlb-app/injuries-view";
import { StandingsView as MlbStandingsView } from "../mlb-app/standings-view";
import { ScheduleView as MlbScheduleView } from "../mlb-app/schedule-view";
// History
import { LeagueHistoryView } from "../history-app/league-history-view";
import { RecordBookView } from "../history-app/record-book-view";
import { PastStandingsView } from "../history-app/past-standings-view";
import { PastDraftView } from "../history-app/past-draft-view";
import { PastTeamsView } from "../history-app/past-teams-view";
import { PastTradesView } from "../history-app/past-trades-view";
import { PastMatchupView } from "../history-app/past-matchup-view";
// Intel
import { PlayerReportView } from "../intel-app/player-report-view";
import { BreakoutsView } from "../intel-app/breakouts-view";
import { RedditView } from "../intel-app/reddit-view";
import { ProspectsView } from "../intel-app/prospects-view";
import { TransactionsView as IntelTransactionsView } from "../intel-app/transactions-view";

import { MOCK_DATA } from "./mock-data";
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

function PreviewApp() {
  const [activeView, setActiveView] = useState("matchup-detail");
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dataSource, setDataSource] = useState<"mock" | "live">("mock");
  const [liveData, setLiveData] = useState<any>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [liveApp] = useState(() => createLiveApp());

  useEffect(() => {
    if (dataSource !== "live") return;
    setLiveLoading(true);
    setLiveError(null);
    setLiveData(null);
    fetchViewData(activeView)
      .then((d) => { setLiveData(d); setLiveLoading(false); })
      .catch((e) => { setLiveError(e.message); setLiveLoading(false); });
  }, [activeView, dataSource]);

  const allViews = VIEW_GROUPS.flatMap((g) => g.views);
  const view = allViews.find((v) => v.id === activeView);
  const currentData = dataSource === "live" ? liveData : MOCK_DATA[activeView];
  const handleNavigate = (newData: any) => setLiveData(newData);
  const activeGroup = VIEW_GROUPS.find((g) => g.views.some((v) => v.id === activeView));

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.style.colorScheme = next ? "dark" : "light";
  };

  return (
    <div className="flex h-screen -m-3 overflow-hidden">
      {/* Mobile header */}
      <div className="sm:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-2 px-3 py-2 bg-card border-b">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="border-none bg-none cursor-pointer text-lg text-foreground p-1">
          {sidebarOpen ? "\u2715" : "\u2630"}
        </button>
        <span className="text-[13px] font-semibold text-foreground">
          {activeGroup ? activeGroup.name : ""} / {view ? view.label : ""}
        </span>
      </div>

      {/* Mobile sidebar overlay backdrop */}
      {sidebarOpen && (
        <div className="sm:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - fixed overlay on mobile, static on desktop */}
      <nav className={
        "w-56 flex-shrink-0 border-r bg-card overflow-y-auto p-3 z-50 "
        + "sm:relative sm:block "
        + (sidebarOpen
          ? "fixed top-0 left-0 bottom-0"
          : "hidden sm:block")
      }>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(false)} className="sm:hidden border-none bg-none cursor-pointer text-lg text-foreground p-0">
              {"\u2715"}
            </button>
            <h1 className="text-sm font-bold text-primary m-0">
              Fantasy Preview
            </h1>
          </div>
          <button onClick={toggleDarkMode} className="border border-border rounded-md bg-secondary cursor-pointer px-2 py-0.5 text-xs text-foreground">
            {darkMode ? "\u2600" : "\u263E"}
          </button>
        </div>
        <div className="flex items-center gap-0 mb-3">
          <button
            onClick={() => setDataSource("mock")}
            className={"px-2 py-0.5 text-xs rounded-l-md border border-border cursor-pointer "
              + (dataSource === "mock" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground")}
          >Mock</button>
          <button
            onClick={() => setDataSource("live")}
            className={"px-2 py-0.5 text-xs rounded-r-md border border-border border-l-0 cursor-pointer "
              + (dataSource === "live" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground")}
          >Live</button>
        </div>
        {VIEW_GROUPS.map((group) => (
          <div key={group.name} className="mb-3.5">
            <h2 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1 px-2.5 flex items-center gap-1.5">
              {group.name}
              <span className="text-[9px] bg-muted rounded-full px-1.5 py-px font-medium">
                {group.views.length}
              </span>
            </h2>
            {group.views.map((v) => (
              <button
                key={v.id}
                onClick={() => { setActiveView(v.id); setSidebarOpen(false); }}
                className={
                  "block w-full text-left px-2.5 py-1.5 rounded-md text-[13px] transition-colors mb-px border-none cursor-pointer " +
                  (activeView === v.id
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-foreground/80 hover:bg-muted bg-transparent")
                }
              >
                {v.label}
              </button>
            ))}
          </div>
        ))}
        <div className="text-[10px] text-muted-foreground mt-2 text-center">
          {allViews.length} views
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 pt-12 sm:pt-6 overflow-y-auto overflow-x-hidden bg-background h-full">
        {/* Breadcrumb */}
        <div className="max-w-[640px] mx-auto overflow-hidden">
          <div className="text-[11px] text-muted-foreground mb-3 flex items-center gap-1">
            {activeGroup && <span>{activeGroup.name}</span>}
            {activeGroup && <span className="opacity-50">/</span>}
            {view && <span className="font-medium">{view.label}</span>}
          </div>
          {dataSource === "live" && liveLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mb-3" />
              <p className="text-muted-foreground text-sm">Loading live data...</p>
            </div>
          ) : dataSource === "live" && liveError ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <p className="text-destructive text-sm font-medium">Failed to load live data</p>
              <p className="text-muted-foreground text-xs mt-1">{liveError}</p>
            </div>
          ) : view && currentData ? (
            <ViewRenderer view={view} data={currentData} app={dataSource === "live" ? liveApp : null} navigate={dataSource === "live" ? handleNavigate : noop} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <p className="text-muted-foreground text-sm">
                {dataSource === "live" ? "No API mapping for this view." : "No mock data for this view yet."}
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                {view ? "View: " + view.id : "Select a view from the sidebar."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ViewRenderer({ view, data, app, navigate }: { view: ViewDef; data: any; app: any; navigate: (d: any) => void }) {
  const Component = view.component;
  const extraProps = { ...(view.props || {}), app, navigate };
  return <Component data={data} {...extraProps} />;
}

import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
createRoot(document.getElementById("root")!).render(<StrictMode><PreviewApp /></StrictMode>);

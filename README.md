# fbb-mcp

Fantasy Baseball MCP Server for Claude. Manage your Yahoo Fantasy Baseball league through natural conversation — ask Claude to optimize your lineup, analyze trades, scout opponents, find waiver pickups, and make roster moves, all backed by real-time data and rendered in rich inline UIs.

## Table of Contents

- [What It Does](#what-it-does)
- [Quick Start](#quick-start)
- [Connecting to Claude](#connecting-to-claude)
  - [Claude Code](#claude-code)
  - [Claude Desktop](#claude-desktop)
  - [Claude.ai (remote)](#claudeai-remote-access)
- [MCP Tools](#mcp-tools)
- [CLI Commands](#cli-commands)
- [Architecture](#architecture)
- [Environment Variables](#environment-variables)
- [Optional Config Files](#optional-config-files)
- [Project Files](#project-files)

## What It Does

This MCP server gives Claude direct access to your Yahoo Fantasy Baseball league, real-time MLB data, and advanced analytics. Instead of switching between Yahoo's app, Baseball Savant, Reddit, and spreadsheets, you just talk to Claude.

**Ask things like:**
- "Who should I pick up this week to help my batting average?"
- "Is it worth trading Soto for two mid-tier pitchers?"
- "Set my lineup for today — bench anyone without a game"
- "Who are the best streaming pitchers for next week?"
- "What's the buzz on Reddit about [player]?"

### How It Works

Claude calls the MCP tools to pull live data, run analysis, and take action on your behalf. Behind the scenes:

1. **Yahoo Fantasy API** — Your roster, standings, matchups, free agents, transactions, and league settings come from Yahoo's OAuth API in real time. Every tool call fetches current data, not cached snapshots.

2. **Analytics engine** — The server doesn't just relay raw data. It computes analysis that Yahoo doesn't provide:
   - **Z-score valuations** rank every player by how many standard deviations above average they are in each scoring category, tuned to your league's specific stat categories (not generic rankings)
   - **Category gap analysis** identifies where your team is weakest relative to the league and scores free agents by how much they'd specifically improve those categories
   - **Matchup strategy** breaks down your current H2H matchup category by category, classifying each as "target" (winnable), "protect" (close lead), "concede" (too far behind), or "lock" (safe lead)
   - **Trade evaluation** computes net z-score value for both sides of a trade, factoring in positional scarcity
   - **Trade finder** scans every team in the league for complementary category strengths/weaknesses and suggests mutually beneficial trade packages

3. **Player intelligence** — Every player surface (roster, free agents, search results, recommendations) is enriched with data from multiple sources:
   - **Statcast** (Baseball Savant) — xwOBA, exit velocity, barrel rate, hard hit rate, sprint speed, with percentile ranks and quality tiers (elite/great/above-avg/average/below-avg)
   - **Trends** — Last 7/14/30 day splits from MLB game logs, hot/cold streak detection
   - **Plate discipline** (FanGraphs via pybaseball) — BB%, K%, O-Swing%, Z-Contact%
   - **Reddit** (r/fantasybaseball) — Mention counts, sentiment, trending player posts
   - **MLB transactions** — Recent call-ups, IL stints, DFA, trades that affect fantasy value

4. **Browser automation** — Write operations (add, drop, trade, lineup changes) use Playwright to automate the Yahoo Fantasy website directly, since Yahoo's API no longer grants write scope to new developer apps. Read operations still use the fast OAuth API.

5. **Inline UI apps** — Tool results aren't just text. Eight Preact + Tailwind HTML apps render interactive tables, charts, and dashboards directly inside Claude's response using MCP Apps (`@modelcontextprotocol/ext-apps`).

### Data Flow

When you ask Claude a question, here's what happens:

```
You: "Should I drop Player X for Player Y?"

Claude calls:
  1. yahoo_roster          → your current roster + intel overlays
  2. yahoo_category_check  → your weak/strong categories
  3. yahoo_value (X)       → Player X z-score breakdown
  4. yahoo_value (Y)       → Player Y z-score breakdown
  5. yahoo_category_simulate → projected category rank changes

Claude synthesizes all 5 results and gives you a recommendation
with specific category-level reasoning.
```

Claude decides which tools to call and in what order based on your question. Complex questions may chain 3-8 tool calls. Simple lookups ("show my roster") are a single call.

## Quick Start

### 1. Get Yahoo API credentials

Go to [developer.yahoo.com/apps/create](https://developer.yahoo.com/apps/create), create an app with **Fantasy Sports** read permissions and `oob` as the redirect URI. Save your consumer key and secret to `config/yahoo_oauth.json`:

```json
{
    "consumer_key": "YOUR_CONSUMER_KEY",
    "consumer_secret": "YOUR_CONSUMER_SECRET"
}
```

### 2. Configure and run

```bash
cp docker-compose.example.yml docker-compose.yml
cp .env.example .env
# Edit .env — set LEAGUE_ID and TEAM_ID (see Environment Variables below)
mkdir -p config data
docker compose up -d
```

### 3. Authorize with Yahoo

On the first API call, Yahoo will ask you to authorize the app. Run any command to trigger it:

```bash
docker exec -it fbb-mcp python3 /app/scripts/yahoo-fantasy.py info
```

Follow the prompt — open the URL, log in, paste the verification code. Tokens refresh automatically after that.

### 4. Connect to Claude

Add to your `.mcp.json` (Claude Code) or `claude_desktop_config.json` (Claude Desktop):

```json
{
  "mcpServers": {
    "fbb-mcp": {
      "command": "docker",
      "args": ["exec", "-i", "fbb-mcp", "node", "/app/mcp-apps/dist/main.js", "--stdio"]
    }
  }
}
```

That's it. Everything runs inside Docker — no local dependencies beyond Docker itself.

### 5. Enable write operations (optional)

To let Claude make roster moves (add, drop, trade, set lineup), set `ENABLE_WRITE_OPS=true` in `.env`, rebuild with `docker compose up -d`, and set up a browser session:

```bash
./yf browser-login
```

This opens a browser — log into Yahoo manually. The session saves to `config/yahoo_session.json` and lasts 2-4 weeks.

## Connecting to Claude

The MCP server supports two transports: **stdio** (local, for Claude Code and Claude Desktop) and **Streamable HTTP** (remote, for Claude.ai). Both use the same tools and backend.

### Claude Code

Add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "fbb-mcp": {
      "command": "docker",
      "args": ["exec", "-i", "fbb-mcp", "node", "/app/mcp-apps/dist/main.js", "--stdio"]
    }
  }
}
```

Restart Claude Code (or run `/mcp`) to pick up the config.

### Claude Desktop

Add to your config file:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "fbb-mcp": {
      "command": "docker",
      "args": ["exec", "-i", "fbb-mcp", "node", "/app/mcp-apps/dist/main.js", "--stdio"]
    }
  }
}
```

Restart Claude Desktop after saving.

### Claude.ai (remote access)

Claude.ai can't run local processes, so the MCP server needs to be reachable over the internet. You need a machine running Docker, a domain name, and a reverse proxy for HTTPS.

**1. Set env vars** in `.env`:

```bash
MCP_SERVER_URL=https://your-domain.com
MCP_AUTH_PASSWORD=your_secure_password
```

`MCP_SERVER_URL` must match exactly what Claude.ai connects to — it's used to generate OAuth callback URLs.

**2. Set up a reverse proxy** to forward HTTPS to the container's port 4951:

<details>
<summary>Caddy (automatic HTTPS)</summary>

```
your-domain.com {
    reverse_proxy localhost:4951
}
```
</details>

<details>
<summary>nginx</summary>

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:4951;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
</details>

Cloudflare Tunnel, Tailscale Funnel, and Pangolin also work.

**3. Rebuild and connect:**

```bash
docker compose up -d
```

In Claude.ai, go to Settings > Integrations > Add MCP Server, enter `https://your-domain.com/mcp`. You'll be redirected to a login page — enter your `MCP_AUTH_PASSWORD` to authorize. The token persists across sessions.

<details>
<summary>How the auth flow works</summary>

The MCP server implements MCP OAuth 2.1 using `@modelcontextprotocol/sdk`. No third-party auth provider needed — the password is checked directly against `MCP_AUTH_PASSWORD`.

```
Claude.ai → GET /mcp → 401 Unauthorized
         → discovers OAuth metadata at /.well-known/oauth-authorization-server
         → redirects user to /authorize → /login (password form)
         → user enters password → /login/callback validates it
         → issues authorization code → Claude.ai exchanges for bearer token
         → GET/POST /mcp with Authorization: Bearer <token> → tools work
```
</details>

## MCP Tools

71 total tools (59 read-only + 12 write operations), each with rich inline HTML UI apps rendered directly in Claude.

### Roster Management

| Tool | Description |
|------|-------------|
| `yahoo_roster` | Show current fantasy roster with positions and eligibility |
| `yahoo_free_agents` | List top free agents (batters or pitchers) |
| `yahoo_search` | Search for a player by name among free agents |
| `yahoo_who_owns` | Check who owns a specific player by player ID |
| `yahoo_add` | Add a free agent to your roster |
| `yahoo_drop` | Drop a player from your roster |
| `yahoo_swap` | Atomic add+drop: add one player and drop another |
| `yahoo_waiver_claim` | Submit a waiver claim with optional FAAB bid |
| `yahoo_waiver_claim_swap` | Submit a waiver claim + drop with optional FAAB bid |
| `yahoo_browser_status` | Check if the browser session for write operations is valid |
| `yahoo_change_team_name` | Change your fantasy team name |
| `yahoo_change_team_logo` | Change your fantasy team logo (PNG/JPG image) |

### League & Standings

| Tool | Description |
|------|-------------|
| `yahoo_standings` | League standings with win-loss records |
| `yahoo_matchups` | Weekly H2H matchup pairings |
| `yahoo_scoreboard` | Live scoring overview for the current week |
| `yahoo_my_matchup` | Detailed H2H matchup with per-category comparison |
| `yahoo_info` | League settings and team info |
| `yahoo_transactions` | Recent league transactions (add, drop, trade) |
| `yahoo_stat_categories` | League scoring categories |
| `yahoo_transaction_trends` | Most added and most dropped players across Yahoo |
| `yahoo_league_pulse` | League activity — moves and trades per team |
| `yahoo_power_rankings` | Teams ranked by estimated roster strength |
| `yahoo_season_pace` | Projected season pace, playoff probability, and magic numbers |

### In-Season Management

| Tool | Description |
|------|-------------|
| `yahoo_lineup_optimize` | Optimize daily lineup (bench off-day players, start active ones) |
| `yahoo_category_check` | Your rank in each stat category vs the league |
| `yahoo_injury_report` | Check roster for injured players and suggest IL moves |
| `yahoo_waiver_analyze` | Score free agents by how much they'd improve your weakest categories |
| `yahoo_streaming` | Recommend streaming pitchers by schedule and two-start potential |
| `yahoo_trade_eval` | Evaluate a trade with value comparison and grade |
| `yahoo_daily_update` | Run all daily checks (lineup + injuries) |
| `yahoo_scout_opponent` | Scout current matchup opponent — strengths, weaknesses, counter-strategies |
| `yahoo_category_simulate` | Simulate category rank impact of adding a player |
| `yahoo_matchup_strategy` | Category-by-category game plan to maximize matchup wins |
| `yahoo_set_lineup` | Move specific player(s) to specific position(s) |
| `yahoo_pending_trades` | View all pending incoming and outgoing trade proposals |
| `yahoo_propose_trade` | Propose a trade to another team |
| `yahoo_accept_trade` | Accept a pending trade |
| `yahoo_reject_trade` | Reject a pending trade |
| `yahoo_whats_new` | Digest of injuries, pending trades, league activity, trending pickups, prospect call-ups |
| `yahoo_trade_finder` | Scan the league for complementary trade partners and suggest packages |
| `yahoo_week_planner` | Games-per-day grid for your roster (off-days, two-start pitchers) |
| `yahoo_closer_monitor` | Monitor closer situations — your closers, available closers, saves leaders |
| `yahoo_pitcher_matchup` | Pitcher matchup quality for your SPs based on opponent batting stats |

### Valuations

| Tool | Description |
|------|-------------|
| `yahoo_rankings` | Top players ranked by z-score value |
| `yahoo_compare` | Compare two players side by side with z-score breakdowns |
| `yahoo_value` | Full z-score breakdown for a player across all categories |

### Draft

| Tool | Description |
|------|-------------|
| `yahoo_draft_status` | Current draft status — picks made, your round, roster composition |
| `yahoo_draft_recommend` | Draft pick recommendation with top available hitters and pitchers by z-score |
| `yahoo_draft_cheatsheet` | Draft strategy cheat sheet with round-by-round targets |
| `yahoo_best_available` | Best available players ranked by z-score |

### Intelligence

| Tool | Description |
|------|-------------|
| `fantasy_player_report` | Deep-dive Statcast + trends + plate discipline + Reddit buzz for a player |
| `fantasy_breakout_candidates` | Players whose expected stats (xwOBA) exceed actual — positive regression candidates |
| `fantasy_bust_candidates` | Players whose actual stats exceed expected (xwOBA) — negative regression candidates |
| `fantasy_reddit_buzz` | What r/fantasybaseball is talking about — hot posts, trending topics |
| `fantasy_trending_players` | Players with rising buzz on Reddit |
| `fantasy_prospect_watch` | Recent MLB prospect call-ups and roster moves |
| `fantasy_transactions` | Recent fantasy-relevant MLB transactions (IL, call-up, DFA, trade) |

### MLB Data

| Tool | Description |
|------|-------------|
| `mlb_teams` | List all MLB teams with abbreviations |
| `mlb_roster` | MLB team roster by abbreviation (NYY, LAD, etc.) |
| `mlb_player` | MLB player info by Stats API player ID |
| `mlb_stats` | Player season stats by Stats API player ID |
| `mlb_injuries` | Current MLB injuries across all teams |
| `mlb_standings` | MLB division standings |
| `mlb_schedule` | MLB game schedule (today or specific date) |

### League History

| Tool | Description |
|------|-------------|
| `yahoo_league_history` | All-time season results — champions, your finishes, W-L-T records |
| `yahoo_record_book` | All-time records — career W-L, best seasons, playoff appearances, #1 draft picks |
| `yahoo_past_standings` | Full standings for a past season |
| `yahoo_past_draft` | Draft picks for a past season with player names |
| `yahoo_past_teams` | Team names, managers, move/trade counts for a past season |
| `yahoo_past_trades` | Trade history for a past season |
| `yahoo_past_matchup` | Matchup results for a specific week in a past season |

### Write Operations

The following 12 tools require `ENABLE_WRITE_OPS=true` and a valid browser session. When `ENABLE_WRITE_OPS=false` (default), these tools are hidden entirely:

`yahoo_add`, `yahoo_drop`, `yahoo_swap`, `yahoo_waiver_claim`, `yahoo_waiver_claim_swap`, `yahoo_set_lineup`, `yahoo_propose_trade`, `yahoo_accept_trade`, `yahoo_reject_trade`, `yahoo_browser_status`, `yahoo_change_team_name`, `yahoo_change_team_logo`

## CLI Commands

The `./yf` helper script provides direct CLI access to all functionality:

```
./yf <command> [args]
```

| Category | Commands |
|----------|----------|
| **League** | `info`, `standings`, `roster`, `fa B/P [n]`, `search <name>`, `add <id>`, `drop <id>`, `swap <add> <drop>`, `matchups [week]`, `scoreboard`, `transactions [type] [n]`, `stat-categories` |
| **Draft** | `status`, `recommend`, `watch [sec]`, `cheatsheet`, `best-available [B\|P] [n]` |
| **Valuations** | `rankings [B\|P] [n]`, `compare <name1> <name2>`, `value <name>`, `import-csv <file>`, `generate` |
| **In-Season** | `lineup-optimize [--apply]`, `category-check`, `injury-report`, `waiver-analyze [B\|P] [n]`, `streaming [week]`, `trade-eval <give> <get>`, `daily-update` |
| **MLB** | `mlb teams`, `mlb roster <tm>`, `mlb stats <id>`, `mlb schedule`, `mlb injuries` |
| **Browser** | `browser-login`, `browser-status`, `browser-test`, `change-team-name <name>`, `change-team-logo <path>` |
| **Docker** | `build`, `restart`, `shell`, `logs` |

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Docker Container (fbb-mcp)                     │
│                                                 │
│  ┌──────────────────┐  ┌─────────────────────┐  │
│  │  Python API       │  │  TypeScript MCP     │  │
│  │  (Flask :8766)    │──│  (Express :4951)    │  │
│  │                   │  │                     │  │
│  │  yahoo_fantasy_api│  │  MCP SDK + ext-apps │  │
│  │  pybaseball       │  │  71 tool defs       │  │
│  │  MLB-StatsAPI     │  │  8 inline HTML UIs  │  │
│  │  Playwright       │  │                     │  │
│  └──────────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────┘
         │                        │
    Yahoo Fantasy API        Claude (stdio/HTTP)
    Yahoo Website (browser)
```

- **Read operations**: Yahoo Fantasy OAuth API (fast, reliable)
- **Write operations**: Playwright browser automation against Yahoo Fantasy website
- **MCP Apps**: Inline HTML UIs (Preact + Tailwind) rendered directly in Claude via `@modelcontextprotocol/ext-apps`

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LEAGUE_ID` | Yes | — | Yahoo Fantasy league key (e.g., `469.l.16960`) |
| `TEAM_ID` | Yes | — | Your team key (e.g., `469.l.16960.t.12`) |
| `ENABLE_WRITE_OPS` | No | `false` | Enable write operation tools (add, drop, trade, lineup) |
| `MCP_SERVER_URL` | For Claude.ai | — | Public HTTPS URL for remote access |
| `MCP_AUTH_PASSWORD` | For Claude.ai | — | Password for the OAuth login page |

The game key changes each MLB season (e.g., `469` for 2026). Find your league and team numbers in your Yahoo Fantasy league URL.

## Optional Config Files

- `config/league-history.json` — Map of year to league key for historical records
- `config/draft-cheatsheet.json` — Draft strategy and targets (see `.example`)
- `data/player-rankings-YYYY.json` — Hand-curated player rankings (fallback for valuations engine)

## Project Files

```
fbb-mcp/
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── yf                              # CLI helper script
├── config/
│   ├── yahoo_oauth.json            # OAuth tokens (gitignored, auto-refreshes)
│   ├── yahoo_session.json          # Browser session (gitignored, for write ops)
│   ├── league-history.json         # Optional: historical league keys
│   └── draft-cheatsheet.json       # Optional: draft strategy
├── data/
│   └── player-rankings-YYYY.json   # Optional: curated rankings
├── scripts/
│   ├── api-server.py               # Flask API server
│   ├── yahoo-fantasy.py            # League management
│   ├── season-manager.py           # In-season management
│   ├── draft-assistant.py          # Draft day tool
│   ├── yahoo_browser.py            # Playwright browser automation
│   ├── history.py                  # Historical records
│   ├── intel.py                    # Fantasy intelligence
│   ├── valuations.py               # Z-score valuation engine
│   ├── mlb-data.py                 # MLB Stats API helper
│   └── mlb_id_cache.py             # Player name → MLB ID mapping
└── mcp-apps/                       # TypeScript MCP server + UI apps
    ├── server.ts                   # MCP server setup + tool registration
    ├── main.ts                     # Entry point (stdio + HTTP)
    ├── src/tools/                  # 8 tool files, 71 MCP tools
    ├── src/api/                    # Python API client
    └── ui/                         # 8 inline HTML apps (Preact + Tailwind)
```

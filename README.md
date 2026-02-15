# fbb-mcp

Fantasy Baseball MCP Server for Claude. Manage your Yahoo Fantasy Baseball league through Claude with rich inline UI apps.

## Prerequisites

- Docker and Docker Compose
- A Yahoo Developer app (free) for Fantasy Sports API access

## Setup

### 1. Yahoo OAuth Credentials

Request an API key from Yahoo:

1. Go to [https://developer.yahoo.com/apps/create](https://developer.yahoo.com/apps/create) and sign in
2. Fill in:
   - **Application Name**: anything (e.g., "Fantasy Baseball")
   - **API Permissions**: select **Fantasy Sports** (Read)
   - **Redirect URI(s)**: `oob`
3. Copy your **Consumer Key** and **Consumer Secret**

Create `config/yahoo_oauth.json` with your credentials:

```json
{
    "consumer_key": "YOUR_CONSUMER_KEY",
    "consumer_secret": "YOUR_CONSUMER_SECRET"
}
```

On the first API call, the `yahoo-oauth` library will open a browser asking you to authorize the app. Yahoo provides a verification code — paste it back into the prompt. This generates a bearer token saved to the same file. Tokens refresh automatically after that.

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LEAGUE_ID` | Yes | — | Yahoo Fantasy league key (e.g., `469.l.16960`) |
| `TEAM_ID` | Yes | — | Your team key (e.g., `469.l.16960.t.12`) |
| `MCP_SERVER_URL` | For remote | — | Public URL where the MCP server is reachable |
| `MCP_AUTH_PASSWORD` | For remote | — | Password for the MCP OAuth 2.1 login page on Claude.ai |
| `ENABLE_WRITE_OPS` | No | `false` | Set to `true` to enable write operation tools (add, drop, trade, lineup changes) |

**Finding your IDs**: The game key changes each MLB season (e.g., `469` for 2026). Check your Yahoo Fantasy league URL for the league number. Your team number is your position in the league (1-based).

### 3. Run

Create a `docker-compose.yml`:

```yaml
services:
  fbb-mcp:
    image: ghcr.io/jweingardt12/fbb-mcp:latest
    container_name: fbb-mcp
    volumes:
      - ./config:/app/config
      - ./data:/app/data
    environment:
      - OAUTH_FILE=/app/config/yahoo_oauth.json
      - LEAGUE_ID=${LEAGUE_ID}
      - TEAM_ID=${TEAM_ID}
      - PYTHON_API_URL=http://localhost:8766
      - MCP_SERVER_URL=${MCP_SERVER_URL}
      - MCP_AUTH_PASSWORD=${MCP_AUTH_PASSWORD}
      - ENABLE_WRITE_OPS=${ENABLE_WRITE_OPS:-false}
      - PORT=4951
    ports:
      - "4951:4951"
    shm_size: '2gb'
    init: true
    tty: true
    stdin_open: true
    restart: unless-stopped
```

Then run:

```bash
mkdir -p config data
docker compose up -d
```

The container runs two processes:
- **Python API server** (port 8766, internal) — Flask backend calling Yahoo Fantasy API + Playwright browser automation
- **TypeScript MCP server** (port 4951, exposed) — MCP SDK with inline HTML UI apps

### 4. Browser Session (for write operations)

Write operations (add, drop, trade, lineup changes) use Playwright browser automation. A one-time login is required:

```bash
./yf browser-login
```

This opens a browser window — log into Yahoo manually (handles CAPTCHA, 2FA). The session is saved to `config/yahoo_session.json` and lasts 2-4 weeks. Check session status anytime:

```bash
./yf browser-status
```

## Connecting to Claude

### Claude Code (local, stdio)

With the Docker container running, add to your project's `.mcp.json`:

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

This runs the MCP server inside the Docker container via stdio. The Python API is already running in the container — no additional setup needed.

### Claude.ai (remote, HTTP)

The Docker container exposes port 4951 with MCP SDK OAuth 2.1 auth. Point a reverse proxy (e.g., Caddy, nginx, Pangolin) at the container, then set `MCP_SERVER_URL` and `MCP_AUTH_PASSWORD` in `.env`. Claude.ai connects to the public URL and prompts for the password on first use.

## MCP Tools

All tools include rich inline HTML UI apps rendered directly in Claude. Tools are organized into 8 categories with 71 total tools (59 read-only + 12 write operations).

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

The `./yf` helper script provides quick access to all functionality:

```
./yf <command> [args]
```

### League
| Command | Description |
|---------|-------------|
| `info` | League info |
| `standings` | League standings |
| `roster` | Your roster |
| `fa B/P [n]` | Free agents (batters/pitchers) |
| `search <name>` | Search players |
| `add <id>` | Add player |
| `drop <id>` | Drop player |
| `swap <add> <drop>` | Atomic add+drop |
| `matchups [week]` | Weekly matchups |
| `scoreboard` | Live scores |
| `transactions [type] [n]` | Recent moves |
| `stat-categories` | Scoring categories |

### Draft
| Command | Description |
|---------|-------------|
| `status` | Draft status |
| `recommend` | Get recommendation |
| `watch [sec]` | Watch draft live |
| `cheatsheet` | Strategy reference |
| `best-available [B\|P] [n]` | Ranked by z-score |

### Valuations
| Command | Description |
|---------|-------------|
| `rankings [B\|P] [n]` | Top players by z-score |
| `compare <name1> <name2>` | Compare two players |
| `value <name>` | Player z-score breakdown |
| `import-csv <file>` | Import FanGraphs projections |
| `generate` | Generate rankings from data |

### In-Season
| Command | Description |
|---------|-------------|
| `lineup-optimize [--apply]` | Optimize daily lineup |
| `category-check` | Category rankings vs league |
| `injury-report` | Check roster injuries |
| `waiver-analyze [B\|P] [n]` | Waiver recommendations |
| `streaming [week]` | Streaming pitcher picks |
| `trade-eval <give> <get>` | Evaluate a trade |
| `daily-update` | Run all daily checks |

### MLB Data
| Command | Description |
|---------|-------------|
| `mlb teams` | MLB teams |
| `mlb roster <tm>` | Team roster |
| `mlb stats <id>` | Player stats |
| `mlb schedule` | Today's games |
| `mlb injuries` | Current injuries |

### Browser (Write Operations)
| Command | Description |
|---------|-------------|
| `browser-login` | Log into Yahoo for browser writes |
| `browser-status` | Check browser session status |
| `browser-test` | Test browser session |
| `change-team-name <name>` | Change team name |
| `change-team-logo <path>` | Change team logo image |

### Docker
| Command | Description |
|---------|-------------|
| `build` | Build container |
| `restart` | Restart container |
| `shell` | Enter container |
| `logs` | View logs |

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

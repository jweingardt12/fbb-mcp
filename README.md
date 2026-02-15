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
   - **API Permissions**: select **Fantasy Sports** with Read/Write access (write is needed for roster changes)
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

```bash
# Required - Your Yahoo Fantasy league identifiers
LEAGUE_ID=469.l.12345           # Found in your Yahoo Fantasy league URL
TEAM_ID=469.l.12345.t.1         # Your team number in the league

# Optional - Only needed for remote access via Claude.ai
MCP_SERVER_URL=https://your-domain.com
MCP_AUTH_PASSWORD=your_password_here
```

| Variable | Required | Description |
|----------|----------|-------------|
| `LEAGUE_ID` | Yes | Yahoo Fantasy league key (format: `{game_key}.l.{league_id}`) |
| `TEAM_ID` | Yes | Your team key (format: `{game_key}.l.{league_id}.t.{team_number}`) |
| `MCP_SERVER_URL` | For remote | Public URL where the MCP server is reachable |
| `MCP_AUTH_PASSWORD` | For remote | Password for the MCP OAuth 2.1 login page on Claude.ai |

**Finding your IDs**: The game key changes each MLB season (e.g., `469` for 2026). Check your Yahoo Fantasy league URL for the league number. Your team number is your position in the league (1-based). The Python scripts resolve the game key automatically from `mlb`.

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
      - PORT=4951
    ports:
      - "4951:4951"
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
- **Python API server** (port 8766, internal) - Flask backend calling Yahoo Fantasy API
- **TypeScript MCP server** (port 4951, exposed) - MCP SDK with inline HTML UI apps

## Connecting to Claude

### Claude Code (local, stdio)

The MCP server can run locally via stdio. Add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "fbb-mcp": {
      "command": "npx",
      "args": ["tsx", "mcp-apps/main.ts", "--stdio"],
      "cwd": "/path/to/fbb-mcp",
      "env": {
        "PYTHON_API_URL": "http://localhost:8766"
      }
    }
  }
}
```

The Python API server must be running separately (via Docker or `python scripts/api-server.py`).

### Claude.ai (remote, HTTP)

The Docker container exposes port 4951 with MCP SDK OAuth 2.1 auth. Point a reverse proxy (e.g., Caddy, nginx, Pangolin) at the container, then set `MCP_SERVER_URL` and `MCP_AUTH_PASSWORD` in `.env`. Claude.ai connects to the public URL and prompts for the password on first use.

## Commands

### Yahoo Fantasy CLI
```bash
docker exec fbb-mcp python3 /app/scripts/yahoo-fantasy.py <command>
```
- `info` - League info
- `standings` - League standings
- `roster` - Your roster
- `free-agents B` - Available batters
- `free-agents P` - Available pitchers
- `search <name>` - Search players
- `add <id>` - Add player
- `drop <id>` - Drop player
- `transactions` - Recent transactions
- `stat-categories` - Scoring categories
- `matchup-detail` - Current matchup breakdown

### Season Manager
```bash
docker exec fbb-mcp python3 /app/scripts/season-manager.py <command>
```
- `weekly-report` - Weekly performance report
- `matchup-strategy` - Matchup strategy analysis
- `week-planner` - Weekly lineup planning
- `add-drop-analysis <add_id> [drop_id]` - Evaluate roster moves
- `trade-targets` - Find trade targets
- `daily-briefing` - Daily briefing

### Draft Assistant
```bash
docker exec -it fbb-mcp python3 /app/scripts/draft-assistant.py <command>
```
- `status` - Draft status
- `recommend` - Get pick recommendation
- `watch 30` - Watch draft (30s refresh)
- `cheatsheet` - Quick strategy reference
- `best-available` - Best available players

### Historical Records
```bash
docker exec fbb-mcp python3 /app/scripts/history.py <command>
```
- `league-history` - All-time season results
- `record-book` - All-time records

## Optional Config Files

- `config/league-history.json` - Map of year to league key for historical records
- `config/draft-cheatsheet.json` - Draft strategy and targets (see `.example`)
- `data/player-rankings-YYYY.json` - Hand-curated player rankings (fallback for valuations engine)

## Files

```
fbb-mcp/
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── config/
│   ├── yahoo_oauth.json          # OAuth tokens (gitignored, auto-refreshes)
│   ├── league-history.json       # Optional: historical league keys
│   └── draft-cheatsheet.json     # Optional: draft strategy
├── data/
│   └── player-rankings-YYYY.json # Optional: curated rankings
├── scripts/
│   ├── api-server.py             # Flask API server
│   ├── yahoo-fantasy.py          # League management
│   ├── season-manager.py         # In-season management
│   ├── draft-assistant.py        # Draft day tool
│   ├── history.py                # Historical records
│   ├── intel.py                  # Fantasy intelligence
│   ├── valuations.py             # Z-score valuation engine
│   └── mlb-data.py               # MLB Stats API helper
└── mcp-apps/                     # TypeScript MCP server + UI apps
    ├── src/tools/                # 36+ MCP tool definitions
    ├── src/api/                  # Python API client
    └── ui/                       # 8 inline HTML apps (Preact + Tailwind)
```

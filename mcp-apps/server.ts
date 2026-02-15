import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as path from "path";
import { fileURLToPath } from "url";
import { registerRosterTools } from "./src/tools/roster-tools.js";
import { registerStandingsTools } from "./src/tools/standings-tools.js";
import { registerValuationsTools } from "./src/tools/valuations-tools.js";
import { registerSeasonTools } from "./src/tools/season-tools.js";
import { registerDraftTools } from "./src/tools/draft-tools.js";
import { registerHistoryTools } from "./src/tools/history-tools.js";
import { registerMlbTools } from "./src/tools/mlb-tools.js";
import { registerIntelTools } from "./src/tools/intel-tools.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = __dirname;

export function createServer(): McpServer {
  const server = new McpServer({
    name: "Yahoo Fantasy Baseball",
    version: "1.0.0",
  });

  registerRosterTools(server, DIST_DIR);
  registerStandingsTools(server, DIST_DIR);
  registerValuationsTools(server, DIST_DIR);
  registerSeasonTools(server, DIST_DIR);
  registerDraftTools(server, DIST_DIR);
  registerHistoryTools(server, DIST_DIR);
  registerMlbTools(server, DIST_DIR);
  registerIntelTools(server, DIST_DIR);

  return server;
}

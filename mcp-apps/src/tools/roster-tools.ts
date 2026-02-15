import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAppTool, registerAppResource, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { z } from "zod";
import * as fs from "fs/promises";
import * as path from "path";
import { apiGet, apiPost, toolError } from "../api/python-client.js";
import { str, type RosterResponse, type FreeAgentsResponse, type SearchResponse, type ActionResponse, type WaiverClaimResponse, type WaiverClaimSwapResponse, type WhoOwnsResponse, type ChangeTeamNameResponse, type ChangeTeamLogoResponse } from "../api/types.js";

const ROSTER_URI = "ui://fbb-mcp/roster.html";

export function registerRosterTools(server: McpServer, distDir: string) {
  // Register the app resource for roster UI
  registerAppResource(
    server,
    "Roster View",
    ROSTER_URI,
    {
      description: "Interactive roster management view",
      _meta: {
        ui: {
          csp: {
            resourceDomains: [
              "img.mlbstatic.com",
              "securea.mlb.com",
            ],
          },
          permissions: { clipboardWrite: {} },
          prefersBorder: true,
        },
      },
    },
    async () => ({
      contents: [{
        uri: ROSTER_URI,
        mimeType: RESOURCE_MIME_TYPE,
        text: await fs.readFile(path.join(distDir, "roster.html"), "utf-8"),
      }],
    }),
  );

  // yahoo_roster
  registerAppTool(
    server,
    "yahoo_roster",
    {
      description: "Show current fantasy baseball roster with positions and eligibility",
      _meta: { ui: { resourceUri: ROSTER_URI } },
    },
    async () => {
      try {
        const data = await apiGet<RosterResponse>("/api/roster");
        const text = "Current Roster:\n" + data.players.map((p) => {
          let line = "  " + str(p.position || "?").padEnd(4) + " " + str(p.name).padEnd(25) + " " + (p.eligible_positions || []).join(",")
            + (p.status ? " [" + p.status + "]" : "");
          if (p.intel && p.intel.statcast && p.intel.statcast.quality_tier) {
            line += " {" + p.intel.statcast.quality_tier + "}";
          }
          if (p.intel && p.intel.trends && p.intel.trends.hot_cold && p.intel.trends.hot_cold !== "neutral") {
            line += " [" + p.intel.trends.hot_cold + "]";
          }
          return line;
        }).join("\n");
        return {
          content: [{ type: "text" as const, text }],
          structuredContent: { type: "roster", ...data },
        };
      } catch (e) { return toolError(e); }
    },
  );

  // yahoo_free_agents
  registerAppTool(
    server,
    "yahoo_free_agents",
    {
      description: "List top free agents. pos_type: B for batters, P for pitchers",
      inputSchema: { pos_type: z.string().default("B"), count: z.number().default(20) },
      _meta: { ui: { resourceUri: ROSTER_URI } },
    },
    async ({ pos_type, count }) => {
      try {
        const data = await apiGet<FreeAgentsResponse>("/api/free-agents", { pos_type, count: String(count) });
        const label = pos_type === "B" ? "Batters" : "Pitchers";
        const text = "Top " + count + " Free Agent " + label + ":\n" + data.players.map((p) => {
          let line = "  " + str(p.name).padEnd(25) + " " + str(p.positions || "?").padEnd(12) + " " + String(p.percent_owned || 0).padStart(3) + "% owned  (id:" + p.player_id + ")";
          if (p.intel && p.intel.statcast && p.intel.statcast.quality_tier) {
            line += " {" + p.intel.statcast.quality_tier + "}";
          }
          if (p.intel && p.intel.trends && p.intel.trends.hot_cold && p.intel.trends.hot_cold !== "neutral") {
            line += " [" + p.intel.trends.hot_cold + "]";
          }
          return line;
        }).join("\n");
        return {
          content: [{ type: "text" as const, text }],
          structuredContent: { type: "free-agents", ...data },
        };
      } catch (e) { return toolError(e); }
    },
  );

  // yahoo_search
  registerAppTool(
    server,
    "yahoo_search",
    {
      description: "Search for a player by name among free agents",
      inputSchema: { player_name: z.string() },
      _meta: { ui: { resourceUri: ROSTER_URI } },
    },
    async ({ player_name }) => {
      try {
        const data = await apiGet<SearchResponse>("/api/search", { name: player_name });
        const text = data.results && data.results.length > 0
          ? "Free agents matching: " + player_name + "\n" + data.results.map((p) =>
              "  " + str(p.name).padEnd(25) + " " + (p.eligible_positions || []).join(",").padEnd(12) + " " + String(p.percent_owned || 0).padStart(3) + "% owned  (id:" + p.player_id + ")"
            ).join("\n")
          : "No free agents found matching: " + player_name;
        return {
          content: [{ type: "text" as const, text }],
          structuredContent: { type: "search", ...data },
        };
      } catch (e) { return toolError(e); }
    },
  );

  // yahoo_add
  registerAppTool(
    server,
    "yahoo_add",
    {
      description: "Add a free agent to your roster by player ID",
      inputSchema: { player_id: z.string() },
      _meta: { ui: { resourceUri: ROSTER_URI } },
    },
    async ({ player_id }) => {
      try {
        const data = await apiPost<ActionResponse>("/api/add", { player_id });
        return {
          content: [{ type: "text" as const, text: data.message || "Add result: " + JSON.stringify(data) }],
          structuredContent: { type: "add", ...data },
        };
      } catch (e) { return toolError(e); }
    },
  );

  // yahoo_drop
  registerAppTool(
    server,
    "yahoo_drop",
    {
      description: "Drop a player from your roster by player ID",
      inputSchema: { player_id: z.string() },
      _meta: { ui: { resourceUri: ROSTER_URI } },
    },
    async ({ player_id }) => {
      try {
        const data = await apiPost<ActionResponse>("/api/drop", { player_id });
        return {
          content: [{ type: "text" as const, text: data.message || "Drop result: " + JSON.stringify(data) }],
          structuredContent: { type: "drop", ...data },
        };
      } catch (e) { return toolError(e); }
    },
  );

  // yahoo_swap
  registerAppTool(
    server,
    "yahoo_swap",
    {
      description: "Atomic add+drop swap: add one player and drop another",
      inputSchema: { add_id: z.string(), drop_id: z.string() },
      _meta: { ui: { resourceUri: ROSTER_URI } },
    },
    async ({ add_id, drop_id }) => {
      try {
        const data = await apiPost<ActionResponse>("/api/swap", { add_id, drop_id });
        return {
          content: [{ type: "text" as const, text: data.message || "Swap result: " + JSON.stringify(data) }],
          structuredContent: { type: "swap", ...data },
        };
      } catch (e) { return toolError(e); }
    },
  );

  // yahoo_waiver_claim
  registerAppTool(
    server,
    "yahoo_waiver_claim",
    {
      description: "Submit a waiver claim with optional FAAB bid. Use for players on waivers (not free agents).",
      inputSchema: { player_id: z.string(), faab: z.number().optional() },
      _meta: { ui: { resourceUri: ROSTER_URI } },
    },
    async ({ player_id, faab }) => {
      try {
        const body: Record<string, string> = { player_id };
        if (faab !== undefined) body.faab = String(faab);
        const data = await apiPost<WaiverClaimResponse>("/api/waiver-claim", body);
        return {
          content: [{ type: "text" as const, text: data.message || "Waiver claim result: " + JSON.stringify(data) }],
          structuredContent: { type: "waiver-claim", ...data },
        };
      } catch (e) { return toolError(e); }
    },
  );

  // yahoo_waiver_claim_swap
  registerAppTool(
    server,
    "yahoo_waiver_claim_swap",
    {
      description: "Submit a waiver claim + drop with optional FAAB bid",
      inputSchema: { add_id: z.string(), drop_id: z.string(), faab: z.number().optional() },
      _meta: { ui: { resourceUri: ROSTER_URI } },
    },
    async ({ add_id, drop_id, faab }) => {
      try {
        const body: Record<string, string> = { add_id, drop_id };
        if (faab !== undefined) body.faab = String(faab);
        const data = await apiPost<WaiverClaimSwapResponse>("/api/waiver-claim-swap", body);
        return {
          content: [{ type: "text" as const, text: data.message || "Waiver claim+drop result: " + JSON.stringify(data) }],
          structuredContent: { type: "waiver-claim-swap", ...data },
        };
      } catch (e) { return toolError(e); }
    },
  );

  // yahoo_browser_status
  registerAppTool(
    server,
    "yahoo_browser_status",
    {
      description: "Check if the browser session for write operations (add, drop, trade, etc.) is valid. If not valid, user needs to run './yf browser-login'.",
      _meta: { ui: { resourceUri: ROSTER_URI } },
    },
    async () => {
      try {
        const data = await apiGet<{ valid: boolean; reason?: string; cookie_count?: number }>("/api/browser-login-status");
        const text = data.valid
          ? "Browser session is valid (" + (data.cookie_count || 0) + " Yahoo cookies)"
          : "Browser session not valid: " + (data.reason || "unknown") + ". Run './yf browser-login' to set up.";
        return {
          content: [{ type: "text" as const, text }],
          structuredContent: { type: "browser-status", ...data },
        };
      } catch (e) { return toolError(e); }
    },
  );

  // yahoo_change_team_name
  registerAppTool(
    server,
    "yahoo_change_team_name",
    {
      description: "Change your fantasy team name",
      inputSchema: { new_name: z.string() },
      _meta: { ui: { resourceUri: ROSTER_URI } },
    },
    async ({ new_name }) => {
      try {
        const data = await apiPost<ChangeTeamNameResponse>("/api/change-team-name", { new_name });
        return {
          content: [{ type: "text" as const, text: data.message || "Result: " + JSON.stringify(data) }],
          structuredContent: { type: "change-team-name", ...data },
        };
      } catch (e) { return toolError(e); }
    },
  );

  // yahoo_change_team_logo
  registerAppTool(
    server,
    "yahoo_change_team_logo",
    {
      description: "Change your fantasy team logo. Provide an absolute file path to an image (PNG/JPG) inside the container.",
      inputSchema: { image_path: z.string() },
      _meta: { ui: { resourceUri: ROSTER_URI } },
    },
    async ({ image_path }) => {
      try {
        const data = await apiPost<ChangeTeamLogoResponse>("/api/change-team-logo", { image_path });
        return {
          content: [{ type: "text" as const, text: data.message || "Result: " + JSON.stringify(data) }],
          structuredContent: { type: "change-team-logo", ...data },
        };
      } catch (e) { return toolError(e); }
    },
  );

  // yahoo_who_owns
  registerAppTool(
    server,
    "yahoo_who_owns",
    {
      description: "Check who owns a specific player by player ID",
      inputSchema: { player_id: z.string() },
      _meta: { ui: { resourceUri: ROSTER_URI } },
    },
    async ({ player_id }) => {
      try {
        const data = await apiGet<WhoOwnsResponse>("/api/who-owns", { player_id });
        let text = "";
        if (data.ownership_type === "team") {
          text = "Player " + player_id + " is owned by: " + data.owner;
        } else if (data.ownership_type === "freeagents") {
          text = "Player " + player_id + " is a free agent";
        } else if (data.ownership_type === "waivers") {
          text = "Player " + player_id + " is on waivers";
        } else {
          text = "Player " + player_id + " ownership: " + data.ownership_type;
        }
        return {
          content: [{ type: "text" as const, text }],
          structuredContent: { type: "who-owns", ...data },
        };
      } catch (e) { return toolError(e); }
    },
  );
}

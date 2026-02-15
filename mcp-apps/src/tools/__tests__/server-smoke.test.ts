import { describe, it, expect } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createServer } from "../../../server.js";

describe("createServer", () => {
  it("returns an McpServer instance without throwing", () => {
    const server = createServer();
    expect(server).toBeInstanceOf(McpServer);
  });
});

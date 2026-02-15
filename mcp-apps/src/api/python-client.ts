const API_BASE = process.env.PYTHON_API_URL || "http://localhost:8766";

export function toolError(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  return {
    content: [{ type: "text" as const, text: "Error: " + msg }],
    structuredContent: { type: "_error", message: msg },
    isError: true as const,
  };
}

export async function apiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(path, API_BASE);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, value);
      }
    }
  }
  const response = await fetch(url.toString());
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error("API error: " + response.status + " " + response.statusText + (body ? " - " + body : ""));
  }
  return response.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: Record<string, string>): Promise<T> {
  const url = new URL(path, API_BASE);
  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error("API error: " + response.status + " " + response.statusText + (text ? " - " + text : ""));
  }
  return response.json() as Promise<T>;
}

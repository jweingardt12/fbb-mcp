import { useState, useCallback } from "react";

interface UseCallToolReturn {
  callTool: (name: string, args?: Record<string, any>) => Promise<any>;
  loading: boolean;
  error: string | null;
}

export function useCallTool(app: any): UseCallToolReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callTool = useCallback(async (name: string, args?: Record<string, any>) => {
    if (!app) {
      setError("App context not available");
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await app.callServerTool({ name, arguments: args || {} });
      return result;
    } catch (err: any) {
      const msg = err && err.message ? err.message : String(err);
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [app]);

  return { callTool, loading, error };
}

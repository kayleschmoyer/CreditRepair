import { maskAccountNumbers } from "./ai/guards";
// @ts-ignore - Deno global is available in edge runtime
declare const Deno: any;

export interface LogEntry {
  requestId: string;
  userId: string | null;
  functionName: string;
  durationMs: number;
  result: "ok" | "error";
}

const logStore: LogEntry[] = [];

export function log(entry: LogEntry) {
  logStore.push(entry);
  console.log(JSON.stringify(entry));
}

export function getLogsForUser(userId: string): LogEntry[] {
  return logStore.filter((l) => l.userId === userId);
}

export function withEdgeLogging(
  functionName: string,
  handler: (
    req: Request,
  ) => Promise<{ response: Response; userId?: string | null }>,
) {
  return async (req: Request): Promise<Response> => {
    const requestId = req.headers.get("x-request-id") ?? crypto.randomUUID();
    const start = Date.now();
    try {
      const { response, userId } = await handler(req);
      const durationMs = Date.now() - start;
      log({
        requestId,
        userId: userId ?? null,
        functionName,
        durationMs,
        result: "ok",
      });
      return response;
    } catch (e) {
      const durationMs = Date.now() - start;
      log({
        requestId,
        userId: null,
        functionName,
        durationMs,
        result: "error",
      });
      console.error(
        maskAccountNumbers(e instanceof Error ? e.message : String(e)),
      );
      if (
        functionName.startsWith("cron") &&
        Deno.env.get("CRON_ALERT_WEBHOOK")
      ) {
        try {
          await fetch(Deno.env.get("CRON_ALERT_WEBHOOK")!, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              function: functionName,
              error: e instanceof Error ? e.message : String(e),
            }),
          });
        } catch (alertErr) {
          console.error("Failed to send cron alert", alertErr);
        }
      }
      return new Response(
        JSON.stringify({
          ok: false,
          error: {
            code: "SERVER_ERROR",
            message: e instanceof Error ? e.message : "Server error",
          },
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  };
}

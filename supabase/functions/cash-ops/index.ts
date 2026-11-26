import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, traceparent",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startedAt = performance.now();
  const url = new URL(req.url);
  const incomingTrace = req.headers.get("traceparent");
  const traceId = incomingTrace?.split("-")[1] || crypto.randomUUID().replaceAll("-", "");
  const spanId = crypto.randomUUID().replaceAll("-", "").slice(0, 16);
  const traceparent = `00-${traceId}-${spanId}-01`;

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";

    const client = createClient(supabaseUrl, anonKey, {
      global: { headers: authHeader ? { Authorization: authHeader } : {} },
    });

    // Safe health ping via non-PII merchants count / auth check
    const { error: dbErr } = await client.from("merchants").select("id", { count: "exact", head: true });
    const latencyMs = Math.round(performance.now() - startedAt);

    const payload = {
      status: dbErr ? "degraded" : "healthy",
      service: "cash-ops-edge",
      region: Deno.env.get("DENO_REGION") || "edge",
      timestamp: new Date().toISOString(),
      db_reachable: !dbErr,
      latency_ms: latencyMs,
      traceparent,
      route: url.pathname,
    };

    return new Response(JSON.stringify(payload), {
      status: dbErr ? 503 : 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "traceparent": traceparent,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        status: "error",
        error: err instanceof Error ? err.message : "Unexpected health error",
        traceparent,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "traceparent": traceparent,
        },
      }
    );
  }
});

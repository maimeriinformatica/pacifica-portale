// =====================================================================
//  Edge Function "ia" — motore IA della Biblioteca Audio
//  Deploy:  supabase functions deploy ia
//  Segreto: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
//  Il frontend (db.js -> DB.ai) invia { system, prompt } e riceve { text }.
//  La chiave API resta sul server: non viene mai esposta al browser.
// =====================================================================
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const { system, prompt } = await req.json();
    const key = Deno.env.get("ANTHROPIC_API_KEY");
    if (!key) return json({ error: "ANTHROPIC_API_KEY non configurata" }, 500);

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: system ?? "Sei un assistente colto e conciso.",
        messages: [{ role: "user", content: String(prompt ?? "") }],
      }),
    });
    const data = await r.json();
    const text = (data.content ?? [])
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("\n")
      .trim();
    return json({ text });
  } catch (e) {
    return json({ error: String(e?.message ?? e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "content-type": "application/json" },
  });
}

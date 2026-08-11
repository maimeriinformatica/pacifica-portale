// =====================================================================
//  Edge Function "rassegna" — scarica un feed RSS/Atom e ne salva le voci.
//  Deploy:  supabase functions deploy rassegna
//
//  IL FEED E' CONTENUTO DI TERZI: non ci si fida mai.
//  - Si estraggono solo titolo, link, data, sommario e un'eventuale immagine.
//  - Il testo viene RIPULITO da ogni tag prima di uscire: la pagina del
//    portale non incorpora l'HTML del feed. Cosi' un feed compromesso non
//    puo' iniettare script o markup sul dominio de La Pacifica.
//  - Gli URL sono accettati solo se http(s): niente javascript:, data:...
//
//  Chiamata dal frontend (presidenza) o da uno scheduler:
//    POST { fonte_id }         -> usa l'URL salvato in `fonti`
//  Richiede un token di utente presidenza (la RPC importa_notizie lo verifica).
// =====================================================================
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const body = await req.json().catch(() => ({}));
    const fonte_id = body.fonte_id;
    const tutte = body.tutte === true;

    // Via del CRON: chiave segreta condivisa (CRON_SECRET nei secrets della
    // funzione). Il cron non ha un utente: con la chiave giusta usa il
    // client di servizio; ogni altra chiamata resta legata al token utente.
    const secret = Deno.env.get("CRON_SECRET") || "";
    const cronOk = !!secret && (req.headers.get("x-cron-key") || "") === secret;
    const sb = cronOk
      ? createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!)
      : createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!,
          { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } },
        );

    if (!fonte_id && !tutte) return json({ error: "fonte_id mancante" }, 400);
    if (tutte && !cronOk) return json({ error: "Sincronizzazione totale riservata al cron" }, 403);

    let fonti: { id: string; url: string }[] = [];
    if (tutte) {
      const { data } = await sb.from("fonti").select("id,url").eq("attiva", true);
      fonti = data ?? [];
    } else {
      const { data: fonte, error: e1 } = await sb.from("fonti")
        .select("id,url,attiva").eq("id", fonte_id).single();
      if (e1 || !fonte) return json({ error: "Fonte inesistente" }, 404);
      fonti = [fonte];
    }

    let importate = 0, lette = 0;
    const errori: string[] = [];
    for (const fonte of fonti) {
      try {
        const res = await fetch(fonte.url, { headers: { "user-agent": "PacificaRassegna/1.0" } });
        if (!res.ok) throw new Error(`feed irraggiungibile (${res.status})`);
        const items = parseFeed(await res.text()).slice(0, 40);
        if (!items.length) throw new Error("nessuna voce nel feed");
        const { data: n, error: e2 } = await sb.rpc("importa_notizie", {
          p_fonte: fonte.id, p_items: items,
        });
        if (e2) throw new Error(e2.message);
        importate += n ?? 0; lette += items.length;
      } catch (e) {
        errori.push(`${fonte.id}: ${String((e as Error)?.message ?? e)}`);
      }
    }
    if (fonti.length === 1 && errori.length === 1) return json({ error: errori[0].split(": ").slice(1).join(": ") }, 502);
    return json({ importate, lette, fonti: fonti.length, errori });
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});

// ---- estrazione: RSS <item> e Atom <entry> ---------------------------
function parseFeed(xml: string) {
  const blocks = matchAll(xml, /<(item|entry)\b[\s\S]*?<\/\1>/gi);
  return blocks.map((b) => {
    const link = pickLink(b);
    const rawGuid = clean(tag(b, "guid") || tag(b, "id"));   // guid/id dichiarato dal feed
    return {
      // un guid esplicito va bene comunque; in mancanza, solo un link http(s)
      guid: rawGuid || safeUrl(link),
      titolo: clean(tag(b, "title")),
      url: safeUrl(link),
      sommario: clean(tag(b, "description") || tag(b, "summary") || tag(b, "content")).slice(0, 400),
      data: isoDate(tag(b, "pubDate") || tag(b, "published") || tag(b, "updated") || tag(b, "dc:date")),
      immagine: safeUrl(pickImage(b)),
    };
  }).filter((x) => x.guid && x.titolo);   // un link non sicuro svuota x.url, non scarta la voce
}

function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"));
  return m ? m[1] : "";
}
function pickLink(b: string): string {
  const href = b.match(/<link\b[^>]*\bhref=["']([^"']+)["']/i);   // Atom
  if (href) return href[1];
  return tag(b, "link");                                          // RSS
}
function pickImage(b: string): string {
  const m = b.match(/<(?:media:content|media:thumbnail|enclosure)\b[^>]*\burl=["']([^"']+)["']/i);
  return m ? m[1] : "";
}

// ---- ripulitura: qui sta la sicurezza -------------------------------
function clean(s: string): string {
  if (!s) return "";
  s = s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");   // via il wrapper CDATA
  s = s.replace(/<[^>]+>/g, " ");                       // via OGNI tag: niente HTML del feed
  s = s.replace(/&lt;[^&]*&gt;/g, " ");                 // via tag doppiamente codificati
  s = decodeEntities(s);
  return s.replace(/\s+/g, " ").trim();
}
function decodeEntities(s: string): string {
  const map: Record<string, string> = {
    "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&apos;": "'", "&nbsp;": " ",
  };
  return s.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&apos;|&nbsp;/g, (m) => map[m])
          .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
          .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)));
}
function safeUrl(u: string): string {
  u = clean(u);
  return /^https?:\/\//i.test(u) ? u : "";             // solo http(s)
}
function isoDate(s: string): string {
  const d = new Date(clean(s));
  return isNaN(d.getTime()) ? "" : d.toISOString();
}
function matchAll(s: string, re: RegExp): string[] {
  const out: string[] = []; let m;
  while ((m = re.exec(s)) !== null) out.push(m[0]);
  return out;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...CORS, "content-type": "application/json" },
  });
}

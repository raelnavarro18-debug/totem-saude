/* =====================================================================
   worker.js — Servidor intermediário (Cloudflare Worker, grátis)
   ---------------------------------------------------------------------
   Por que existe: a API da z.ai não aceita chamadas com chave vindas
   direto do navegador (bloqueio de CORS). Este Worker:
     1. recebe a pergunta do totem,
     2. coloca a chave (guardada como SEGREDO no Cloudflare),
     3. repassa para a z.ai e devolve a resposta.
   Vantagem extra: a chave NUNCA fica no tablet nem no GitHub.

   Configuração no painel do Cloudflare (Workers > seu worker > Settings):
     - Variables and Secrets > Add > tipo "Secret":
         ZAI_KEY        = a chave da z.ai
     - (opcional) Variável de texto:
         ORIGENS        = https://SEU-USUARIO.github.io,http://localhost:8765
   ===================================================================== */

const ZAI_URL = "https://api.z.ai/api/paas/v4/chat/completions";
const MODELOS_PERMITIDOS = ["glm-4.5-flash"];
const MAX_MENSAGENS = 12;
const MAX_CARACTERES = 6000;

export default {
  async fetch(request, env) {
    const origem = request.headers.get("Origin") || "";
    const permitidas = (env.ORIGENS || "").split(",").map((s) => s.trim()).filter(Boolean);
    const origemOk = permitidas.length === 0 || permitidas.includes(origem);

    const cors = {
      "Access-Control-Allow-Origin": origemOk ? origem || "*" : "null",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    };

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return resposta({ erro: "use POST" }, 405, cors);
    if (!origemOk) return resposta({ erro: "origem não permitida" }, 403, cors);
    if (!env.ZAI_KEY) return resposta({ erro: "ZAI_KEY não configurada no Worker" }, 500, cors);

    let corpo;
    try {
      corpo = await request.json();
    } catch {
      return resposta({ erro: "JSON inválido" }, 400, cors);
    }

    // Proteções contra abuso: limita tamanho, modelo e tokens
    const mensagens = Array.isArray(corpo.messages) ? corpo.messages.slice(-MAX_MENSAGENS) : [];
    if (!mensagens.length || JSON.stringify(mensagens).length > MAX_CARACTERES) {
      return resposta({ erro: "mensagem vazia ou grande demais" }, 400, cors);
    }
    const modelo = MODELOS_PERMITIDOS.includes(corpo.model) ? corpo.model : MODELOS_PERMITIDOS[0];

    const r = await fetch(ZAI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.ZAI_KEY}` },
      body: JSON.stringify({
        model: modelo,
        messages: mensagens,
        temperature: typeof corpo.temperature === "number" ? corpo.temperature : 0.4,
        max_tokens: Math.min(Number(corpo.max_tokens) || 600, 800),
        thinking: { type: "disabled" },
      }),
    });

    return new Response(await r.text(), {
      status: r.status,
      headers: { ...cors, "Content-Type": "application/json; charset=utf-8" },
    });
  },
};

function resposta(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json; charset=utf-8" },
  });
}

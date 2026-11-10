/* =====================================================================
   ia.js — Conversa com a IA (z.ai / GLM)
   ---------------------------------------------------------------------
   O navegador NÃO fala direto com a z.ai (ela bloqueia por CORS).
   Ele fala com o nosso servidor intermediário (servidor/worker.js),
   que guarda a chave em segredo. O endereço do servidor é colocado
   no painel secreto (toque 5x no logo).
   Se não houver internet ou servidor, usa respostaOffline() (Plano B).
   ===================================================================== */

const CONFIG_PADRAO = {
  endpoint: "", // ex.: https://totem-ia.SEU-USUARIO.workers.dev
  modelo: "glm-4.5-flash",
  inatividade: 60, // segundos parado até voltar ao início
};

function lerConfig() {
  try {
    return { ...CONFIG_PADRAO, ...JSON.parse(localStorage.getItem("totem_config") || "{}") };
  } catch {
    return { ...CONFIG_PADRAO };
  }
}

function salvarConfig(cfg) {
  try { localStorage.setItem("totem_config", JSON.stringify(cfg)); } catch {}
}

// ---------- O PROMPT (etapa 4 do roteiro) ----------
const PROMPT_SISTEMA = `Você é a assistente virtual do "Posto de Saúde Solidário", uma SIMULAÇÃO criada por estudantes do ensino médio para uma feira de ciências com o tema "IA e solidariedade".

Cenário: um posto de saúde de uma comunidade isolada, sem médico especialista por perto. Você apoia o AGENTE COMUNITÁRIO DE SAÚDE a orientar as pessoas. Você NÃO substitui o profissional de saúde.

Regras obrigatórias:
1. NUNCA dê diagnóstico. Use expressões como "pode estar ligado a", "entre as possibilidades".
2. NUNCA indique remédios, doses ou tratamentos específicos. Pode dar cuidados gerais (beber água, descansar, não se automedicar).
3. Se houver qualquer sinal de alerta (falta de ar, febre muito alta, confusão, sonolência excessiva, dor no peito, sangramento, desmaio, convulsão, manchas roxas), comece a resposta com "⚠️ ATENÇÃO" e oriente procurar atendimento com urgência ou ligar para o SAMU 192.
4. Linguagem simples, acolhedora, em português do Brasil, para qualquer pessoa entender.
5. Resposta CURTA (no máximo 120 palavras). Cada item de lista em uma LINHA NOVA começando com "- ". Use este formato:
   **Possibilidades:** (1 ou 2 linhas)
   **O agente de saúde deve observar:** (2 ou 3 itens com "- ")
   **Cuidados gerais:** (1 ou 2 itens com "- ")
   **Quando procurar atendimento:** (1 linha)
6. Termine sempre com: "_Só um profissional de saúde pode fazer o diagnóstico._"
7. Se a pessoa digitar dados pessoais (nome completo, CPF, endereço, telefone), não repita esses dados e lembre que é uma simulação e não se deve informar dados reais.
8. Se o assunto não for saúde, responda com gentileza que você só conversa sobre a mini consulta do posto.`;

// Histórico curto da conversa (para a IA lembrar do contexto)
let historico = [];

function iniciarConversa(contextoConsulta) {
  historico = [];
  if (contextoConsulta) {
    historico.push({
      role: "user",
      content: `Contexto da mini consulta que o visitante acabou de fazer (dados fictícios): ${contextoConsulta}`,
    });
    historico.push({ role: "assistant", content: "Entendido. Vou considerar esse contexto nas próximas respostas." });
  }
}

/**
 * Envia a pergunta para a IA.
 * Retorna { texto, online } — online=false quando usou o Plano B.
 */
async function perguntarIA(pergunta) {
  const cfg = lerConfig();
  historico.push({ role: "user", content: pergunta });

  if (!cfg.endpoint || !navigator.onLine) {
    const texto = respostaOffline(pergunta);
    historico.push({ role: "assistant", content: texto });
    return { texto, online: false };
  }

  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), 25000); // 25 s no máximo

  const chamar = () =>
    fetch(cfg.endpoint, {
      method: "POST",
      signal: controle.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: cfg.modelo,
        messages: [{ role: "system", content: PROMPT_SISTEMA }, ...historico.slice(-8)],
        temperature: 0.4,
        max_tokens: 600,
      }),
    });

  try {
    let resp = await chamar();
    // 429 = "muitas perguntas ao mesmo tempo" (limite do plano grátis).
    // Espera 2 s e tenta mais uma vez antes de usar o Plano B.
    if (resp.status === 429) {
      await new Promise((r) => setTimeout(r, 2000));
      resp = await chamar();
    }
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const dados = await resp.json();
    const texto = dados.choices?.[0]?.message?.content?.trim();
    if (!texto) throw new Error("resposta vazia");
    historico.push({ role: "assistant", content: texto });
    return { texto, online: true };
  } catch (erro) {
    console.warn("IA indisponível, usando Plano B:", erro);
    const texto = respostaOffline(pergunta);
    historico.push({ role: "assistant", content: texto });
    return { texto, online: false };
  } finally {
    clearTimeout(timer);
  }
}

/** Teste rápido usado no painel secreto. */
async function testarConexao(cfg) {
  try {
    const resp = await fetch(cfg.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: cfg.modelo,
        messages: [{ role: "user", content: "Responda apenas: ok" }],
        max_tokens: 10,
      }),
    });
    if (!resp.ok) {
      const corpo = await resp.text();
      return { ok: false, msg: `Erro ${resp.status}: ${corpo.slice(0, 160)}` };
    }
    return { ok: true, msg: "Conexão OK! A IA está respondendo." };
  } catch (e) {
    return { ok: false, msg: "Sem conexão: " + e.message };
  }
}

/* ---------- Formatação segura do texto da IA ----------
   Escapa HTML (segurança) e converte **negrito**, _itálico_ e listas. */
function formatarTexto(texto) {
  const esc = texto
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    // itens que vieram na mesma linha ("...: - a; - b") viram linhas separadas
    .replace(/(:|;)\s+-\s+/g, "$1\n- ");
  const linhas = esc.split("\n");
  let html = "";
  let emLista = false;
  for (let linha of linhas) {
    linha = linha
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|\s)_(.+?)_(?=\s|$|[.,!?])/g, "$1<em>$2</em>");
    const item = linha.match(/^\s*[-•*]\s+(.*)/);
    if (item) {
      if (!emLista) { html += "<ul>"; emLista = true; }
      html += `<li>${item[1]}</li>`;
    } else {
      if (emLista) { html += "</ul>"; emLista = false; }
      if (linha.trim()) html += `<p>${linha}</p>`;
    }
  }
  if (emLista) html += "</ul>";
  return html;
}

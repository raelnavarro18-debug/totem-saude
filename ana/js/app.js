/* =====================================================================
   app.js — Navegação entre telas e lógica do totem
   ===================================================================== */

const $ = (sel) => document.querySelector(sel);

// ---------- Estado da consulta atual ----------
let estado = novoEstado();
function novoEstado() {
  return { passo: 0, respostas: {}, caso: null, contada: false, orientacao: null };
}

// ---------- Troca de tela ----------
let telaAtual = "inicio";
function mostrarTela(nome) {
  document.querySelectorAll(".tela").forEach((t) => t.classList.toggle("ativa", t.dataset.tela === nome));
  telaAtual = nome;
  const tela = document.querySelector(`[data-tela="${nome}"]`);
  if (tela) tela.scrollTop = 0;
}

/* =====================================================================
   INÍCIO
   ===================================================================== */
function montarInicio() {
  const lista = $("#listaCasos");
  lista.innerHTML = "";
  CASOS.forEach((caso) => {
    const b = document.createElement("button");
    b.className = "caso";
    b.innerHTML = `<span class="caso-icone">${caso.icone}</span><span><strong>${caso.titulo}</strong><small>${caso.descricao} · caso fictício</small></span>`;
    b.addEventListener("click", () => abrirCaso(caso));
    lista.appendChild(b);
  });
  $("#mapaSvg").innerHTML = MAPA_SVG;
  atualizarPlacar(false);
}

function abrirCaso(caso) {
  estado = novoEstado();
  estado.caso = caso;
  estado.respostas = { ...caso.respostas };
  mostrarResumo();
}

/* =====================================================================
   PERGUNTAS
   ===================================================================== */
function desenharProgresso(el, passo) {
  el.innerHTML = PERGUNTAS.map((_, i) => `<span class="${i <= passo ? "feito" : ""}"></span>`).join("");
}

function mostrarPergunta(passo) {
  estado.passo = passo;
  const p = PERGUNTAS[passo];
  desenharProgresso($("#progresso"), passo);
  $("#perguntaTitulo").textContent = `${passo + 1}. ${p.titulo}`;
  $("#perguntaSub").textContent = p.subtitulo || "";

  const box = $("#opcoes");
  box.innerHTML = "";
  const atual = estado.respostas[p.id];

  p.opcoes.forEach((op) => {
    const b = document.createElement("button");
    b.className = "opcao";
    b.innerHTML = `<span class="emoji">${op.icone}</span><span>${op.rotulo}</span>`;
    const marcada = p.multipla ? (atual || []).includes(op.valor) : atual === op.valor;
    if (marcada) b.classList.add("marcada");
    b.addEventListener("click", () => escolher(p, op, b));
    box.appendChild(b);
  });

  $("#btnContinuar").classList.toggle("escondido", !(p.multipla && (atual || []).length));
  mostrarTela("pergunta");
}

function escolher(p, op, botao) {
  if (p.multipla) {
    let lista = estado.respostas[p.id] || [];
    if (op.exclusiva) {
      lista = lista.includes(op.valor) ? [] : [op.valor];
    } else {
      lista = lista.filter((v) => !p.opcoes.find((o) => o.valor === v)?.exclusiva);
      lista = lista.includes(op.valor) ? lista.filter((v) => v !== op.valor) : [...lista, op.valor];
    }
    estado.respostas[p.id] = lista;
    mostrarPergunta(estado.passo); // redesenha marcações
    return;
  }

  // Escolha única: marca e avança sozinho
  estado.respostas[p.id] = op.valor;
  document.querySelectorAll(".opcao").forEach((b) => b.classList.remove("marcada"));
  botao.classList.add("marcada");

  setTimeout(() => {
    if (p.id === "sintoma" && op.valor === "outro") {
      desenharProgresso($("#progressoOutro"), estado.passo);
      $("#campoOutro").value = estado.respostas.textoOutro || "";
      mostrarTela("outro");
      setTimeout(() => $("#campoOutro").focus(), 300);
    } else {
      avancar();
    }
  }, 280);
}

function avancar() {
  if (estado.passo < PERGUNTAS.length - 1) mostrarPergunta(estado.passo + 1);
  else mostrarResumo();
}

function voltar() {
  if (telaAtual === "outro") return mostrarPergunta(1);
  if (telaAtual === "pergunta" && estado.passo > 0) return mostrarPergunta(estado.passo - 1);
  mostrarTela("inicio");
}

/* =====================================================================
   RESUMO
   ===================================================================== */
function lista(itens) {
  return `<ul>${itens.map((i) => `<li>${escapar(i)}</li>`).join("")}</ul>`;
}
function escapar(t) {
  return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function mostrarResumo() {
  const o = gerarOrientacao(estado.respostas, estado.caso?.extras);
  estado.orientacao = o;

  $("#alertaUrgente").classList.toggle("escondido", !o.urgente);
  $("#resumoTexto").textContent = o.resumo;

  $("#cartoes").innerHTML = `
    <div class="cartao c-possib">
      <h3>🔎 Possibilidades</h3>
      ${lista(o.possibilidades.slice(0, 4))}
      <p class="nao-diag">São apenas possibilidades, não um diagnóstico.</p>
    </div>
    <div class="cartao c-pergunta">
      <h3>📋 O agente de saúde deve perguntar</h3>
      ${lista(o.perguntas.slice(0, 5))}
    </div>
    <div class="cartao c-cuidado">
      <h3>💧 Cuidados gerais</h3>
      ${lista(o.cuidados.slice(0, 4))}
      ${o.nota ? `<p class="nao-diag">${escapar(o.nota)}</p>` : ""}
    </div>
    <div class="cartao c-quando ${o.urgente ? "urgente" : ""}">
      <h3>🚑 Quando procurar atendimento</h3>
      <p><strong>${escapar(o.quandoProcurar)}</strong></p>
      <p style="margin-top:8px">${escapar(o.alertaExtra)}</p>
    </div>`;

  mostrarTela("resumo");
}

/* =====================================================================
   CHAT LIVRE COM A IA
   ===================================================================== */
const SUGESTOES = [
  "manchas vermelhas e febre",
  "tosse há 3 semanas",
  "febre e dor atrás dos olhos",
  "dor de cabeça e enjoo",
];

let aguardandoIA = false;

function abrirChat() {
  const o = estado.orientacao;
  iniciarConversa(o ? o.resumo : null);
  $("#chatMensagens").innerHTML = "";
  $("#btnVoltarResumo").classList.toggle("escondido", !o);

  const sug = estado.caso ? [estado.caso.textoLivre, ...SUGESTOES.filter((s) => s !== estado.caso.textoLivre)] : SUGESTOES;
  $("#chatSugestoes").innerHTML = "";
  sug.slice(0, 4).forEach((s) => {
    const b = document.createElement("button");
    b.className = "sugestao";
    b.type = "button";
    b.textContent = s;
    b.addEventListener("click", () => enviarMensagem(s));
    $("#chatSugestoes").appendChild(b);
  });

  adicionarMsg("ia", "Olá! Sou a assistente do posto. 💬 Descreva o sintoma com suas palavras ou toque em um exemplo abaixo.", null);
  mostrarTela("chat");
}

function adicionarMsg(quem, texto, online) {
  const div = document.createElement("div");
  div.className = `msg msg-${quem === "ia" ? "ia" : "usuario"}`;
  if (quem === "ia") {
    div.innerHTML = formatarTexto(texto);
    if (online !== null) {
      const origem = document.createElement("span");
      origem.className = "origem";
      origem.textContent = online ? "🤖 Resposta da IA (z.ai)" : "📦 Resposta pronta (modo offline)";
      div.appendChild(origem);
    }
  } else {
    div.textContent = texto;
  }
  $("#chatMensagens").appendChild(div);
  rolarChat();
  return div;
}

function rolarChat() {
  const box = $("#chatMensagens");
  box.scrollTop = box.scrollHeight;
}

async function enviarMensagem(texto) {
  texto = (texto || "").trim();
  if (!texto || aguardandoIA) return;
  aguardandoIA = true;
  $("#chatCampo").value = "";
  $("#chatCampo").blur(); // fecha o teclado do Android
  $("#chatEnviar").disabled = true;

  adicionarMsg("usuario", texto);
  const pensando = document.createElement("div");
  pensando.className = "msg msg-ia pensando";
  pensando.innerHTML = '<span class="pontos">A IA está pensando</span>';
  $("#chatMensagens").appendChild(pensando);
  rolarChat();

  const { texto: resposta, online } = await perguntarIA(texto);
  pensando.remove();
  adicionarMsg("ia", resposta, online);
  atualizarStatus(online);

  aguardandoIA = false;
  $("#chatEnviar").disabled = false;
}

/* =====================================================================
   FINAL + PLACAR SOLIDÁRIO
   ===================================================================== */
function hoje() {
  return new Date().toISOString().slice(0, 10);
}
function lerPlacar() {
  try {
    const p = JSON.parse(localStorage.getItem("totem_placar") || "{}");
    return p.data === hoje() ? p.n || 0 : 0;
  } catch { return 0; }
}
function gravarPlacar(n) {
  try { localStorage.setItem("totem_placar", JSON.stringify({ data: hoje(), n })); } catch {}
}

function atualizarPlacar(animar) {
  const n = lerPlacar();
  $("#placarMini").textContent = n;
  const el = $("#placarNumero");
  if (!animar) { el.textContent = n; return; }
  // contagem animada até o número
  let atual = Math.max(0, n - 15);
  const passo = () => {
    el.textContent = atual;
    if (atual < n) { atual++; setTimeout(passo, 50); }
  };
  passo();
}

function mostrarFinal() {
  if (!estado.contada) {
    gravarPlacar(lerPlacar() + 1);
    estado.contada = true;
  }
  mostrarTela("final");
  atualizarPlacar(true);
}

function reiniciar() {
  estado = novoEstado();
  esconderInatividade();
  mostrarTela("inicio");
  atualizarPlacar(false);
}

/* =====================================================================
   STATUS DA IA (canto do topo)
   ===================================================================== */
function atualizarStatus(online) {
  const cfg = lerConfig();
  const el = $("#statusIA");
  const conectada = online ?? (!!cfg.endpoint && navigator.onLine);
  el.classList.toggle("online", conectada);
  el.classList.toggle("offline", !conectada);
  $("#statusTexto").textContent = conectada ? "IA conectada" : "modo offline";
}
window.addEventListener("online", () => atualizarStatus());
window.addEventListener("offline", () => atualizarStatus(false));

/* =====================================================================
   MODO APRESENTAÇÃO: volta ao início se ficar parado
   ===================================================================== */
let ultimoToque = Date.now();
let contagemTimer = null;

function registrarToque() { ultimoToque = Date.now(); }
["pointerdown", "keydown", "touchstart"].forEach((ev) => document.addEventListener(ev, registrarToque, { passive: true }));

setInterval(() => {
  const limite = (lerConfig().inatividade || 60) * 1000;
  const painelAberto = !$("#painel").classList.contains("escondido");
  if (telaAtual === "inicio" || painelAberto || contagemTimer || aguardandoIA) return;
  if (Date.now() - ultimoToque > limite) mostrarInatividade();
}, 1000);

function mostrarInatividade() {
  let s = 10;
  $("#contagem").textContent = s;
  $("#inatividade").classList.remove("escondido");
  contagemTimer = setInterval(() => {
    s--;
    $("#contagem").textContent = s;
    if (s <= 0) reiniciar();
  }, 1000);
}
function esconderInatividade() {
  clearInterval(contagemTimer);
  contagemTimer = null;
  $("#inatividade").classList.add("escondido");
  registrarToque();
}

/* =====================================================================
   PAINEL SECRETO: toque 5 vezes no logo em até 3 segundos
   ===================================================================== */
let toquesLogo = [];
$("#logo").addEventListener("click", () => {
  const agora = Date.now();
  toquesLogo = toquesLogo.filter((t) => agora - t < 3000);
  toquesLogo.push(agora);
  if (toquesLogo.length >= 5) {
    toquesLogo = [];
    abrirPainel();
  }
});

function abrirPainel() {
  const cfg = lerConfig();
  $("#cfgModelo").value = cfg.modelo;
  $("#cfgEndpoint").value = cfg.endpoint;
  $("#cfgInatividade").value = cfg.inatividade;
  mensagemPainel("", "");
  $("#painel").classList.remove("escondido");
}
function configDoPainel() {
  return {
    modelo: $("#cfgModelo").value.trim() || CONFIG_PADRAO.modelo,
    endpoint: $("#cfgEndpoint").value.trim(),
    inatividade: Math.max(15, parseInt($("#cfgInatividade").value, 10) || CONFIG_PADRAO.inatividade),
  };
}
function mensagemPainel(texto, tipo) {
  const el = $("#painelMsg");
  el.textContent = texto;
  el.className = "painel-msg " + tipo;
}

/* =====================================================================
   TELA CHEIA (no 1º toque, se não estiver instalado como app)
   ===================================================================== */
function entrarTelaCheia() {
  const el = document.documentElement;
  if (!document.fullscreenElement && el.requestFullscreen) {
    el.requestFullscreen({ navigationUI: "hide" }).catch(() => {});
  }
}
document.addEventListener("pointerdown", function primeiroToque(e) {
  if (e.target.closest("#painel, #logo")) return;
  entrarTelaCheia();
  document.removeEventListener("pointerdown", primeiroToque);
});

/* =====================================================================
   AÇÕES DOS BOTÕES (data-acao="...")
   ===================================================================== */
const ACOES = {
  comecar: () => { estado = novoEstado(); mostrarPergunta(0); },
  voltar,
  continuar: avancar,
  confirmarOutro: () => {
    const t = $("#campoOutro").value.trim();
    if (!t) { $("#campoOutro").focus(); return; }
    estado.respostas.textoOutro = t;
    $("#campoOutro").blur();
    avancar();
  },
  chat: abrirChat,
  voltarResumo: () => mostrarTela("resumo"),
  finalizar: mostrarFinal,
  reiniciar,
  mapa: () => mostrarTela("mapa"),
  inicio: () => mostrarTela("inicio"),
  continuarAqui: esconderInatividade,
  telaCheia: entrarTelaCheia,
  testarIA: async () => {
    const cfg = configDoPainel();
    if (!cfg.endpoint) return mensagemPainel("Coloque o endereço do servidor primeiro.", "erro");
    mensagemPainel("Testando…", "");
    const r = await testarConexao(cfg);
    mensagemPainel(r.msg, r.ok ? "ok" : "erro");
  },
  zerarPlacar: () => { gravarPlacar(0); atualizarPlacar(false); mensagemPainel("Placar zerado.", "ok"); },
  salvarPainel: () => {
    salvarConfig(configDoPainel());
    $("#painel").classList.add("escondido");
    atualizarStatus();
  },
};

document.addEventListener("click", (e) => {
  const alvo = e.target.closest("[data-acao]");
  if (alvo && ACOES[alvo.dataset.acao]) ACOES[alvo.dataset.acao]();
});

$("#chatForm").addEventListener("submit", (e) => {
  e.preventDefault();
  enviarMensagem($("#chatCampo").value);
});
$("#campoOutro").addEventListener("keydown", (e) => {
  if (e.key === "Enter") ACOES.confirmarOutro();
});

// Bloqueia o menu de toque longo (totem)
document.addEventListener("contextmenu", (e) => {
  if (!e.target.closest("input")) e.preventDefault();
});

/* =====================================================================
   INICIALIZAÇÃO
   ===================================================================== */
montarInicio();
atualizarStatus();

// Modo offline (PWA): guarda os arquivos no tablet
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch((e) => console.warn("SW:", e));
}

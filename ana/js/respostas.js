/* =====================================================================
   respostas.js — Base de conhecimento OFFLINE (Plano B)
   ---------------------------------------------------------------------
   Tudo aqui funciona SEM internet. O questionário usa sempre estas
   respostas prontas, então a demonstração nunca trava.
   IMPORTANTE: são orientações GERAIS para uma simulação escolar.
   Nada aqui é diagnóstico.
   ===================================================================== */

// ---------- Perguntas do questionário (tabela do roteiro) ----------
const PERGUNTAS = [
  {
    id: "idade",
    titulo: "Quem é o paciente?",
    opcoes: [
      { valor: "crianca", rotulo: "Criança", icone: "🧒" },
      { valor: "adulto", rotulo: "Adulto", icone: "👩" },
      { valor: "idoso", rotulo: "Idoso", icone: "👴" },
    ],
  },
  {
    id: "sintoma",
    titulo: "Qual o principal incômodo?",
    opcoes: [
      { valor: "febre", rotulo: "Febre", icone: "🌡️" },
      { valor: "manchas", rotulo: "Manchas na pele", icone: "🔴" },
      { valor: "tosse", rotulo: "Tosse", icone: "😷" },
      { valor: "dor", rotulo: "Dor", icone: "🤕" },
      { valor: "outro", rotulo: "Outro", icone: "✏️" },
    ],
  },
  {
    id: "tempo",
    titulo: "Há quanto tempo?",
    opcoes: [
      { valor: "hoje", rotulo: "Hoje", icone: "☀️" },
      { valor: "dias", rotulo: "2 a 3 dias", icone: "📅" },
      { valor: "semana", rotulo: "Mais de uma semana", icone: "🗓️" },
    ],
  },
  {
    id: "alertas",
    titulo: "Há algum sinal de alerta?",
    subtitulo: "Pode tocar em mais de um",
    multipla: true,
    opcoes: [
      { valor: "ar", rotulo: "Falta de ar", icone: "🫁" },
      { valor: "febrealta", rotulo: "Febre muito alta", icone: "🔥" },
      { valor: "confusao", rotulo: "Muita sonolência ou confusão", icone: "😵" },
      { valor: "nenhum", rotulo: "Nenhum", icone: "✅", exclusiva: true },
    ],
  },
];

// Textos legíveis para montar o resumo
const ROTULOS = {
  idade: { crianca: "uma criança", adulto: "um adulto", idoso: "uma pessoa idosa" },
  tempo: { hoje: "começou hoje", dias: "começou há 2 a 3 dias", semana: "começou há mais de uma semana" },
  alertas: { ar: "falta de ar", febrealta: "febre muito alta", confusao: "muita sonolência ou confusão" },
};

// ---------- Conhecimento por sintoma ----------
const SINTOMAS = {
  febre: {
    nome: "febre",
    palavras: ["febre", "quente", "calafrio", "temperatura", "febril"],
    possibilidades: [
      "Infecções por vírus, como gripe e resfriado (as mais comuns).",
      "Dengue, zika ou chikungunya, principalmente em época de chuva e mosquitos.",
      "Infecções de garganta, ouvido ou urina.",
    ],
    perguntas: [
      "A temperatura foi medida com termômetro? Quanto deu?",
      "Tem dor no corpo, nas juntas ou atrás dos olhos?",
      "Apareceram manchas na pele, vômitos ou diarreia?",
      "Alguém da casa ou da vizinhança está com sintomas parecidos?",
    ],
    cuidados: [
      "Beber bastante água, soro caseiro, sucos e chás.",
      "Descansar e usar roupas leves.",
      "Não tomar remédio por conta própria: alguns remédios (como AAS/aspirina) são perigosos em casos de dengue.",
      "Anotar a temperatura e o horário para mostrar à equipe de saúde.",
    ],
    alertaExtra: "Febre que não baixa, manchas roxas, sangramento na gengiva ou nariz, ou convulsão: atendimento imediato.",
  },

  manchas: {
    nome: "manchas na pele",
    palavras: ["mancha", "manchas", "pele", "coceira", "vermelh", "bolinha", "pintas", "alergia", "brotoeja"],
    possibilidades: [
      "Alergia (a alimento, remédio, picada de inseto ou produto).",
      "Doenças virais que causam manchas, como sarampo, rubéola, catapora ou dengue.",
      "Micoses e irritações da pele.",
    ],
    perguntas: [
      "As manchas coçam? Onde começaram e para onde se espalharam?",
      "Tem febre junto com as manchas?",
      "O cartão de vacinação está em dia?",
      "Teve contato com alguém com manchas parecidas?",
    ],
    cuidados: [
      "Evitar coçar e manter a pele limpa e seca.",
      "Não passar pomadas ou produtos sem orientação.",
      "Separar toalhas e roupas de cama, se houver suspeita de doença contagiosa.",
      "Levar o cartão de vacinação na consulta.",
    ],
    alertaExtra: "Manchas roxas que não somem ao apertar, inchaço no rosto ou na boca, ou falta de ar: atendimento imediato.",
  },

  tosse: {
    nome: "tosse",
    palavras: ["tosse", "tossindo", "catarro", "pigarro", "gripe", "resfriado", "garganta"],
    possibilidades: [
      "Resfriado ou gripe (as causas mais comuns).",
      "Alergia, bronquite ou asma.",
      "Pneumonia, quando vem com febre e cansaço.",
      "Tosse por mais de 3 semanas pode ser tuberculose e precisa de exame. O exame e o tratamento são gratuitos no SUS.",
    ],
    perguntas: [
      "A tosse é seca ou com catarro? Já saiu sangue?",
      "Tem febre no fim da tarde ou suor à noite?",
      "Perdeu peso sem querer?",
      "Fuma ou fica perto de fumaça (por exemplo, fogão a lenha)?",
    ],
    cuidados: [
      "Beber bastante água e manter a casa arejada.",
      "Cobrir a boca e o nariz com o braço ao tossir.",
      "Evitar fumaça e poeira.",
      "Não usar xarope por conta própria, principalmente em crianças.",
    ],
    alertaExtra: "Falta de ar, chiado forte no peito, lábios arroxeados ou sangue no catarro: atendimento imediato.",
  },

  dor: {
    nome: "dor",
    palavras: ["dor", "doendo", "doi", "dói", "cabeça", "barriga", "costas", "peito", "machuc"],
    possibilidades: [
      "Dor muscular por esforço, má postura ou cansaço.",
      "Dor de cabeça por tensão, falta de sono, de água ou de comida.",
      "Dor causada por infecção ou inflamação. Depende muito do local.",
    ],
    perguntas: [
      "Onde exatamente dói? A dor vai para outro lugar?",
      "De 0 a 10, qual a força da dor?",
      "Começou depois de queda, batida ou esforço?",
      "O que piora ou melhora a dor?",
    ],
    cuidados: [
      "Repouso e observar se a dor muda de lugar ou de força.",
      "Beber água e se alimentar bem.",
      "Não tomar remédio por conta própria sem orientação.",
    ],
    alertaExtra: "Dor no peito, dor de cabeça súbita e muito forte, barriga dura com dor forte, ou dor depois de acidente: atendimento imediato.",
  },

  outro: {
    nome: "outro sintoma",
    palavras: [],
    possibilidades: [
      "Muitos sintomas têm causas simples, mas só a avaliação de um profissional pode dizer o que é.",
    ],
    perguntas: [
      "Quando começou e como está mudando?",
      "Existe algum outro sintoma junto (febre, dor, vômito, cansaço)?",
      "A pessoa tem alguma doença de longa duração ou toma remédio todo dia?",
    ],
    cuidados: [
      "Beber água, descansar e anotar como os sintomas evoluem.",
      "Não tomar remédio por conta própria.",
    ],
    alertaExtra: "Se aparecer falta de ar, desmaio, confusão ou dor muito forte: atendimento imediato.",
  },
};

// ---------- Cuidados por idade ----------
const IDADE = {
  crianca: {
    perguntas: ["A criança está mamando ou bebendo líquidos? Está fazendo xixi normalmente?", "Está brincando ou muito quieta e abatida?"],
    cuidados: ["Remédio para criança é sempre pelo peso e com orientação profissional."],
    nota: "Em bebês com menos de 3 meses, qualquer febre deve ser avaliada logo.",
  },
  adulto: {
    perguntas: ["Tem alguma doença como pressão alta ou diabetes?"],
    cuidados: [],
    nota: "",
  },
  idoso: {
    perguntas: ["Toma remédios todos os dias? Quais?", "Está mais confuso ou mais fraco que o normal?"],
    cuidados: ["Pessoas idosas desidratam mais rápido: oferecer água várias vezes ao dia."],
    nota: "Em idosos, os sinais podem ser mais discretos. Às vezes aparece confusão em vez de febre alta.",
  },
};

// ---------- Interpretação do tempo ----------
const TEMPO = {
  hoje: "Começou hoje. Vale observar como evolui nas próximas 24 a 48 horas.",
  dias: "Já são alguns dias. Se não estiver melhorando, é hora de passar pela equipe de saúde.",
  semana: "Sintoma que dura mais de uma semana merece avaliação da equipe de saúde em breve, mesmo sem sinais de alerta.",
};

// ---------- Os 3 casos prontos (sugestão do roteiro) ----------
// Dados 100% fictícios.
const CASOS = [
  {
    id: "manchas_febre",
    titulo: "Manchas e febre",
    icone: "🔴🌡️",
    descricao: "Criança, 2 a 3 dias",
    respostas: { idade: "crianca", sintoma: "manchas", tempo: "dias", alertas: ["nenhum"] },
    textoLivre: "manchas vermelhas pelo corpo e febre",
    extras: {
      possibilidades: ["Febre junto com manchas pede atenção especial para doenças como sarampo e dengue."],
      perguntas: ["A criança tomou as vacinas de sarampo (tríplice viral)?"],
    },
  },
  {
    id: "tosse_longa",
    titulo: "Tosse prolongada",
    icone: "😷⏳",
    descricao: "Adulto, mais de uma semana",
    respostas: { idade: "adulto", sintoma: "tosse", tempo: "semana", alertas: ["nenhum"] },
    textoLivre: "tosse há quase um mês",
    extras: {
      possibilidades: ["Tosse há quase um mês: o agente deve encaminhar para o exame de escarro (tuberculose)."],
      perguntas: [],
    },
  },
  {
    id: "febre_olhos",
    titulo: "Febre e dor atrás dos olhos",
    icone: "🌡️👁️",
    descricao: "Adulto, 2 a 3 dias",
    respostas: { idade: "adulto", sintoma: "febre", tempo: "dias", alertas: ["nenhum"] },
    textoLivre: "febre e dor atrás dos olhos",
    extras: {
      possibilidades: ["Febre com dor atrás dos olhos e no corpo é um quadro típico de dengue. A fase de mais atenção costuma ser quando a febre começa a baixar (por volta do 3º ao 5º dia)."],
      perguntas: ["Tem água parada perto de casa (vasos, pneus, caixa d'água aberta)?"],
    },
  },
];

/* =====================================================================
   gerarOrientacao(respostas)
   Monta a resposta completa do questionário a partir das escolhas.
   ===================================================================== */
function gerarOrientacao(r, extras) {
  const s = SINTOMAS[r.sintoma] || SINTOMAS.outro;
  const id = IDADE[r.idade] || IDADE.adulto;
  const alertas = (r.alertas || []).filter((a) => a !== "nenhum");
  const urgente = alertas.length > 0;

  // Resumo em linguagem simples
  const nomeSintoma = r.sintoma === "outro" && r.textoOutro ? `"${r.textoOutro}"` : s.nome;
  let resumo = `Paciente: ${ROTULOS.idade[r.idade] || "pessoa"}. Principal incômodo: ${nomeSintoma}, que ${ROTULOS.tempo[r.tempo] || "começou recentemente"}.`;
  resumo += urgente
    ? ` Sinais de alerta informados: ${alertas.map((a) => ROTULOS.alertas[a]).join(", ")}.`
    : " Nenhum sinal de alerta informado.";

  const possibilidades = [...(extras?.possibilidades || []), ...s.possibilidades];
  const perguntas = [...(extras?.perguntas || []), ...s.perguntas, ...id.perguntas];
  const cuidados = [...s.cuidados, ...id.cuidados];

  let quandoProcurar;
  if (urgente) {
    quandoProcurar = "AGORA. Há sinal de alerta. Leve a pessoa ao serviço de saúde mais próximo ou ligue para o SAMU 192.";
  } else {
    quandoProcurar = TEMPO[r.tempo] || TEMPO.dias;
  }

  return {
    urgente,
    resumo,
    possibilidades,
    perguntas,
    cuidados,
    nota: id.nota,
    alertaExtra: s.alertaExtra,
    quandoProcurar,
  };
}

/* =====================================================================
   respostaOffline(texto)
   Usada no chat quando NÃO há internet ou chave de API.
   Procura palavras-chave e devolve uma orientação curta.
   ===================================================================== */
function respostaOffline(texto) {
  const t = texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const semAcento = (p) => p.normalize("NFD").replace(/[̀-ͯ]/g, "");

  // Sinais de urgência têm prioridade
  const urgencia = ["falta de ar", "nao consigo respirar", "desmai", "convuls", "sangr", "dor no peito", "roxo", "roxa", "confus"];
  if (urgencia.some((p) => t.includes(p))) {
    return "⚠️ **Isso pode ser um sinal de alerta.**\n\nProcure atendimento **com urgência** no serviço de saúde mais próximo ou ligue para o **SAMU 192**.\n\nO agente de saúde deve acompanhar a pessoa e não deixá-la sozinha.\n\n_Lembre: só um profissional de saúde pode fazer o diagnóstico._";
  }

  const achados = Object.entries(SINTOMAS).filter(([, s]) => s.palavras.some((p) => t.includes(semAcento(p))));
  if (achados.length === 0) {
    return "Entendi. Para orientar melhor, o agente de saúde pode perguntar:\n\n- Quando começou?\n- Tem febre, dor, tosse ou manchas junto?\n- A pessoa toma algum remédio todo dia?\n\nEnquanto isso: beber água, descansar e **não tomar remédio por conta própria**.\n\n_Estou no modo offline, com respostas prontas. Só um profissional de saúde pode diagnosticar._";
  }

  let out = "";
  for (const [, s] of achados.slice(0, 2)) {
    out += `**Sobre ${s.nome}:**\n`;
    out += `Pode estar ligado a, entre outras coisas: ${s.possibilidades.slice(0, 2).map((p) => p.replace(/\.$/, "").toLowerCase()).join("; ")}.\n\n`;
    out += `**O agente pode perguntar:**\n${s.perguntas.slice(0, 2).map((p) => "- " + p).join("\n")}\n\n`;
    out += `**Sinais de alerta:** ${s.alertaExtra}\n\n`;
  }
  out += "_Estou no modo offline, com respostas prontas. Isto não é diagnóstico: encaminhe para a equipe de saúde._";
  return out;
}

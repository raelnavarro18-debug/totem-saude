# Totem Triagem Médica Solidária

Aplicação do totem da Feira de Ciências (tema **IA e Solidariedade**).
É uma **simulação**: a IA não faz diagnóstico, ela apoia o agente de saúde.

## Como funciona

```
Tablet (GitHub Pages)  ──►  Servidor intermediário (Cloudflare Worker)  ──►  IA z.ai
   respostas prontas             guarda a chave em segredo                   glm-4.5-flash
   (funcionam offline)
```

- **Questionário** (4 perguntas + resumo) e **3 casos prontos**: usam as respostas de `js/respostas.js`. Funcionam **sem internet**.
- **Chat livre**: usa a IA de verdade. Se a internet ou a IA falharem, responde com as respostas prontas (Plano B) e mostra "modo offline".
- **Placar solidário**: conta quantas pessoas foram orientadas no dia.
- **Modo apresentação**: depois de 60 s parado, volta sozinho para o início.
- **Painel secreto**: toque **5 vezes rápido no logo** (cruz vermelha).

## Arquivos

| Arquivo | O que tem |
|---|---|
| `index.html` | todas as telas |
| `css/estilo.css` | visual (cores, tamanhos dos botões) |
| `js/respostas.js` | perguntas, casos prontos e respostas offline (**editem aqui os textos**) |
| `js/ia.js` | conversa com a IA e o **prompt** |
| `js/app.js` | navegação, placar, inatividade, painel |
| `js/mapa.js` | desenho do mapa |
| `sw.js` | guarda o app no tablet para funcionar offline |
| `servidor/worker.js` | servidor intermediário (Cloudflare) |
| `servidor/proxy_local.py` | o mesmo servidor, para rodar no PC |

> ⚠️ **Nunca coloquem a chave da z.ai em nenhum arquivo deste projeto.** Ela fica só no Cloudflare.

---

## Passo 1: publicar o site no GitHub Pages

1. Crie uma conta em github.com (se ainda não tiver).
2. Crie um repositório **público**, por exemplo `totem-saude`.
3. Envie todos os arquivos da pasta (botão *Add file > Upload files*), **menos** a pasta `.claude`.
4. Vá em *Settings > Pages*, em *Source* escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`, e clique em *Save*.
5. Em 1 ou 2 minutos o site fica em: `https://SEU-USUARIO.github.io/totem-saude/`

## Passo 2: criar o servidor da IA (Cloudflare Worker, grátis)

> A conta precisa ser de um adulto. Peça para quem tem a conta da z.ai (seu pai) fazer junto.

1. Crie uma conta em dash.cloudflare.com.
2. Menu **Workers & Pages > Create > Create Worker**. Dê o nome `totem-ia` e clique em *Deploy*.
3. Clique em **Edit code**, apague tudo, cole o conteúdo de `servidor/worker.js` e clique em *Deploy*.
4. Volte ao worker e vá em **Settings > Variables and Secrets > Add**:
   - Tipo **Secret**, nome `ZAI_KEY`, valor: a chave da z.ai.
   - Tipo **Text**, nome `ORIGENS`, valor: `https://SEU-USUARIO.github.io` (assim só o site de vocês consegue usar o servidor).
5. Copie o endereço do worker, algo como `https://totem-ia.SEU-USUARIO.workers.dev`.

## Passo 3: configurar o tablet

1. Abra o site no **Chrome** do Android.
2. Toque 5x no logo, cole o endereço do worker em **Endereço do servidor da IA**, toque em **Testar IA** (deve aparecer "Conexão OK!") e depois em **Salvar e fechar**.
3. Menu do Chrome (⋮) > **Adicionar à tela inicial** / **Instalar app**. Abrindo pelo ícone, ele fica em tela cheia e funciona offline.
4. Configurações do Android:
   - **Tela > Tempo limite da tela**: o máximo (ou ative "Manter tela ligada" nas opções do desenvolvedor).
   - **Segurança > Fixar app** (*App pinning*): impede que visitantes saiam do totem.
   - Deixe o tablet **na tomada** durante a feira.

## Testar no PC (sem Cloudflare)

No PowerShell, dentro da pasta do projeto:

```powershell
python -m http.server 8765
```

Em outro terminal:

```powershell
$env:ZAI_KEY = "cole-a-chave-aqui"
python servidor/proxy_local.py
```

Abra `http://localhost:8765`, toque 5x no logo e coloque `http://localhost:8787` como endereço do servidor.

## Plano B (se a internet cair)

- O app continua funcionando: o questionário e os casos prontos não usam internet, e o chat responde com respostas prontas.
- Mesmo assim, tirem **capturas de tela** das respostas da IA para os 3 casos, como diz o roteiro.

## Limite do plano grátis

O modelo `glm-4.5-flash` é gratuito, mas tem limite de perguntas por minuto. Se muita gente usar ao mesmo tempo, algumas respostas aparecem como "modo offline". Isso é normal e o visitante continua recebendo orientação.

## Mudou algum arquivo?

Abra `sw.js` e aumente a versão (`totem-v1` → `totem-v2`). Assim o tablet baixa a versão nova.

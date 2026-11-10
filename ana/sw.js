/* =====================================================================
   sw.js — Service Worker: guarda o app no tablet para funcionar
   mesmo se a internet da feira cair (Plano B).
   >>> Sempre que mudar algum arquivo, aumente a VERSAO abaixo. <<<
   ===================================================================== */

const VERSAO = "totem-v1";
const ARQUIVOS = [
  "./",
  "index.html",
  "css/estilo.css",
  "js/respostas.js",
  "js/ia.js",
  "js/mapa.js",
  "js/app.js",
  "manifest.json",
  "img/icone-192.png",
  "img/icone-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((nomes) => Promise.all(nomes.filter((n) => n !== VERSAO).map((n) => caches.delete(n))))
  );
  self.clients.claim();
});

// Arquivos do próprio site: tenta a rede primeiro (para pegar atualizações),
// e se falhar usa a cópia guardada. A API da IA não passa por aqui.
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        const copia = resp.clone();
        caches.open(VERSAO).then((c) => c.put(e.request, copia));
        return resp;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});

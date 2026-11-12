/* ==========================================
   SERVICE WORKER - MVI
   VERSÃO 14
   ========================================== */

const CACHE_NAME = 'mvi-cache-v14';

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  './jspdf.min.js'
];

/* ==========================================
   INSTALAÇÃO
   ========================================== */

self.addEventListener('install', event => {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );

});

/* ==========================================
   ATIVAÇÃO
   ========================================== */

self.addEventListener('activate', event => {

  event.waitUntil(
    caches.keys()
      .then(keys => {

        return Promise.all(
          keys
            .filter(key =>
              key.startsWith('mvi-cache-') &&
              key !== CACHE_NAME
            )
            .map(key => caches.delete(key))
        );

      })
      .then(() => self.clients.claim())
  );

});

/* ==========================================
   REQUISIÇÕES
   CACHE FIRST + NAVEGAÇÃO OFFLINE
   ========================================== */

self.addEventListener('fetch', event => {

  const request = event.request;
  const url = new URL(request.url);

  // Não interceptar serviços externos
  // Exemplo: Supabase
  if (url.origin !== self.location.origin) {
    return;
  }

  // Processar somente requisições GET
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith((async () => {

    /* ======================================
       ABERTURA DA PWA
       ====================================== */

    if (request.mode === 'navigate') {

      // Prioriza a página salva no dispositivo
      const pagina = await caches.match('./index.html');

      if (pagina) {
        return pagina;
      }

      // Caso não exista cache, tenta internet
      try {
        return await fetch(request);
      } catch (erro) {
        return Response.error();
      }

    }

    /* ======================================
       ARQUIVOS DA APLICAÇÃO
       ====================================== */

    // Procurar primeiro no cache
    const arquivo = await caches.match(request);

    if (arquivo) {
      return arquivo;
    }

    // Buscar na internet somente se necessário
    try {
      return await fetch(request);
    } catch (erro) {
      return Response.error();
    }

  })());

});

// jalimpo.com: a raiz "/" mostra a landing (dist/site/index.html, copiada de
// ../landing por scripts/juntar-landing.mjs); todo o resto é o app. Só "/"
// passa por aqui (assets.run_worker_first), o resto é servido direto.
export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === "/") return env.ASSETS.fetch(new Request(new URL("/site/", request.url), request));
    return env.ASSETS.fetch(request);
  },
};

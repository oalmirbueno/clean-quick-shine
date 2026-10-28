// jalimpo.com: a landing (Worker "jalimpo-site") mora na raiz e em /site/*;
// todo o resto é o app (arquivos de ./dist). Só "/" e "/site/*" passam por
// aqui (assets.run_worker_first), então o app continua servido direto.
export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === "/" || pathname.startsWith("/site/")) return env.SITE.fetch(request);
    return env.ASSETS.fetch(request);
  },
};

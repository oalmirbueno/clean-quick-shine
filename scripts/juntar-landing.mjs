// Copia a landing (../landing/public) para dist/site/ antes do deploy da web.
// Fica fora do git e fora do app nativo: o Codemagic roda só `vite build`.
// O Worker (worker/index.js) serve dist/site/index.html na raiz "/".
import { cpSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const landing = fileURLToPath(new URL("../../landing/public/", import.meta.url));
const dist = fileURLToPath(new URL("../dist/", import.meta.url));

if (!existsSync(landing + "index.html")) {
  console.error(`Landing não encontrada em ${landing}`);
  process.exit(1);
}
cpSync(landing + "site", dist + "site", { recursive: true });
cpSync(landing + "index.html", dist + "site/index.html");
console.log("landing copiada para dist/site");

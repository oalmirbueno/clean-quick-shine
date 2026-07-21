import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const bundled = await bundle({
  entryPoint: path.resolve(__dirname, "../src/index.ts"),
  webpackOverride: (c) => c,
});

const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});

const targets = [
  { id: "ios-safari", out: "/mnt/documents/instalar-ja-limpo-iphone-safari.mp4" },
];

for (const t of targets) {
  console.log(`Rendering ${t.id}...`);
  const composition = await selectComposition({
    serveUrl: bundled,
    id: t.id,
    puppeteerInstance: browser,
  });
  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: "h264",
    outputLocation: t.out,
    puppeteerInstance: browser,
    muted: true,
    concurrency: 1,
  });
  console.log(`  -> ${t.out}`);
}

await browser.close({ silent: false });
console.log("done");

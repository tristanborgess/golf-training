import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) =>
        e.isDirectory() ? walk(path.join(dir, e.name)) : path.join(dir, e.name),
      ),
    )
  ).flat();
}
const files = (await walk("out")).filter(
  (file) =>
    !file.endsWith(".map") &&
    !file.endsWith(".txt") &&
    !file.endsWith("/sw.js") &&
    !file.endsWith("/precache.json") &&
    !file.endsWith(".DS_Store"),
);
const hash = createHash("sha256");
let totalBytes = 0;
for (const file of files.sort()) {
  hash.update(file);
  const bytes = await readFile(file);
  totalBytes += bytes.length;
  hash.update(bytes);
}
const version = hash.digest("hex").slice(0, 12);
const urls = files.map(
  (file) => `/${path.relative("out", file).split(path.sep).join("/")}`,
);
await writeFile("out/precache.json", JSON.stringify({ version, urls }));
const source = await readFile("public/sw.js", "utf8");
await writeFile("out/sw.js", source.replace("__BUILD_VERSION__", version));
console.log(
  `Prepared ${urls.length} local files for offline use (${version}).`,
);

console.log(`Offline download: ${(totalBytes / 1024 / 1024).toFixed(2)} MiB.`);
if (totalBytes > 6 * 1024 * 1024)
  console.warn("Offline precache exceeds the 6 MiB advisory budget.");

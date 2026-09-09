import { extname, resolve } from "node:path";

const root = resolve("out");
Bun.serve({
  port: Number(process.env.PORT ?? 3001),
  hostname: "127.0.0.1",
  async fetch(req) {
    const url = new URL(req.url);
    let pathname: string;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      return new Response("Bad request", { status: 400 });
    }
    const candidate = resolve(root, `.${pathname}`);
    if (candidate !== root && !candidate.startsWith(`${root}/`))
      return new Response("Forbidden", { status: 403 });
    const file = Bun.file(
      extname(candidate) ? candidate : resolve(candidate, "index.html"),
    );
    if (!(await file.exists()))
      return new Response("Not found", { status: 404 });
    const headers = new Headers({
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    });
    if (pathname.endsWith(".webmanifest"))
      headers.set("Content-Type", "application/manifest+json");
    return new Response(file, { headers });
  },
});
console.log("Range Notes production preview: http://127.0.0.1:3001");

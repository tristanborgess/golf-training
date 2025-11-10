#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const fg = require("fast-glob");
const chokidar = require("chokidar");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

const ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT, "src");
const LOCALES_DIR = path.join(ROOT, "locales");
const DEFAULT_LOCALE = "en";

// Watch explicit extension patterns; avoid negate patterns for chokidar
const FILE_GLOB = [
  `${SRC_DIR}/**/*.ts`,
  `${SRC_DIR}/**/*.tsx`,
  `${SRC_DIR}/**/*.js`,
  `${SRC_DIR}/**/*.jsx`,
];
const WATCH_IGNORED = [
  `${SRC_DIR}/**/*.d.ts`,
  `${LOCALES_DIR}/**/*`,
  `${ROOT}/node_modules/**`,
  `${ROOT}/.next/**`,
];

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return {};
  }
}

function writeJSON(filePath, obj) {
  // Sort keys alphabetically for stable diffs
  const sorted = Object.fromEntries(
    Object.entries(obj).sort(([a], [b]) => a.localeCompare(b))
  );
  const json = `${JSON.stringify(sorted, null, 2)}\n`;

  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Use process-specific temp file to avoid conflicts when multiple processes run
  const tmpPath = `${filePath}.tmp.${process.pid}`;
  try {
    fs.writeFileSync(tmpPath, json, "utf8");
    // Verify temp file exists before renaming
    if (fs.existsSync(tmpPath)) {
      fs.renameSync(tmpPath, filePath);
    } else {
      throw new Error(`Temp file ${tmpPath} was not created`);
    }
  } catch (err) {
    // Clean up temp file if rename fails
    if (fs.existsSync(tmpPath)) {
      try {
        fs.unlinkSync(tmpPath);
      } catch {
        // Ignore cleanup errors
      }
    }
    throw err;
  }
}

function extractKeysFromCode(code, filePath) {
  const keys = new Set();
  let ast;

  try {
    ast = parser.parse(code, {
      sourceType: "module",
      plugins: [
        "typescript",
        "jsx",
        "decorators-legacy",
        "classProperties",
        "importAttributes",
      ],
    });
  } catch (err) {
    console.warn(`Failed to parse ${filePath}: ${err.message}`);
    return keys;
  }

  traverse(ast, {
    CallExpression(path) {
      const callee = path.node.callee;
      // Look for t("...") calls where t is an identifier
      if (callee.type === "Identifier" && callee.name === "t") {
        const arg = path.node.arguments[0];
        if (!arg) return;

        // String literal: t("Hello")
        if (arg.type === "StringLiteral") {
          const value = arg.value.trim();
          if (value) keys.add(value);
        }
        // Template literal with no expressions: t(`Hello world`)
        else if (
          arg.type === "TemplateLiteral" &&
          arg.expressions.length === 0
        ) {
          const value = arg.quasis
            .map((q) => q.value.cooked)
            .join("")
            .trim();
          if (value) keys.add(value);
        }
      }
    },
  });

  return keys;
}

async function gatherAllKeys() {
  const files = await fg(FILE_GLOB, {
    dot: false,
    ignore: WATCH_IGNORED,
    onlyFiles: true,
    absolute: true,
  });
  const allKeys = new Set();

  for (const filePath of files) {
    const code = fs.readFileSync(filePath, "utf8");
    const keys = extractKeysFromCode(code, filePath);
    for (const key of keys) {
      allKeys.add(key);
    }
  }

  return allKeys;
}

function loadLocaleFiles() {
  // Ensure locales directory exists
  if (!fs.existsSync(LOCALES_DIR)) {
    fs.mkdirSync(LOCALES_DIR, { recursive: true });
  }

  // Ensure default locale files exist
  const ensureLocale = (locale) => {
    const filePath = path.join(LOCALES_DIR, `${locale}.json`);
    if (!fs.existsSync(filePath)) {
      writeJSON(filePath, {});
    }
    return filePath;
  };

  ensureLocale("en");
  ensureLocale("es");

  // Return all locale files
  return fs
    .readdirSync(LOCALES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => path.join(LOCALES_DIR, f));
}

async function syncOnce({ silent = false } = {}) {
  const usedKeys = await gatherAllKeys();
  const localeFiles = loadLocaleFiles();

  for (const filePath of localeFiles) {
    const locale = path.basename(filePath, ".json");
    const current = readJSON(filePath);
    const next = {};

    // Build new object with only used keys
    for (const key of usedKeys) {
      if (locale === DEFAULT_LOCALE) {
        // English-as-source: value = key (English phrase)
        next[key] = key;
      } else {
        // Other locales: preserve existing translation or use empty string
        next[key] = Object.hasOwn(current, key) ? current[key] : "";
      }
    }

    // Write back (atomic write)
    writeJSON(filePath, next);

    if (!silent) {
      const missing = Object.values(next).filter((v) => v === "").length;
      const total = Object.keys(next).length;
      console.log(
        `✓ ${path.basename(filePath)}: ${total} key${total !== 1 ? "s" : ""}${
          missing > 0 ? ` (${missing} untranslated)` : ""
        }`
      );
    }
  }
}

// File-based lock to prevent concurrent syncs across processes
const LOCK_FILE = path.join(ROOT, ".i18n-sync.lock");

function acquireLock() {
  const maxAge = 5000; // 5 seconds max lock age
  if (fs.existsSync(LOCK_FILE)) {
    try {
      const stats = fs.statSync(LOCK_FILE);
      const age = Date.now() - stats.mtimeMs;
      if (age > maxAge) {
        // Stale lock, remove it
        fs.unlinkSync(LOCK_FILE);
      } else {
        return false; // Lock is held
      }
    } catch {
      // Lock file might have been removed, try again
    }
  }
  try {
    fs.writeFileSync(LOCK_FILE, process.pid.toString(), "utf8");
    return true;
  } catch {
    return false;
  }
}

function releaseLock() {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      fs.unlinkSync(LOCK_FILE);
    }
  } catch {
    // Ignore cleanup errors
  }
}

// Simple lock to prevent concurrent syncs
let isSyncing = false;

function debounce(fn, ms) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), ms);
  };
}

async function main() {
  const watch = process.argv.includes("--watch");

  // Try to acquire lock (only needed when NOT in watch mode, i.e., called by chokidar-cli)
  if (!watch) {
    if (!acquireLock()) {
      // Another process is syncing, skip this run
      return;
    }
  }

  try {
    // Initial sync
    await syncOnce();
  } finally {
    if (!watch) {
      releaseLock();
    }
  }

  if (watch) {
    const debouncedSync = debounce(async () => {
      if (isSyncing) {
        return; // Skip if already syncing
      }
      isSyncing = true;
      try {
        await syncOnce({ silent: true });
      } catch (err) {
        console.error("Error during sync:", err.message);
      } finally {
        isSyncing = false;
      }
    }, 300);

    console.log(`\n👀 Watching for changes in ${SRC_DIR}...`);
    console.log("   (Press Ctrl+C to stop)\n");
    console.log("   Patterns:", FILE_GLOB.map((g) => `\n     - ${g}`).join(""));

    const watcher = chokidar.watch(FILE_GLOB, {
      persistent: true,
      ignoreInitial: true,
      ignored: WATCH_IGNORED,
      awaitWriteFinish: {
        stabilityThreshold: 200,
        pollInterval: 50,
      },
    });

    const onChange = (event, filePath) => {
      const rel = path.relative(ROOT, filePath);
      // Filter again by extension (belt & suspenders)
      if (!/[.](ts|tsx|js|jsx)$/.test(rel) || /[.]d[.]ts$/.test(rel)) return;
      console.log(`[${event}] ${rel}`);
      debouncedSync();
    };

    watcher
      .on("add", (p) => onChange("add", p))
      .on("change", (p) => onChange("change", p))
      .on("unlink", (p) => onChange("unlink", p))
      .on("error", (err) => console.error("Watcher error:", err));
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

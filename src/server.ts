import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import fs from 'node:fs';
import { dirname } from 'node:path';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

// --- localStorage shim / startup diagnostics -------------------------------------------------
// Some SSR environments or tooling pass a `--localstorage-file` flag to node. If that flag is
// present without a valid path Node will emit the warning seen previously. We can't remove
// flags passed by the invoker, but we can provide two helpful behaviors:
// 1) If the environment variable `LOCALSTORAGE_FILE` is set, create a simple file-backed
//    localStorage implementation and attach it to globalThis so server-side code expecting
//    `localStorage` will not fail.
// 2) If `--localstorage-file` appears in `process.execArgv` without a path, log a clearer
//    diagnostic suggesting to set `LOCALSTORAGE_FILE` or remove the flag from the start command.

// Detect the legacy flag in the argv passed to the node process (execArgv contains node flags).
const execArgs = process.execArgv || [];
const localStorageFlagIndex = execArgs.findIndex((a) => a === '--localstorage-file' || a.startsWith('--localstorage-file='));
if (localStorageFlagIndex !== -1) {
  const hasValue = execArgs[localStorageFlagIndex].includes('=') || execArgs[localStorageFlagIndex + 1];
  if (!hasValue) {
    // Print a friendly diagnostic — Node already prints a warning for this, but we give guidance.
    // Keep logging synchronous and minimal so it appears early in the process output.
    // eslint-disable-next-line no-console
    console.warn(
      "Warning: `--localstorage-file` was provided without a valid path.\n" +
        "Either remove this flag from your node invocation, or set the environment variable `LOCALSTORAGE_FILE`\n" +
        "to a file path to enable server-side localStorage persistence (e.g. LOCALSTORAGE_FILE=./.localstorage.json).",
    );
  }
}

// If the user set LOCALSTORAGE_FILE we will mount a tiny file-backed localStorage implementation.
const lsFile = process.env['LOCALSTORAGE_FILE'];
if (lsFile) {
  try {
    const fullPath = fs.existsSync(lsFile) ? lsFile : join(process.cwd(), lsFile);
    let store: Record<string, string> = {};
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, { encoding: 'utf8' });
        store = content ? JSON.parse(content) : {};
      } catch {
        store = {};
      }
    }

    const persist = () => {
      try {
        fs.writeFileSync(fullPath, JSON.stringify(store, null, 2));
      } catch {
        // ignore write errors — this shim is best-effort
      }
    };

    globalThis.localStorage = {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => {
        store[k] = String(v);
        persist();
      },
      removeItem: (k: string) => {
        delete store[k];
        persist();
      },
      clear: () => {
        store = {};
        persist();
      },
      key: (i: number) => Object.keys(store)[i] ?? null,
      get length() {
        return Object.keys(store).length;
      },
    } as Storage & { length: number };
    // eslint-disable-next-line no-console
    console.log(`Mounted server localStorage shim at ${fullPath}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Could not mount LOCALSTORAGE_FILE-backed storage:', err);
  }
}
// ----------------------------------------------------------------------------------------------

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);

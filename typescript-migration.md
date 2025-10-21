Searched codebase for "#codebase I've implemented the changes you told me to do for an initial setup/migration. Generate a guide of the steps to take next. Where should I start? Where do I go from there? What should I focus on first? When do I start getting stricter? And so on...", 25 results

GitHub Copilot

Below is a concise, ordered guide to continue your incremental JS→TS migration now that the initial build/config changes are in place.

1. Quick reality check (one-off)

- Confirm these files exist/are updated:
  - tsconfig.json
  - webpack.rules.js
  - webpack.renderer.config.js
  - webpack.main.config.js
  - package.json
    (Open them to verify.)

2. Add minimal global type declarations (required)
   Create a small types file so TS knows about injected globals (webpack/electron env, custom process.env keys). Example file to add:

```js
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY_VITE?: string;

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: 'development' | 'production';
    EXPRESS_URL?: string;
    SQL_DATE_FORMAT?: string;
    // add any other env keys you use
  }
}
```

3. Add fast type-check-in-build (recommended)

- Install fork-ts-checker-webpack-plugin (if not already).
- Add it to renderer + main webpack configs so webpack + ts-loader (transpileOnly) still surface type errors.

Example change for renderer:

```js
// ...existing code...
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
// ...existing code...
module.exports = {
  // ...
  plugins: [new Dotenv(), new ForkTsCheckerWebpackPlugin()],
};
```

Mirror similarly in webpack.main.config.js plugins array.

4. Install / declare typings you’ll need
   Run once:

```bash
npm install --save-dev fork-ts-checker-webpack-plugin eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
# and add @types for libraries you use as you convert files:
npm install --save-dev @types/mssql @types/express @types/pdfreader
```

(Only add @types for libs your files import when you convert them.)

5. Plan the conversion order (low friction → high friction)

- Phase A (best start) — pure utils & small modules:
  - src/utils/\*.js (e.g. progTableUtils.js, queryUtils.js, processPDF.js)
  - src/utils/queries/\*.js
  - pdfPayload.js
    Why: few React/DOM types, easier to add return/param types.
- Phase B — data/test fixtures:
  - src/utils/test-data/\*.js
    Why: simple JSON-like objects; helps produce typed interfaces.
- Phase C — shared hooks/context/services:
  - ConfigContext.jsx → ConfigContext.tsx
  - Contexts.js
    Why: central place to define app-wide types (config, env, api shape).
- Phase D — small presentational components:
  - components/\* simple ones first, rename .jsx → .tsx
  - use React.FC<Props> or typed function component signatures
- Phase E — complex components/containers with state & MUI:
  - containers/\*, larger components, forms
- Phase F — main & server:
  - src/main.js, src/server.js, preload.js
    Why: main/server run under Node/Electron, require Node types and careful build for main process.

6. How to convert a file safely (example workflow)

- git branch migration/feature
- git mv progTableUtils.js src/utils/progTableUtils.ts
- Fix import/export differences if any (keep default exports or convert to named)
- Add explicit types for inputs and outputs. If unsure, start with lightweight types: any / unknown → refine later.
- Run npm run type-check frequently.

7. Strictness ramp (when and how)

- Stage 0 (now): keep in tsconfig: allowJs: true, transpileOnly: true, strict: false — allows fast incremental conversion.
- Stage 1 (after converting most utils & small components): enable "noImplicitAny": true and run tsc --noEmit to find missing types.
- Stage 2: enable "strictNullChecks": true to uncover null/undefined bugs.
- Stage 3: enable "strict": true and fix remaining issues.
- Use a small commit cadence and a migration branch per feature to avoid large breaking diffs.

8. Typical gotchas & fixes

- Missing types for CJS modules → create declaration stubs:

```ts
declare module 'pdfreader';
declare module 'some-legacy-cjs';
```

- Electron/webpack-injected constants → add to global.d.ts (see step 2).
- process.env keys → typed in global.d.ts to avoid TS errors.
- When using ts-loader transpileOnly, always run fork-ts-checker or tsc --noEmit in CI.

9. Linting & formatting

- Add ESLint with @typescript-eslint and the React plugin; run autofix during migration. This keeps code consistent and helps spot type problems earlier.

10. CI

- Add a job that runs:
  - npm ci
  - npm run type-check (tsc --noEmit)
  - npm test / build
    This prevents regressions when you enable stricter TS options.

11. Examples / quick commands

- Run full type-check locally:

```bash
npx tsc --noEmit
# or
npm run type-check
```

- Convert a file:

```bash
git mv src/components/Toast.jsx src/components/Toast.tsx
# open file and add Props type, fix imports
```

Files you will edit first (open these):

- progTableUtils.js
- queryUtils.js
- pdfPayload.js
- ConfigContext.jsx

When to get stricter

- Start enabling noImplicitAny after you’ve converted and typed most utils and several components (this yields fast ROI).
- Enable strictNullChecks next — it will reveal runtime null issues (fix domain logic).
- Full strict mode last.

If you want, I can:

- create the global.d.ts and shims.d.ts files in the repo,
- add ForkTsCheckerWebpackPlugin to webpack configs,
- or convert one specific file now (say /home/estebanv/eseka/eseka-produccion-seamless/src/utils/progTableUtils.js) — tell me which.

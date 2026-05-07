# Deployment and Release Notes

## Purpose
Document the build process, deployment steps, configuration, and release considerations for the Pathfinding Visualizer.

## Scope
`package.json`, `build/`, `public/`.

> `src/serviceWorker.js` was deleted in task T06-R1 (CRA PWA boilerplate never used).

---

## Build Process

The project uses Create React App (`react-scripts 5.0.1`, Webpack 5, ESLint 8, Jest 27). **Upgraded from react-scripts 3.1.2 in T13 (May 2026).**

### Scripts (`package.json`)

| Script | Command | Notes |
|---|---|---|
| `start` | `react-scripts start` | Local development server on port 3000 |
| `build` | `react-scripts build` | Production build output to `build/` |
| `predeploy` | `react-scripts build` | Runs automatically before `deploy` |
| `deploy` | `gh-pages -d build` | Publishes `build/` to GitHub Pages |
| `test` | `react-scripts test` | Jest 27 test runner (watch mode) |
| `test:coverage` | `react-scripts test --coverage --watchAll=false` | Single-run coverage report |
| `eject` | `react-scripts eject` | Irreversible CRA eject (not recommended) |

`NODE_OPTIONS=--openssl-legacy-provider` **has been removed** (T13). Webpack 5 (bundled in react-scripts 5.x) is compatible with Node 17+ OpenSSL 3 defaults. `cross-env` remains as a devDependency for future use but is no longer needed in any script.

---

## Configuration Management

| Config Key | Location | Value |
|---|---|---|
| `homepage` | `package.json` | `https://bjralphs.github.io/Visualizer` |
| `browserslist.production` | `package.json` | `>0.2%`, not dead, not op_mini all |
| `browserslist.development` | `package.json` | Last 1 Chrome/Firefox/Safari version |
| `PUBLIC_URL` | CRA environment variable | Derived from `homepage` at build time |
| `NODE_ENV` | CRA environment variable | `production` during build |

No `.env` files were found in the workspace. No custom environment variables are used beyond CRA defaults.

---

## Deployment Steps

### GitHub Pages Deployment
1. Ensure Node.js is installed and `npm install` has been run.
2. Run `npm run deploy`.
   - `predeploy` script runs `react-scripts build` first.
   - `deploy` script publishes the `build/` directory to the `gh-pages` branch via `gh-pages`.
3. GitHub Pages serves the content at `https://bjralphs.github.io/Visualizer`.

### Local Development
1. `npm install`
2. `npm start`
3. Open `http://localhost:3000`.

---

## Environment Assumptions
- Any OS — scripts are cross-platform; `--openssl-legacy-provider` workaround removed (T13).
- Node.js 16+ (Webpack 5 / react-scripts 5 compatible). Node 24 tested; a `[DEP0176]` warning from react-scripts internals appears in build output but does not affect the build.
- `gh-pages` branch exists or will be created on the target GitHub repository.
- GitHub Pages is enabled for the repository.

---

## Database Setup / Migration Steps
None. The application has no database.

---

## Rollback Considerations
- GitHub Pages deployment can be rolled back by reverting the `gh-pages` branch to a previous commit and force-pushing.
- There is no server-side state, so rollback has no data impact.
- The previous `build/` output is not retained locally after a new build; ensure the previous deployment commit is tagged if rollback is needed.

---

## Release Checklist
- [ ] `npm test` passes.
- [ ] `npm run build` completes without errors or warnings.
- [ ] Application loads correctly at `localhost:3000` before deploying.
- [ ] All 13 algorithms run and animate correctly.
- [ ] All maze generators produce valid mazes.
- [ ] Responsive layout verified at common viewport sizes.
- [ ] `npm run deploy` completes and the live URL is accessible.

---

## Deployment Gaps
- No CI/CD pipeline; deployment is fully manual.
- No staging environment; changes go directly to production (GitHub Pages).
- No version tagging or changelog management process.
- Service worker boilerplate deleted (T06-R1); PWA offline capability was never active.

---

## Operational Concerns
- GitHub Pages has no server-side logic; the app is a static bundle.
- Cache busting is handled by CRA's content-hashed filenames (e.g., `main.aa556af0.chunk.js`).
- The `build/` directory is committed as part of the deployment but is not the source of truth; `src/` is.

---

## Known Gaps
- No environment-specific configuration (dev vs. prod feature flags).
- ~~No automated deployment pipeline.~~ **CI added: `ci.yml` tests every push/PR; `deploy.yml` deploys on push to `main`.**
- ~~Cross-platform build script incompatibility.~~ **Fixed: T07 (cross-env) + T13 (removed openssl flag).**

---

## Recommended Follow-up Work
1. ~~Replace Windows-specific `set` with `cross-env` package for cross-platform compatibility.~~ **Done (T07).**
2. ~~Upgrade `react-scripts` to a version compatible with current Node.js.~~ **Done: upgraded to react-scripts 5.0.1 (T13).**
3. Add a GitHub Actions workflow for automated build, test, and deploy on merge to `main`.
4. Tag releases with semantic version numbers.

---

## Release History

### May 2026 — Phase 2
- **T12**: Upgraded React 16.10.1 → 18.3.1. Entry point updated to `createRoot` API (`src/index.js`). `App.test.js` migrated to `@testing-library/react`.
- **T13**: Upgraded react-scripts 3.1.2 → 5.0.1 (Webpack 5, ESLint 8, Jest 27). Removed `--openssl-legacy-provider` from all scripts. Added `@testing-library/react@^13`, `@testing-library/jest-dom@^5`, `@testing-library/user-event@^13` as explicit devDependencies. ESLint Unicode BOM rule silenced via `eslintConfig`.
- **T14**: Added `role="grid"` / `role="row"` / `role="gridcell"` ARIA hierarchy to the grid. Each Node has `tabIndex={0}`, `aria-label`, and Space/Enter keyboard toggle support. Focus ring added via `.node:focus-visible`.
- **T15**: Added touch event support for mobile drawing. `onTouchStart` per Node; `onTouchMove`/`onTouchEnd` on the grid container. `handleTouchMove` uses `document.elementFromPoint` to identify the node under the touch point. `touch-action: none` added to `.grid` CSS to prevent browser scroll interception.
- **ARIA tests (Node.test.jsx)**: 14 tests covering `aria-label` content, `role="gridcell"`, `tabIndex`, keyboard toggle (Space/Enter), and `onTouchStart` forwarding.
- **GitHub Actions CI**: New `ci.yml` runs `npm test` + `npm run build` on every push and PR. Fixed `deploy.yml`: removed stale `NODE_OPTIONS: --openssl-legacy-provider`, updated to Node 20 LTS, added `npm ci` caching, added test step before deploy.
- **Coverage thresholds**: `jest.coverageThreshold` added to `package.json`. `npm run test:coverage` script added. Actual coverage: statements 51%, branches 40%, functions 50%, lines 54%.
- **Algorithm tests**: All 13 algorithms now have unit tests. `remaining_algorithms.test.js` covers `dfs`, `floydWarshall`, `gbfs`, `biDirectionalSearch`, `uniformCostSearch`, `beamSearch`, `weightedAStar` (28 tests).
- **Test suite**: 121 tests across 12 suites, all passing.

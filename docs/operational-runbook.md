# Operational Runbook

## Purpose
Provide a reference for diagnosing, recovering, and maintaining the Pathfinding Visualizer in a live environment.

## Scope
GitHub Pages deployment at `https://bjralphs.github.io/Visualizer`. Local development at `http://localhost:3000`.

---

## Common Support Tasks

### Task 1: Deploy a New Version
```bash
npm install          # ensure dependencies are up to date
npm test             # verify no regressions
npm run deploy       # builds and publishes to gh-pages branch
```
Allow 1–5 minutes for GitHub Pages CDN to propagate.

### Task 2: Run Locally
```bash
npm install
npm start
```
Opens at `http://localhost:3000`.

### Task 3: Run Tests
```bash
npm test
```
Runs Jest in watch mode. Press `a` to run all tests.

### Task 4: Rebuild Without Deploying
```bash
npm run build
```
Output is in `build/`. Inspect `build/index.html` and `build/static/` to verify.

---

## Failure Diagnosis Steps

### Symptom: Blank page / app does not load after deployment

1. Open browser DevTools → Console. Look for JavaScript errors.
2. Check the GitHub Pages deployment status at `https://github.com/bjralphs/Visualizer/deployments`.
3. Verify the `gh-pages` branch was updated: `git log gh-pages --oneline -5`.
4. Test the build locally: `npm run build` → serve `build/` with a static server.
5. Check for cache issues: open the URL in an incognito window or hard-refresh (`Ctrl+Shift+R`).

### Symptom: Algorithm does not animate
1. Open DevTools → Console. Check for JavaScript errors.
2. Verify the algorithm name in `ALGORITHM_REGISTRY` matches the name shown in the UI.
3. Check if `isAnimating` is stuck at `true` — refresh the page to reset.
4. Verify the start and finish nodes are not surrounded by walls.

### Symptom: Maze generation produces an inaccessible grid
1. Confirm `applyMaze` ran — check if start/finish nodes are on open cells.
2. If nodes appear on walls after maze generation, this is a bug in `applyMaze`'s BFS — file a bug.

### Symptom: Build fails with OpenSSL error
```
error:0308010C:digital envelope routines::unsupported
```
**Fix:** Ensure `NODE_OPTIONS=--openssl-legacy-provider` is set. On Windows this is already in the npm scripts. If running in a non-Windows shell, prepend manually:
```bash
NODE_OPTIONS=--openssl-legacy-provider npm run build
```
Or upgrade Node.js to a version compatible with Webpack 5 and upgrade `react-scripts`.

### Symptom: `npm run deploy` fails
1. Check GitHub credentials / SSH key is configured.
2. Confirm `gh-pages` package is installed: `npm ls gh-pages`.
3. Check the `homepage` field in `package.json` matches the target URL.

---

## Important Logs

| Log | Location | When to check |
|---|---|---|
| Browser console errors | DevTools → Console | Any runtime failure |
| `ErrorBoundary` output | DevTools → Console (`ErrorBoundary caught: ...`) | White screen / app crash |
| GitHub Pages deployment log | GitHub repository → Actions or Deployments tab | Deployment failures |
| `npm run build` output | Terminal | Build failures |

---

## Configuration Checks

| Check | Location | Expected Value |
|---|---|---|
| `homepage` URL | `package.json` | `https://bjralphs.github.io/Visualizer` |
| Node.js version compatibility | `package.json` scripts | Requires `--openssl-legacy-provider` flag |
| `react-scripts` version | `package.json` dependencies | `3.1.2` |
| `gh-pages` version | `package.json` devDependencies | `^6.3.0` |

---

## Database Checks
Not applicable. The application has no database.

---

## Restart / Recovery Steps

### Full Reset (Local)
1. Stop `npm start` (`Ctrl+C`).
2. Delete `node_modules/` and `build/` if needed.
3. Run `npm install`.
4. Run `npm start`.

### Production Rollback (GitHub Pages)
1. Find the last known-good commit hash on the `gh-pages` branch:
   ```bash
   git log gh-pages --oneline
   ```
2. Force-reset `gh-pages` to that commit and push:
   ```bash
   git checkout gh-pages
   git reset --hard <good-commit-hash>
   git push --force origin gh-pages
   ```
3. Verify the live URL is restored (allow up to 5 minutes for CDN propagation).

---

## Escalation Guidance
This is an open-source educational project with a single maintainer. There is no on-call rotation or SLA.

- For build or deployment issues: check the [Create React App documentation](https://create-react-app.dev/) and [gh-pages npm package](https://www.npmjs.com/package/gh-pages).
- For algorithm correctness issues: open a GitHub issue with a reproducible grid configuration.

---

## Known Operational Risks

| Risk | Impact | Current Status |
|---|---|---|
| No automated monitoring | Production errors are invisible | No monitoring configured |
| Manual deployment only | Human error can break production | No CI/CD |
| Node.js version sensitivity | Build fails on incompatible Node | Workaround in place (`--openssl-legacy-provider`) |
| No staging environment | All changes go directly to production | Accepted risk for this project scale |
| `isAnimating` stuck on error | UI permanently locked | Mitigated by page refresh; no auto-recovery |

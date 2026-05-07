# Reliability Improvement Case Study

## Purpose
Identify reliability risks in the Pathfinding Visualizer codebase, document current error-handling behaviour, and recommend improvements.

## Scope
`src/Components/ErrorBoundary.jsx`, `src/PathfindingVisualizer/PathfindingVisualizer.jsx`, `src/algorithms/`, `src/serviceWorker.js`.

---

## Reliability Problem / Risk

### Risk 1: Animation Errors Are Not Caught

**Problem:** The animation loop in `PathfindingVisualizer.jsx` queues hundreds of `setTimeout` callbacks. Any JavaScript exception thrown inside a callback (e.g., a null `document.getElementById` return) will:
- Not be caught by `ErrorBoundary.jsx` (which only catches React render errors).
- Leave `isAnimating === true` permanently, locking the UI.
- Produce no user-visible feedback.

**Evidence from codebase:**
```js
// PathfindingVisualizer.jsx
const tid = setTimeout(() => {
  const el = document.getElementById(id);
  if (el) el.className = cls; // el can be null if grid resizes during animation
}, 3 * delayCounter++);
```

The `if (el)` guard exists for the null case but only silently skips it — it does not cancel the animation or notify the user.

---

### Risk 2: Node.js / OpenSSL Build Dependency

**Status: Resolved (T07, May 2026).** `cross-env@10.1.0` was installed as a devDependency and all build/start scripts were updated to use `cross-env NODE_OPTIONS=...` syntax, replacing the Windows-only `set VAR=value &&` form.

**Original problem:** All build and start scripts used `set NODE_OPTIONS=--openssl-legacy-provider`, a workaround for a known incompatibility between Node.js 17+ and Webpack 4. This syntax only works on Windows `cmd.exe`.

**Resolution:**
```json
"build": "cross-env NODE_OPTIONS=--openssl-legacy-provider react-scripts build"
```

**Remaining risk:** The underlying incompatibility between `react-scripts@3.1.2` (Webpack 4) and Node.js 17+ OpenSSL 3 still requires the `--openssl-legacy-provider` flag. Upgrading `react-scripts` to v5.x would remove this requirement (tracked as T13).

---

### Risk 3: No Automated Deployment Verification

**Problem:** `npm run deploy` publishes directly to GitHub Pages with no verification step. A successful `gh-pages` push does not guarantee the deployed app works.

---

### Risk 4: Insufficient Automated Test Coverage

**Status: Partially resolved (T04, T05, T08, T09, T11 — May 2026).** The test suite has grown from 1 smoke test to 74 tests across 10 suites, covering all algorithm implementations, utility functions, component state methods, and the two-phase gate behaviour.

---

## Current Error-Handling Behaviour

| Scenario | Handling | Quality |
|---|---|---|
| React render exception | `ErrorBoundary.jsx` catches, shows fallback UI, logs to console | Adequate |
| Algorithm returns no path | `PathfindingVisualizer.jsx` sets `noPathFound: true`, shows indicator | Adequate |
| Null DOM element during animation | Guarded with `if (el)` — silently skipped | Weak |
| Invalid algorithm name in registry | `ALGORITHM_REGISTRY.get(menuItem)` returns `undefined` — `Needs verification` what happens next | Unknown |
| Grid resize during animation | Clears `animationTimeouts`, resets grid | Adequate |
| Maze generator places nodes on walls | `applyMaze` relocates via BFS | Adequate |

---

## Logging / Monitoring Maturity

**Level: Minimal.**

- Only `console.error` in `ErrorBoundary.componentDidCatch`.
- No external error tracking.
- No uptime monitoring.
- No performance metrics.

---

## Recommended Improvements

### 1. Wrap Animation Callbacks in `try/catch`
```js
const tid = setTimeout(() => {
  try {
    const el = document.getElementById(id);
    if (el) el.className = cls;
  } catch (err) {
    console.error('Animation callback error:', err);
    this.context.setIsAnimating(false);
  }
}, delay);
```

### 2. Guard Against `undefined` Registry Entry
```js
const entry = ALGORITHM_REGISTRY.get(menuItem);
if (!entry) {
  console.error(`Unknown algorithm: ${menuItem}`);
  return;
}
```

### 3. Integrate Sentry in `ErrorBoundary`
```js
componentDidCatch(error, info) {
  Sentry.captureException(error, { extra: info });
}
```

### 4. Add CI/CD Pipeline
- GitHub Actions workflow: run `npm test` and `npm run build` on every push to `main`.
- Gate deployment on passing tests.

### 5. Upgrade `react-scripts`
- Upgrade to `react-scripts 5.x` to eliminate the `--openssl-legacy-provider` workaround.

---

## Expected Impact

| Improvement | Expected Outcome |
|---|---|
| Animation `try/catch` | Prevents UI lock after animation error; surfaces error details |
| Registry guard | Prevents silent failure when an unknown algorithm name is selected |
| Sentry integration | Production errors become visible without user reports |
| CI/CD pipeline | Broken deployments caught before going live |
| `react-scripts` upgrade | Removes fragile Node.js version dependency |

---

## Follow-up Work
1. Implement animation callback `try/catch` in `PathfindingVisualizer.jsx`.
2. Add registry `undefined` guard in `selectAlgorithm`.
3. Integrate Sentry (free tier adequate for this project).
4. Add GitHub Actions CI workflow.
5. Upgrade `react-scripts` and remove `--openssl-legacy-provider`.

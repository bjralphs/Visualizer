# Tradeoff Analysis

## Purpose
Document the major technical and design decisions made in the Pathfinding Visualizer, the alternatives considered, and the rationale for each choice.

## Scope
Architecture, algorithm implementation, state management, rendering, deployment, and tooling decisions visible in the codebase.

---

## Decision 1: React Class Component for `PathfindingVisualizer`

**Current approach:** `PathfindingVisualizer.jsx` is a React class component using `static contextType`, lifecycle methods (`componentDidMount`, `componentWillUnmount`), and an imperative ref API.

**Alternatives considered:**
- Functional component with hooks (`useEffect`, `useRef`, `useImperativeHandle`).

**Why current approach was chosen:**
- The class component pattern was established before React hooks were the dominant paradigm. Refactoring was deferred to avoid risk during active feature development.
- Class components support `static contextType` (single context), which was simpler for the initial integration.

**Tradeoffs:**
- Maintainability: Class components are harder to test and compose than functional components.
- Performance: No meaningful difference at this scale.
- Developer experience: Hooks are now the React standard; new contributors expect functional components.

**Deferred improvement:** Refactor `PathfindingVisualizer.jsx` to a functional component with `useImperativeHandle`.

---

## Decision 2: Split Context Architecture (`MenuItemContext.js`)

**Current approach:** Four sub-contexts (`MenuCtx`, `AnimationCtx`, `DrawModeCtx`, `HistoryCtx`) and a combined `MenuItemContext` for the class component. Each slice only re-renders its consumers.

**Alternatives considered:**
- Single monolithic context (simpler, but causes all consumers to re-render on any change).
- Redux or Zustand for global state.

**Why current approach was chosen:**
- Avoids unnecessary re-renders without adding a third-party state management library.
- Keeps the dependency footprint minimal (only `react` and `react-dom`).

**Tradeoffs:**
- The dual-context pattern (split sub-contexts + combined context for the class component) adds complexity.
- No Redux DevTools or time-travel debugging.
- As state grows, custom hooks become harder to maintain than a reducer.

---

## Decision 3: DOM Direct Manipulation for Animation

**Current approach:** Animation mutates DOM `className` directly via `document.getElementById(id).className = cls` inside `setTimeout` callbacks, bypassing React's render cycle.

**Alternatives considered:**
- Store visited/path state in React state and let React re-render nodes.
- Use CSS animations triggered by class names set via React state.

**Why current approach was chosen:**
- Mutating thousands of DOM nodes via `setState` on every animation frame would cause significant re-render overhead, especially on large grids (up to 26 × 68 = 1,768 nodes).
- Direct DOM mutation is significantly faster for high-frequency sequential updates.

**Tradeoffs:**
- Correctness risk: React state and DOM can drift out of sync; `resetCSS()` is needed to reconcile.
- Testability: DOM-mutation logic cannot be tested with React Testing Library snapshot tests.
- Maintainability: The pattern is non-idiomatic React.

---

## Decision 4: Algorithm Registry Pattern (`ALGORITHM_REGISTRY`)

**Current approach:** A `Map` in `PathfindingVisualizer.jsx` maps algorithm name strings to `{ fn, animate }` objects. Adding a new algorithm requires one entry in this map and one import.

**Alternatives considered:**
- A large `switch` statement on algorithm name.
- Dynamic imports per algorithm.

**Why current approach was chosen:**
- Single source of truth: one place to add an algorithm.
- Eliminates repetitive `if/else` or `switch` branching.
- Easy to extend without modifying existing logic.

**Tradeoffs:**
- Algorithm name strings must match exactly between the registry, `algoData.js`, and modal selection UI.
- No compile-time type safety on the key strings.

---

## Decision 5: GitHub Pages Deployment

**Current approach:** Static deployment to GitHub Pages via `gh-pages` npm package. No server, no backend, no CI/CD pipeline.

**Alternatives considered:**
- Netlify or Vercel for automated CI/CD.
- A Node.js server for future API capabilities.

**Why current approach was chosen:**
- Free hosting for a static SPA.
- Zero infrastructure to maintain.
- Simple deployment command (`npm run deploy`).

**Tradeoffs:**
- Manual deployment; no automated pipeline on code push.
- No staging environment.
- Windows-specific `set NODE_OPTIONS=...` syntax in scripts breaks on Linux/macOS.
- No server-side capabilities if future features require them.

---

## Decision 6: Manhattan Distance Heuristic for All Heuristic Algorithms

**Current approach:** `heuristic(nodeA, nodeB)` in `utils.js` uses Manhattan distance (`|Δrow| + |Δcol|`) for A*, Weighted A*, GBFS, Beam Search, IDA*, and Bidirectional A*.

**Alternatives considered:**
- Euclidean distance (better for diagonal movement).
- Chebyshev distance.

**Why current approach was chosen:**
- The grid uses only orthogonal (4-directional) movement. Manhattan distance is admissible and consistent for this grid type.
- Euclidean distance would overestimate costs in a 4-connected grid.

**Tradeoffs:**
- If diagonal movement is added in future, the heuristic must change to Euclidean or Chebyshev.

---

## Decision 7: `MinHeap` Implemented from Scratch

**Current approach:** A custom binary min-heap (`MinHeap` class in `utils.js`) is used by all priority-queue-based algorithms.

**Alternatives considered:**
- JavaScript arrays with `Array.sort()` (O(n log n) per sort vs O(log n) per insert/extract).
- A third-party heap library.

**Why current approach was chosen:**
- Zero additional dependencies.
- `Array.sort()` is too slow for large grids with many nodes.
- The custom heap supports a configurable `keyFn` for flexible priority comparison.

**Tradeoffs:**
- Custom data structures require more maintenance than well-tested library code.
- The heap uses a "lazy deletion" pattern (stale entries are discarded on extract) which is correct but not immediately obvious to new contributors.

---

## Operational Concerns
- Several deferred improvements (React upgrade, CI pipeline, cross-platform scripts) accumulate technical debt.

---

## Known Gaps
- No formal architecture decision record (ADR) process.

---

## Recommended Follow-up Work
1. Adopt ADR format for future decisions.
2. Address the class component → functional component refactor.
3. Replace direct DOM mutation with a virtualized animation approach.
4. Add `cross-env` to fix cross-platform build scripts.

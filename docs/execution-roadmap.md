# Execution Roadmap — Pathfinding Visualizer

_Generated: May 6, 2026 — targeting first public release_

---

## 1. Current State Summary

The codebase is in **late-development, pre-release condition**. All originally planned Phase 1 and Phase 2 work described in [roadmap.md](roadmap.md) has been applied. The product is functionally complete against the PRD MVP scope with two notable exceptions (one user-visible bug, one test gap) and a cluster of low-risk cleanup items.

### What is working

| Area | Evidence |
|------|----------|
| All 13 algorithms | `ALGORITHM_REGISTRY` in `PathfindingVisualizer.jsx:33–47`; all `.js` files present under `src/algorithms/` |
| 12 maze generators | `selectMaze()` switch (`PathfindingVisualizer.jsx:831–874`) covers 12 named cases |
| Wall / weight / gate drawing | `handleMouseDown`, `handleMouseEnter` dispatch on `context.drawMode` |
| Drag for start, finish, gate | `draggingNode` state + `handleMouseEnter` drag paths |
| Gate two-phase execution | `selectAlgorithmWithGate()` + `animateTwoPhase()` |
| Responsive grid resize | `handleResize()` with debounce-free cancel-and-rebuild |
| Animation speed (Slow / Fast) | `selectSpeed()` reads `context.speedItem`; `MenuItemProvider` cycles it |
| Clear path / reset grid | Both correctly cancel timeouts and restore CSS |
| Info sidebar + run history | `Context.jsx` + `algoData.js` (13 entries) + `MAX_RUN_HISTORY = 20` |
| Accessible modals | `SelectionModal.jsx`: `role="dialog"`, focus trap, Escape, arrow-key navigation |
| Error boundary | `ErrorBoundary.jsx` wraps `<App>` |
| Static deploy | `npm run deploy` → `gh-pages -d build`; homepage set to `https://bjralphs.github.io/Visualizer` |

---

## 2. PRD Compliance Matrix

| Req | Description | Status | Evidence / Gap |
|-----|-------------|--------|----------------|
| FR1 | Select 1 of 13 algorithms | ✅ Done | `AlgorithmModal.jsx` + `ALGORITHM_REGISTRY` |
| FR2 | Generate multiple maze patterns | ⚠️ Partial | 12 generators work; **"Basic Random Maze" produces identical output to "Recursive Division"** — `visualizeBRM()` calls `createMaze()`, same as `visualizeCellularMaze()` |
| FR3 | Draw walls, weighted nodes, gate | ✅ Done | `drawMode` ∈ {`'wall'`,`'weight'`,`'gate'`} all wired |
| FR4 | Drag start, finish, gate | ✅ Done | `draggingNode` state; drag paths in `handleMouseEnter` |
| FR5 | Animate algorithm execution | ✅ Done | `_animate()` / `animateTwoPhase()` with timeout queues |
| FR6 | Clear path / reset grid | ✅ Done | `clearPath()` preserves walls; `resetGrid()` clears all |
| FR7 | Adjust speed (Slow / Fast) | ✅ Done | Speed toggle in `Navbar.jsx`; `selectSpeed()` returns 30ms / 10ms |
| FR8 | Info sidebar with metadata + run history | ✅ Done | `Context.jsx` renders `algoData.js` fields + `runHistory` |
| FR9 | Responsive grid resize | ✅ Done | `handleResize()` rebuilds grid to fit new viewport |
| NFR1 | Smooth on 26×68 grids | ⚠️ Risk | Floyd-Warshall allocates two O(V²) matrices for 1 768 nodes ≈ 3M cells; this works but forces animation to play ALL non-wall nodes, making it visually slow |
| NFR2 | Load < 3s on broadband | ✅ Done | Static SPA, no runtime dependencies beyond React |
| NFR3 | Static SPA, no server | ✅ Done | No backend calls, no `localStorage` |
| NFR4 | Deploy via `npm run deploy` | ✅ Done | `gh-pages` script configured |

**Overall compliance: 12 / 14 requirements fully met; 2 have known gaps.**

---

## 3. Bug List

### B1 — `visualizeBRM()` is a duplicate of `visualizeCellularMaze()` _(User-Visible, High)_

**File:** `PathfindingVisualizer.jsx:487–491`

```js
visualizeBRM() {
  const { grid } = this.state;
  const newGrid = createMaze(grid);   // identical to visualizeCellularMaze()
  this.applyMaze(newGrid);
}
```

Both "Recursive Division" and "Basic Random Maze" call `createMaze()`, which is a randomised Prim's DFS maze carver. The user selects "Basic Random Maze" and gets a structured maze — directly contradicting the `MazeModal` description: _"Places walls randomly across the grid; quick, chaotic, and unpredictable."_

**Fix:** Replace `visualizeBRM()` body with a random wall scatter (30–40 % wall probability), similar to how `visualizeWeightMaze()` works but toggling `isWall` instead of `isWeight`. **Does not require `applyMaze()`** since random scatter preserves open cells.

---

### B2 — `handleReset()` mutates node objects in-place _(Low, Fragile)_

**File:** `PathfindingVisualizer.jsx:210–224`

```js
handleReset = grid => {
  return grid.map(row =>
    row.map(node => ({
      ...node,
      distance: Infinity,
      isVisited: false,
      isWall: false,          // spread + override — safe
      ...
    })),
  );
};
```

This method itself is correctly immutable (spread + override). **However**, `resetAlgorithmState()` at line ~602 mutates node fields directly:

```js
resetAlgorithmState(grid) {
  for (const row of grid) {
    for (const node of row) {
      node.distance = Infinity;   // direct mutation
      node.isVisited = false;
      ...
    }
  }
}
```

`resetAlgorithmState()` is called inside `selectAlgorithmWithGate()` on the live grid reference _before_ setState. Because `selectAlgorithmWithGate()` runs synchronously before the setState callback, the mutation is intentional (avoids a full grid copy on each gate-phase transition). However, this bypasses React's change-detection and can cause subtle bugs if rendering order assumptions change.

**Fix:** Document the intentional mutation with a comment, or extract to a pure helper used only in the gate-phase pipeline.

---

### B3 — Unused `'Average'` speed case _(Dead Code, Low)_

**File:** `PathfindingVisualizer.jsx:900–910`

```js
selectSpeed() {
  switch (this.context.speedItem) {
    case 'Fast':    return 10;
    case 'Average': return 20;   // UNREACHABLE — SPEEDS = ['Slow', 'Fast']
    case 'Slow':    return 30;
    default:        return 10;
  }
}
```

`MenuItemContext.js:72` defines `const [speedItem, setSpeedItem] = useState('Slow')` and `Navbar.jsx:20` defines `const SPEEDS = ['Slow', 'Fast']`. The `'Average'` branch can never execute.

**Fix:** Remove the `'Average'` case.

---

### B4 — `Node.jsx` wrapped in `React.memo` but defeats memoisation _(Performance, Medium)_

**File:** `PathfindingVisualizer.jsx:955–970`, `Node.jsx:12`

Every render of `PathfindingVisualizer` creates new inline arrow functions:

```js
onMouseDown={() => this.handleMouseDown(row, col)}
```

`React.memo` performs a shallow prop comparison. New function references on every render mean all ~1 700 `Node` components re-render whenever `mouseIsPressed` or `draggingNode` changes (twice per mouse-down/up cycle).

Additionally, `mouseIsPressed` is passed as a prop to `Node` but is not in `Node.jsx`'s destructuring and is never used — it is silently forwarded to the DOM as an unknown attribute (React will warn in development).

**Fix (minimum viable):** Remove `mouseIsPressed` from the `<Node>` JSX props. This alone eliminates the extra re-render burst. A fuller fix binds the handlers once in the constructor.

---

### B5 — `GrassBackground` rendered twice _(Visual Flicker Risk, Low)_

`App.js:65` renders `<GrassBackground />` as a full-viewport fixed layer (`zIndex: -1`). `PathfindingVisualizer.jsx:921` renders a second `<GrassBackground />` inside `.pv-container`. Two identical background layers are composited; the inner one may clip on narrow viewports.

**Fix:** Remove the `<GrassBackground />` call inside `PathfindingVisualizer.jsx`'s `render()` method; the `App.js` layer covers the full viewport.

---

### B6 — `bellman_ford_search.js` re-declares a private `getUnvisitedNeighbors` _(Dead Duplicate, Low)_

**File:** `bellman_ford_search.js:38–51`

A local `getUnvisitedNeighbors` is defined inside the file, functionally identical to the exported `getUnvisitedNeighbors` in `utils.js` except it additionally filters `!neighbor.isWall`. The file imports `getAllNodes` from `utils.js` but not `getUnvisitedNeighbors`, so the local version shadows the shared one.

Two divergences exist: the local version filters `isWall`; the shared one does not. Bellman-Ford correctly avoids walls through this local filter — but the divergence from the shared API is a maintenance hazard.

**Fix:** Import `getUnvisitedNeighbors` from `utils.js` and add a wall-filter step inside `getAllEdges()`, or add an `isWall` parameter to the shared utility. Remove the local declaration.

---

### B7 — `App.test.js` uses deprecated `ReactDOM.render` _(Test Infrastructure, Low)_

**File:** `src/App.test.js`

React 18 removes `ReactDOM.render`. The project is on React 16 so this doesn't fail today, but any upgrade path runs through this test breaking first.

---

## 4. Dead / Residual Code

| Location | Item | Safe to Remove |
|----------|------|---------------|
| `src/serviceWorker.js` + `index.js:11` | CRA PWA boilerplate; `unregister()` always called | Yes — remove the import and the file |
| `Node.css:22–29` | `.node-f` and `.node-s` rules — no class name in any JSX or CSS applies these | Yes — remove both rules |
| `PathfindingVisualizer.jsx:selectSpeed()` | `'Average'` case | Yes — remove the case |
| `<Node mouseIsPressed={mouseIsPressed}>` | Prop not consumed by `Node.jsx` | Yes — remove the prop |
| Inner `<GrassBackground>` in `PathfindingVisualizer.jsx` | Duplicate of the App-level background | Yes — remove inner instance |
| `bellman_ford_search.js` local `getUnvisitedNeighbors` | Duplicates `utils.js` | Yes after refactor |

---

## 5. Missing Tests

The only test file is `src/App.test.js` — a smoke test that mounts and immediately unmounts `<App>`. No algorithm, utility, context, or component behaviour is tested.

### Critical gaps (block release confidence)

| Gap | Why it matters |
|----|----------------|
| Algorithm unit tests | Regressions in path correctness are invisible without them. A wrong `previousNode` chain silently produces no path or an incorrect one |
| `MinHeap` unit test | The heap is used by 7 algorithms; a subtle off-by-one in `_siftDown` would corrupt all of them |
| `getNodesInShortestPathOrder` | Shared by all non-bidirectional algorithms; must produce `[start, …, finish]` and terminate on disconnected graph |
| `applyMaze` BFS placement | The `findNearestConnected` BFS must never return a walled cell |
| Gate two-phase correctness | `selectAlgorithmWithGate` runs two independent algorithm phases; an early-exit bug in phase 2 would show no path without a visible error |

### Secondary gaps (pre-release recommended)

| Gap |
|----|
| `MAX_RUN_HISTORY = 20` cap enforced by `addRun` |
| `handleReset` returns correct node shapes |
| `handleResize` clamps start/finish within new bounds |
| `clearPath` preserves `isWall` and `isWeight` |
| `visualizeWeightMaze` does not overwrite start/finish/gate |
| Bidirectional A* `getNodesInShortestPathOrderBiAStar` stitches forward + backward chains correctly |

---

## 6. Edge Cases and Blind Spots

| ID | Description | Location | Verified? |
|----|-------------|----------|-----------|
| EC1 | Start node == finish node (zero-length path) | All algorithms — `if (closestNode === finishNode) return` fires immediately; `getNodesInShortestPathOrder` returns `[finishNode]`; `_animateShortestPath` receives length-1 array and sets `noPathFound: true`. This is correct behaviour but untested | Needs verification |
| EC2 | Finish node fully walled in | Algorithms return `visitedNodesInOrder` with finish never reached; `getNodesInShortestPathOrder(finish)` walks `previousNode = null` chain and returns `[finish]` (length 1); `_animateShortestPath` correctly shows `noPathFound: true` | Needs verification |
| EC3 | Gate placed on a cell that becomes a wall after maze generation | `handleReset` clears `hasGate`; maze generation always resets gate state. But if the user places a gate and then hand-draws a wall on the same cell, the wall-toggle hits `getNewGridWithWallToggled` which does not check `isGate` — it will set `isWall: true` on a gate cell. `handleMouseDown` guards against `drawMode === 'wall'` reaching gate cells only when `drawMode === 'gate'`; in wall mode, `handleMouseDown` calls `getNewGridWithWallToggled` without gate protection | **Bug — needs fix** |
| EC4 | Very small grid (< 3 rows or cols) after extreme window resize | `getInitialGrid` clamps to `MAX_ROWS / MAX_COLS` upper bounds but has no lower-bound clamp; `numRows` or `numCols` could be 0 or negative on very short viewports | Needs verification |
| EC5 | Floyd-Warshall on a fully open 26×68 grid | V = 1768; matrix size = 1768² ≈ 3.1M cells × 2 arrays; JS heap allocation is ~25 MB. Animation plays all 1768 nodes at `speed` ms each — at Fast (10ms) this is 17.7 s of animation | Confirmed slow; acceptable as a known limitation of the algorithm |
| EC6 | IDA* on a grid with no path | `maxBound = grid.length * grid[0].length`; the while loop terminates when `bound > maxBound`. On a 26×68 grid `maxBound = 1768`; IDA* may iterate up to 1768 times before giving up | Needs verification that it terminates within a few seconds |
| EC7 | Drag start/finish to same cell | `handleMouseEnter` for `draggingNode === 'start'` checks `target.isFinish` but not if `row === finishNodeRow && col === finishNodeCol` when they coincide with the gate. Gate protection is present for start drag (`target.isGate`), so this is handled | ✅ Covered |
| EC8 | Maze generated while gate is placed | `selectMaze()` resets `hasGate: false` and clears gate state before generating — correct | ✅ Covered |
| EC9 | Window resize during animation | `handleResize` calls `setIsAnimating(false)` and clears all timeouts before rebuilding — correct | ✅ Covered |
| EC10 | Bidirectional A* path reconstruction when meeting node is start or finish | `getNodesInShortestPathOrderBiAStar` builds forward chain from `meetingNode.previousNode` and backward chain from `meetingNode.previousNodeReverse`. If the meeting node is the start, `previousNode = null` and forward chain is just `[startNode]`; backward chain reconstructs to finish. Edge case is structurally handled but untested | Needs verification |

---

## 7. Cleanup / Refactor Recommendations

These are **not required for release** but reduce maintenance cost:

| Rec | Item | Effort |
|-----|------|--------|
| R1 | Remove `serviceWorker.js` and its `index.js` import | 5 min |
| R2 | Remove unused `.node-f` / `.node-s` CSS rules | 2 min |
| R3 | Remove `mouseIsPressed` prop from `<Node>` JSX | 2 min |
| R4 | Remove inner `<GrassBackground>` from `PathfindingVisualizer.jsx` | 2 min |
| R5 | Remove `'Average'` dead case from `selectSpeed()` | 1 min |
| R6 | Consolidate `bellman_ford_search.js` local `getUnvisitedNeighbors` into `utils.js` call | 15 min |
| R7 | Add cross-platform build scripts (use `cross-env` package) | 20 min |
| R8 | Document `resetAlgorithmState()` mutation intent explicitly | 5 min |

---

## 8. Phased Remediation Plan

### Phase 0 — Blockers (must fix before release)

These are **required** for the product to be correct and releasable.

| ID | Task | PRD Req | Files Affected | Complexity | Risk | Can Parallelize | Status |
|----|------|---------|----------------|-----------|------|-----------------|--------|
| T01 | Fix `visualizeBRM()`: replace with random wall scatter | FR2 | `PathfindingVisualizer.jsx` | Low | Low | Yes | ✅ Done |
| T02 | Fix EC3: wall draw guards against gate cell | FR3 | `PathfindingVisualizer.jsx:handleMouseEnter` | Low | Low | Yes | ✅ Done |
| T03 | Remove `mouseIsPressed` prop from `<Node>` | NFR1 | `PathfindingVisualizer.jsx` | Low | Low | Yes | ✅ Done |
| T04 | Write algorithm unit tests (MinHeap, BFS, Dijkstra, A*, path reconstruction) | — | New `src/algorithms/*.test.js` | Medium | Low | Yes | ✅ Done |
| T05 | Write `utils.js` unit tests | — | New `src/algorithms/utils.test.js` | Low | Low | Yes (with T04) | ✅ Done |

### Phase 1 — Quality (before publicising URL)

| ID | Task | PRD Req | Files Affected | Complexity | Risk | Can Parallelize | Status |
|----|------|---------|----------------|-----------|------|-----------------|--------|
| T06 | Dead code cleanup (B5, B6, R1–R6) | — | Multiple | Low | Low | Yes | ✅ Done |
| T07 | Fix cross-platform scripts (add `cross-env`) | NFR4 | `package.json` | Low | Low | Yes | ✅ Done |
| T08 | Write component tests: `clearPath` preserves walls, `resetGrid` restores state, `handleResize` clamps bounds | FR6, FR9 | `src/PathfindingVisualizer/PathfindingVisualizer.test.jsx` | Medium | Low | Yes | ✅ Done |
| T09 | Write gate/two-phase integration test | FR4, FR5 | `src/algorithms/gate_integration.test.js` | Medium | Medium | Yes | ✅ Done |
| T10 | Verify and fix EC4 (small grid lower-bound clamp) | FR9 | `PathfindingVisualizer.jsx:getInitialGrid`, `handleResize`, `componentDidMount` | Low | Low | Yes | ✅ Done |
| T11 | Verify IDA\* termination time on no-path grid (EC6) | NFR1 | `src/algorithms/ida_star_search.test.js` | Low | Low | Yes | ✅ Done |

### Phase 2 — Hardening (post-launch maintenance window)

| ID | Task | PRD Req | Files Affected | Complexity | Risk | Can Parallelize | Status |
|----|------|---------|----------------|-----------|------|-----------------|--------|
| T12 | Upgrade React 16 → 18 + migrate to `createRoot` | — | `index.js`, `App.test.js`, `package.json` | Medium | Medium | No (T04/T08 must pass first) | ✅ Done |
| T13 | Upgrade `react-scripts` 3.1.2 → 5.x | — | `package.json`, ESLint config | Medium | Medium | No (do after T12) | ✅ Done |
| T14 | Add ARIA labels and keyboard support for grid cells | — | `Node.jsx`, `PathfindingVisualizer.jsx` | High | Medium | Yes | ✅ Done |
| T15 | Add pointer events (touch) support for mobile drawing | — | `PathfindingVisualizer.jsx`, `Node.jsx`, `PathfindingVisualizer.css` | Medium | Low | Yes | ✅ Done |
| T16 | Show performance metrics in sidebar (steps, path length, time) | Future enhancement | `Context.jsx`, `MenuItemContext.js` | Low | Low | Yes | ✅ Already implemented (pre-existing) |

---

## 9. Directed Acyclic Graph (DAG) of Tasks

```
T05 ──┐
T04 ──┤── [all unit tests pass]
      │
T01 ──┤
T02 ──┤
T03 ──┘
      │
      ▼
   Phase 0 complete
      │
T06 ──┤
T07 ──┤
T08 ──┤
T09 ──┤
T10 ──┤
T11 ──┘
      │
      ▼
   Phase 1 complete  ←── RELEASE
      │
T12 ──► T13 ──┐
              ├── T14
              └── T15
                    │
                    ▼
                 Phase 2
```

Dependencies:
- T12 (React 18 upgrade) must follow Phase 0 + Phase 1 passing (tests are the safety net)
- T13 (react-scripts 5) must follow T12; together they complete all toolchain upgrades
- T14 (ARIA) was parallelisable with T12/T13 and has been completed
- T15 (touch) is the sole remaining Phase 2 task; can be implemented independently
- T16 was already implemented prior to Phase 2
- **All 13 algorithm unit tests now exist** (`remaining_algorithms.test.js` covers the 7 previously untested algorithms)
- **Node.test.jsx** covers ARIA labels (all 6 states), keyboard toggle (Space/Enter), and touch forwarding (14 tests)
- **GitHub Actions CI** added (`ci.yml`); `deploy.yml` fixed and now runs tests before deploy
- **Coverage thresholds** configured in `package.json`; `npm run test:coverage` available
- **Test suite: 121 tests across 12 suites, all passing** (build: "Compiled successfully")
- **All planned follow-up items complete.** No open tracked tasks remain.
- T13 (react-scripts upgrade) must follow T12
- T14, T15 can run in parallel after T13

All Phase 0 and Phase 1 tasks are independent of each other and can run in parallel within each phase.

---

## 10. Parallel Worktree Plan

Because all Phase 0 tasks touch different functions/files they can be developed simultaneously in separate git worktrees.

```
main (integration branch)
├── worktree-fix-maze         → T01: random wall scatter for Basic Random Maze
├── worktree-fix-guards       → T02 + T03: gate-cell wall guard + remove mouseIsPressed prop
├── worktree-unit-tests       → T04 + T05: algorithm + utils unit tests
└── worktree-cleanup          → T06 + T07 + T10 + T11: dead code, cross-env, edge-case checks
```

**Setup:**
```bash
git worktree add ../visualizer-fix-maze -b fix/basic-random-maze
git worktree add ../visualizer-fix-guards -b fix/gate-wall-guard
git worktree add ../visualizer-unit-tests -b feat/algorithm-unit-tests
git worktree add ../visualizer-cleanup -b chore/dead-code-cleanup
```

Merge order: worktree-fix-guards and worktree-fix-maze both touch `PathfindingVisualizer.jsx` in different functions — rebase against main after each lands to avoid conflicts.

---

## 11. Detailed Task Specifications

### T01 — Fix `visualizeBRM()`: Random Wall Scatter

**ID:** T01  
**PRD Req:** FR2 — "User can generate one of multiple maze patterns"  
**Dependencies:** None  
**Files:** `src/PathfindingVisualizer/PathfindingVisualizer.jsx`  
**Complexity:** Low  
**Risk:** Low — only changes the body of `visualizeBRM()`; no shared logic touched  

**Description:**  
`visualizeBRM()` currently calls `createMaze()`, producing a structured DFS maze identical to "Recursive Division". The `MazeModal` description says _"Places walls randomly across the grid; quick, chaotic, and unpredictable."_ Replace the body with a random per-cell wall scatter (≈ 35% probability), skipping start, finish, and gate cells. No `applyMaze()` needed since open cells are not carved — just set.

**Implementation sketch:**
```js
visualizeBRM() {
  const { grid } = this.state;
  const newGrid = grid.map(row =>
    row.map(node => {
      if (node.isStart || node.isFinish || node.isGate) return node;
      const shouldBeWall = Math.random() < 0.35;
      if (!shouldBeWall) return { ...node, isWall: false };
      return { ...node, isWall: true, isWeight: false, wallVariant: Math.floor(Math.random() * 5) };
    }),
  );
  this.setState({ grid: newGrid });
}
```

**Validation:**  
1. Select "Basic Random Maze" → grid fills with random wall pattern (not a carved maze).  
2. Start and finish nodes remain clear.  
3. Run Dijkstra → path found on typical scatter.  
4. Run again → different pattern generated each time.

**Can parallelize:** Yes

---

### T02 — Fix EC3: Gate Cell Gets Wall-Toggled

**ID:** T02  
**PRD Req:** FR3 — "User can draw walls, weighted nodes, and a gate"  
**Dependencies:** None  
**Files:** `src/PathfindingVisualizer/PathfindingVisualizer.jsx:handleMouseDown`  
**Complexity:** Low  
**Risk:** Low  

**Description:**  
In `handleMouseDown`, when `drawMode === 'wall'`, the code calls `getNewGridWithWallToggled` without checking if the target cell has `isGate`. A user can accidentally overwrite a placed gate with a wall, then clicking where the gate was removes the wall but the gate state (`hasGate: true`) is still live — leading to `getGateNode()` returning an `isWall: true` node.

**Fix:** Add a guard in the `else` (wall mode) branch:
```js
} else {
  const node = grid[row][col];
  if (node.isGate) return;  // add this guard
  const newGrid = getNewGridWithWallToggled(grid, row, col);
  this.setState({ grid: newGrid, mouseIsPressed: true });
}
```

**Validation:**  
1. Place gate → switch to wall draw mode → click on gate cell → gate cell is unchanged.  
2. Drag over gate cell in wall mode → gate cell unchanged.

**Can parallelize:** Yes

---

### T03 — Remove Unused `mouseIsPressed` Prop from `<Node>`

**ID:** T03  
**PRD Req:** NFR1 (animation smoothness)  
**Dependencies:** None  
**Files:** `src/PathfindingVisualizer/PathfindingVisualizer.jsx` (render method)  
**Complexity:** Low  
**Risk:** Low  

**Description:**  
`mouseIsPressed={mouseIsPressed}` is passed to every `<Node>` but is not in `Node.jsx`'s props destructuring and is never used. React will pass it to the DOM as an unknown attribute (generating a dev warning) and `React.memo` will see a changed prop on every mouse-down/up event, forcing re-renders of all ~1 700 Node components.

**Validation:**  
1. Remove prop.  
2. Run app; wall drawing, dragging all behave identically.  
3. React dev tools profiler shows no Node re-renders during mouse-down/up when no node state changes.

**Can parallelize:** Yes

---

### T04 — Algorithm Unit Tests

**ID:** T04  
**PRD Req:** None (quality gate)  
**Dependencies:** None  
**Files:** New `src/algorithms/dijkstra.test.js`, `bfs.test.js`, `a_star_search.test.js`, `utils.test.js`, `bellman_ford_search.test.js`, `bidirectional_a_star_search.test.js`  
**Complexity:** Medium  
**Risk:** Low  

**Test cases to cover:**

```
dijkstra.test.js
  ✓ finds shortest path on simple 5×5 open grid
  ✓ respects WEIGHT_COST = 5 on weighted nodes
  ✓ returns empty visitedNodes when finish is walled in
  ✓ getNodesInShortestPathOrder returns [start, ..., finish]
  ✓ getNodesInShortestPathOrder returns [finish] when no path

bfs.test.js
  ✓ finds shortest unweighted path
  ✓ ignores weights (takes same path regardless of weight nodes)
  ✓ terminates when finish unreachable

a_star_search.test.js
  ✓ returns same shortest path as Dijkstra on unweighted grid
  ✓ respects WEIGHT_COST on weighted nodes
  ✓ terminates when finish unreachable

bellman_ford_search.test.js
  ✓ finds path on small grid
  ✓ terminates (no infinite loop) on all-wall finish

bidirectional_a_star_search.test.js
  ✓ getNodesInShortestPathOrderBiAStar returns path from start to finish
  ✓ forward + backward chains stitch at meeting node

utils.test.js — see T05
```

**Can parallelize:** Yes (with T05)

---

### T05 — `utils.js` Unit Tests

**ID:** T05  
**PRD Req:** None (quality gate)  
**Dependencies:** None  
**Files:** New `src/algorithms/utils.test.js`  
**Complexity:** Low  
**Risk:** Low  

**Test cases:**
```
MinHeap
  ✓ extractMin returns smallest key
  ✓ insert + extractMin in order
  ✓ custom keyFn used correctly
  ✓ size updates after insert/extract

heuristic
  ✓ returns |dr| + |dc|
  ✓ returns 0 for same node

getAllNodes
  ✓ returns flat array of all nodes in row-major order

getUnvisitedNeighbors
  ✓ returns only unvisited, non-wall neighbours
  ✓ does not return out-of-bounds cells
```

**Can parallelize:** Yes (with T04)

---

### T06 — Dead Code Cleanup

**ID:** T06  
**PRD Req:** None  
**Dependencies:** None  
**Files:** `src/index.js`, `src/serviceWorker.js`, `Node.css`, `PathfindingVisualizer.jsx`, `bellman_ford_search.js`  
**Complexity:** Low  
**Risk:** Low  

**Checklist (all items completed on May 6, 2026):**
- [x] Delete `src/serviceWorker.js`
- [x] Remove `import * as serviceWorker` and `serviceWorker.unregister()` from `index.js`
- [x] Remove `.node-f` and `.node-s` from `Node.css`
- [x] Remove `mouseIsPressed` from `<Node>` JSX (completed with T03)
- [x] Remove inner `<GrassBackground />` from `PathfindingVisualizer.jsx` render
- [x] Remove `'Average'` case from `selectSpeed()`
- [x] Consolidate `bellman_ford_search.js` local `getUnvisitedNeighbors` (import from utils, filter walls in `getAllEdges`)

**Validation:** `npm test` passes; `npm run build` succeeds; `npm start` shows no React warnings about unknown props.

**Can parallelize:** Yes

---

### T07 — Cross-Platform Build Scripts

**ID:** T07  
**PRD Req:** NFR4  
**Dependencies:** None  
**Files:** `package.json`  
**Complexity:** Low  
**Risk:** Low  

The current scripts use Windows-only `set VAR=value` syntax:
```json
"start": "set NODE_OPTIONS=--openssl-legacy-provider && react-scripts start"
```

**Fix:** Install `cross-env` as a dev dependency and rewrite:
```json
"start": "cross-env NODE_OPTIONS=--openssl-legacy-provider react-scripts start"
```

Note: `--openssl-legacy-provider` is needed only because react-scripts 3.1.2 uses an old webpack with a hash function incompatible with OpenSSL 3. This flag becomes unnecessary after T13 (react-scripts upgrade). Document that in a comment.

**Can parallelize:** Yes

---

## 12. Recommended First 3–5 Tasks

Start with these in parallel across four worktrees:

| Priority | Task | Reason |
|----------|------|--------|
| **1st** | **T01** (fix Basic Random Maze) | Single function body replacement; high user-visible impact; zero risk |
| **1st** | **T03** (remove `mouseIsPressed` prop) | 1-line removal; eliminates a dev-mode warning and an unnecessary ~1 700-node re-render on every mouse event |
| **1st** | **T05** (MinHeap + utils unit tests) | Fastest tests to write; validates the heap used by 7 algorithms; unblocks T04 reviewers |
| **2nd** | **T02** (gate-cell wall guard) | Closes a reproducible user bug; 2-line fix |
| **2nd** | **T04** (algorithm unit tests) | The biggest gap between "works manually" and "ready to release with confidence" |

After these five land on `main` and CI passes, proceed to T06 (dead code cleanup) and T07 (cross-env) as a single cleanup PR, then cut the first release tag.

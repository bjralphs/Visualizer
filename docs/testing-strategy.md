# Testing Strategy

## Purpose
Document the current test coverage, testing approach, and recommended improvements for the Pathfinding Visualizer.

## Scope
`src/App.test.js`, `src/algorithms/`, `src/Components/`, `src/PathfindingVisualizer/`.

---

## Existing Test Files

| File | Type | Tests | Coverage |
|---|---|---|
| `src/App.test.js` | Smoke | 1 | Renders `<App />` without crashing; immediately unmounts |
| `src/algorithms/utils.test.js` | Unit | 17 | `getAllNodes`, `getUnvisitedNeighbors`, `getNeighbors`, `heuristic`, `MinHeap` |
| `src/algorithms/dijkstra.test.js` | Unit | 7 | `dijkstra`, `getNodesInShortestPathOrder` |
| `src/algorithms/breadth_first_search.test.js` | Unit | 5 | `bfs` |
| `src/algorithms/a_star_search.test.js` | Unit | 6 | `aStar` optimality, weight cost, unreachable finish |
| `src/algorithms/bellman_ford_search.test.js` | Unit | 5 | `bellmanFord` termination, wall exclusion, weight cost |
| `src/algorithms/bidirectional_a_star_search.test.js` | Unit | 6 | `bidirectionalAStar`, `getNodesInShortestPathOrderBiAStar` |
| `src/algorithms/ida_star_search.test.js` | Unit | 6 | `idaStar` path-finding, no-path termination (EC6), wall exclusion |
| `src/algorithms/gate_integration.test.js` | Integration | 6 | Two-phase BFS + Dijkstra gate path-finding; phase-1 failure detection |
| `src/PathfindingVisualizer/PathfindingVisualizer.test.jsx` | Component | 11 | `clearPath`, `resetGrid`, `handleResize` (EC4 lower-bound guard) |
| `src/PathfindingVisualizer/Node/Node.test.jsx` | Unit | 14 | ARIA labels (6 states), `role="gridcell"`, `tabIndex`, Space/Enter keyboard toggle, non-matching keys, `onTouchStart` forwarding (T14/T15) |
| `src/algorithms/remaining_algorithms.test.js` | Unit | 28 | `dfs`, `floydWarshall`, `gbfs`, `biDirectionalSearch`, `uniformCostSearch`, `beamSearch`, `weightedAStar` |
| `src/algorithms/testHelpers.js` | Helper | — | `createNode`, `createGrid` shared helpers (not a test file) |

**Total: 121 tests across 12 suites, all passing as of May 2026.**

---

## Current Test Coverage

### `src/App.test.js`

```js
// T12: updated from legacy ReactDOM.render to @testing-library/react (React 18).
it('renders without crashing', () => {
  render(<App />);
});
```

- Confirms the application mounts without a JavaScript exception.
- Does not test any functionality, state, user interaction, or algorithm correctness.
- **T12 update (May 2026):** Migrated from legacy `ReactDOM.render` to `@testing-library/react`'s `render` to support React 18.
- **T10 resolution (May 2026):** jsdom's zero-sized viewport previously produced an empty grid, causing `applyMaze` to throw. The `Math.max(1, ...)` lower-bound clamp in `getInitialGrid` and `handleResize`, plus position clamping in `componentDidMount`, now prevent this crash.

### Algorithm Unit Tests (T04 + T05 — Added May 6, 2026)

**`src/algorithms/utils.test.js`** (17 tests)
- `getAllNodes`: row-major order, empty grid.
- `getUnvisitedNeighbors`: corner/centre/edge counts; excludes visited; does not filter walls (wall filtering is caller responsibility).
- `getNeighbors`: no filtering at all.
- `heuristic`: Manhattan distance, symmetry, same-position zero.
- `MinHeap`: order correctness, size tracking, custom keyFn, single-element, many-element sort.

**`src/algorithms/dijkstra.test.js`** (7 tests)
- Finds 5-node optimal path on 3×3 open grid.
- Visits start node first.
- Applies `WEIGHT_COST = 5` to weighted nodes.
- Returns `[finish]` path when finish is walled in.
- Returns `[finish]` immediately when start === finish.
- Handles fully-walled grid without throwing.

**`src/algorithms/breadth_first_search.test.js`** (5 tests)
- Finds 5-node optimal path; level-order visit on 1×4 grid.
- Terminates gracefully when finish unreachable.
- Ignores weight nodes (BFS is unweighted).
- Handles start === finish.

**`src/algorithms/a_star_search.test.js`** (6 tests)
- Finds optimal path; same length as Dijkstra on unweighted 5×5 grid.
- Applies `WEIGHT_COST`.
- Terminates gracefully on unreachable finish.
- Explores strictly fewer nodes than Dijkstra on a 10×10 open grid.
- Handles start === finish.

**`src/algorithms/bellman_ford_search.test.js`** (5 tests)
- Finds 5-node optimal path.
- Terminates without infinite loop on walled finish.
- No path found through wall (1×3 grid).

### Remaining Algorithm Unit Tests (Added May 2026)

**`src/algorithms/remaining_algorithms.test.js`** (28 tests)

Covers the 7 algorithms not included in the initial T04 batch:

- **`dfs`** (4 tests): visits finish, traceable path via `previousNode`, no wall traversal, unreachable termination.
- **`floydWarshall`** (4 tests): all non-wall nodes visited, path reconstruction, no walls in visited set, `WEIGHT_COST` applied.
- **`gbfs`** (4 tests): finds finish, traceable path, explores fewer nodes than BFS on open grid, unreachable termination.
- **`biDirectionalSearch`** (3 tests): intersection node found, unreachable termination, `WEIGHT_COST` accumulation.
- **`uniformCostSearch`** (4 tests): shortest path found, same cost as Dijkstra on unweighted grid, `WEIGHT_COST` = 6 on weighted node, unreachable termination.
- **`beamSearch`** (4 tests): finds finish, traceable path, explores fewer nodes than BFS, handles start === finish.
- **`weightedAStar`** (5 tests): finds finish, explores fewer nodes than standard A*, `WEIGHT_COST` applied to `gCost`, unreachable finish, traceable path.

### `src/PathfindingVisualizer/PathfindingVisualizer.test.jsx` — Component Tests (T08)

11 tests covering `clearPath`, `resetGrid`, and `handleResize` (including EC4 lower-bound clamp via `Math.max(1, ...)`). Uses legacy `ReactDOM.render` to obtain a class instance ref; emits a React 18 deprecation warning in test output but remains functional.

### T14: ARIA and Keyboard Accessibility (unit-tested)

14 tests in `src/PathfindingVisualizer/Node/Node.test.jsx`:
- `aria-label` content verified for all 6 node states (plain, start, finish, wall, weight, gate) including 1-based row/col numbering.
- `role="gridcell"` and `tabIndex={0}` asserted.
- Space and Enter keys fire `onMouseDown` + `onMouseUp`.
- ArrowRight and Tab keys are silently ignored.
- `onTouchStart` is forwarded to the DOM element (T15 coverage).

### T15: Touch / Pointer Events (Added May 2026)

Five new tests in `src/PathfindingVisualizer/PathfindingVisualizer.test.jsx`:
- `handleTouchStart` sets `mouseIsPressed` and toggles a wall on the target node.
- `handleTouchEnd` resets `mouseIsPressed`.
- `handleTouchMove` calls `handleMouseEnter` for the node identified via `document.elementFromPoint`.
- `handleTouchMove` is safe when `elementFromPoint` returns `null`.
- `handleTouchMove` is safe when the element's `id` does not match the `node-{row}-{col}` pattern.
- Wall nodes never appear in the visited list.
- Applies `WEIGHT_COST` correctly.

**`src/algorithms/bidirectional_a_star_search.test.js`** (6 tests)
- `getNodesInShortestPathOrderBiAStar`: stitches forward/backward chains; lone node; forward-only chain.
- `bidirectionalAStar`: finds path on 3×5 grid; terminates on unreachable finish; all visited nodes carry a frontier flag.

### IDA* Unit Tests (T11 — Added May 6, 2026)

**`src/algorithms/ida_star_search.test.js`** (6 tests)
- Finds path on simple 1×5 grid and 5×5 grid.
- Returns correctly when start === finish.
- **EC6 regression guards (two tests):** verifies IDA* terminates within 5 s on a 10×10 fully-isolated finish and on the maximum 26×68 grid. Both complete in < 50 ms in practice.
- Does not traverse wall nodes.
- Finds correct L-shaped path (center-wall 3×3).

### Gate / Two-Phase Integration Tests (T09 — Added May 6, 2026)

**`src/algorithms/gate_integration.test.js`** (6 tests)

Mirrors the component’s `selectAlgorithmWithGate` logic at the algorithm layer:

1. `resetAlgorithmState(grid)` + `algoFn(grid, start, gate)` → `shortest1`
2. `resetAlgorithmState(grid)` + `algoFn(grid, gate, finish)` → `shortest2`
3. `noPathFound` ↔ `shortest1.length <= 1`

BFS tests:
- Phase 1 reaches gate; Phase 2 reaches finish; combined path covers all waypoints in order.
- Gate surrounded by walls → `shortest1.length <= 1` (no-path condition).
- finish === gate (trivial second leg → `shortest2.length = 1`).

Dijkstra tests:
- Weight node between start and gate — correct routing.
- Finish walled off — phase 2 returns `shortest2.length <= 1`.

### Component Tests (T08 — Added May 6, 2026)

**`src/PathfindingVisualizer/PathfindingVisualizer.test.jsx`** (11 tests)

Mounts `PathfindingVisualizer` wrapped in a mock `MenuItemContext.Provider` using `ReactDOM.render` + class `ref`. Sets `window.innerWidth = 1280`, `window.innerHeight = 800` in `beforeEach`.

`clearPath()` (4 tests):
- Preserves `isWall` on walled nodes.
- Preserves `isWeight` on weighted nodes.
- Clears `isVisited`, `distance`, `gCost`, `distanceFromFinish`, `previousNode`, `isVisitedByStart`, `isVisitedByFinish` on all nodes.
- Sets `state.noPathFound` to `false`.

`resetGrid()` (5 tests):
- Clears `isWall` on all nodes.
- Clears `isWeight` on all nodes.
- Clears `isVisited` and `previousNode` on all nodes.
- Resets `hasGate`, `gateNodeRow`, `gateNodeCol` state flags.
- Sets `state.noPathFound` to `false`.

`handleResize()` (3 tests):
- Produces a non-empty grid after resize to 1024×768.
- Clamps to at least 1 row and 1 col on near-zero viewport (EC4 guard).
- Clamps `startNodeRow/Col` and `finishNodeRow/Col` to within the new grid bounds.

### Manual Testing
`Needs verification` — no formal manual test plan exists in the repository.

---

## Business Rules to Test

| Rule | Source |
|---|---|
| Grid drawing is blocked during animation | `PathfindingVisualizer.jsx:handleMouseDown` |
| Bidirectional algorithms fall back to direct mode when gate is present | `PathfindingVisualizer.jsx:selectAlgorithm` |
| `applyMaze` always places start/finish on open, connected cells | `PathfindingVisualizer.jsx:applyMaze` |
| `WEIGHT_COST = 5` applied to weighted nodes by weighted algorithms | `constants.js`, algorithm files |
| `MAX_RUN_HISTORY = 20` run history entries enforced | `MenuItemContext.js:addRun` |
| `MAX_ROWS = 26`, `MAX_COLS = 68` grid bounds enforced | `PathfindingVisualizer.jsx:handleResize` |
| No path → `noPathFound: true` | `PathfindingVisualizer.jsx:selectAlgorithm` |
| Start/finish nodes cannot be converted to walls/weights | `handleMouseDown` |

---

## Recommended Test Cases

### Algorithm Correctness (Unit)
- `dijkstra`: returns shortest path on a simple 5×5 grid.
- `bfs`: returns shortest path on an unweighted grid.
- `aStar`: returns same path as Dijkstra on a grid with no weights.
- `bellmanFord`: completes without infinite loop on a grid with no negative cycles.
- All algorithms: return empty visited list when start === finish.
- All algorithms: return empty path when finish is fully surrounded by walls.
- `weightedAStar`, `uniformCostSearch`: weight nodes are visited with cost 5× normal.

### Utility Unit Tests
- `getAllNodes`: returns `rows × cols` nodes for a 3×3 grid.
- `getUnvisitedNeighbors`: returns 0 neighbours for a node surrounded by walls.
- `heuristic`: `heuristic({row:0,col:0}, {row:3,col:4})` === 7 (Manhattan).
- `MinHeap`: `insert` / `extractMin` returns nodes in ascending order.

### Component Tests
- `ErrorBoundary`: renders fallback when a child throws.
- `Node`: renders `node-wall` class when `isWall === true`.
- `MenuItemContext`: `useMenuItem` hook returns updated value after `setMenuItem`.

### Integration Tests
- Algorithm selection → visualize → `noPathFound` state when grid is fully walled.
- Maze generation → start and finish nodes are always on open cells.

### Regression Risks
- Changes to `getInitialGrid` or `createNode` could break algorithm assumptions about node shape.
- Changes to `ALGORITHM_REGISTRY` key names must stay in sync with `algoData.js` keys.
- Grid resize during animation could leave stale `setTimeout` callbacks referencing old node IDs.

---

## Test Infrastructure
- Test runner: `react-scripts test` (Jest 27 + jsdom, via react-scripts 5).
- Run tests: `npm test`.
- Run with coverage: `npm run test:coverage` (outputs text summary + lcov report).
- Coverage thresholds enforced in `package.json` (`jest.coverageThreshold`): statements ≥40%, branches ≥30%, functions ≥40%, lines ≥45%.
- Actual coverage (May 2026): statements 51%, branches 40%, functions 50%, lines 54%.
- CI: GitHub Actions `ci.yml` runs `npm test` + `npm run build` on every push and PR.

---

## Operational Concerns
- Algorithm correctness is now tested across all 13 algorithms via unit tests (T04, T05, remaining_algorithms.test.js).
- Regression safety is high for algorithm logic; grid/component interaction tests remain limited.

---

## Known Gaps
- No component interaction tests for `MenuItemContext` hooks or `ErrorBoundary` render fallback.
- No end-to-end tests.
- No coverage reporting configured beyond text summary.

---

## Recommended Follow-up Work
1. ~~Add unit tests for the remaining 7 algorithms.~~ **Done (remaining_algorithms.test.js).**
2. ~~Implement T15 (touch/pointer events) and add pointer-event tests.~~ **Done (T15).**
3. ~~Add a dedicated ARIA test for `Node`.~~ **Done (Node.test.jsx).**
4. ~~Set up a GitHub Actions CI workflow.~~ **Done (ci.yml).**
5. Add React Testing Library tests for `ErrorBoundary` and `MenuItemContext`.
6. Tighten Jest coverage thresholds incrementally (current floor: 30–45%; target: 60–70%).

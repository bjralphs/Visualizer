# Testing Strategy

## Purpose
Document the current test coverage, testing approach, and recommended improvements for the Pathfinding Visualizer.

## Scope
`src/App.test.js`, `src/algorithms/`, `src/Components/`, `src/PathfindingVisualizer/`.

---

## Existing Test Files

| File | Type | Coverage |
|---|---|---|
| `src/App.test.js` | Smoke test | Renders `<App />` without crashing; immediately unmounts |

There are no other test files in the workspace.

---

## Current Test Coverage

### `src/App.test.js`

```js
it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});
```

- Confirms the application mounts without a JavaScript exception.
- Does not test any functionality, state, user interaction, or algorithm correctness.

### Unit Tests
None exist for:
- Any algorithm in `src/algorithms/`
- `utils.js` (`getAllNodes`, `getUnvisitedNeighbors`, `getNeighbors`, `heuristic`, `MinHeap`)
- `MenuItemContext.js` hooks
- `PathfindingVisualizer.jsx` methods

### Integration Tests
None.

### End-to-End Tests
None.

### Manual Testing
`Needs verification` — no manual test plan or test case document exists in the repository.

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
- Test runner: `react-scripts test` (Jest + jsdom).
- Run tests: `npm test`.
- No CI pipeline is configured in the repository (`Needs verification`).

---

## Operational Concerns
- Only one smoke test exists; the application has no meaningful automated test coverage.
- Algorithm bugs would only be caught by manual visual inspection.

---

## Known Gaps
- No algorithm correctness tests.
- No utility unit tests.
- No component interaction tests.
- No CI/CD pipeline.
- No coverage reporting configured.

---

## Recommended Follow-up Work
1. Add unit tests for all 13 algorithm files.
2. Add unit tests for `utils.js` (`MinHeap`, `heuristic`, `getAllNodes`).
3. Add React Testing Library tests for `ErrorBoundary`, `Node`, and `MenuItemContext`.
4. Configure Jest coverage thresholds in `package.json`.
5. Set up a GitHub Actions CI workflow to run tests on every push.

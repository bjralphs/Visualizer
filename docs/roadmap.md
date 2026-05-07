# Pathfinding Visualizer � Roadmap

_Last updated: April 27, 2026_

---

## Current State

A React 16 single-page app that visualizes 9 pathfinding algorithms on an interactive grid.
Built as a class/function hybrid with Context API for shared UI state and direct DOM mutation
for performant animations.

### What Works (after Phase 1 + Phase 2 fixes)
- Grid renders from viewport dimensions on mount, sized correctly (NAVBAR_HEIGHT = 190px)
- Wall drawing via mouse drag; isWall toggled immutably
- 11 algorithms: BFS, DFS, Dijkstra, A*, Greedy BFS, UCS, Bellman-Ford, Floyd-Warshall, Bidirectional BFS, Beam Search, Weighted A* (e=2.5)
- GBFS now correctly explores nodes via open-set approach (was always returning "no path")
- Recursive Division maze generation now correctly applies to grid (was discarding return value)
- createMaze() no longer pollutes isVisited � algorithms work correctly after maze generation
- Distinct visualizeWeightMaze() (random weight scatter) and visualizeStairPattern() (zigzag walls)
- Algorithm/maze/speed selection synced via Context API (MenuItemContext)
- Animated visited-node sweep + shortest-path reconstruction
- Bidirectional animation with distinct start-side (lightblue) / finish-side (lightpink) colors
- isAnimating guard � "Visualize!" disables while animation runs
- All setTimeout IDs tracked and cancelled on resetGrid()
- "No path found" red banner on unreachable finish
- "Clear Path" now only clears visited/path state � walls are preserved
- resetCSS() restores start/finish node classes correctly after clear
- isWeight property on nodes; Node.jsx renders .node-weight (green)
- Legend with SVG icons, context bar showing current selections
- Fast / Average / Slow speed options correctly read from context
- Build fixed for Node.js 17+ (NODE_OPTIONS=--openssl-legacy-provider)

---

## Remaining Bugs

### Minor
| # | Location | Bug | Impact |
|---|----------|-----|--------|
| B14 | PathfindingVisualizer.jsx handleReset() | Directly mutates node objects in-place (node.isWall = false, etc.) � violates React immutability | Fragile; hard-to-reproduce rendering edge cases |

---

## Unimplemented / Incomplete Features

### Functionality Gaps
| # | Feature | Detail |
|---|---------|--------|
| F1 | Weighted node cost | isWeight field and visual exist, but no algorithm reads it � Dijkstra, A*, UCS all treat every edge as cost 1 |
| F2 | Bomb node two-phase path | "Add Bomb" button exists but is completely unwired � no state, no handler, no two-phase visualization |
| F3 | Draggable start/finish nodes | Start hardcoded at (10,15), finish at (10,35); no drag-to-reposition |
| F4 | "Set Walls & Heights" drawing mode | Button calls selectMaze() � does nothing useful; should toggle weight-drawing mode |
| F5 | Grid resize on window resize | Grid computed once in componentDidMount; resizing the window desyncs the grid |
| F7 | Recursive Division skew variants | Horizontal-skew and vertical-skew menu items both call visualizeBRM() � no actual skew differentiation |

### UX / Accessibility Gaps
| # | Gap | Detail |
|---|-----|--------|
| U3 | No mobile/touch support | Only mouse events � touch devices cannot draw walls |
| U4 | No keyboard accessibility | No tabIndex, no ARIA attributes on grid cells or buttons |
| U5 | No algorithm information | No complexity tooltip, no explanation of what each algorithm guarantees |

### Technical Debt
| # | Debt | Detail |
|---|------|--------|
| T1 | React 16 + deprecated ReactDOM.render | Should migrate to React 18 createRoot |
| T2 | Mixed paradigm | Functional App + class PathfindingVisualizer; hooks would simplify |
| T3 | Floyd-Warshall / Bellman-Ford scale | O(V^3) and O(VE) � freeze-risk on grids larger than ~30x60 |
| T4 | Direct DOM mutation for animation | Intentional for perf, but couples animation to DOM IDs |
| T5 | Stale dependencies | react@16.10.1, react-scripts@3.1.2 � 5+ years behind |
| T6 | ~~PWA unused~~ | ~~serviceWorker.unregister() always called; boilerplate never cleaned up~~ _Resolved in T06-R1 (May 2026): `src/serviceWorker.js` deleted; import removed from `index.js`._  |

---

## Recommended Next Steps

### Phase 3 � Core Feature Completion
1. F1 � Weighted edges: Respect node.isWeight in Dijkstra, A*, UCS � edge cost = neighbor.isWeight ? 5 : 1
2. F7 � Recursive Division skew variants: Implement visualizeHorizontalSkewMaze() and visualizeVerticalSkewMaze() with biased split direction
3. F4 � Drawing mode toggle: Add drawingMode state ('wall' | 'weight'); mouse handlers respect it; "Set Walls & Heights" toggles the mode
4. F3 � Draggable start/finish: Track isDraggingStart / isDraggingFinish; mouseDown on start/finish node enters drag mode; mouseUp drops it
5. F2 � Bomb node: Add bombNode state; "Add Bomb" enters placement mode; two-phase algorithm start->bomb then bomb->finish

### Phase 4 � UX Polish
6. F5 � Grid resize: Debounced window.resize listener rebuilds grid preserving walls where possible
7. U5 � Algorithm info: Tooltip or collapsible panel per algorithm: time complexity, space, shortest-path guarantee
8. U3 � Touch support: Map onTouchStart/onTouchMove/onTouchEnd to wall/weight drawing logic
9. B14 � Immutable reset: Rebuild node objects immutably in handleReset() instead of mutating in-place

### Phase 5 � Technical Modernization
10. T1/T2: Migrate to React 18 createRoot; refactor PathfindingVisualizer to functional with useImperativeHandle
11. T5: Upgrade to latest react, react-dom, react-scripts (removes NODE_OPTIONS workaround)
12. T3: Show performance warning or auto-cap grid size for Floyd-Warshall / Bellman-Ford
13. U4 � Accessibility: tabIndex, role="gridcell", aria-label on Node cells

---

## Out of Scope (Deliberate Exclusions)
- Backend / server-side persistence
- Multi-user collaboration
- 3D or hex-grid visualization
- Diagonal movement (grid is 4-directional only)

---

## Change Log

| Date | Phase | What changed |
|------|-------|-------------|
| Apr 27, 2026 | Phase 1 complete | Fixed B1 (handleSelectSpeed), B2 (distinct maze implementations), B4 (NAVBAR_HEIGHT 350->190), B5 (dead algorithm exports), B6 (Context.css deduplicated), B7 (App.css cleaned); Added isAnimating guard (U1), timeout cancellation on reset (U2), no-path-found banner (F6), isWeight node infrastructure; fixed Node.js 17+ OpenSSL build error |
| Apr 27, 2026 | Phase 3 partial | Added Beam Search (open-set BFS, beam width=5) and Weighted A* (e=2.5) algorithms; added Binary Tree, Sidewinder, Rooms & Corridors maze generators; implemented Recursive Division H/V skew variants with biased Prim's direction weights |
| Apr 27, 2026 | Phase 2 complete | Fixed B8 (visualizeCellularMaze discards return value), B9 (GBFS rewritten with open-set � was always returning empty), B10 (createMaze now resets isVisited before returning), B11 (swapped maze dropdown label/key pairs corrected), B12 (Clear Path now calls clearPath() which preserves walls), B13 (resetCSS now explicitly restores node-start/node-finish classes), B15 (removed dead selectSpeed prop/handler from App.js and Navbar), U6 (removed console.log calls from Navbar dropdown handlers) |


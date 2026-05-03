# Architecture

## Purpose
Provide a system-level overview of the Pathfinding Visualizer application for onboarding engineers and maintainers.

## Scope
All source modules under `src/`, the build output under `build/`, and deployment configuration in `package.json`.

---

## System Overview
The Pathfinding Visualizer is a client-side React single-page application (SPA) with no backend, no database, and no authentication layer. Users interact with an in-browser grid, select algorithms and maze patterns, and watch animated pathfinding runs in real time.

---

## Main Components and Layers

| Layer | Files |
|---|---|
| Application shell | `src/App.js`, `src/index.js` |
| Global state / context | `src/Components/MenuItemContext.js` |
| Navigation | `src/Components/Navbar.jsx` |
| Grid and visualizer engine | `src/PathfindingVisualizer/PathfindingVisualizer.jsx` |
| Individual grid cell | `src/PathfindingVisualizer/Node/Node.jsx` |
| Background rendering | `src/PathfindingVisualizer/GrassBackground.jsx` |
| Algorithm implementations | `src/algorithms/*.js` (13 algorithms) |
| Shared algorithm utilities | `src/algorithms/utils.js`, `src/algorithms/constants.js` |
| Information sidebar | `src/Components/Context.jsx`, `src/Components/algoData.js` |
| Modals | `src/Components/AlgorithmModal.jsx`, `src/Components/MazeModal.jsx`, `src/Components/SelectionModal.jsx` |
| UI chrome | `src/Components/Legend.jsx`, `src/Components/Footer.jsx`, `src/Components/Tooltip.jsx` |
| Error boundary | `src/Components/ErrorBoundary.jsx` |

---

## Key Modules

### `src/PathfindingVisualizer/PathfindingVisualizer.jsx`
- Class component; the central engine of the application.
- Owns the grid state (a 2D array of node objects).
- Exposes `selectAlgorithm()`, `selectMaze()`, `clearPath()`, `resetGrid()` via a forwarded ref.
- Registered algorithm → function mapping via `ALGORITHM_REGISTRY` (`Map`).
- Constants: `START_NODE_ROW=10`, `START_NODE_COL=15`, `FINISH_NODE_ROW=10`, `FINISH_NODE_COL=35`, `NODE_WIDTH=25`, `NODE_HEIGHT=25`, `MAX_ROWS=26`, `MAX_COLS=68`.
- Handles responsive grid resizing via `handleResize`.

### `src/Components/MenuItemContext.js`
- Provides four split React contexts (`MenuCtx`, `AnimationCtx`, `DrawModeCtx`, `HistoryCtx`) and a combined `MenuItemContext` for the class component.
- Custom hooks: `useMenuItem`, `useMazeItem`, `useSpeedItem`, `useIsAnimating`, `useDrawMode`, `useRunHistory`.
- `MAX_RUN_HISTORY = 20` entries stored in state.

### `src/algorithms/utils.js`
- `getAllNodes(grid)` — flattens 2D grid to 1D.
- `getUnvisitedNeighbors(node, grid)` — returns unvisited orthogonal neighbours.
- `getNeighbors(node, grid)` — returns all orthogonal neighbours (no filtering).
- `heuristic(nodeA, nodeB)` — Manhattan distance.
- `MinHeap` class — binary min-heap with configurable key function; used by weighted algorithms.

### `src/algorithms/constants.js`
- `WEIGHT_COST = 5` — cost multiplier applied to weighted nodes.

---

## External Dependencies

| Dependency | Version | Purpose |
|---|---|---|
| `react` | ^16.10.1 | UI framework |
| `react-dom` | ^16.10.1 | DOM rendering |
| `react-scripts` | 3.1.2 | Build toolchain (Create React App) |
| `gh-pages` | ^6.3.0 (dev) | GitHub Pages deployment |

There are no API clients, authentication libraries, state management libraries (Redux, MobX), or CSS-in-JS dependencies.

---

## Database Dependencies
None. All application state is held in React component state. No `localStorage` or `sessionStorage` usage was found.

---

## Authentication and Authorization Overview
None. The application is fully public with no user accounts, sessions, or role-based access.

---

## Mermaid Architecture Diagram

```mermaid
graph TD
    Browser["Browser (SPA)"]

    subgraph App Shell
        AppJS["App.js"]
        ErrorBoundary["ErrorBoundary.jsx"]
        MenuItemProvider["MenuItemProvider (MenuItemContext.js)"]
    end

    subgraph UI Layer
        Navbar["Navbar.jsx"]
        Legend["Legend.jsx"]
        AlgorithmModal["AlgorithmModal.jsx"]
        MazeModal["MazeModal.jsx"]
        SelectionModal["SelectionModal.jsx"]
        Tooltip["Tooltip.jsx"]
        Context["Context.jsx (Info Sidebar)"]
        GrassBackground["GrassBackground.jsx"]
    end

    subgraph Visualizer Engine
        PV["PathfindingVisualizer.jsx (class)"]
        Node["Node.jsx"]
    end

    subgraph Algorithm Layer
        AlgoRegistry["ALGORITHM_REGISTRY (Map)"]
        Algorithms["src/algorithms/*.js (13 files)"]
        Utils["utils.js / constants.js"]
    end

    subgraph Data
        AlgoData["algoData.js (ALGO_INFO)"]
    end

    subgraph Deployment
        GHPages["GitHub Pages (bjralphs.github.io/Visualizer)"]
    end

    Browser --> AppJS
    AppJS --> ErrorBoundary
    AppJS --> MenuItemProvider
    AppJS --> Navbar
    AppJS --> Legend
    AppJS --> PV
    AppJS --> Context
    AppJS --> GrassBackground
    Navbar --> AlgorithmModal
    Navbar --> MazeModal
    AlgorithmModal --> SelectionModal
    MazeModal --> SelectionModal
    PV --> AlgoRegistry
    AlgoRegistry --> Algorithms
    Algorithms --> Utils
    Context --> AlgoData
    PV --> Node
    GHPages --> Browser
```

---

## Operational Concerns
- The service worker (`src/serviceWorker.js`) is defined but **not registered** by default in `src/index.js`.
- The build targets GitHub Pages (`homepage` in `package.json`).
- `NODE_OPTIONS=--openssl-legacy-provider` is set in all scripts, indicating a Node.js version mismatch requiring a legacy OpenSSL flag.

---

## Known Gaps
- No server-side rendering or API.
- No state persistence across sessions.
- React 16 is end-of-life; class component pattern in `PathfindingVisualizer.jsx` is legacy.
- No error tracking service (e.g., Sentry) is wired up.

---

## Recommended Follow-up Work
- Upgrade to React 18 and refactor `PathfindingVisualizer.jsx` to a functional component with hooks.
- Add error tracking (Sentry or similar) to `ErrorBoundary`.
- Integrate a service worker for offline support.
- Add `eslint` and `prettier` configuration to the project.

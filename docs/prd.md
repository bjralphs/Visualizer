# Product Requirements Document (PRD)

## Purpose
Define the product vision, requirements, and scope for the Pathfinding Visualizer.

## Scope
The browser-based React SPA deployed at `https://bjralphs.github.io/Visualizer`.

---

## Product Summary
The Pathfinding Visualizer is an interactive, browser-based educational tool that lets users visually explore and compare 13 classical pathfinding algorithms on a configurable grid. Users can draw walls and weighted nodes, place a gate (waypoint), generate maze patterns, and watch algorithms animate in real time with supporting educational content.

---

## Problem Statement
Students, developers, and educators learning graph algorithms lack an interactive tool to build intuition about how algorithms explore space and find paths. Static textbook diagrams and code alone do not convey the dynamic, step-by-step behaviour that distinguishes algorithms like A* from BFS or Dijkstra.

---

## Users and Stakeholders

| User | Description |
|---|---|
| **Student** | Learning graph algorithms for coursework or interview preparation |
| **Educator** | Using the tool to demonstrate algorithm behaviour in lectures or tutorials |
| **Developer / engineer** | Refreshing or deepening understanding of pathfinding for professional use |
| **Maintainer** | `bjralphs` — sole developer and deployer |

---

## Goals

- Allow users to select any of 13 algorithms and visualise step-by-step execution on a grid.
- Allow users to configure the grid with walls, weighted nodes, and a gate (intermediate waypoint).
- Provide educational content (complexity, origin, strengths, weaknesses, use cases) for each algorithm.
- Support multiple maze generation patterns to demonstrate algorithm behaviour on structured vs. random graphs.
- Be accessible via a public URL with no installation or login required.

## Non-Goals

- No user accounts, saved states, or shareable links.
- No backend, API, or server-side computation.
- No mobile-native app.
- No diagonal movement on the grid.
- No real-world map data or GPS integration.

---

## Requirements

### Functional
- FR1: User can select one of 13 algorithms.
- FR2: User can generate one of multiple maze patterns.
- FR3: User can draw walls, weighted nodes, and a gate on the grid.
- FR4: User can drag start, finish, and gate nodes.
- FR5: User can visualise algorithm execution with animated steps.
- FR6: User can clear the path or reset the entire grid.
- FR7: User can adjust animation speed (`Slow` / `Fast`).
- FR8: The info sidebar displays algorithm metadata (complexity, origin, description, run history).
- FR9: The grid resizes responsively on window resize.

### Non-Functional
- NFR1: Animation is smooth on grids up to 26 × 68 = 1,768 nodes.
- NFR2: The application loads in under 3 seconds on a standard broadband connection.
- NFR3: The application is a static SPA with no server dependency.
- NFR4: The application is deployable via a single `npm run deploy` command.

---

## User Stories

| ID | As a… | I want to… | So that… |
|---|---|---|---|
| US1 | Student | Select and run A* Search | I can see how heuristic guidance differs from BFS |
| US2 | Student | Draw walls on the grid | I can test how algorithms navigate obstacles |
| US3 | Student | Place a weighted node | I can see how weighted algorithms prefer cheaper paths |
| US4 | Student | Place a gate | I can see how algorithms route through a required waypoint |
| US5 | Educator | Generate a recursive backtracker maze | I can demonstrate algorithm behaviour on a complex maze |
| US6 | User | See the algorithm's complexity and origin | I can understand the algorithm's theoretical properties |
| US7 | User | Clear the path without losing my walls | I can run a different algorithm on the same grid |
| US8 | User | Drag the start node | I can change the start position without rebuilding the grid |

---

## Success Metrics
- `Needs verification` — no analytics are configured. Suggested metrics:
  - Number of algorithm runs per session.
  - Most-selected algorithms.
  - Session duration.
  - Bounce rate.

---

## Constraints
- Must be deployable as a static SPA (GitHub Pages).
- Must use only React and CRA; no additional runtime dependencies.
- Must work on the last 1 version of Chrome, Firefox, and Safari.

---

## Risks
- React 16 end-of-life: security patches may not be backported.
- No automated testing: regressions may not be caught before deployment.
- Cross-platform build script: contributors on Linux/macOS cannot use the npm scripts as written.

---

## MVP Scope
All features listed above are present in the current deployed build. The MVP shipped with:
- 13 algorithms.
- Multiple maze generators.
- Wall, weight, and gate drawing.
- Info sidebar with algorithm metadata and run history.
- Responsive grid.

---

## Future Enhancements
- Diagonal movement support.
- Shareable grid configurations via URL hash.
- Side-by-side algorithm comparison.
- Performance metrics displayed in the sidebar (steps explored, path length, execution time).
- Mobile touch event support.
- Dark/light theme toggle.

# Permission Matrix

## Purpose
Document user roles, permissions, and access controls within the Pathfinding Visualizer.

## Scope
Entire application. There is no authentication, authorisation, or role system.

---

## Current Implementation Details

The application is fully public with no user accounts, sessions, tokens, or role-based access control. Every visitor has identical, unrestricted access to all features.

---

## User Roles

| Role | Description |
|---|---|
| **Visitor** | Any user who opens the application in a browser. No login required. |

There are no admin, editor, viewer, or authenticated roles.

---

## Permission Table

| Action | Visitor | Enforced In |
|---|---|---|
| View the grid | ✅ | — |
| Draw walls | ✅ | `handleMouseDown` checks `!isAnimating` and node type guards |
| Draw weights | ✅ | `drawMode === 'weight'` check in `handleMouseDown` |
| Place/remove gate | ✅ | `drawMode === 'gate'` check in `handleMouseDown` |
| Drag start node | ✅ | `node.isStart` check in `handleMouseDown` |
| Drag finish node | ✅ | `node.isFinish` check in `handleMouseDown` |
| Drag gate node | ✅ | `node.isGate` check in `handleMouseDown` |
| Select algorithm | ✅ | Blocked during animation via `disabled={isAnimating}` on button |
| Select maze pattern | ✅ | Blocked during animation via `disabled={isAnimating}` on button |
| Generate maze | ✅ | Blocked during animation; blocked if `mazeItem === 'None'` (`canGenerateMaze`) |
| Visualize / run algorithm | ✅ | Blocked during animation via `isAnimating` guard in `selectAlgorithm` |
| Clear path | ✅ | Always available; cancels animation |
| Clear board | ✅ | Always available; cancels animation |
| Change speed | ✅ | `cycleSpeed()` in `Navbar.jsx` |
| Change draw mode | ✅ | `Needs verification` — draw mode toggle control location |
| View algorithm info sidebar | ✅ | `Context.jsx` reads `menuItem` from context |
| View run history | ✅ | `Context.jsx` reads `runHistory` from context |

---

## Admin-Only Actions
None. There are no admin-only features.

---

## Read-Only States
During animation (`isAnimating === true`), the following actions are blocked:
- Drawing walls, weights, gates.
- Dragging start, finish, or gate nodes.
- Selecting a new algorithm.
- Selecting a new maze.
- Generating a maze.

---

## Where Permissions Are Enforced in Code

| Guard | Location | Mechanism |
|---|---|---|
| Block grid drawing during animation | `PathfindingVisualizer.jsx:handleMouseDown` | `if (this.context.isAnimating) return;` |
| Block algorithm/maze selection during animation | `Navbar.jsx` | `disabled={isAnimating}` on buttons |
| Block maze generation when `mazeItem === 'None'` | `Navbar.jsx` | `const canGenerateMaze = mazeItem !== 'None' && !isAnimating` |
| Prevent wall/weight on special nodes | `PathfindingVisualizer.jsx:handleMouseDown` | `if (node.isStart \|\| node.isFinish \|\| node.isGate ...) return;` |

---

## Operational Concerns
- No authentication means there is no protection against misuse; however, this is appropriate for a public educational tool with no server-side state.

---

## Known Gaps
- Draw mode toggle control location is `Needs verification`.
- No rate limiting or anti-automation protection (not required for this use case).

---

## Recommended Follow-up Work
- If a shareable link or save feature is added in future, an authentication layer would be required.

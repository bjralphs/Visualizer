/**
 * T09 — Gate / two-phase algorithm integration tests.
 *
 * These tests validate the two-phase "gate" path-finding behaviour at the
 * algorithm layer, independent of animation or React component state.  The
 * same logic is used by PathfindingVisualizer.selectAlgorithmWithGate().
 *
 * Two-phase pattern (mirroring the component):
 *   1. resetAlgorithmState(grid)
 *   2. Phase 1: run algo(grid, start, gate)  → shortest1
 *   3. resetAlgorithmState(grid)             ← wipes isVisited / distance
 *   4. Phase 2: run algo(grid, gate, finish) → shortest2
 *   5. noPathFound = shortest1.length <= 1 (gate unreachable)
 */

import { bfs } from './breadth_first_search';
import { dijkstra, getNodesInShortestPathOrder } from './dijkstra';
import { createGrid } from './testHelpers';

// ── Helper: reset per-run algorithm fields (mirrors resetAlgorithmState) ─────

function resetAlgorithmState(grid) {
    for (const row of grid) {
        for (const node of row) {
            node.distance = Infinity;
            node.isVisited = false;
            node.previousNode = null;
            node.gCost = undefined;
            node.isVisitedByStart = false;
            node.isVisitedByFinish = false;
        }
    }
}

// ── Helper: run a two-phase algorithm and return both shortest paths ──────────

function runTwoPhase(grid, start, gate, finish, algoFn) {
    resetAlgorithmState(grid);
    algoFn(grid, start, gate);
    const shortest1 = getNodesInShortestPathOrder(gate);

    resetAlgorithmState(grid);
    algoFn(grid, gate, finish);
    const shortest2 = getNodesInShortestPathOrder(finish);

    return { shortest1, shortest2 };
}

// ── BFS two-phase ─────────────────────────────────────────────────────────────

describe('Two-phase gate (BFS)', () => {
    it('finds path from start to gate then gate to finish', () => {
        // 1-row grid: S(0,0) -- G(0,2) -- F(0,4), all open
        const grid = createGrid(1, 5);
        const start = grid[0][0];
        const gate = grid[0][2];
        const finish = grid[0][4];

        start.isStart = true;
        gate.isGate = true;
        finish.isFinish = true;

        const { shortest1, shortest2 } = runTwoPhase(grid, start, gate, finish, bfs);

        // Phase 1 path should reach the gate (length > 1 means at least start + gate)
        expect(shortest1.length).toBeGreaterThan(1);
        expect(shortest1[shortest1.length - 1]).toBe(gate);

        // Phase 2 path should reach finish
        expect(shortest2.length).toBeGreaterThan(1);
        expect(shortest2[shortest2.length - 1]).toBe(finish);
    });

    it('sets noPathFound when gate is completely walled off', () => {
        // 3-row grid; gate at (1,1) is surrounded by walls
        const grid = createGrid(3, 3, {
            '0-1': { isWall: true },
            '1-0': { isWall: true },
            '1-2': { isWall: true },
            '2-1': { isWall: true },
        });
        const start = grid[0][0];
        const gate = grid[1][1]; // isolated
        const finish = grid[2][2];

        start.isStart = true;
        gate.isGate = true;
        finish.isFinish = true;

        const { shortest1 } = runTwoPhase(grid, start, gate, finish, bfs);

        // Gate is unreachable → phase 1 shortest path is just [gate] (length 1)
        // which matches the component's noPathFound condition: shortest1.length <= 1
        expect(shortest1.length).toBeLessThanOrEqual(1);
    });

    it('combined path visits all three waypoints in order', () => {
        // Straight 1×7 grid: S G F laid out with gaps
        const grid = createGrid(1, 7);
        const start = grid[0][0];
        const gate = grid[0][3];
        const finish = grid[0][6];

        start.isStart = true;
        gate.isGate = true;
        finish.isFinish = true;

        const { shortest1, shortest2 } = runTwoPhase(grid, start, gate, finish, bfs);

        // Verify order: start is first in phase-1, gate is last in phase-1 / first in phase-2, finish is last
        expect(shortest1[0]).toBe(start);
        expect(shortest1[shortest1.length - 1]).toBe(gate);
        expect(shortest2[shortest2.length - 1]).toBe(finish);
    });

    it('phase 2 works even when finish equals gate (trivial second leg)', () => {
        const grid = createGrid(1, 3);
        const start = grid[0][0];
        const gate = grid[0][2];
        // Treat the gate as the finish — phase 2 is a no-op
        const finish = gate;

        start.isStart = true;
        gate.isGate = true;
        gate.isFinish = true;

        const { shortest1, shortest2 } = runTwoPhase(grid, start, gate, finish, bfs);

        expect(shortest1.length).toBeGreaterThan(1);
        // Phase 2: start === finish, path length is 1 (just the gate/finish node)
        expect(shortest2.length).toBe(1);
        expect(shortest2[0]).toBe(finish);
    });
});

// ── Dijkstra two-phase (weighted verification) ────────────────────────────────

describe('Two-phase gate (Dijkstra)', () => {
    it('routes correctly when weight nodes are between start and gate', () => {
        // 1×5: S(0) W(1) G(2) F(4)
        const grid = createGrid(1, 5, { '0-1': { isWeight: true } });
        const start = grid[0][0];
        const gate = grid[0][2];
        const finish = grid[0][4];

        start.isStart = true;
        grid[0][1].isWeight = true;
        gate.isGate = true;
        finish.isFinish = true;

        const { shortest1, shortest2 } = runTwoPhase(grid, start, gate, finish, dijkstra);

        expect(shortest1.length).toBeGreaterThan(1);
        expect(shortest1[shortest1.length - 1]).toBe(gate);
        expect(shortest2.length).toBeGreaterThan(1);
        expect(shortest2[shortest2.length - 1]).toBe(finish);
    });

    it('detects no-path when finish is walled off in phase 2', () => {
        // Start and gate are connected; finish is isolated
        const grid = createGrid(1, 5, {
            '0-3': { isWall: true },
        });
        const start = grid[0][0];
        const gate = grid[0][2];
        const finish = grid[0][4];

        start.isStart = true;
        gate.isGate = true;
        finish.isFinish = true;

        const { shortest1, shortest2 } = runTwoPhase(grid, start, gate, finish, dijkstra);

        // Phase 1 succeeds
        expect(shortest1.length).toBeGreaterThan(1);
        // Phase 2 cannot reach finish (wall at col 3 blocks the only path on row 0)
        expect(shortest2.length).toBeLessThanOrEqual(1);
    });
});

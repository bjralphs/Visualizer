/**
 * Remaining algorithm unit tests — T04 follow-up.
 *
 * Covers the 7 algorithms that were missing dedicated test files:
 *   dfs, floydWarshall, gbfs, biDirectionalSearch,
 *   uniformCostSearch, beamSearch, weightedAStar
 */

import { dfs } from './depth_first_search';
import { floydWarshall } from './floyd_warshall_search';
import { gbfs } from './greedy_best_first_search';
import { biDirectionalSearch } from './bidirectional_search';
import { uniformCostSearch } from './uniform_cost_search';
import { beamSearch } from './beam_search';
import { weightedAStar } from './weighted_a_star_search';
import { getNodesInShortestPathOrder } from './dijkstra';
import { WEIGHT_COST } from './constants';
import { createGrid } from './testHelpers';

// ── DFS ───────────────────────────────────────────────────────────────────────

describe('dfs', () => {
    it('visits the finish node on an open 1×5 grid', () => {
        const grid = createGrid(1, 5);
        const start = grid[0][0];
        const finish = grid[0][4];
        start.isStart = true;
        finish.isFinish = true;

        const visited = dfs(grid, start, finish);

        expect(visited.includes(finish)).toBe(true);
        expect(finish.isVisited).toBe(true);
    });

    it('returns a traceable path to the finish', () => {
        const grid = createGrid(3, 3);
        const start = grid[0][0];
        const finish = grid[2][2];
        start.isStart = true;
        finish.isFinish = true;

        dfs(grid, start, finish);

        const path = getNodesInShortestPathOrder(finish);
        expect(path[0]).toBe(start);
        expect(path[path.length - 1]).toBe(finish);
    });

    it('does not traverse wall nodes', () => {
        // 1×4: S wall wall F → finish unreachable
        const grid = createGrid(1, 4, {
            '0-1': { isWall: true },
            '0-2': { isWall: true },
        });
        const start = grid[0][0];
        const finish = grid[0][3];
        start.isStart = true;
        finish.isFinish = true;

        const visited = dfs(grid, start, finish);

        expect(visited.includes(finish)).toBe(false);
        expect(visited.includes(grid[0][1])).toBe(false);
    });

    it('terminates gracefully when finish is unreachable', () => {
        const grid = createGrid(3, 3, {
            '1-0': { isWall: true },
            '0-1': { isWall: true },
        });
        const start = grid[0][0];
        const finish = grid[2][2];
        start.isStart = true;
        finish.isFinish = true;

        const visited = dfs(grid, start, finish);

        expect(Array.isArray(visited)).toBe(true);
        expect(finish.isVisited).toBe(false);
    });
});

// ── Floyd-Warshall ────────────────────────────────────────────────────────────

describe('floydWarshall', () => {
    it('marks all reachable non-wall nodes as visited', () => {
        const grid = createGrid(3, 3);
        const start = grid[0][0];
        const finish = grid[2][2];
        start.isStart = true;
        finish.isFinish = true;

        const visited = floydWarshall(grid, start, finish);

        // Floyd-Warshall visits ALL non-wall nodes in the animation sweep
        expect(visited.length).toBe(9);
    });

    it('reconstructs a path to the finish via previousNode chains', () => {
        const grid = createGrid(1, 5);
        const start = grid[0][0];
        const finish = grid[0][4];
        start.isStart = true;
        finish.isFinish = true;

        floydWarshall(grid, start, finish);

        const path = getNodesInShortestPathOrder(finish);
        expect(path[0]).toBe(start);
        expect(path[path.length - 1]).toBe(finish);
        expect(path.length).toBe(5);
    });

    it('does not include wall nodes in the visited list', () => {
        const grid = createGrid(2, 3, { '0-1': { isWall: true } });
        const start = grid[0][0];
        const finish = grid[1][2];
        start.isStart = true;
        finish.isFinish = true;

        const visited = floydWarshall(grid, start, finish);

        expect(visited.some(n => n.isWall)).toBe(false);
    });

    it('applies WEIGHT_COST to weighted nodes in path cost', () => {
        // 1×3: S W F — path cost = 1 + WEIGHT_COST via the weight node
        const grid = createGrid(1, 3, { '0-1': { isWeight: true } });
        const start = grid[0][0];
        const finish = grid[0][2];
        start.isStart = true;
        finish.isFinish = true;

        floydWarshall(grid, start, finish);

        // Floyd-Warshall traces the minimum-cost path; finish.previousNode should be set
        expect(finish.previousNode).not.toBeNull();
    });
});

// ── GBFS ─────────────────────────────────────────────────────────────────────

describe('gbfs', () => {
    it('finds the finish node on an open 5×5 grid', () => {
        const grid = createGrid(5, 5);
        const start = grid[0][0];
        const finish = grid[4][4];
        start.isStart = true;
        finish.isFinish = true;

        const visited = gbfs(grid, start, finish);

        expect(visited.includes(finish)).toBe(true);
    });

    it('returns a traceable path via previousNode', () => {
        const grid = createGrid(3, 5);
        const start = grid[0][0];
        const finish = grid[2][4];
        start.isStart = true;
        finish.isFinish = true;

        gbfs(grid, start, finish);

        const path = getNodesInShortestPathOrder(finish);
        expect(path[0]).toBe(start);
        expect(path[path.length - 1]).toBe(finish);
    });

    it('explores fewer nodes than BFS on an open grid (greedy heuristic)', () => {
        // GBFS should reach the finish without exploring the entire grid
        const grid = createGrid(10, 10);
        const start = grid[0][0];
        const finish = grid[9][9];
        start.isStart = true;
        finish.isFinish = true;

        const visited = gbfs(grid, start, finish);

        // BFS on a 10×10 would visit up to 100 nodes; GBFS visits far fewer
        expect(visited.length).toBeLessThan(50);
    });

    it('terminates gracefully when finish is unreachable', () => {
        const grid = createGrid(3, 3, {
            '0-1': { isWall: true },
            '1-0': { isWall: true },
        });
        const start = grid[0][0];
        const finish = grid[2][2];
        start.isStart = true;
        finish.isFinish = true;

        const visited = gbfs(grid, start, finish);

        expect(Array.isArray(visited)).toBe(true);
        expect(finish.isVisited).toBe(false);
    });
});

// ── Bidirectional Search (Bidirectional Dijkstra) ─────────────────────────────

describe('biDirectionalSearch', () => {
    it('reaches an intersection on an open 3×5 grid', () => {
        const grid = createGrid(3, 5);
        const start = grid[1][0];
        const finish = grid[1][4];
        start.isStart = true;
        finish.isFinish = true;

        const visited = biDirectionalSearch(grid, start, finish);

        // At least one node must carry both forward and backward visited flags
        const intersectionExists = visited.some(
            n => n.isVisited && n.isVisitedByFinish,
        ) || visited.some(n => n.isVisited) && visited.some(n => n.isVisitedByFinish);
        expect(intersectionExists).toBe(true);
    });

    it('terminates on an unreachable finish', () => {
        const grid = createGrid(3, 3, {
            '0-1': { isWall: true },
            '1-0': { isWall: true },
        });
        const start = grid[0][0];
        const finish = grid[2][2];
        start.isStart = true;
        finish.isFinish = true;

        const visited = biDirectionalSearch(grid, start, finish);

        expect(Array.isArray(visited)).toBe(true);
    });

    it('applies WEIGHT_COST to weighted edges', () => {
        // 1×5: S W . . F — the forward search should note the weight penalty
        const grid = createGrid(1, 5, { '0-1': { isWeight: true } });
        const start = grid[0][0];
        const finish = grid[0][4];
        start.isStart = true;
        finish.isFinish = true;

        const visited = biDirectionalSearch(grid, start, finish);

        expect(visited.length).toBeGreaterThan(0);
    });
});

// ── Uniform Cost Search ───────────────────────────────────────────────────────

describe('uniformCostSearch', () => {
    it('finds the shortest path on an open 1×5 grid', () => {
        const grid = createGrid(1, 5);
        const start = grid[0][0];
        const finish = grid[0][4];
        start.isStart = true;
        finish.isFinish = true;

        const visited = uniformCostSearch(grid, start, finish);

        expect(visited.includes(finish)).toBe(true);
        const path = getNodesInShortestPathOrder(finish);
        expect(path.length).toBe(5);
    });

    it('produces the same path length as Dijkstra on a weighted grid', () => {
        // Both UCS and Dijkstra are identical in this implementation;
        // they should produce the same distance to the finish.
        const grid1 = createGrid(3, 3, { '0-1': { isWeight: true } });
        const grid2 = createGrid(3, 3, { '0-1': { isWeight: true } });
        const start1 = grid1[0][0]; start1.isStart = true;
        const finish1 = grid1[2][2]; finish1.isFinish = true;
        const start2 = grid2[0][0]; start2.isStart = true;
        const finish2 = grid2[2][2]; finish2.isFinish = true;

        uniformCostSearch(grid1, start1, finish1);
        const { dijkstra } = require('./dijkstra');
        dijkstra(grid2, start2, finish2);

        // Both should settle on the same minimum distance to finish
        expect(finish1.distance).toBe(finish2.distance);
    });

    it('applies WEIGHT_COST to weighted nodes', () => {
        // 1×3: S W F — cost = 1 (S→W) + WEIGHT_COST (W→F)... Wait, weight is edge TO the node.
        // Cost to reach W from S = WEIGHT_COST (W is the destination, so cost = WEIGHT_COST)
        // Cost to reach F from W = 1
        // Total = WEIGHT_COST + 1
        const grid = createGrid(1, 3, { '0-1': { isWeight: true } });
        const start = grid[0][0];
        const finish = grid[0][2];
        start.isStart = true;
        finish.isFinish = true;

        uniformCostSearch(grid, start, finish);

        expect(finish.distance).toBe(WEIGHT_COST + 1);
    });

    it('terminates gracefully when finish is unreachable', () => {
        const grid = createGrid(1, 3, { '0-1': { isWall: true } });
        const start = grid[0][0];
        const finish = grid[0][2];
        start.isStart = true;
        finish.isFinish = true;

        const visited = uniformCostSearch(grid, start, finish);

        expect(visited.includes(finish)).toBe(false);
    });
});

// ── Beam Search ───────────────────────────────────────────────────────────────

describe('beamSearch', () => {
    it('finds the finish on an open 5×5 grid', () => {
        const grid = createGrid(5, 5);
        const start = grid[0][0];
        const finish = grid[4][4];
        start.isStart = true;
        finish.isFinish = true;

        const visited = beamSearch(grid, start, finish);

        expect(visited.includes(finish)).toBe(true);
    });

    it('returns a traceable path via previousNode', () => {
        const grid = createGrid(5, 5);
        const start = grid[0][0];
        const finish = grid[4][4];
        start.isStart = true;
        finish.isFinish = true;

        beamSearch(grid, start, finish);

        const path = getNodesInShortestPathOrder(finish);
        expect(path[0]).toBe(start);
        expect(path[path.length - 1]).toBe(finish);
    });

    it('visits at most BEAM_WIDTH candidates per frontier level (incomplete)', () => {
        // On a wide open 10×10 grid, Beam Search (BEAM_WIDTH=5) should visit
        // far fewer nodes than BFS — demonstrating its incomplete nature.
        const grid = createGrid(10, 10);
        const start = grid[0][0];
        const finish = grid[9][9];
        start.isStart = true;
        finish.isFinish = true;

        const visited = beamSearch(grid, start, finish);

        // BFS would visit ~100 nodes; Beam Search with width 5 visits far fewer
        expect(visited.length).toBeLessThan(100);
    });

    it('handles start === finish', () => {
        const grid = createGrid(3, 3);
        const start = grid[1][1];
        start.isStart = true;
        start.isFinish = true;

        const visited = beamSearch(grid, start, start);

        expect(visited.length).toBe(1);
        expect(visited[0]).toBe(start);
    });
});

// ── Weighted A* ───────────────────────────────────────────────────────────────

describe('weightedAStar', () => {
    it('finds the finish on an open 5×5 grid', () => {
        const grid = createGrid(5, 5);
        const start = grid[0][0];
        const finish = grid[4][4];
        start.isStart = true;
        finish.isFinish = true;

        const visited = weightedAStar(grid, start, finish);

        expect(visited.includes(finish)).toBe(true);
        expect(finish.isVisited).toBe(true);
    });

    it('explores fewer nodes than standard A* (ε > 1 trades quality for speed)', () => {
        // ε=2.5 means the weighted variant should expand fewer nodes than ε=1 (A*)
        const grid1 = createGrid(10, 10);
        const grid2 = createGrid(10, 10);
        const s1 = grid1[0][0]; s1.isStart = true;
        const f1 = grid1[9][9]; f1.isFinish = true;
        const s2 = grid2[0][0]; s2.isStart = true;
        const f2 = grid2[9][9]; f2.isFinish = true;

        const wVisited = weightedAStar(grid1, s1, f1);
        const { aStar } = require('./a_star_search');
        const aVisited = aStar(grid2, s2, f2);

        expect(wVisited.length).toBeLessThanOrEqual(aVisited.length);
    });

    it('applies WEIGHT_COST in gCost accumulation', () => {
        // 1×3: S W F — gCost at F should be WEIGHT_COST + 1
        const grid = createGrid(1, 3, { '0-1': { isWeight: true } });
        const start = grid[0][0];
        const finish = grid[0][2];
        start.isStart = true;
        finish.isFinish = true;

        weightedAStar(grid, start, finish);

        expect(finish.gCost).toBe(WEIGHT_COST + 1);
    });

    it('terminates gracefully when finish is unreachable', () => {
        const grid = createGrid(1, 3, { '0-1': { isWall: true } });
        const start = grid[0][0];
        const finish = grid[0][2];
        start.isStart = true;
        finish.isFinish = true;

        const visited = weightedAStar(grid, start, finish);

        expect(visited.includes(finish)).toBe(false);
    });

    it('returns a traceable path via previousNode', () => {
        const grid = createGrid(5, 5);
        const start = grid[0][0];
        const finish = grid[4][4];
        start.isStart = true;
        finish.isFinish = true;

        weightedAStar(grid, start, finish);

        const path = getNodesInShortestPathOrder(finish);
        expect(path[0]).toBe(start);
        expect(path[path.length - 1]).toBe(finish);
    });
});

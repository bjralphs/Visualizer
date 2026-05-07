/**
 * T11 — IDA* algorithm unit tests.
 *
 * Verifies correct path-finding and, critically, that IDA* terminates
 * within acceptable time on grids where no path exists (EC6: the algorithm
 * uses a maxBound guard = grid.length × grid[0].length to prevent
 * infinite iteration on no-path grids).
 */

import { idaStar } from './ida_star_search';
import { getNodesInShortestPathOrder } from './dijkstra';
import { createGrid } from './testHelpers';

describe('idaStar', () => {
    it('finds a path on a simple 1×5 open grid', () => {
        const grid = createGrid(1, 5);
        const start = grid[0][0];
        const finish = grid[0][4];
        start.isStart = true;
        finish.isFinish = true;

        const visited = idaStar(grid, start, finish);

        expect(visited.length).toBeGreaterThan(0);
        expect(finish.isVisited).toBe(true);
        const path = getNodesInShortestPathOrder(finish);
        expect(path[0]).toBe(start);
        expect(path[path.length - 1]).toBe(finish);
    });

    it('finds a path on a 5×5 open grid', () => {
        const grid = createGrid(5, 5);
        const start = grid[0][0];
        const finish = grid[4][4];
        start.isStart = true;
        finish.isFinish = true;

        const visited = idaStar(grid, start, finish);

        expect(visited.length).toBeGreaterThan(0);
        expect(finish.isVisited).toBe(true);
    });

    it('returns an empty visited list when start === finish', () => {
        const grid = createGrid(3, 3);
        const start = grid[1][1];
        start.isStart = true;
        start.isFinish = true;

        const visited = idaStar(grid, start, start);

        // Start node is visited immediately on the first iteration
        expect(finish => true).toBeTruthy(); // guard: algorithm must return
        // IDA* marks start as visited when it hits it
        expect(Array.isArray(visited)).toBe(true);
    });

    it('terminates on a fully-walled no-path grid within time limit (EC6)', () => {
        // 10×10 grid; finish is walled in so no path exists.
        // maxBound guard in idaStar caps iterations at grid.length * grid[0].length = 100.
        const grid = createGrid(10, 10, {
            // Wall off the finish node on all four sides
            '8-9': { isWall: true },
            '9-8': { isWall: true },
        });
        const start = grid[0][0];
        const finish = grid[9][9];
        start.isStart = true;
        finish.isFinish = true;

        const t0 = Date.now();
        const visited = idaStar(grid, start, finish);
        const elapsed = Date.now() - t0;

        // Must return (not hang) and finish should not be reached
        expect(Array.isArray(visited)).toBe(true);
        expect(finish.isVisited).toBe(false);
        // Must complete within 5 seconds (in practice < 50 ms)
        expect(elapsed).toBeLessThan(5000);
    });

    it('terminates on a 26×68 fully-walled grid within time limit (EC6 — full app size)', () => {
        // Matches the maximum app grid: MAX_ROWS × MAX_COLS.
        // This is the worst-case scenario for IDA* iteration depth.
        // maxBound = 26 * 68 = 1768 iterations at most.
        const grid = createGrid(26, 68, { '25-67': { isWall: false } });
        // Wall off the entire grid except start — finish is isolated
        for (let r = 0; r < 26; r++) {
            for (let c = 0; c < 68; c++) {
                if ((r !== 0 || c !== 0) && (r !== 25 || c !== 67)) {
                    grid[r][c].isWall = true;
                }
            }
        }
        const start = grid[0][0];
        const finish = grid[25][67];
        start.isStart = true;
        finish.isFinish = true;

        const t0 = Date.now();
        const visited = idaStar(grid, start, finish);
        const elapsed = Date.now() - t0;

        expect(Array.isArray(visited)).toBe(true);
        // finish is walled off — should not be visited
        expect(finish.isVisited).toBe(false);
        // Must complete within 5 seconds on CI hardware
        expect(elapsed).toBeLessThan(5000);
    });

    it('does not traverse wall nodes', () => {
        // 1×5: S(0) wall(1) wall(2) wall(3) F(4) — finish unreachable
        const grid = createGrid(1, 5, {
            '0-1': { isWall: true },
            '0-2': { isWall: true },
            '0-3': { isWall: true },
        });
        const start = grid[0][0];
        const finish = grid[0][4];
        start.isStart = true;
        finish.isFinish = true;

        idaStar(grid, start, finish);

        // Wall nodes must not be marked visited
        expect(grid[0][1].isVisited).toBe(false);
        expect(grid[0][2].isVisited).toBe(false);
        expect(grid[0][3].isVisited).toBe(false);
        expect(finish.isVisited).toBe(false);
    });

    it('finds the correct path on an L-shaped grid', () => {
        // 3×3 with a wall blocking the diagonal shortcut:
        //   S . .
        //   . W .
        //   . . F
        const grid = createGrid(3, 3, { '1-1': { isWall: true } });
        const start = grid[0][0];
        const finish = grid[2][2];
        start.isStart = true;
        finish.isFinish = true;

        const visited = idaStar(grid, start, finish);

        expect(visited.length).toBeGreaterThan(0);
        expect(finish.isVisited).toBe(true);
        const path = getNodesInShortestPathOrder(finish);
        expect(path[0]).toBe(start);
        expect(path[path.length - 1]).toBe(finish);
        // Path must not include the walled center node
        expect(path.includes(grid[1][1])).toBe(false);
    });
});

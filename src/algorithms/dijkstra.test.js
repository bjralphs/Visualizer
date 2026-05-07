import { dijkstra, getNodesInShortestPathOrder } from './dijkstra';
import { WEIGHT_COST } from './constants';
import { createNode, createGrid } from './testHelpers';

// ─── getNodesInShortestPathOrder ─────────────────────────────────────────────

describe('getNodesInShortestPathOrder', () => {
    it('returns [finish] when no previousNode chain exists (no path)', () => {
        const finish = createNode(0, 0);
        expect(getNodesInShortestPathOrder(finish)).toEqual([finish]);
    });

    it('reconstructs a three-node path in correct order', () => {
        const a = createNode(0, 0);
        const b = createNode(0, 1);
        const c = createNode(0, 2);
        b.previousNode = a;
        c.previousNode = b;
        expect(getNodesInShortestPathOrder(c)).toEqual([a, b, c]);
    });

    it('starts at the start node and ends at the finish node', () => {
        const start = createNode(0, 0);
        const mid = createNode(0, 1);
        const end = createNode(0, 2);
        mid.previousNode = start;
        end.previousNode = mid;
        const path = getNodesInShortestPathOrder(end);
        expect(path[0]).toBe(start);
        expect(path[path.length - 1]).toBe(end);
    });
});

// ─── dijkstra ────────────────────────────────────────────────────────────────

describe('dijkstra', () => {
    it('finds the shortest path on a simple open grid', () => {
        const grid = createGrid(3, 3);
        const start = grid[0][0];
        const finish = grid[2][2];

        dijkstra(grid, start, finish);

        const path = getNodesInShortestPathOrder(finish);
        // Shortest Manhattan path from (0,0) to (2,2) is 4 moves → 5 nodes.
        expect(path.length).toBe(5);
        expect(path[0]).toBe(start);
        expect(path[path.length - 1]).toBe(finish);
    });

    it('visits the start node first', () => {
        const grid = createGrid(3, 3);
        const start = grid[0][0];
        const visited = dijkstra(grid, start, grid[2][2]);
        expect(visited[0]).toBe(start);
    });

    it('applies WEIGHT_COST to weighted nodes', () => {
        // 1×3 grid: start → weight → finish
        // Edge cost: start→weight = WEIGHT_COST; weight→finish = 1
        const grid = createGrid(1, 3);
        const start = grid[0][0];
        const weight = grid[0][1];
        const finish = grid[0][2];
        weight.isWeight = true;

        dijkstra(grid, start, finish);

        const path = getNodesInShortestPathOrder(finish);
        expect(path).toHaveLength(3);
        expect(finish.distance).toBe(WEIGHT_COST + 1);
    });

    it('returns an empty path when finish is walled in', () => {
        const grid = createGrid(3, 3);
        const start = grid[0][0];
        const finish = grid[2][2];
        // Surround finish with walls
        grid[1][2].isWall = true;
        grid[2][1].isWall = true;

        dijkstra(grid, start, finish);

        const path = getNodesInShortestPathOrder(finish);
        // finish.previousNode was never set → path is just [finish]
        expect(path).toHaveLength(1);
        expect(path[0]).toBe(finish);
    });

    it('returns [finish] immediately when start === finish', () => {
        const grid = createGrid(3, 3);
        const start = grid[1][1];

        const visited = dijkstra(grid, start, start);

        expect(visited).toHaveLength(1);
        const path = getNodesInShortestPathOrder(start);
        expect(path).toHaveLength(1);
        expect(path[0]).toBe(start);
    });

    it('handles a fully-walled grid with no reachable nodes', () => {
        const grid = createGrid(3, 3, {
            '0-1': { isWall: true }, '1-0': { isWall: true },
            '1-1': { isWall: true }, '1-2': { isWall: true },
            '0-2': { isWall: true },
        });
        const start = grid[0][0];
        const finish = grid[2][2];

        expect(() => dijkstra(grid, start, finish)).not.toThrow();
        const path = getNodesInShortestPathOrder(finish);
        expect(path).toHaveLength(1);
    });
});

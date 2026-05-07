import { bellmanFord } from './bellman_ford_search';
import { getNodesInShortestPathOrder } from './dijkstra';
import { createGrid } from './testHelpers';

describe('bellmanFord', () => {
    it('finds a path on a small open grid', () => {
        const grid = createGrid(3, 3);
        const start = grid[0][0];
        const finish = grid[2][2];

        bellmanFord(grid, start, finish);

        const path = getNodesInShortestPathOrder(finish);
        expect(path[0]).toBe(start);
        expect(path[path.length - 1]).toBe(finish);
        expect(path.length).toBe(5); // 4-move Manhattan path → 5 nodes
    });

    it('terminates without infinite loop when finish is walled in', () => {
        const grid = createGrid(3, 3);
        const start = grid[0][0];
        const finish = grid[2][2];
        grid[1][2].isWall = true;
        grid[2][1].isWall = true;

        expect(() => bellmanFord(grid, start, finish)).not.toThrow();

        const path = getNodesInShortestPathOrder(finish);
        expect(path).toHaveLength(1); // no path found
    });

    it('does not traverse through wall nodes', () => {
        // 1×3 grid with a wall in the middle — no path should be found
        const grid = createGrid(1, 3);
        const start = grid[0][0];
        const finish = grid[0][2];
        grid[0][1].isWall = true;

        bellmanFord(grid, start, finish);

        const path = getNodesInShortestPathOrder(finish);
        expect(path).toHaveLength(1); // finish.previousNode never set
    });

    it('does not include wall nodes in the visited list', () => {
        const grid = createGrid(3, 3);
        const start = grid[0][0];
        const finish = grid[2][2];
        grid[0][1].isWall = true;

        const visited = bellmanFord(grid, start, finish);
        const wallNodeVisited = visited.some(n => n.isWall);
        expect(wallNodeVisited).toBe(false);
    });

    it('applies WEIGHT_COST to weighted nodes', () => {
        // 1×3: start → weight → finish
        const grid = createGrid(1, 3);
        const start = grid[0][0];
        const finish = grid[0][2];
        grid[0][1].isWeight = true;

        bellmanFord(grid, start, finish);

        const { WEIGHT_COST } = require('./constants');
        expect(finish.distance).toBe(WEIGHT_COST + 1);
    });
});

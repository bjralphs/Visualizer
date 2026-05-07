import { bfs } from './breadth_first_search';
import { getNodesInShortestPathOrder } from './dijkstra';
import { createGrid } from './testHelpers';

describe('bfs', () => {
    it('finds the shortest path on an open grid', () => {
        const grid = createGrid(3, 3);
        const start = grid[0][0];
        const finish = grid[2][2];

        bfs(grid, start, finish);

        const path = getNodesInShortestPathOrder(finish);
        // Shortest path from (0,0) to (2,2) on 3×3 is 4 moves → 5 nodes.
        expect(path.length).toBe(5);
        expect(path[0]).toBe(start);
        expect(path[path.length - 1]).toBe(finish);
    });

    it('visits nodes in level-order on a 1-row grid', () => {
        // 1×4 grid — only one path: start → A → B → finish
        const grid = createGrid(1, 4);
        const start = grid[0][0];
        const finish = grid[0][3];

        bfs(grid, start, finish);

        const path = getNodesInShortestPathOrder(finish);
        expect(path).toEqual([grid[0][0], grid[0][1], grid[0][2], grid[0][3]]);
    });

    it('terminates gracefully when finish is unreachable', () => {
        const grid = createGrid(3, 3);
        const start = grid[0][0];
        const finish = grid[2][2];
        grid[1][2].isWall = true;
        grid[2][1].isWall = true;

        expect(() => bfs(grid, start, finish)).not.toThrow();

        const path = getNodesInShortestPathOrder(finish);
        // finish.previousNode was never set
        expect(path).toHaveLength(1);
        expect(path[0]).toBe(finish);
    });

    it('ignores weight nodes — path cost is not considered', () => {
        // On a 1×3 grid BFS goes straight through the weight node regardless
        const grid = createGrid(1, 3);
        const start = grid[0][0];
        const finish = grid[0][2];
        grid[0][1].isWeight = true;

        bfs(grid, start, finish);

        const path = getNodesInShortestPathOrder(finish);
        expect(path).toHaveLength(3);
        expect(path[1]).toBe(grid[0][1]);
    });

    it('returns [start] immediately when start === finish', () => {
        const grid = createGrid(3, 3);
        const start = grid[0][0];

        const visited = bfs(grid, start, start);

        // BFS pushes start and immediately hits the finishNode check
        expect(visited[0]).toBe(start);
        const path = getNodesInShortestPathOrder(start);
        expect(path).toHaveLength(1);
    });
});

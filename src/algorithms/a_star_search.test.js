import { aStar } from './a_star_search';
import { dijkstra, getNodesInShortestPathOrder } from './dijkstra';
import { WEIGHT_COST } from './constants';
import { createGrid } from './testHelpers';

describe('aStar', () => {
    it('finds a path from start to finish on an open grid', () => {
        const grid = createGrid(5, 5);
        const start = grid[0][0];
        const finish = grid[4][4];

        aStar(grid, start, finish);

        const path = getNodesInShortestPathOrder(finish);
        // Shortest path from (0,0) to (4,4) is 8 moves → 9 nodes.
        expect(path.length).toBe(9);
        expect(path[0]).toBe(start);
        expect(path[path.length - 1]).toBe(finish);
    });

    it('finds the same optimal path length as Dijkstra on an unweighted grid', () => {
        const gridA = createGrid(5, 5);
        aStar(gridA, gridA[0][0], gridA[4][4]);
        const aStarPath = getNodesInShortestPathOrder(gridA[4][4]);

        const gridD = createGrid(5, 5);
        dijkstra(gridD, gridD[0][0], gridD[4][4]);
        const dijkstraPath = getNodesInShortestPathOrder(gridD[4][4]);

        expect(aStarPath.length).toBe(dijkstraPath.length);
    });

    it('applies WEIGHT_COST to weighted nodes', () => {
        // 1×3: start → weight → finish
        const grid = createGrid(1, 3);
        const start = grid[0][0];
        const finish = grid[0][2];
        grid[0][1].isWeight = true;

        aStar(grid, start, finish);

        expect(finish.gCost).toBe(WEIGHT_COST + 1);
    });

    it('terminates gracefully when finish is unreachable', () => {
        const grid = createGrid(3, 3);
        const start = grid[0][0];
        const finish = grid[2][2];
        grid[1][2].isWall = true;
        grid[2][1].isWall = true;

        expect(() => aStar(grid, start, finish)).not.toThrow();

        const path = getNodesInShortestPathOrder(finish);
        expect(path).toHaveLength(1);
    });

    it('explores fewer nodes than Dijkstra on a large open grid', () => {
        const gridA = createGrid(10, 10);
        const aVisited = aStar(gridA, gridA[0][0], gridA[9][9]);

        const gridD = createGrid(10, 10);
        const dVisited = dijkstra(gridD, gridD[0][0], gridD[9][9]);

        // A* with Manhattan heuristic focuses toward the goal and expands fewer nodes.
        expect(aVisited.length).toBeLessThan(dVisited.length);
    });

    it('returns [finish] immediately when start === finish', () => {
        const grid = createGrid(3, 3);
        const start = grid[1][1];

        const visited = aStar(grid, start, start);

        expect(visited).toHaveLength(1);
        const path = getNodesInShortestPathOrder(start);
        expect(path).toHaveLength(1);
    });
});

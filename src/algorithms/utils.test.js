import { getAllNodes, getUnvisitedNeighbors, getNeighbors, heuristic, MinHeap } from './utils';
import { createNode, createGrid } from './testHelpers';

// ─── getAllNodes ─────────────────────────────────────────────────────────────

describe('getAllNodes', () => {
    it('returns all nodes in row-major order', () => {
        const grid = createGrid(2, 3);
        const nodes = getAllNodes(grid);
        expect(nodes).toHaveLength(6);
        expect(nodes[0]).toBe(grid[0][0]);
        expect(nodes[5]).toBe(grid[1][2]);
    });

    it('returns an empty array for an empty grid', () => {
        expect(getAllNodes([])).toHaveLength(0);
    });
});

// ─── getUnvisitedNeighbors ───────────────────────────────────────────────────

describe('getUnvisitedNeighbors', () => {
    it('returns 4 unvisited neighbours for a centre node', () => {
        const grid = createGrid(3, 3);
        expect(getUnvisitedNeighbors(grid[1][1], grid)).toHaveLength(4);
    });

    it('returns 2 neighbours for a corner node', () => {
        const grid = createGrid(3, 3);
        expect(getUnvisitedNeighbors(grid[0][0], grid)).toHaveLength(2);
    });

    it('returns 3 neighbours for an edge (non-corner) node', () => {
        const grid = createGrid(3, 3);
        expect(getUnvisitedNeighbors(grid[0][1], grid)).toHaveLength(3);
    });

    it('excludes already-visited neighbours', () => {
        const grid = createGrid(3, 3);
        grid[0][1].isVisited = true;
        // (0,0) neighbours: (1,0) and (0,1); (0,1) is visited
        const result = getUnvisitedNeighbors(grid[0][0], grid);
        expect(result).toHaveLength(1);
        expect(result[0]).toBe(grid[1][0]);
    });

    it('does NOT filter wall nodes (wall filtering is caller responsibility)', () => {
        const grid = createGrid(3, 3);
        grid[0][1].isWall = true;
        // (0,0) has (1,0) and (0,1); wall node is still returned
        const result = getUnvisitedNeighbors(grid[0][0], grid);
        expect(result).toHaveLength(2);
        expect(result).toContain(grid[0][1]);
    });
});

// ─── getNeighbors ────────────────────────────────────────────────────────────

describe('getNeighbors', () => {
    it('returns all 4 neighbours with no filtering', () => {
        const grid = createGrid(3, 3);
        grid[0][1].isVisited = true;
        grid[0][1].isWall = true;
        // No filtering — visited and wall nodes both returned
        const result = getNeighbors(grid[1][1], grid);
        expect(result).toHaveLength(4);
    });

    it('returns 2 neighbours for a corner node', () => {
        const grid = createGrid(3, 3);
        expect(getNeighbors(grid[0][0], grid)).toHaveLength(2);
    });
});

// ─── heuristic ───────────────────────────────────────────────────────────────

describe('heuristic', () => {
    it('returns the Manhattan distance between two nodes', () => {
        const a = createNode(0, 0);
        const b = createNode(3, 4);
        expect(heuristic(a, b)).toBe(7);
    });

    it('returns 0 when both nodes occupy the same position', () => {
        const a = createNode(5, 3);
        expect(heuristic(a, a)).toBe(0);
    });

    it('is symmetric', () => {
        const a = createNode(1, 2);
        const b = createNode(4, 6);
        expect(heuristic(a, b)).toBe(heuristic(b, a));
    });
});

// ─── MinHeap ─────────────────────────────────────────────────────────────────

describe('MinHeap', () => {
    it('extracts the minimum-distance node first', () => {
        const heap = new MinHeap();
        const a = createNode(0, 0, { distance: 5 });
        const b = createNode(0, 1, { distance: 2 });
        const c = createNode(0, 2, { distance: 8 });
        heap.insert(a);
        heap.insert(b);
        heap.insert(c);
        expect(heap.extractMin()).toBe(b);
        expect(heap.extractMin()).toBe(a);
        expect(heap.extractMin()).toBe(c);
    });

    it('tracks size correctly', () => {
        const heap = new MinHeap();
        expect(heap.size).toBe(0);
        heap.insert(createNode(0, 0, { distance: 1 }));
        expect(heap.size).toBe(1);
        heap.extractMin();
        expect(heap.size).toBe(0);
    });

    it('respects a custom keyFn', () => {
        const heap = new MinHeap(n => n.gCost);
        const a = createNode(0, 0, { gCost: 10 });
        const b = createNode(0, 1, { gCost: 3 });
        heap.insert(a);
        heap.insert(b);
        expect(heap.extractMin()).toBe(b);
    });

    it('handles a single element correctly', () => {
        const heap = new MinHeap();
        const n = createNode(0, 0, { distance: 0 });
        heap.insert(n);
        expect(heap.extractMin()).toBe(n);
        expect(heap.size).toBe(0);
    });

    it('correctly orders many nodes', () => {
        const heap = new MinHeap();
        const distances = [7, 3, 9, 1, 5, 2, 8, 4, 6, 0];
        distances.forEach(d => heap.insert(createNode(0, 0, { distance: d })));
        const extracted = [];
        while (heap.size > 0) extracted.push(heap.extractMin().distance);
        expect(extracted).toEqual([...distances].sort((a, b) => a - b));
    });
});

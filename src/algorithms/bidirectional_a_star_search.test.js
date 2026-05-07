import {
    bidirectionalAStar,
    getNodesInShortestPathOrderBiAStar,
} from './bidirectional_a_star_search';
import { createNode, createGrid } from './testHelpers';

// ─── getNodesInShortestPathOrderBiAStar ──────────────────────────────────────

describe('getNodesInShortestPathOrderBiAStar', () => {
    it('stitches forward and backward chains at the meeting node', () => {
        // Forward chain:  a → b → c (meeting node)
        // Backward chain: c → d
        const a = createNode(0, 0);
        const b = createNode(0, 1);
        const c = createNode(0, 2); // meeting node
        const d = createNode(0, 3);

        b.previousNode = a;
        c.previousNode = b;
        c.previousNodeReverse = d; // backward: c points to d

        const path = getNodesInShortestPathOrderBiAStar(c);
        // Forward unshifted: [a, b, c]; backward appended: [d]
        expect(path).toEqual([a, b, c, d]);
    });

    it('returns just the meeting node when it has no chains', () => {
        const lone = createNode(0, 0);
        const path = getNodesInShortestPathOrderBiAStar(lone);
        expect(path).toEqual([lone]);
    });

    it('handles a forward-only chain (no backward link)', () => {
        const a = createNode(0, 0);
        const b = createNode(0, 1); // meeting node, no backward chain
        b.previousNode = a;

        const path = getNodesInShortestPathOrderBiAStar(b);
        expect(path).toEqual([a, b]);
    });
});

// ─── bidirectionalAStar ───────────────────────────────────────────────────────

describe('bidirectionalAStar', () => {
    it('finds a path on a simple open grid', () => {
        const grid = createGrid(3, 5);
        const start = grid[1][0]; start.isStart = true;
        const finish = grid[1][4]; finish.isFinish = true;

        const visited = bidirectionalAStar(grid, start, finish);
        expect(visited.length).toBeGreaterThan(0);

        // The last visited node is the meeting node; a path should be reconstructable.
        const meetingNode = visited[visited.length - 1];
        const path = getNodesInShortestPathOrderBiAStar(meetingNode);
        expect(path.length).toBeGreaterThan(0);
    });

    it('terminates gracefully when finish is unreachable', () => {
        const grid = createGrid(3, 3);
        const start = grid[0][0];
        const finish = grid[2][2];
        // Wall off finish completely
        grid[1][2].isWall = true;
        grid[2][1].isWall = true;

        expect(() => bidirectionalAStar(grid, start, finish)).not.toThrow();
    });

    it('marks visited nodes by their frontier direction', () => {
        const grid = createGrid(3, 5);
        const start = grid[1][0]; start.isStart = true;
        const finish = grid[1][4]; finish.isFinish = true;

        const visited = bidirectionalAStar(grid, start, finish);

        // Every node in visitedNodesInOrder must carry at least one frontier flag.
        const allFlagged = visited.every(n => n.isVisited || n.isVisitedByFinish);
        expect(allFlagged).toBe(true);
    });
});

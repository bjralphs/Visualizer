// Shared utilities used by multiple pathfinding algorithms.

/** Return a flat array of every node in the grid, in row-major order. */
export function getAllNodes(grid) {
    const nodes = [];
    for (const row of grid) {
        for (const node of row) {
            nodes.push(node);
        }
    }
    return nodes;
}

/**
 * Return the four orthogonal neighbours of `node` that have not yet been
 * marked visited (node.isVisited === false).
 */
export function getUnvisitedNeighbors(node, grid) {
    const neighbors = [];
    const { col, row } = node;
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
    return neighbors.filter(neighbor => !neighbor.isVisited);
}

/**
 * Return ALL four orthogonal neighbours of `node` with no filtering.
 * Used by algorithms (IDA*, Bidirectional A*) that manage their own
 * visited / wall checks inside the main loop.
 */
export function getNeighbors(node, grid) {
    const neighbors = [];
    const { col, row } = node;
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
    return neighbors;
}

/** Manhattan distance heuristic — used by A*, Weighted A*, GBFS, Beam, IDA*, Bidirectional A*. */
export function heuristic(nodeA, nodeB) {
    return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
}

/**
 * Binary min-heap with optional key function.
 *
 * Pass a `keyFn` to key on a property other than `node.distance`.
 * Defaults to `n => n.distance` for backward compatibility.
 *
 * Supports O(log n) insert and extractMin. Used with the "lazy deletion"
 * pattern: when a node's distance is improved it is re-inserted; stale
 * heap entries are discarded when extracted because `node.isVisited` is
 * already true by then.
 */
export class MinHeap {
    constructor(keyFn) {
        this._heap = [];
        this._key = keyFn || (n => n.distance);
    }

    get size() {
        return this._heap.length;
    }

    insert(node) {
        this._heap.push(node);
        this._bubbleUp(this._heap.length - 1);
    }

    extractMin() {
        const min = this._heap[0];
        const last = this._heap.pop();
        if (this._heap.length > 0) {
            this._heap[0] = last;
            this._siftDown(0);
        }
        return min;
    }

    _bubbleUp(i) {
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (this._key(this._heap[parent]) <= this._key(this._heap[i])) break;
            [this._heap[parent], this._heap[i]] = [this._heap[i], this._heap[parent]];
            i = parent;
        }
    }

    _siftDown(i) {
        const n = this._heap.length;
        while (true) {
            let smallest = i;
            const l = 2 * i + 1;
            const r = 2 * i + 2;
            if (l < n && this._key(this._heap[l]) < this._key(this._heap[smallest])) smallest = l;
            if (r < n && this._key(this._heap[r]) < this._key(this._heap[smallest])) smallest = r;
            if (smallest === i) break;
            [this._heap[smallest], this._heap[i]] = [this._heap[i], this._heap[smallest]];
            i = smallest;
        }
    }
}

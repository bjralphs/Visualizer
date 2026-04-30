// IDA* (Iterative Deepening A*)
// Performs a depth-limited DFS, increasing the f-cost bound each iteration
// until the finish node is found. Uses O(d) memory where d is solution depth.
// The animation shows each complete DFS sweep — visually distinct from all
// other algorithms as you watch it re-explore with each higher bound.
//
// To keep the animation non-blocking on large grids, each DFS iteration is
// run iteratively (explicit stack) rather than recursively.
import { WEIGHT_COST } from './constants';
import { heuristic, getNeighbors } from './utils';

export function idaStar(grid, startNode, finishNode) {
    const visitedNodesInOrder = [];

    startNode.gCost = 0;
    let bound = heuristic(startNode, finishNode);

    // Guard against infinite loops on grids with no path
    const maxBound = grid.length * grid[0].length;

    while (bound <= maxBound) {
        const result = searchBound(
            grid,
            startNode,
            finishNode,
            bound,
            visitedNodesInOrder,
        );

        if (result === 'FOUND') return visitedNodesInOrder;
        if (result === Infinity) return visitedNodesInOrder; // no path
        bound = result; // raise bound to the smallest f-cost that exceeded the current bound
    }

    return visitedNodesInOrder;
}

// Iterative DFS bounded by f-cost. Returns:
//   'FOUND'  — finish reached
//   Infinity — no path exists
//   number   — smallest f-cost exceeding bound (next bound to try)
function searchBound(grid, startNode, finishNode, bound, visitedNodesInOrder) {
    // Stack entries: { node, gCost, parent }
    const stack = [{ node: startNode, gCost: 0, parent: null }];
    let nextBound = Infinity;

    // Track which nodes are on the current path to avoid cycles
    const onPath = new Set();

    while (stack.length) {
        const { node, gCost, parent } = stack.pop();

        const f = gCost + heuristic(node, finishNode);

        if (f > bound) {
            if (f < nextBound) nextBound = f;
            continue;
        }

        if (node.isWall) continue;

        // Record each node once per full IDA* run; update path on cheaper re-visit
        if (!node.isVisited) {
            node.isVisited = true;
            node.gCost = gCost;
            if (parent) node.previousNode = parent;
            visitedNodesInOrder.push(node);
        } else if (gCost < node.gCost) {
            // Later IDA* iteration found a cheaper route — update the traceback
            node.gCost = gCost;
            if (parent) node.previousNode = parent;
        }

        if (node === finishNode) return 'FOUND';

        const key = `${node.row}-${node.col}`;
        if (onPath.has(key)) continue;
        onPath.add(key);

        const neighbors = getNeighbors(node, grid);
        // Push in reverse so we process in natural order (top, bottom, left, right)
        for (let i = neighbors.length - 1; i >= 0; i--) {
            const neighbor = neighbors[i];
            if (neighbor.isWall) continue;
            const neighborKey = `${neighbor.row}-${neighbor.col}`;
            if (onPath.has(neighborKey)) continue;

            const neighborG = gCost + (neighbor.isWeight ? WEIGHT_COST : 1);
            // Update path tracking if we found a cheaper route
            if (!neighbor.isVisited || neighborG < neighbor.gCost) {
                stack.push({ node: neighbor, gCost: neighborG, parent: node });
            }
        }

        onPath.delete(key);
    }

    return nextBound;
}



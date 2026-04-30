// Beam Search — BFS that keeps only the top BEAM_WIDTH candidates per level,
// ranked by Manhattan distance to the finish node.
// Not guaranteed to find the shortest path (incomplete when beam is too narrow),
// but much faster than BFS on large open grids.
import { WEIGHT_COST } from './constants';
import { getUnvisitedNeighbors, heuristic } from './utils';

const BEAM_WIDTH = 5;

export function beamSearch(grid, startNode, finishNode) {
    const visitedNodesInOrder = [];
    startNode.distance = 0;
    startNode.isVisited = true;
    visitedNodesInOrder.push(startNode);

    if (startNode === finishNode) return visitedNodesInOrder;

    let frontier = [startNode];

    while (frontier.length) {
        const candidates = [];
        const seen = new Set();

        for (const node of frontier) {
            for (const neighbor of getUnvisitedNeighbors(node, grid)) {
                const key = `${neighbor.row}-${neighbor.col}`;
                if (!seen.has(key) && !neighbor.isWall) {
                    seen.add(key);
                    if (neighbor.distance === Infinity) {
                        neighbor.distance = node.distance + (neighbor.isWeight ? WEIGHT_COST : 1);
                        neighbor.previousNode = node;
                    }
                    candidates.push(neighbor);
                }
            }
        }

        candidates.sort((a, b) => heuristic(a, finishNode) - heuristic(b, finishNode));

        const nextFrontier = [];
        for (const node of candidates) {
            if (node.isVisited) continue;
            node.isVisited = true;
            visitedNodesInOrder.push(node);
            if (node === finishNode) return visitedNodesInOrder;
            nextFrontier.push(node);
            if (nextFrontier.length >= BEAM_WIDTH) break;
        }

        frontier = nextFrontier;
    }

    return visitedNodesInOrder;
}

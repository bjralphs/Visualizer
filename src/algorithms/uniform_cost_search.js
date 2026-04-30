import { WEIGHT_COST } from './constants';
import { getUnvisitedNeighbors, MinHeap } from './utils';

// Uniform Cost Search expands nodes in order of increasing path cost g(n),
// guaranteeing the optimal path on any non-negative cost graph.
// On this grid every unweighted edge costs 1 and every weighted edge costs
// WEIGHT_COST, making UCS equivalent to Dijkstra's algorithm.
// The two are shown side-by-side so learners can compare identical behaviour
// under different pedagogical names.
export function uniformCostSearch(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];
  startNode.distance = 0;

  const heap = new MinHeap();
  heap.insert(startNode);

  while (heap.size > 0) {
    const closestNode = heap.extractMin();

    if (closestNode.isWall) continue;
    if (closestNode.isVisited) continue; // stale heap entry — skip
    if (closestNode.distance === Infinity) return visitedNodesInOrder;

    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);

    if (closestNode === finishNode) return visitedNodesInOrder;

    for (const neighbor of getUnvisitedNeighbors(closestNode, grid)) {
      const d = closestNode.distance + (neighbor.isWeight ? WEIGHT_COST : 1);
      if (d < neighbor.distance) {
        neighbor.distance = d;
        neighbor.previousNode = closestNode;
        heap.insert(neighbor);
      }
    }
  }

  return visitedNodesInOrder;
}


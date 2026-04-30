import { WEIGHT_COST } from './constants';
import { getUnvisitedNeighbors, heuristic, MinHeap } from './utils';

export function aStar(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];
  startNode.gCost = 0;
  startNode.distance = heuristic(startNode, finishNode);

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
      const tentativeG = closestNode.gCost + (neighbor.isWeight ? WEIGHT_COST : 1);
      if (tentativeG < neighbor.gCost) {
        neighbor.gCost = tentativeG;
        neighbor.distance = tentativeG + heuristic(neighbor, finishNode);
        neighbor.previousNode = closestNode;
        heap.insert(neighbor);
      }
    }
  }

  return visitedNodesInOrder;
}


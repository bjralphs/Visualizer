// The primary function for Greedy Best-First Search.
import { getUnvisitedNeighbors, heuristic, MinHeap } from './utils';

export function gbfs(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];
  // Store heuristic value in node.distance — used as the MinHeap priority key.
  // GBFS ignores path cost and greedily expands the node closest to the finish.
  startNode.distance = heuristic(startNode, finishNode);

  const heap = new MinHeap();
  heap.insert(startNode);

  while (heap.size > 0) {
    const closestNode = heap.extractMin();

    if (closestNode.isWall) continue;
    if (closestNode.isVisited) continue; // stale heap entry — skip

    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);

    if (closestNode === finishNode) return visitedNodesInOrder;

    for (const neighbor of getUnvisitedNeighbors(closestNode, grid)) {
      neighbor.distance = heuristic(neighbor, finishNode);
      neighbor.previousNode = closestNode;
      heap.insert(neighbor);
    }
  }

  return visitedNodesInOrder;
}



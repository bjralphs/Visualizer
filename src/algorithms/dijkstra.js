import { WEIGHT_COST } from './constants';
import { getUnvisitedNeighbors, MinHeap } from './utils';

export function dijkstra(grid, startNode, finishNode) {
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

export function getNodesInShortestPathOrder(finishNode) {
  const nodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
}

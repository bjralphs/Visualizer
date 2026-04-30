// Bidirectional Dijkstra: simultaneous BFS/Dijkstra from both start and finish.
// Alternates between forward (from start) and backward (from finish) frontiers.
// Returns when a node is claimed by both searches — the intersection point.
//
// Forward frontier keys on node.distance (cost from start).
// Backward frontier keys on node.distanceFromFinish (cost from finish).
// Both use lazy-deletion MinHeaps for O(n log n) total complexity.
import { WEIGHT_COST } from './constants';
import { MinHeap } from './utils';

export function biDirectionalSearch(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];
  startNode.distance = 0;
  finishNode.distanceFromFinish = 0;

  const forwardHeap = new MinHeap();                           // keys on node.distance
  const backwardHeap = new MinHeap(n => n.distanceFromFinish); // keys on node.distanceFromFinish

  forwardHeap.insert(startNode);
  backwardHeap.insert(finishNode);

  let forwardSearch = true;

  while (forwardHeap.size > 0 && backwardHeap.size > 0) {
    if (forwardSearch) {
      const currentNode = forwardHeap.extractMin();

      if (currentNode.isWall || currentNode.isVisited) {
        forwardSearch = !forwardSearch;
        continue;
      }
      if (currentNode.distance === Infinity) return visitedNodesInOrder;

      currentNode.isVisited = true;
      visitedNodesInOrder.push(currentNode);

      if (currentNode.isVisitedByFinish) return visitedNodesInOrder; // intersection found

      for (const neighbor of getForwardNeighbors(currentNode, grid)) {
        const d = currentNode.distance + (neighbor.isWeight ? WEIGHT_COST : 1);
        if (d < neighbor.distance) {
          neighbor.distance = d;
          neighbor.previousNode = currentNode;
          forwardHeap.insert(neighbor);
        }
      }
    } else {
      const currentNode = backwardHeap.extractMin();

      if (currentNode.isWall || currentNode.isVisitedByFinish) {
        forwardSearch = !forwardSearch;
        continue;
      }
      if (currentNode.distanceFromFinish === Infinity) return visitedNodesInOrder;

      currentNode.isVisitedByFinish = true;
      visitedNodesInOrder.push(currentNode);

      if (currentNode.isVisited) return visitedNodesInOrder; // intersection found

      for (const neighbor of getBackwardNeighbors(currentNode, grid)) {
        const d = currentNode.distanceFromFinish + (neighbor.isWeight ? WEIGHT_COST : 1);
        if (d < neighbor.distanceFromFinish) {
          neighbor.distanceFromFinish = d;
          // Push into forward heap so the forward search can claim this node
          // and build the previousNode chain back to start for path reconstruction.
          forwardHeap.insert(neighbor);
        }
      }
    }

    forwardSearch = !forwardSearch;
  }

  return visitedNodesInOrder;
}

/** Forward-search neighbours: unvisited (by forward search) orthogonal cells. */
function getForwardNeighbors(node, grid) {
  const { col, row } = node;
  const neighbors = [];
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors.filter(n => !n.isVisited);
}

/** Backward-search neighbours: unvisited (by backward search) orthogonal cells. */
function getBackwardNeighbors(node, grid) {
  const { col, row } = node;
  const neighbors = [];
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors.filter(n => !n.isVisitedByFinish);
}



import { WEIGHT_COST } from './constants';
import { getUnvisitedNeighbors } from './utils';

export function floydWarshall(grid, startNode, finishNode) {
  const numNodes = grid.length * (grid[0] ? grid[0].length : 0);
  let dist = Array.from({ length: numNodes }, () =>
    Array(numNodes).fill(Infinity),
  );
  let next = Array.from({ length: numNodes }, () => Array(numNodes).fill(null));

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const idx = row * grid[0].length + col;
      dist[idx][idx] = 0;
      for (const neighbor of getUnvisitedNeighbors(grid[row][col], grid)) {
        if (!neighbor.isWall) {
          // Be mindful of wall nodes here
          const idxNeighbor = neighbor.row * grid[0].length + neighbor.col;
          dist[idx][idxNeighbor] = neighbor.isWeight ? WEIGHT_COST : 1; // distance between neighbors
          next[idx][idxNeighbor] = idxNeighbor;
        }
      }
    }
  }

  for (let k = 0; k < numNodes; k++) {
    if (grid[Math.floor(k / grid[0].length)][k % grid[0].length].isWall)
      continue; // Skip if the intermediate node is a wall
    for (let i = 0; i < numNodes; i++) {
      for (let j = 0; j < numNodes; j++) {
        if (dist[i][j] > dist[i][k] + dist[k][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
          next[i][j] = next[i][k];
        }
      }
    }
  }

  // Exploration sweep: show all reachable (non-wall) nodes being processed,
  // giving Floyd-Warshall the same visible animation as other algorithms.
  const visitedNodesInOrder = [];
  for (const row of grid) {
    for (const node of row) {
      if (!node.isWall) {
        node.isVisited = true;
        visitedNodesInOrder.push(node);
      }
    }
  }

  // Path reconstruction: walk the next-hop matrix to set previousNode chains.
  let currentNodeIdx = startNode.row * grid[0].length + startNode.col;
  const targetNodeIdx = finishNode.row * grid[0].length + finishNode.col;
  let prevNode = null;

  while (currentNodeIdx !== null && currentNodeIdx !== targetNodeIdx) {
    const currentNode =
      grid[Math.floor(currentNodeIdx / grid[0].length)][
      currentNodeIdx % grid[0].length
      ];
    currentNode.previousNode = prevNode;
    prevNode = currentNode;
    currentNodeIdx = next[currentNodeIdx][targetNodeIdx];
  }
  if (currentNodeIdx === targetNodeIdx) {
    finishNode.previousNode = prevNode;
  }

  return visitedNodesInOrder;
}




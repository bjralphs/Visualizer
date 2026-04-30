import { WEIGHT_COST } from './constants';
import { getAllNodes } from './utils';

export function bellmanFord(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];
  startNode.distance = 0;

  const allNodes = getAllNodes(grid);
  const edges = getAllEdges(grid);

  let targetReached = false;

  for (let i = 1; i <= allNodes.length && !targetReached; i++) {
    for (const edge of edges) {
      if (edge.from.distance + (edge.to.isWeight ? WEIGHT_COST : 1) < edge.to.distance) {
        edge.to.distance = edge.from.distance + (edge.to.isWeight ? WEIGHT_COST : 1);
        edge.to.previousNode = edge.from;
        if (!edge.to.isVisited) {
          edge.to.isVisited = true;
          visitedNodesInOrder.push(edge.to);
        }
        // Check if the finishNode has been reached
        if (edge.to === finishNode) {
          targetReached = true;
          break;
        }
      }
    }
  }

  return visitedNodesInOrder;
}

function getAllEdges(grid) {
  const edges = [];
  for (const node of getAllNodes(grid)) {
    const neighbors = getUnvisitedNeighbors(node, grid);
    for (const neighbor of neighbors) {
      edges.push({ from: node, to: neighbor });
    }
  }
  return edges;
}

function getUnvisitedNeighbors(node, grid) {
  const neighbors = [];
  const { col, row } = node;

  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);

  return neighbors.filter(neighbor => !neighbor.isVisited && !neighbor.isWall);
}




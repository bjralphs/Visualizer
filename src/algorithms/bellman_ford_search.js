import { WEIGHT_COST } from './constants';
import { getAllNodes, getUnvisitedNeighbors } from './utils';

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

// T06-B6: Removed local duplicate getUnvisitedNeighbors.
// The shared version from utils.js returns all unvisited orthogonal neighbours;
// we add an explicit !isWall filter here to preserve Bellman-Ford edge semantics.
function getAllEdges(grid) {
  const edges = [];
  for (const node of getAllNodes(grid)) {
    for (const neighbor of getUnvisitedNeighbors(node, grid)) {
      if (!neighbor.isWall) {
        edges.push({ from: node, to: neighbor });
      }
    }
  }
  return edges;
}



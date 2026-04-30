import { getUnvisitedNeighbors } from './utils';

export function dfs(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];
  const nodeStack = [{ node: startNode, previous: null }];

  while (nodeStack.length > 0) {
    const { node: currentNode, previous } = nodeStack.pop();

    if (currentNode.isVisited || currentNode.isWall) continue;

    currentNode.isVisited = true;
    currentNode.previousNode = previous;
    visitedNodesInOrder.push(currentNode);

    if (currentNode === finishNode) return visitedNodesInOrder;

    for (const neighbor of getUnvisitedNeighbors(currentNode, grid)) {
      nodeStack.push({ node: neighbor, previous: currentNode });
    }
  }

  return visitedNodesInOrder;
}


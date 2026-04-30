// Bidirectional A*
// Runs two A* frontiers simultaneously — one from start, one from finish —
// alternating expansions. Each frontier uses the Manhattan heuristic toward
// its own target. Terminates when the two frontiers intersect.
//
// Produces a noticeably smaller explored region than both standard A* and
// the existing Bidirectional BFS, making the comparison visually instructive.
import { WEIGHT_COST } from './constants';
import { heuristic, getNeighbors } from './utils';

export function bidirectionalAStar(grid, startNode, finishNode) {
    const visitedNodesInOrder = [];

    startNode.gCost = 0;
    startNode.distance = heuristic(startNode, finishNode);
    startNode.isVisitedByStart = true;

    finishNode.gCost = 0;
    finishNode.distance = heuristic(finishNode, startNode);
    finishNode.isVisitedByFinish = true;

    // Open sets seeded with only the respective start nodes
    const forwardOpen = [startNode];
    const backwardOpen = [finishNode];

    while (forwardOpen.length && backwardOpen.length) {
        // --- Forward step ---
        sortByFCost(forwardOpen);
        const fwdNode = forwardOpen.shift();

        if (fwdNode.isWall) continue;
        fwdNode.isVisited = true;
        visitedNodesInOrder.push(fwdNode);

        // Intersection: backward frontier has already touched this node
        if (fwdNode.isVisitedByFinish) return visitedNodesInOrder;

        for (const neighbor of getNeighbors(fwdNode, grid)) {
            if (neighbor.isWall || neighbor.isVisited) continue;
            const tentativeG = fwdNode.gCost + (neighbor.isWeight ? WEIGHT_COST : 1);
            if (!neighbor.isVisitedByStart || tentativeG < neighbor.gCost) {
                neighbor.gCost = tentativeG;
                neighbor.distance = tentativeG + heuristic(neighbor, finishNode);
                neighbor.previousNode = fwdNode;
                neighbor.isVisitedByStart = true;
                forwardOpen.push(neighbor);
            }
        }

        // --- Backward step ---
        sortByFCost(backwardOpen);
        const bwdNode = backwardOpen.shift();

        if (bwdNode.isWall) continue;
        bwdNode.isVisitedByFinish = true;
        visitedNodesInOrder.push(bwdNode);

        // Intersection: forward frontier has already touched this node
        if (bwdNode.isVisited) return visitedNodesInOrder;

        for (const neighbor of getNeighbors(bwdNode, grid)) {
            if (neighbor.isWall || neighbor.isVisitedByFinish) continue;
            const tentativeG = bwdNode.gCost + (neighbor.isWeight ? WEIGHT_COST : 1);
            if (!neighbor.isVisitedByFinish || tentativeG < neighbor.gCost) {
                neighbor.gCost = tentativeG;
                neighbor.distance = tentativeG + heuristic(neighbor, startNode);
                neighbor.previousNodeReverse = bwdNode;
                neighbor.isVisitedByFinish = true;
                backwardOpen.push(neighbor);
            }
        }
    }

    return visitedNodesInOrder;
}

export function getNodesInShortestPathOrderBiAStar(meetingNode) {
    // Forward chain: meetingNode back to startNode
    const forwardPath = [];
    let node = meetingNode;
    while (node !== null) {
        forwardPath.unshift(node);
        node = node.previousNode;
    }
    // Backward chain: meetingNode toward finishNode
    const backwardPath = [];
    let bNode = meetingNode.previousNodeReverse;
    while (bNode !== null) {
        backwardPath.push(bNode);
        bNode = bNode.previousNodeReverse;
    }
    return [...forwardPath, ...backwardPath];
}

function sortByFCost(openSet) {
    openSet.sort((a, b) => a.distance - b.distance);
}



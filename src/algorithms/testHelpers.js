/**
 * Shared test helpers for algorithm unit tests.
 * Not a test file — no describe/it blocks here.
 */

/** Creates a minimal node object with all algorithm-relevant fields. */
export function createNode(row, col, overrides = {}) {
    return {
        row,
        col,
        isStart: false,
        isFinish: false,
        isWall: false,
        isWeight: false,
        isGate: false,
        isVisited: false,
        distance: Infinity,
        gCost: Infinity,
        distanceFromFinish: Infinity,
        previousNode: null,
        previousNodeReverse: null,
        isVisitedByStart: false,
        isVisitedByFinish: false,
        wallVariant: 0,
        ...overrides,
    };
}

/**
 * Creates an R×C grid of clean nodes.
 * @param {number} rows
 * @param {number} cols
 * @param {Object} cellOverrides  — keyed by "row-col", e.g. { '0-0': { isWall: true } }
 */
export function createGrid(rows, cols, cellOverrides = {}) {
    return Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) =>
            createNode(r, c, cellOverrides[`${r}-${c}`] || {}),
        ),
    );
}

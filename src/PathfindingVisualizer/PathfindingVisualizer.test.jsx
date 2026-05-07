/**
 * T08 — Component tests for PathfindingVisualizer
 *
 * Covers:
 *   - clearPath: clears algorithm state but preserves walls/weights
 *   - resetGrid: clears walls, weights, visited state and gate state flags
 *   - handleResize: produces a non-empty grid; clamps to ≥ 1 row/col on
 *     near-zero viewports (EC4 regression guard)
 */

import React from 'react';
import ReactDOM from 'react-dom';
import PathfindingVisualizer from './PathfindingVisualizer';
import MenuItemContext from '../Components/MenuItemContext';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Minimal mock that satisfies all this.context.* calls in PFV. */
const makeMockContext = (overrides = {}) => ({
    menuItem: 'Breadth-First Search',
    mazeItem: 'Basic Random Maze',  // avoids heavy maze generation in tests
    speedItem: 'Fast',
    isAnimating: false,
    setIsAnimating: jest.fn(),
    drawMode: 'wall',
    setDrawMode: jest.fn(),
    runHistory: [],
    addRun: jest.fn(),
    ...overrides,
});

/**
 * Render PathfindingVisualizer inside a mock context and return the instance.
 * Uses ReactDOM.render (CRA 3.x / React 16 API) to obtain a class ref.
 */
function mountPFV(ctx = makeMockContext()) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    let instance = null;
    ReactDOM.render(
        <MenuItemContext.Provider value={ctx}>
            <PathfindingVisualizer ref={r => { instance = r; }} />
        </MenuItemContext.Provider>,
        container,
    );
    return { instance, container };
}

function unmount(container) {
    ReactDOM.unmountComponentAtNode(container);
    document.body.removeChild(container);
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
    // Provide a realistic viewport so getInitialGrid produces a real grid
    // (jsdom defaults to 0 × 0; with EC4 fix the grid would be 1×1 instead)
    Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true, writable: true });

    jest.useFakeTimers();
});

afterEach(() => {
    jest.runAllTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
});

// ── clearPath ─────────────────────────────────────────────────────────────────

describe('clearPath()', () => {
    it('preserves isWall on nodes that were walled', () => {
        const { instance, container } = mountPFV();
        const wallRow = 2, wallCol = 2;

        // Paint a wall and some visited state onto the grid
        const dirtyGrid = instance.state.grid.map((row, r) =>
            row.map((node, c) => ({
                ...node,
                isWall: r === wallRow && c === wallCol,
                isVisited: true,
                distance: 3,
                gCost: 3,
                distanceFromFinish: 3,
                previousNode: {},
                isVisitedByStart: true,
                isVisitedByFinish: true,
            })),
        );
        instance.setState({ grid: dirtyGrid });

        instance.clearPath();

        const grid = instance.state.grid;
        expect(grid[wallRow][wallCol].isWall).toBe(true);
        unmount(container);
    });

    it('preserves isWeight on weighted nodes', () => {
        const { instance, container } = mountPFV();
        const wRow = 3, wCol = 3;

        const dirtyGrid = instance.state.grid.map((row, r) =>
            row.map((node, c) => ({
                ...node,
                isWeight: r === wRow && c === wCol,
                isVisited: true,
            })),
        );
        instance.setState({ grid: dirtyGrid });

        instance.clearPath();

        expect(instance.state.grid[wRow][wCol].isWeight).toBe(true);
        unmount(container);
    });

    it('clears isVisited, distance, gCost, distanceFromFinish, and previousNode', () => {
        const { instance, container } = mountPFV();

        const dirtyGrid = instance.state.grid.map(row =>
            row.map(node => ({
                ...node,
                isVisited: true,
                distance: 5,
                gCost: 7,
                distanceFromFinish: 3,
                previousNode: {},
                isVisitedByStart: true,
                isVisitedByFinish: true,
            })),
        );
        instance.setState({ grid: dirtyGrid });

        instance.clearPath();

        const { grid } = instance.state;
        for (const row of grid) {
            for (const node of row) {
                expect(node.isVisited).toBe(false);
                expect(node.distance).toBe(Infinity);
                expect(node.gCost).toBe(Infinity);
                expect(node.distanceFromFinish).toBe(Infinity);
                expect(node.previousNode).toBeNull();
                expect(node.isVisitedByStart).toBe(false);
                expect(node.isVisitedByFinish).toBe(false);
            }
        }
        unmount(container);
    });

    it('sets noPathFound to false', () => {
        const { instance, container } = mountPFV();
        instance.setState({ noPathFound: true, grid: instance.state.grid });

        instance.clearPath();

        expect(instance.state.noPathFound).toBe(false);
        unmount(container);
    });
});

// ── resetGrid ─────────────────────────────────────────────────────────────────

describe('resetGrid()', () => {
    it('clears isWall on all nodes', () => {
        const { instance, container } = mountPFV();
        const walledGrid = instance.state.grid.map(row =>
            row.map(node => ({ ...node, isWall: true })),
        );
        instance.setState({ grid: walledGrid });

        instance.resetGrid();

        for (const row of instance.state.grid) {
            for (const node of row) {
                expect(node.isWall).toBe(false);
            }
        }
        unmount(container);
    });

    it('clears isWeight on all nodes', () => {
        const { instance, container } = mountPFV();
        const weightedGrid = instance.state.grid.map(row =>
            row.map(node => ({ ...node, isWeight: true })),
        );
        instance.setState({ grid: weightedGrid });

        instance.resetGrid();

        for (const row of instance.state.grid) {
            for (const node of row) {
                expect(node.isWeight).toBe(false);
            }
        }
        unmount(container);
    });

    it('clears isVisited and previousNode on all nodes', () => {
        const { instance, container } = mountPFV();
        const visitedGrid = instance.state.grid.map(row =>
            row.map(node => ({ ...node, isVisited: true, previousNode: {} })),
        );
        instance.setState({ grid: visitedGrid });

        instance.resetGrid();

        for (const row of instance.state.grid) {
            for (const node of row) {
                expect(node.isVisited).toBe(false);
                expect(node.previousNode).toBeNull();
            }
        }
        unmount(container);
    });

    it('resets gate-related state flags', () => {
        const { instance, container } = mountPFV();
        instance.setState({ hasGate: true, gateNodeRow: 5, gateNodeCol: 5 });

        instance.resetGrid();

        expect(instance.state.hasGate).toBe(false);
        expect(instance.state.gateNodeRow).toBeNull();
        expect(instance.state.gateNodeCol).toBeNull();
        unmount(container);
    });

    it('sets noPathFound to false', () => {
        const { instance, container } = mountPFV();
        instance.setState({ noPathFound: true });

        instance.resetGrid();

        expect(instance.state.noPathFound).toBe(false);
        unmount(container);
    });
});

// ── handleResize ──────────────────────────────────────────────────────────────

describe('handleResize()', () => {
    it('produces a non-empty grid after resize to a normal viewport', () => {
        const { instance, container } = mountPFV();

        Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true, writable: true });
        instance.handleResize();

        const { grid } = instance.state;
        expect(grid.length).toBeGreaterThanOrEqual(1);
        expect(grid[0].length).toBeGreaterThanOrEqual(1);
        unmount(container);
    });

    it('clamps to at least 1 row and 1 col on a near-zero viewport (EC4)', () => {
        const { instance, container } = mountPFV();

        Object.defineProperty(window, 'innerWidth', { value: 0, configurable: true, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: 0, configurable: true, writable: true });
        instance.handleResize();

        const { grid } = instance.state;
        expect(grid.length).toBeGreaterThanOrEqual(1);
        expect(grid[0].length).toBeGreaterThanOrEqual(1);
        unmount(container);
    });

    it('clamps start and finish positions inside the new grid bounds', () => {
        const { instance, container } = mountPFV();

        // Force a tiny viewport so numRows and numCols shrink
        Object.defineProperty(window, 'innerWidth', { value: 100, configurable: true, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: 300, configurable: true, writable: true });
        instance.handleResize();

        const { grid, startNodeRow, startNodeCol, finishNodeRow, finishNodeCol } = instance.state;
        const numRows = grid.length;
        const numCols = grid[0].length;

        expect(startNodeRow).toBeLessThan(numRows);
        expect(startNodeCol).toBeLessThan(numCols);
        expect(finishNodeRow).toBeLessThan(numRows);
        expect(finishNodeCol).toBeLessThan(numCols);
        unmount(container);
    });
});

// ── T15: Touch event handlers ─────────────────────────────────────────────────

describe('T15 touch handlers', () => {
    it('handleTouchStart sets mouseIsPressed and toggles a wall', () => {
        const { instance, container } = mountPFV();
        const row = 2, col = 2;

        // Simulate touch start on a plain node — should toggle wall on
        const fakeEvent = { preventDefault: jest.fn() };
        instance.handleTouchStart(row, col, fakeEvent);

        expect(fakeEvent.preventDefault).toHaveBeenCalled();
        expect(instance.state.mouseIsPressed).toBe(true);
        expect(instance.state.grid[row][col].isWall).toBe(true);
        unmount(container);
    });

    it('handleTouchEnd resets mouseIsPressed', () => {
        const { instance, container } = mountPFV();
        instance.setState({ mouseIsPressed: true });

        const fakeEvent = { preventDefault: jest.fn() };
        instance.handleTouchEnd(fakeEvent);

        expect(fakeEvent.preventDefault).toHaveBeenCalled();
        expect(instance.state.mouseIsPressed).toBe(false);
        unmount(container);
    });

    it('handleTouchMove calls handleMouseEnter for the node under the touch point', () => {
        const { instance, container } = mountPFV();

        // Spy on handleMouseEnter to verify it is called with the correct coords.
        // Asserting wall state directly is unreliable because the inner setState
        // may not flush synchronously when called outside React event handlers.
        const spy = jest.spyOn(instance, 'handleMouseEnter');
        instance.setState({ mouseIsPressed: true });

        // Mock elementFromPoint to return an element with a valid node id
        const fakeEl = document.createElement('div');
        fakeEl.id = 'node-3-4';
        const origFromPoint = document.elementFromPoint;
        document.elementFromPoint = jest.fn(() => fakeEl);

        const fakeEvent = {
            preventDefault: jest.fn(),
            changedTouches: [{ clientX: 100, clientY: 200 }],
        };
        instance.handleTouchMove(fakeEvent);

        expect(fakeEvent.preventDefault).toHaveBeenCalled();
        expect(document.elementFromPoint).toHaveBeenCalledWith(100, 200);
        expect(spy).toHaveBeenCalledWith(3, 4);

        document.elementFromPoint = origFromPoint;
        unmount(container);
    });

    it('handleTouchMove does nothing when elementFromPoint returns null', () => {
        const { instance, container } = mountPFV();
        instance.setState({ mouseIsPressed: true });

        const origFromPoint = document.elementFromPoint;
        document.elementFromPoint = jest.fn(() => null);

        const gridBefore = instance.state.grid;
        const fakeEvent = {
            preventDefault: jest.fn(),
            changedTouches: [{ clientX: 0, clientY: 0 }],
        };
        // Should not throw
        expect(() => instance.handleTouchMove(fakeEvent)).not.toThrow();
        expect(instance.state.grid).toBe(gridBefore); // state unchanged

        document.elementFromPoint = origFromPoint;
        unmount(container);
    });

    it('handleTouchMove does nothing when element id does not match node pattern', () => {
        const { instance, container } = mountPFV();
        instance.setState({ mouseIsPressed: true });

        const fakeEl = document.createElement('div');
        fakeEl.id = 'not-a-node';
        const origFromPoint = document.elementFromPoint;
        document.elementFromPoint = jest.fn(() => fakeEl);

        const gridBefore = instance.state.grid;
        const fakeEvent = {
            preventDefault: jest.fn(),
            changedTouches: [{ clientX: 0, clientY: 0 }],
        };
        expect(() => instance.handleTouchMove(fakeEvent)).not.toThrow();
        expect(instance.state.grid).toBe(gridBefore); // state unchanged

        document.elementFromPoint = origFromPoint;
        unmount(container);
    });
});

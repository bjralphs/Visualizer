/**
 * T14-test — ARIA, keyboard, and touch unit tests for Node.jsx
 *
 * Covers:
 *   - aria-label content for every node state (plain, start, finish, wall,
 *     weight, gate) including 1-based row/col labelling
 *   - role="gridcell" and tabIndex={0}
 *   - Space / Enter keyboard toggle fires onMouseDown + onMouseUp (T14)
 *   - Other keys are ignored
 *   - onTouchStart is forwarded to the DOM element (T15)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Node from './Node';

// ── Helper ────────────────────────────────────────────────────────────────────

function renderNode(overrides = {}) {
    const defaultProps = {
        col: 0,
        row: 0,
        isStart: false,
        isFinish: false,
        isWall: false,
        isWeight: false,
        isGate: false,
        wallVariant: 0,
        onMouseDown: jest.fn(),
        onMouseEnter: jest.fn(),
        onMouseUp: jest.fn(),
        onTouchStart: jest.fn(),
    };
    return render(<Node {...defaultProps} {...overrides} />);
}

// ── aria-label ────────────────────────────────────────────────────────────────

describe('aria-label', () => {
    it('plain node: shows 1-based row and column numbers', () => {
        renderNode({ row: 2, col: 4 });
        expect(screen.getByRole('gridcell')).toHaveAttribute(
            'aria-label',
            'row 3, column 5',
        );
    });

    it('start node: label includes "Start node"', () => {
        renderNode({ isStart: true, row: 0, col: 0 });
        expect(screen.getByRole('gridcell').getAttribute('aria-label')).toContain(
            'Start node',
        );
    });

    it('finish node: label includes "Finish node"', () => {
        renderNode({ isFinish: true });
        expect(screen.getByRole('gridcell').getAttribute('aria-label')).toContain(
            'Finish node',
        );
    });

    it('wall node: label includes "Wall"', () => {
        renderNode({ isWall: true });
        expect(screen.getByRole('gridcell').getAttribute('aria-label')).toContain(
            'Wall',
        );
    });

    it('weight node: label includes "Weight"', () => {
        renderNode({ isWeight: true });
        expect(screen.getByRole('gridcell').getAttribute('aria-label')).toContain(
            'Weight',
        );
    });

    it('gate node: label includes "Gate node"', () => {
        renderNode({ isGate: true });
        expect(screen.getByRole('gridcell').getAttribute('aria-label')).toContain(
            'Gate node',
        );
    });

    it('start node at (0,0): full label is "Start node, row 1, column 1"', () => {
        renderNode({ isStart: true, row: 0, col: 0 });
        expect(screen.getByRole('gridcell')).toHaveAttribute(
            'aria-label',
            'Start node, row 1, column 1',
        );
    });
});

// ── ARIA roles / keyboard navigation ──────────────────────────────────────────

describe('ARIA roles and keyboard focus', () => {
    it('renders an element with role="gridcell"', () => {
        renderNode();
        expect(screen.getByRole('gridcell')).toBeInTheDocument();
    });

    it('has tabIndex={0} so the cell is keyboard-focusable', () => {
        renderNode();
        expect(screen.getByRole('gridcell')).toHaveAttribute('tabindex', '0');
    });
});

// ── Keyboard handler (T14) ────────────────────────────────────────────────────

describe('keyboard handler (T14)', () => {
    it('Space fires onMouseDown then onMouseUp', () => {
        const onMouseDown = jest.fn();
        const onMouseUp = jest.fn();
        renderNode({ onMouseDown, onMouseUp });
        fireEvent.keyDown(screen.getByRole('gridcell'), { key: ' ' });
        expect(onMouseDown).toHaveBeenCalledTimes(1);
        expect(onMouseUp).toHaveBeenCalledTimes(1);
    });

    it('Enter fires onMouseDown then onMouseUp', () => {
        const onMouseDown = jest.fn();
        const onMouseUp = jest.fn();
        renderNode({ onMouseDown, onMouseUp });
        fireEvent.keyDown(screen.getByRole('gridcell'), { key: 'Enter' });
        expect(onMouseDown).toHaveBeenCalledTimes(1);
        expect(onMouseUp).toHaveBeenCalledTimes(1);
    });

    it('ArrowRight does not fire onMouseDown or onMouseUp', () => {
        const onMouseDown = jest.fn();
        const onMouseUp = jest.fn();
        renderNode({ onMouseDown, onMouseUp });
        fireEvent.keyDown(screen.getByRole('gridcell'), { key: 'ArrowRight' });
        expect(onMouseDown).not.toHaveBeenCalled();
        expect(onMouseUp).not.toHaveBeenCalled();
    });

    it('Tab does not fire onMouseDown or onMouseUp', () => {
        const onMouseDown = jest.fn();
        const onMouseUp = jest.fn();
        renderNode({ onMouseDown, onMouseUp });
        fireEvent.keyDown(screen.getByRole('gridcell'), { key: 'Tab' });
        expect(onMouseDown).not.toHaveBeenCalled();
        expect(onMouseUp).not.toHaveBeenCalled();
    });
});

// ── Touch handler (T15) ───────────────────────────────────────────────────────

describe('touch handler (T15)', () => {
    it('onTouchStart prop is invoked when a touch starts on the cell', () => {
        const onTouchStart = jest.fn();
        renderNode({ onTouchStart });
        fireEvent.touchStart(screen.getByRole('gridcell'));
        expect(onTouchStart).toHaveBeenCalledTimes(1);
    });
});

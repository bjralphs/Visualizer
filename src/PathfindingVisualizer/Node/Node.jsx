import React from 'react';
import wall1 from '../../assets/wall_background/wall_1.png';
import wall2 from '../../assets/wall_background/wall_2.png';
import wall3 from '../../assets/wall_background/wall_3.png';
import wall4 from '../../assets/wall_background/wall_4.png';
import wall5 from '../../assets/wall_background/wall_5.png';

import './Node.css';

const WALL_IMAGES = [wall1, wall2, wall3, wall4, wall5];

/** Returns a human-readable label for screen readers. */
function getNodeLabel(isStart, isFinish, isGate, isWall, isWeight, row, col) {
  const parts = [];
  if (isStart) parts.push('Start node');
  if (isFinish) parts.push('Finish node');
  if (isGate) parts.push('Gate node');
  if (isWall) parts.push('Wall');
  if (isWeight) parts.push('Weight');
  parts.push(`row ${row + 1}, column ${col + 1}`);
  return parts.join(', ');
}

const Node = React.memo(function Node({
  col,
  isFinish,
  isStart,
  isWall,
  isWeight,
  isGate,
  wallVariant,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  onTouchStart,
  row,
}) {
  const extraClassName = isGate
    ? 'node-gate'
    : isFinish
      ? 'node-finish'
      : isStart
        ? 'node-start'
        : isWall
          ? 'node-wall'
          : isWeight
            ? 'node-weight'
            : '';

  const wallStyle = isWall
    ? {
      backgroundImage: `url(${WALL_IMAGES[wallVariant ?? 0]})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
    }
    : undefined;

  // T14: keyboard toggle — Space/Enter fires the same handler as a mouse click.
  function handleKeyDown(e) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onMouseDown && onMouseDown();
      onMouseUp && onMouseUp();
    }
  }

  return (
    <div
      id={`node-${row}-${col}`}
      className={`node ${extraClassName}`}
      style={wallStyle}
      role="gridcell"
      tabIndex={0}
      aria-label={getNodeLabel(isStart, isFinish, isGate, isWall, isWeight, row, col)}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      onKeyDown={handleKeyDown}
    />
  );
});

export default Node;

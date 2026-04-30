import React from 'react';
import wall1 from '../../assets/wall_background/wall_1.png';
import wall2 from '../../assets/wall_background/wall_2.png';
import wall3 from '../../assets/wall_background/wall_3.png';
import wall4 from '../../assets/wall_background/wall_4.png';
import wall5 from '../../assets/wall_background/wall_5.png';

import './Node.css';

const WALL_IMAGES = [wall1, wall2, wall3, wall4, wall5];

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

  return (
    <div
      id={`node-${row}-${col}`}
      className={`node ${extraClassName}`}
      style={wallStyle}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseUp={onMouseUp}
    />
  );
});

export default Node;

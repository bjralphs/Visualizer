// Navbar.jsx
import React, { useState } from 'react';
import './Navbar.css';
import algorithmSelectionIcon from '../assets/menu/algorithm_selection.png';
import mazeSelectionIcon from '../assets/menu/maze_selection.png';
import titleIcon from '../assets/menu/title.png';
import generateMazeIcon from '../assets/menu/generate_maze.png';
import visualizeIcon from '../assets/menu/visualize.png';
import clearBoardIcon from '../assets/menu/clear_board.png';
import clearPathIcon from '../assets/menu/clear_path.png';
import speedSlowIcon from '../assets/menu/speed_slow.png';
import speedFastIcon from '../assets/menu/speed_fast.png';
import { useMazeItem, useSpeedItem, useIsAnimating } from './MenuItemContext';
import AlgorithmModal from './AlgorithmModal';
import MazeModal from './MazeModal';
import Tooltip from './Tooltip';
import './Tooltip.css';

const SPEEDS = ['Slow', 'Fast'];
const SPEED_ICONS = { Slow: speedSlowIcon, Fast: speedFastIcon };

const Navbar = ({ selectAlgorithm, selectMaze, resetGrid, clearPath }) => {
  const [algorithmModalOpen, setAlgorithmModalOpen] = useState(false);
  const [mazeModalOpen, setMazeModalOpen] = useState(false);

  const { mazeItem } = useMazeItem();
  const { speedItem, setSpeedItem } = useSpeedItem();
  const { isAnimating } = useIsAnimating();

  const cycleSpeed = () => {
    const idx = SPEEDS.indexOf(speedItem);
    setSpeedItem(SPEEDS[(idx + 1) % SPEEDS.length]);
  };

  function handleTitleClick() {
    if (window.confirm('Reset the page? All walls and progress will be lost.')) {
      window.location.reload();
    }
  }

  // Generate Maze is only active when a maze is selected and not animating (B5)
  const canGenerateMaze = mazeItem !== 'None' && !isAnimating;

  return (
    <div className="navbar">
      {/* Title — confirm before hard-reload (B6) */}
      <button
        className="nav-btn-icon nav-title"
        onClick={handleTitleClick}
        aria-label="Pathfinding Visualizer — reset the page">
        <img src={titleIcon} alt="" className="nav-title-img" />
      </button>

      {/* Algorithm + Maze modal triggers — grouped, locked during animation */}
      <div className={`nav-btn-group${isAnimating ? ' nav-disabled' : ''}`}>
        <span className="tt">
          <button
            disabled={isAnimating}
            className="nav-btn-icon"
            aria-label="Choose a pathfinding algorithm"
            aria-haspopup="dialog"
            onClick={() => setAlgorithmModalOpen(true)}>
            <img src={algorithmSelectionIcon} alt="" className="menu-trigger-img" />
          </button>
          <span className="tt__text tt__text--below">Choose a pathfinding algorithm</span>
        </span>

        <span className="tt">
          <button
            disabled={isAnimating}
            className="nav-btn-icon"
            aria-label="Choose a maze or pattern"
            aria-haspopup="dialog"
            onClick={() => setMazeModalOpen(true)}>
            <img src={mazeSelectionIcon} alt="" className="menu-trigger-img" />
          </button>
          <span className="tt__text tt__text--below">Choose a maze or pattern</span>
        </span>
      </div>

      {/* "Generate Maze" replaces misleading "Set Walls & Heights" (B5) */}
      {/* Visualize button — between maze selection and generate maze */}
      <span className="tt">
        <button
          onClick={selectAlgorithm}
          disabled={isAnimating}
          aria-label="Run the selected algorithm"
          className={`nav-btn nav-btn-icon${isAnimating ? ' visualize-disabled' : ''}`}>
          <img src={visualizeIcon} alt="" className="menu-btn-icon-large" />
        </button>
        <span className="tt__text tt__text--below">Run the selected algorithm</span>
      </span>

      <div className="nav-btn-group">
        <span className="tt">
          <button
            onClick={() => selectMaze()}
            disabled={!canGenerateMaze}
            aria-label="Re-generate the current maze"
            className={`nav-btn nav-btn-icon${!canGenerateMaze ? ' nav-disabled' : ''}`}>
            <img src={generateMazeIcon} alt="" className="menu-btn-icon" />
          </button>
          <span className="tt__text tt__text--below">Re-generate the current maze</span>
        </span>

        <span className="tt">
          <button onClick={clearPath} aria-label="Clear the visualized path, keep walls" className="nav-btn nav-btn-icon">
            <img src={clearPathIcon} alt="" className="menu-btn-icon" />
          </button>
          <span className="tt__text tt__text--below">Clear the visualized path, keep walls</span>
        </span>

        <span className="tt">
          <button onClick={resetGrid} aria-label="Clear everything — walls, weights, path" className="nav-btn nav-btn-icon">
            <img src={clearBoardIcon} alt="" className="menu-btn-icon" />
          </button>
          <span className="tt__text tt__text--below">Clear everything — walls, weights, path</span>
        </span>
      </div>

      {/* Speed cycle button */}
      <Tooltip text={`Toggle animation speed: ${speedItem}`} position="below">
        <button
          className="nav-btn nav-btn-icon"
          role="switch"
          aria-checked={speedItem === 'Fast'}
          aria-label={`Animation speed: ${speedItem}`}
          onClick={cycleSpeed}>
          <img src={SPEED_ICONS[speedItem]} alt="" className="menu-btn-icon" />
        </button>
      </Tooltip>

      {/* Algorithm + Maze context display — now lives in the infoBoard overlay */}

      <AlgorithmModal isOpen={algorithmModalOpen} onClose={() => setAlgorithmModalOpen(false)} clearPath={clearPath} />
      <MazeModal isOpen={mazeModalOpen} onClose={() => setMazeModalOpen(false)} onGenerate={name => { setMazeModalOpen(false); selectMaze(name); }} />
    </div>
  );
};

export default Navbar;

import React from 'react';
import './Legend.css';
import StartNodeIcon from '../assets/legend/startNode.png';
import TargetNodeIcon from '../assets/legend/targetNode.png';
import GateNodeIcon from '../assets/legend/gateNode.png';
import WeightNodeIcon from '../assets/legend/weightNode.png';
import UnvisitedNodeIcon from '../assets/legend/unvisitedNode.png';
import VisitedNodeIcon from '../assets/legend/visitedNode.png';
import ShortestPathNodeIcon from '../assets/legend/shortest-pathNode.png';
import WallNodeIcon from '../assets/legend/wallNode.png';
import IconContainer from '../assets/legend/iconContainer.png';
import wallIcon from '../assets/icons/wallIcon.gif';
import weightNodeIcon from '../assets/icons/weightNode.gif';
import gateNodeIcon from '../assets/icons/gateNode.gif';
import { useDrawMode, useIsAnimating } from './MenuItemContext';
import Tooltip from './Tooltip';
import './Tooltip.css';

const Legend = () => {
  const { drawMode, setDrawMode } = useDrawMode();
  const { isAnimating } = useIsAnimating();

  return (
    <div className="legend">
      <div className="legend-group">
        <span className="tt tt--legend">
          <img src={StartNodeIcon} alt="Start Node Icon" className="icon-size" />
          <span role="tooltip" className="tt__text tt__text--above">Start node — where the algorithm begins</span>
        </span>
        <span className="tt tt--legend">
          <img src={TargetNodeIcon} alt="Target Node Icon" className="icon-size" />
          <span role="tooltip" className="tt__text tt__text--above">Target node — the destination to reach</span>
        </span>
        <span className="tt tt--legend">
          <img src={GateNodeIcon} alt="Gate Node Icon" className="icon-size" />
          <span role="tooltip" className="tt__text tt__text--above">Gate node — algorithm must pass through this</span>
        </span>
        <span className="tt tt--legend">
          <img src={WeightNodeIcon} alt="Weight Node Icon" className="icon-size" />
          <span role="tooltip" className="tt__text tt__text--above">Weight node — costs more to traverse</span>
        </span>
      </div>
      <div className={`icon-container${isAnimating ? ' disabled' : ''}`} style={{ backgroundImage: `url(${IconContainer})` }}>
        <Tooltip text="Draw walls — blocks all paths" position="above" style={{ position: 'absolute', left: '15%', top: '50%', transform: 'translate(-50%, -50%)' }}>
          <button
            className={`icon-slot${drawMode === 'wall' ? ' icon-slot-active' : ''}`}
            aria-pressed={drawMode === 'wall'}
            onClick={() => setDrawMode('wall')}>
            <img src={wallIcon} alt="Wall" />
          </button>
        </Tooltip>
        <Tooltip text="Draw weighted nodes — costs more to traverse" position="above" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
          <button
            className={`icon-slot${drawMode === 'weight' ? ' icon-slot-active' : ''}`}
            aria-pressed={drawMode === 'weight'}
            onClick={() => setDrawMode('weight')}>
            <img src={weightNodeIcon} alt="Weight" />
          </button>
        </Tooltip>
        <Tooltip text="Place a gate — algorithm must pass through it" position="above" style={{ position: 'absolute', left: '85%', top: '50%', transform: 'translate(-50%, -50%)' }}>
          <button
            className={`icon-slot${drawMode === 'gate' ? ' icon-slot-active' : ''}`}
            aria-pressed={drawMode === 'gate'}
            onClick={() => setDrawMode('gate')}>
            <img src={gateNodeIcon} alt="Gate" />
          </button>
        </Tooltip>
      </div>
      <div className="legend-group">
        <span className="tt tt--legend">
          <img src={UnvisitedNodeIcon} alt="Unvisited Node Icon" className="icon-size" />
          <span role="tooltip" className="tt__text tt__text--above">Unvisited node — not yet explored</span>
        </span>
        <span className="tt tt--legend">
          <img src={VisitedNodeIcon} alt="Visited Node Icon" className="icon-size" />
          <span role="tooltip" className="tt__text tt__text--above">Visited node — explored by the algorithm</span>
        </span>
        <span className="tt tt--legend">
          <img src={ShortestPathNodeIcon} alt="Shortest-path Node Icon" className="icon-size" />
          <span role="tooltip" className="tt__text tt__text--above">Shortest-path node — the optimal route</span>
        </span>
        <span className="tt tt--legend">
          <img src={WallNodeIcon} alt="Wall Node Icon" className="icon-size" />
          <span role="tooltip" className="tt__text tt__text--above">Wall node — impassable barrier</span>
        </span>
      </div>
    </div>
  );
};

export default Legend;


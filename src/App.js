import React, { useRef } from 'react';
import './App.css';
import infoBoardImg from './assets/infoBoard.png';
import Navbar from './Components/Navbar';
import Legend from './Components/Legend';
import PathfindingVisualizer from './PathfindingVisualizer/PathfindingVisualizer';
import GrassBackground from './PathfindingVisualizer/GrassBackground';
import Context from './Components/Context';
import ErrorBoundary from './Components/ErrorBoundary';
import { MenuItemProvider } from './Components/MenuItemContext.js';

function App() {
  // Create a reference using useRef
  const pathfindingVisualizerRef = useRef(null);

  const handleSelectAlgorithm = () => {
    // Check if the ref is currently pointing to an instance of PathfindingVisualizer
    if (pathfindingVisualizerRef.current) {
      pathfindingVisualizerRef.current.selectAlgorithm();
    }
  };

  const handleSelectMaze = (name) => {
    if (pathfindingVisualizerRef.current) {
      pathfindingVisualizerRef.current.selectMaze(name);
    }
  };

  const handleClearPath = () => {
    if (pathfindingVisualizerRef.current) {
      pathfindingVisualizerRef.current.clearPath();
    }
  };

  const handleResetGrid = () => {
    // Check if the ref is currently pointing to an instance of PathfindingVisualizer
    if (pathfindingVisualizerRef.current) {
      pathfindingVisualizerRef.current.resetGrid();
    }
  };

  return (
    <ErrorBoundary>
      <MenuItemProvider>
        <div className="App">
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
            <GrassBackground />
          </div>
          <Navbar
            selectMaze={handleSelectMaze}
            selectAlgorithm={handleSelectAlgorithm}
            resetGrid={handleResetGrid}
            clearPath={handleClearPath}
          />
          <Legend />
          <PathfindingVisualizer ref={pathfindingVisualizerRef} />
          <div className="info-board-wrapper">
            <img
              src={infoBoardImg}
              alt="Info Board"
              className="info-board"
            />
            <Context />
          </div>
        </div>
      </MenuItemProvider>
    </ErrorBoundary>
  );
}

export default App;

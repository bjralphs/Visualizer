import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';

// ── Internal sub-contexts ────────────────────────────────────────────────────
// Each slice gets its own React context so only the relevant consumers
// re-render when that slice changes.
const MenuCtx = createContext(); // menuItem, mazeItem
const AnimationCtx = createContext(); // isAnimating, speedItem
const DrawModeCtx = createContext(); // drawMode
const HistoryCtx = createContext(); // runHistory, addRun

// Combined context kept for the PathfindingVisualizer class component which
// uses `static contextType` (class components only support one context).
const MenuItemContext = createContext();

const MAX_RUN_HISTORY = 20;

// ── Hooks — public API unchanged ─────────────────────────────────────────────
export const useMenuItem = () => {
  const context = useContext(MenuCtx);
  if (!context) throw new Error('useMenuItem must be used within a MenuItemProvider');
  const { menuItem, setMenuItem } = context;
  return { menuItem, setMenuItem };
};

export const useMazeItem = () => {
  const context = useContext(MenuCtx);
  if (!context) throw new Error('useMazeItem must be used within a MenuItemProvider');
  const { mazeItem, setMazeItem } = context;
  return { mazeItem, setMazeItem };
};

export const useSpeedItem = () => {
  const context = useContext(AnimationCtx);
  if (!context) throw new Error('useSpeedItem must be used within a MenuItemProvider');
  const { speedItem, setSpeedItem } = context;
  return { speedItem, setSpeedItem };
};

export const useIsAnimating = () => {
  const context = useContext(AnimationCtx);
  if (!context) throw new Error('useIsAnimating must be used within a MenuItemProvider');
  const { isAnimating, setIsAnimating } = context;
  return { isAnimating, setIsAnimating };
};

export const useDrawMode = () => {
  const context = useContext(DrawModeCtx);
  if (!context) throw new Error('useDrawMode must be used within a MenuItemProvider');
  const { drawMode, setDrawMode } = context;
  return { drawMode, setDrawMode };
};

export const useRunHistory = () => {
  const context = useContext(HistoryCtx);
  if (!context) throw new Error('useRunHistory must be used within a MenuItemProvider');
  const { runHistory, addRun } = context;
  return { runHistory, addRun };
};

export default MenuItemContext;

export const MenuItemProvider = ({ children }) => {
  const [menuItem, setMenuItem] = useState('Breadth-First Search');
  const [mazeItem, setMazeItem] = useState('Recursive Backtracker');
  const [speedItem, setSpeedItem] = useState('Slow');
  const [isAnimating, setIsAnimating] = useState(false);
  const [drawMode, setDrawMode] = useState('wall');
  const [runHistory, setRunHistory] = useState([]);

  const addRun = useCallback((entry) => {
    setRunHistory(prev => [entry, ...prev].slice(0, MAX_RUN_HISTORY));
  }, []);

  // Each sub-context memo only busts when its own slice changes, so only
  // its consumers re-render.
  const menuValue = useMemo(
    () => ({ menuItem, setMenuItem, mazeItem, setMazeItem }),
    [menuItem, mazeItem],
  );
  const animationValue = useMemo(
    () => ({ isAnimating, setIsAnimating, speedItem, setSpeedItem }),
    [isAnimating, speedItem],
  );
  const drawModeValue = useMemo(
    () => ({ drawMode, setDrawMode }),
    [drawMode],
  );
  const historyValue = useMemo(
    () => ({ runHistory, addRun }),
    [runHistory, addRun],
  );

  // Combined value — only the class component (PFV) reads this.
  const combined = useMemo(() => ({
    menuItem, setMenuItem,
    mazeItem, setMazeItem,
    speedItem, setSpeedItem,
    isAnimating, setIsAnimating,
    drawMode, setDrawMode,
    runHistory, addRun,
  }), [menuItem, mazeItem, speedItem, isAnimating, drawMode, runHistory, addRun]);

  return (
    <MenuCtx.Provider value={menuValue}>
      <AnimationCtx.Provider value={animationValue}>
        <DrawModeCtx.Provider value={drawModeValue}>
          <HistoryCtx.Provider value={historyValue}>
            <MenuItemContext.Provider value={combined}>
              {children}
            </MenuItemContext.Provider>
          </HistoryCtx.Provider>
        </DrawModeCtx.Provider>
      </AnimationCtx.Provider>
    </MenuCtx.Provider>
  );
};

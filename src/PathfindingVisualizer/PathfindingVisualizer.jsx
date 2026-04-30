// Import necessary libraries and components
import React, { Component } from 'react';
import Node from './Node/Node';
import GrassBackground from './GrassBackground';
import { dijkstra, getNodesInShortestPathOrder } from '../algorithms/dijkstra';
import { bfs } from '../algorithms/breadth_first_search';
import { dfs } from '../algorithms/depth_first_search';
import { aStar } from '../algorithms/a_star_search';
import { bellmanFord } from '../algorithms/bellman_ford_search';
import { floydWarshall } from '../algorithms/floyd_warshall_search';
import { gbfs } from '../algorithms/greedy_best_first_search';
import { biDirectionalSearch } from '../algorithms/bidirectional_search';
import { uniformCostSearch } from '../algorithms/uniform_cost_search';
import { beamSearch } from '../algorithms/beam_search';
import { weightedAStar } from '../algorithms/weighted_a_star_search';
import { idaStar } from '../algorithms/ida_star_search';
import { bidirectionalAStar, getNodesInShortestPathOrderBiAStar } from '../algorithms/bidirectional_a_star_search';
import './PathfindingVisualizer.css';
import MenuItemContext from '../Components/MenuItemContext.js';
import fenceTopLeft from '../assets/grid_border/fence_top_left.png';
import fenceTopMiddle from '../assets/grid_border/fence_top_middle.png';
import fenceTopRight from '../assets/grid_border/fence_top_right.png';
import fenceLeft from '../assets/grid_border/fence_left.png';
import fenceRight from '../assets/grid_border/fence_right.png';
import fenceBottomLeft from '../assets/grid_border/fence_bottom_left.png';
import fenceBottomMiddle from '../assets/grid_border/fence_bottom_middle.png';
import fenceBottomRight from '../assets/grid_border/fence_bottom_right.png';

// Single source of truth: maps algorithm name → { fn, animate }.
// animate: 'standard' | 'bidirectional' | 'bidirectional-astar'
// Only 'bidirectional*' algorithms fall back to direct mode when a gate is placed.
const ALGORITHM_REGISTRY = new Map([
  ["Dijkstra's Algorithm", { fn: dijkstra, animate: 'standard' }],
  ['Breadth-First Search', { fn: bfs, animate: 'standard' }],
  ['Depth-First Search', { fn: dfs, animate: 'standard' }],
  ['A* Search', { fn: aStar, animate: 'standard' }],
  ['Bellman-Ford', { fn: bellmanFord, animate: 'standard' }],
  ['Floyd-Warshall', { fn: floydWarshall, animate: 'standard' }],
  ['Greedy Best-First Search', { fn: gbfs, animate: 'standard' }],
  ['Bidirectional Search', { fn: biDirectionalSearch, animate: 'bidirectional' }],
  ['Uniform Cost Search', { fn: uniformCostSearch, animate: 'standard' }],
  ['Beam Search', { fn: beamSearch, animate: 'standard' }],
  ['Weighted A*', { fn: weightedAStar, animate: 'standard' }],
  ['IDA*', { fn: idaStar, animate: 'standard' }],
  ['Bidirectional A*', { fn: bidirectionalAStar, animate: 'bidirectional-astar' }],
]);

// How long (ms) between each node step along the shortest path (mound speed)
const PATH_STEP_MS = 100;
// How long (ms) the arrival.gif plays before swapping to the looping final.gif
const ARRIVAL_DURATION_MS = 1500;

// Constants for the starting and finishing nodes' positions
const START_NODE_ROW = 10;
const START_NODE_COL = 15;
const FINISH_NODE_ROW = 10;
const FINISH_NODE_COL = 35;
const NODE_WIDTH = 25;
const NODE_HEIGHT = 25;
const NAVBAR_HEIGHT = 190; // navbar + legend + context bar
const FOOTER_HEIGHT = 80;  // footer: 2 × 2rem padding + line height
const MAX_ROWS = 26;  // caps grid height: 26 × 25px = 650px + 246px chrome ≈ 896px
const MAX_COLS = 68;  // caps grid width:  68 × 25px = 1700px
const INFO_BOARD_WIDTH = 360;       // max width of the fixed info-board-wrapper
const INFO_BOARD_ASPECT = 280 / 700; // intrinsic aspect ratio of infoBoard.png (280×700)
const PV_PADDING_LEFT = 16;   // 1rem padding-left on .pv-container

// Main component definition
export default class PathfindingVisualizer extends Component {
  static contextType = MenuItemContext;
  constructor() {
    super();
    this.animationTimeouts = [];
    // Initialize state with an empty grid and mouseIsPressed set to false
    this.state = {
      grid: [],
      mouseIsPressed: false,
      draggingNode: null,
      startNodeRow: START_NODE_ROW,
      startNodeCol: START_NODE_COL,
      finishNodeRow: FINISH_NODE_ROW,
      finishNodeCol: FINISH_NODE_COL,
      gateNodeRow: null,
      gateNodeCol: null,
      hasGate: false,
      menuItem: 'Pick an Algorithm to begin',
      mazeItem: 'Pick a Maze to begin',
      speedItem: 'Fast',
      noPathFound: false,
      weightPaintMode: 'draw',
    };
  }

  // When component mounts, populate grid and listen for viewport resize
  componentDidMount() {
    const grid = getInitialGrid();
    this.setState({ grid }, () => {
      this.selectMaze(this.context.mazeItem);
    });
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    this.animationTimeouts.forEach(clearTimeout);
    this.animationTimeouts = [];
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize = () => {
    // Cancel any in-flight animation and rebuild the grid to fit the new size.
    this.animationTimeouts.forEach(clearTimeout);
    this.animationTimeouts = [];
    this.context.setIsAnimating(false);
    const availableHeight = window.innerHeight - NAVBAR_HEIGHT - FOOTER_HEIGHT;
    const numRows = Math.min(Math.floor((availableHeight - 2 * NODE_HEIGHT) / NODE_HEIGHT), MAX_ROWS);
    // Actual rendered board width: constrained by both max-width and max-height (aspect ratio)
    const infoBoardByWidth = Math.min(INFO_BOARD_WIDTH, window.innerWidth * 0.9);
    const infoBoardByHeight = (window.innerHeight - 270) * INFO_BOARD_ASPECT;
    const infoBoardW = Math.min(infoBoardByWidth, infoBoardByHeight);
    const numCols = Math.min(Math.floor((window.innerWidth - infoBoardW - PV_PADDING_LEFT - 2 * NODE_WIDTH) / NODE_WIDTH), MAX_COLS);
    const startRow = Math.min(this.state.startNodeRow, numRows - 1);
    const startCol = Math.min(this.state.startNodeCol, numCols - 1);
    const finishRow = Math.min(this.state.finishNodeRow, numRows - 1);
    const finishCol = Math.min(this.state.finishNodeCol, numCols - 1);
    this.setState({
      grid: getInitialGrid(startRow, startCol, finishRow, finishCol),
      startNodeRow: startRow,
      startNodeCol: startCol,
      finishNodeRow: finishRow,
      finishNodeCol: finishCol,
      hasGate: false,
      gateNodeRow: null,
      gateNodeCol: null,
      noPathFound: false,
    });
  };

  setGrid = grid => {
    this.setState({ grid });
  };

  // After maze generation, BFS from each special node's position to find the
  // nearest open cell that has at least one open neighbour (i.e. is actually
  // connected to the carved maze rather than isolated).  Moves start/finish
  // there and keeps all related state in sync.
  applyMaze = newGrid => {
    const { startNodeRow, startNodeCol, finishNodeRow, finishNodeCol } = this.state;
    const numRows = newGrid.length;
    const numCols = newGrid[0].length;

    const hasOpenNeighbour = (grid, r, c) =>
      [[-1, 0], [1, 0], [0, -1], [0, 1]].some(([dr, dc]) => {
        const nr = r + dr, nc = c + dc;
        return nr >= 0 && nr < numRows && nc >= 0 && nc < numCols && !grid[nr][nc].isWall;
      });

    const findNearestConnected = (grid, row, col, forbidKey = null) => {
      const visited = new Set();
      const queue = [{ row, col }];
      visited.add(`${row}-${col}`);
      while (queue.length) {
        const { row: r, col: c } = queue.shift();
        const key = `${r}-${c}`;
        if (!grid[r][c].isWall && hasOpenNeighbour(grid, r, c) && key !== forbidKey) {
          return { row: r, col: c };
        }
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const nr = r + dr, nc = c + dc;
          const nk = `${nr}-${nc}`;
          if (nr >= 0 && nr < numRows && nc >= 0 && nc < numCols && !visited.has(nk)) {
            visited.add(nk);
            queue.push({ row: nr, col: nc });
          }
        }
      }
      return { row, col };
    };

    const newStart = findNearestConnected(newGrid, startNodeRow, startNodeCol);
    const newFinish = findNearestConnected(newGrid, finishNodeRow, finishNodeCol, `${newStart.row}-${newStart.col}`);

    const grid = newGrid.map(row => row.slice());

    // Clear old special-node flags
    grid[startNodeRow][startNodeCol] = { ...grid[startNodeRow][startNodeCol], isStart: false };
    grid[finishNodeRow][finishNodeCol] = { ...grid[finishNodeRow][finishNodeCol], isFinish: false };

    // Place at new positions (force open in case they landed on a wall)
    grid[newStart.row][newStart.col] = { ...grid[newStart.row][newStart.col], isStart: true, isWall: false };
    grid[newFinish.row][newFinish.col] = { ...grid[newFinish.row][newFinish.col], isFinish: true, isWall: false };

    this.setState({
      grid,
      startNodeRow: newStart.row,
      startNodeCol: newStart.col,
      finishNodeRow: newFinish.row,
      finishNodeCol: newFinish.col,
    });
  };

  handleReset = grid => {
    return grid.map(row =>
      row.map(node => ({
        ...node,
        distance: Infinity,
        isVisited: false,
        isWall: false,
        isWeight: false,
        isGate: false,
        previousNode: null,
        gCost: Infinity,
        distanceFromFinish: Infinity,
        isVisitedByStart: false,
        isVisitedByFinish: false,
      })),
    );
  };

  resetGrid() {
    this.animationTimeouts.forEach(clearTimeout);
    this.animationTimeouts = [];
    this.context.setIsAnimating(false);
    const newGrid = this.handleReset(this.state.grid);
    this.setState(
      { grid: newGrid, noPathFound: false, hasGate: false, gateNodeRow: null, gateNodeCol: null },
      () => { this.resetCSS(); },
    );
  }

  resetCSS() {
    const grid = this.state.grid;
    let delayCounter = 0;
    for (let row of grid) {
      for (let node of row) {
        const id = `node-${node.row}-${node.col}`;
        let cls;
        if (node.isStart) cls = 'node node-start';
        else if (node.isFinish) cls = 'node node-finish';
        else if (node.isWeight) cls = 'node node-weight';
        else if (node.isGate) cls = 'node node-gate';
        else cls = 'node';
        const tid = setTimeout(() => {
          const el = document.getElementById(id);
          if (el) el.className = cls;
        }, 3 * delayCounter++);
        this.animationTimeouts.push(tid);
      }
    }
  }

  clearPath() {
    this.animationTimeouts.forEach(clearTimeout);
    this.animationTimeouts = [];
    this.context.setIsAnimating(false);
    const { grid } = this.state;
    const newGrid = grid.map(row =>
      row.map(node => ({
        ...node,
        isVisited: false,
        previousNode: null,
        distance: Infinity,
        gCost: Infinity,
        distanceFromFinish: Infinity,
        isVisitedByStart: false,
        isVisitedByFinish: false,
      })),
    );
    this.setState({ grid: newGrid, noPathFound: false }, () => {
      this.resetCSS();
    });
  }

  // Handle the event when a mouse button is pressed down on a node
  handleMouseDown(row, col) {
    if (this.context.isAnimating) return;
    const { grid, hasGate, gateNodeRow, gateNodeCol } = this.state;
    const node = grid[row][col];
    if (node.isStart) {
      this.setState({ draggingNode: 'start', mouseIsPressed: true });
      return;
    }
    if (node.isFinish) {
      this.setState({ draggingNode: 'finish', mouseIsPressed: true });
      return;
    }
    if (hasGate && node.isGate) {
      this.setState({ draggingNode: 'gate', mouseIsPressed: true });
      return;
    }
    const drawMode = this.context.drawMode;
    if (drawMode === 'weight') {
      if (node.isStart || node.isFinish || node.isGate || node.isWall) return;
      const paintMode = node.isWeight ? 'erase' : 'draw';
      const newGrid = getNewGridWithWeightToggled(grid, row, col);
      this.setState({ grid: newGrid, mouseIsPressed: true, weightPaintMode: paintMode });
    } else if (drawMode === 'gate') {
      if (node.isStart || node.isFinish || node.isWall) return;
      if (hasGate) {
        // Remove existing gate before placing a new one
        const cleared = getNewGridWithGateRemoved(grid, gateNodeRow, gateNodeCol);
        const newGrid = getNewGridWithGatePlaced(cleared, row, col);
        this.setState({ grid: newGrid, gateNodeRow: row, gateNodeCol: col, mouseIsPressed: true });
      } else {
        const newGrid = getNewGridWithGatePlaced(grid, row, col);
        this.setState({ grid: newGrid, hasGate: true, gateNodeRow: row, gateNodeCol: col, mouseIsPressed: true });
      }
    } else {
      const newGrid = getNewGridWithWallToggled(grid, row, col);
      this.setState({ grid: newGrid, mouseIsPressed: true });
    }
  }

  // Handle the event when the mouse enters a node's space
  handleMouseEnter(row, col) {
    if (this.context.isAnimating) return;
    if (!this.state.mouseIsPressed) return;
    const { grid, draggingNode, startNodeRow, startNodeCol, finishNodeRow, finishNodeCol, gateNodeRow, gateNodeCol } = this.state;
    if (draggingNode === 'start') {
      const target = grid[row][col];
      if (target.isWall || target.isFinish || target.isGate) return;
      const newGrid = getNewGridWithMovedNode(grid, row, col, 'start', startNodeRow, startNodeCol);
      this.setState({ grid: newGrid, startNodeRow: row, startNodeCol: col });
      return;
    }
    if (draggingNode === 'finish') {
      const target = grid[row][col];
      if (target.isWall || target.isStart || target.isGate) return;
      const newGrid = getNewGridWithMovedNode(grid, row, col, 'finish', finishNodeRow, finishNodeCol);
      this.setState({ grid: newGrid, finishNodeRow: row, finishNodeCol: col });
      return;
    }
    if (draggingNode === 'gate') {
      const target = grid[row][col];
      if (target.isWall || target.isStart || target.isFinish) return;
      const cleared = getNewGridWithGateRemoved(grid, gateNodeRow, gateNodeCol);
      const newGrid = getNewGridWithGatePlaced(cleared, row, col);
      this.setState({ grid: newGrid, gateNodeRow: row, gateNodeCol: col });
      return;
    }
    const drawMode = this.context.drawMode;
    if (drawMode === 'weight') {
      const node = grid[row][col];
      if (node.isStart || node.isFinish || node.isGate || node.isWall) return;
      const { weightPaintMode } = this.state;
      const shouldBeWeight = weightPaintMode === 'draw';
      if (node.isWeight === shouldBeWeight) return; // already correct state, skip
      const newGrid = getNewGridWithWeightToggled(grid, row, col);
      this.setState({ grid: newGrid });
    } else if (drawMode === 'gate') {
      // Gate mode drag while no gate node selected — do nothing
    } else {
      const newGrid = getNewGridWithWallToggled(grid, row, col);
      this.setState({ grid: newGrid });
    }
  }

  // Handle the event when a mouse button is released
  handleMouseUp() {
    this.setState({ mouseIsPressed: false, draggingNode: null });
  }

  // Shared animation engine. getVisitedClass(node) returns the CSS class string
  // for the visited phase, or null to skip that node.
  _animate(visitedNodesInOrder, nodesInShortestPathOrder, getVisitedClass) {
    if (!visitedNodesInOrder) {
      this.setState({ noPathFound: true });
      this.context.setIsAnimating(false);
      return;
    }
    const elapsedMs = Math.round(performance.now() - (this.algoStartTime || 0));
    const runEntry = {
      algo: this.context.menuItem,
      visited: visitedNodesInOrder.length,
      path: nodesInShortestPathOrder.length > 1 ? nodesInShortestPathOrder.length : null,
      ms: elapsedMs,
    };
    const speed = this.selectSpeed();
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        const tid = setTimeout(() => {
          this.context.addRun(runEntry);
          this._animateShortestPath(nodesInShortestPathOrder);
        }, speed * i);
        this.animationTimeouts.push(tid);
        return;
      }
      const tid = setTimeout(() => {
        const node = visitedNodesInOrder[i];
        const cls = getVisitedClass(node);
        if (cls) {
          const el = document.getElementById(`node-${node.row}-${node.col}`);
          if (el) el.className = cls;
        }
      }, speed * i);
      this.animationTimeouts.push(tid);
    }
  }

  // Returns the settled CSS class for a path node once the mound leader has advanced past it.
  _settledPathClass(node, gateNode) {
    if (gateNode && node.row === gateNode.row && node.col === gateNode.col) return 'node node-gate';
    return node.isWeight ? 'node node-shortest-path-weight' : 'node node-shortest-path';
  }

  // Returns the CSS rotation for the mound GIF based on travel direction.
  // Assumes the GIF faces right by default (0deg).
  _getMoundRotation(from, to) {
    if (!from) return '0deg';
    const dRow = to.row - from.row;
    const dCol = to.col - from.col;
    if (dCol > 0) return '0deg';    // right
    if (dCol < 0) return '180deg';  // left
    if (dRow > 0) return '90deg';   // down
    if (dRow < 0) return '-90deg';  // up
    return '0deg';
  }

  // Shared shortest-path animation (second phase).
  // mound.gif leads node-by-node; arrival.gif plays on the finish node;
  // final.gif loops on the finish node after arrival completes.
  _animateShortestPath(nodesInShortestPathOrder) {
    if (nodesInShortestPathOrder.length <= 1) {
      this.setState({ noPathFound: true });
      this.context.setIsAnimating(false);
      return;
    }
    const last = nodesInShortestPathOrder.length - 1;
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      const tid = setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        // Settle the node the mound just left
        if (i > 0) {
          const prev = nodesInShortestPathOrder[i - 1];
          const prevEl = document.getElementById(`node-${prev.row}-${prev.col}`);
          if (prevEl) prevEl.className = prev.isWeight ? 'node node-shortest-path-weight' : 'node node-shortest-path';
        }
        const el = document.getElementById(`node-${node.row}-${node.col}`);
        if (i === last) {
          if (el) el.className = 'node node-shortest-path-arrival';
          this.context.setIsAnimating(false);
        } else {
          const rotation = this._getMoundRotation(i > 0 ? nodesInShortestPathOrder[i - 1] : null, node);
          if (el) {
            el.style.setProperty('--mound-rotate', rotation);
            el.className = 'node node-shortest-path-leading';
          }
        }
      }, PATH_STEP_MS * i);
      this.animationTimeouts.push(tid);
    }
    // Swap arrival → final once the arrival GIF has played through
    const finalNode = nodesInShortestPathOrder[last];
    const finalTid = setTimeout(() => {
      const el = document.getElementById(`node-${finalNode.row}-${finalNode.col}`);
      if (el && el.className === 'node node-shortest-path-arrival') {
        el.className = 'node node-shortest-path-final';
      }
    }, PATH_STEP_MS * last + ARRIVAL_DURATION_MS);
    this.animationTimeouts.push(finalTid);
  }

  // Thin wrapper for standard (single-frontier) algorithms.
  animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder) {
    this._animate(
      visitedNodesInOrder,
      nodesInShortestPathOrder,
      node => node.isWeight ? 'node node-visited-weight' : 'node node-visited',
    );
  }

  // Thin wrapper for bidirectional algorithms (two-colour visited animation).
  animateAlgorithmBI(visitedNodesInOrder, nodesInShortestPathOrder) {
    this._animate(
      visitedNodesInOrder,
      nodesInShortestPathOrder,
      node => node.isVisitedByStart
        ? 'node node-visited-start'
        : node.isVisitedByFinish
          ? 'node node-visited-finish'
          : null,
    );
  }

  visualizeCellularMaze() {
    const { grid } = this.state;
    const newGrid = createMaze(grid);
    this.applyMaze(newGrid);
  }

  visualizeBRM() {
    const { grid } = this.state;
    const newGrid = createMaze(grid);
    this.applyMaze(newGrid);
  }

  visualizeWeightMaze() {
    const { grid } = this.state;
    const newGrid = grid.map(row =>
      row.map(node => {
        if (node.isStart || node.isFinish || node.isWall || node.isGate) return node;
        return { ...node, isWeight: Math.random() < 0.3 };
      }),
    );
    this.setState({ grid: newGrid });
  }

  visualizeStairPattern() {
    const { grid: initialGrid } = this.state;
    const numRows = initialGrid.length;
    const numCols = initialGrid[0].length;
    let newGrid = initialGrid;
    for (let row = 1; row < numRows - 1; row += 2) {
      const fromLeft = Math.floor(row / 2) % 2 === 0;
      const gapCol = fromLeft ? numCols - 1 : 0;
      for (let col = 0; col < numCols; col++) {
        const node = newGrid[row][col];
        if (col !== gapCol && !node.isStart && !node.isFinish) {
          newGrid = getNewGridWithWallToggled(newGrid, row, col);
        }
      }
    }
    this.setState({ grid: newGrid });
  }

  visualizeBinaryTreeMaze() {
    const { grid } = this.state;
    const newGrid = createBinaryTreeMaze(grid);
    this.applyMaze(newGrid);
  }

  visualizeSidewinderMaze() {
    const { grid } = this.state;
    const newGrid = createSidewinderMaze(grid);
    this.applyMaze(newGrid);
  }

  visualizeHorizontalSkewMaze() {
    const { grid } = this.state;
    const newGrid = createSkewedMaze(grid, 'horizontal');
    this.applyMaze(newGrid);
  }

  visualizeVerticalSkewMaze() {
    const { grid } = this.state;
    const newGrid = createSkewedMaze(grid, 'vertical');
    this.applyMaze(newGrid);
  }

  visualizeRoomsMaze() {
    const { grid } = this.state;
    const newGrid = createRoomsMaze(grid);
    this.applyMaze(newGrid);
  }

  visualizeRecursiveBacktracker() {
    const { grid } = this.state;
    const newGrid = createRecursiveBacktrackerMaze(grid);
    this.applyMaze(newGrid);
  }

  visualizeSpiralMaze() {
    const { grid } = this.state;
    const newGrid = createSpiralMaze(grid);
    this.applyMaze(newGrid);
  }

  visualizeConcentricRings() {
    const { grid } = this.state;
    const newGrid = createConcentricRingsMaze(grid);
    this.applyMaze(newGrid);
  }

  getStartNode() {
    const { grid, startNodeRow, startNodeCol } = this.state;
    return grid[startNodeRow][startNodeCol];
  }

  getFinishNode() {
    const { grid, finishNodeRow, finishNodeCol } = this.state;
    return grid[finishNodeRow][finishNodeCol];
  }

  getGateNode() {
    const { grid, gateNodeRow, gateNodeCol } = this.state;
    return grid[gateNodeRow][gateNodeCol];
  }

  // Reset only per-run algorithm fields (distance, visited, etc.) without
  // clearing walls, weights, or gate placement.
  resetAlgorithmState(grid) {
    for (const row of grid) {
      for (const node of row) {
        node.distance = Infinity;
        node.isVisited = false;
        node.previousNode = null;
        node.gCost = undefined;
        node.isVisitedByStart = false;
        node.isVisitedByFinish = false;
      }
    }
  }

  // Run a single-phase algorithm and return [visited, shortest].
  // algoFn is (grid, start, finish) => visitedNodesInOrder.
  runAlgoPhase(grid, start, finish, algoFn) {
    this.resetAlgorithmState(grid);
    const visited = algoFn(grid, start, finish);
    const shortest = getNodesInShortestPathOrder(finish);
    return { visited, shortest };
  }

  selectAlgorithm() {
    if (this.context.isAnimating) return;
    this.animationTimeouts.forEach(clearTimeout);
    this.animationTimeouts = [];

    // Clear any previous path/visited state synchronously before running
    const clearedGrid = this.state.grid.map(row =>
      row.map(node => ({
        ...node,
        isVisited: false,
        previousNode: null,
        distance: Infinity,
        gCost: Infinity,
        distanceFromFinish: Infinity,
        isVisitedByStart: false,
        isVisitedByFinish: false,
      })),
    );
    for (const row of clearedGrid) {
      for (const node of row) {
        const el = document.getElementById(`node-${node.row}-${node.col}`);
        if (!el) continue;
        if (node.isStart) el.className = 'node node-start';
        else if (node.isFinish) el.className = 'node node-finish';
        else if (node.isWall) el.className = 'node node-wall';
        else if (node.isWeight) el.className = 'node node-weight';
        else if (node.isGate) el.className = 'node node-gate';
        else el.className = 'node';
      }
    }

    this.algoStartTime = performance.now();
    this.setState({ grid: clearedGrid, noPathFound: false }, () => {
      this.context.setIsAnimating(true);
      const { hasGate } = this.state;
      if (hasGate) {
        this.selectAlgorithmWithGate();
      } else {
        this.selectAlgorithmDirect();
      }
    });
  }

  selectAlgorithmDirect() {
    const entry = ALGORITHM_REGISTRY.get(this.context.menuItem);
    if (!entry) {
      this.context.setIsAnimating(false);
      window.alert('Select An Algorithm First!');
      return;
    }

    const { grid } = this.state;
    const startNode = this.getStartNode();
    const finishNode = this.getFinishNode();
    const visitedNodesInOrder = entry.fn(grid, startNode, finishNode);

    if (entry.animate === 'bidirectional-astar') {
      const meetingNode = visitedNodesInOrder.length > 0
        ? visitedNodesInOrder[visitedNodesInOrder.length - 1]
        : null;
      const shortest = meetingNode ? getNodesInShortestPathOrderBiAStar(meetingNode) : [];
      this.animateAlgorithmBI(visitedNodesInOrder, shortest);
    } else if (entry.animate === 'bidirectional') {
      const shortest = getNodesInShortestPathOrder(finishNode);
      this.animateAlgorithmBI(visitedNodesInOrder, shortest);
    } else {
      const shortest = getNodesInShortestPathOrder(finishNode);
      this.animateAlgorithm(visitedNodesInOrder, shortest);
    }
  }

  // Two-phase execution: start→gate, then gate→finish.
  // Bidirectional algorithms don't support two-phase; fall back to direct.
  selectAlgorithmWithGate() {
    const entry = ALGORITHM_REGISTRY.get(this.context.menuItem);

    if (!entry || entry.animate !== 'standard') {
      // Bidirectional algorithms don't support two-phase gates
      this.selectAlgorithmDirect();
      return;
    }

    const { grid } = this.state;
    const startNode = this.getStartNode();
    const gateNode = this.getGateNode();
    const finishNode = this.getFinishNode();

    // Phase 1: start → gate
    this.resetAlgorithmState(grid);
    const visited1 = entry.fn(grid, startNode, gateNode);
    const shortest1 = getNodesInShortestPathOrder(gateNode);

    // Phase 2: gate → finish (resets algo state on same grid)
    this.resetAlgorithmState(grid);
    const visited2 = entry.fn(grid, gateNode, finishNode);
    const shortest2 = getNodesInShortestPathOrder(finishNode);

    if (!visited1 || shortest1.length <= 1) {
      this.setState({ noPathFound: true });
      this.context.setIsAnimating(false);
      return;
    }

    // Animate phase 1, then phase 2 back-to-back
    const elapsedMs = Math.round(performance.now() - (this.algoStartTime || 0));
    const totalVisited = visited1.length + visited2.length;
    const totalPath = (shortest1.length > 1 && shortest2.length > 1)
      ? shortest1.length + shortest2.length - 1
      : null;
    const runEntry = { algo: this.context.menuItem, visited: totalVisited, path: totalPath, ms: elapsedMs };
    this.animateTwoPhase(visited1, shortest1, visited2, shortest2, runEntry, gateNode);
  }

  animateTwoPhase(visited1, shortest1, visited2, shortest2, runEntry, gateNode) {
    const speed = this.selectSpeed();
    let offset = 0;

    // Phase 1 visited
    for (let i = 0; i < visited1.length; i++) {
      const tid = setTimeout(() => {
        const node = visited1[i];
        const el = document.getElementById(`node-${node.row}-${node.col}`);
        if (el) el.className = node.isWeight ? 'node node-visited-weight' : 'node node-visited';
      }, speed * i);
      this.animationTimeouts.push(tid);
    }
    offset = speed * visited1.length;

    // Record run at the moment the shortest path animation begins
    if (runEntry) {
      const tid = setTimeout(() => { this.context.addRun(runEntry); }, offset);
      this.animationTimeouts.push(tid);
    }

    // Phase 1 shortest path — mound leads; gate node retains gate class as waypoint marker
    for (let i = 0; i < shortest1.length; i++) {
      const tid = setTimeout(() => {
        const node = shortest1[i];
        const isGateNode = gateNode && node.row === gateNode.row && node.col === gateNode.col;
        const el = document.getElementById(`node-${node.row}-${node.col}`);
        if (i > 0) {
          const prev = shortest1[i - 1];
          const prevEl = document.getElementById(`node-${prev.row}-${prev.col}`);
          if (prevEl) prevEl.className = this._settledPathClass(prev, gateNode);
        }
        if (isGateNode) {
          if (el) el.className = 'node node-gate';
        } else {
          const rotation = this._getMoundRotation(i > 0 ? shortest1[i - 1] : null, node);
          if (el) {
            el.style.setProperty('--mound-rotate', rotation);
            el.className = 'node node-shortest-path-leading';
          }
        }
      }, offset + PATH_STEP_MS * i);
      this.animationTimeouts.push(tid);
    }
    offset += PATH_STEP_MS * shortest1.length;

    if (!visited2 || shortest2.length <= 1) {
      const tid = setTimeout(() => {
        this.setState({ noPathFound: true });
        this.context.setIsAnimating(false);
      }, offset);
      this.animationTimeouts.push(tid);
      return;
    }

    // Phase 2 visited — skip overwriting gate node so it stays visible as waypoint
    for (let i = 0; i < visited2.length; i++) {
      const tid = setTimeout(() => {
        const node = visited2[i];
        const isGateNode = gateNode && node.row === gateNode.row && node.col === gateNode.col;
        if (isGateNode) return;
        const el = document.getElementById(`node-${node.row}-${node.col}`);
        if (el) el.className = node.isWeight ? 'node node-visited-weight' : 'node node-visited';
      }, offset + speed * i);
      this.animationTimeouts.push(tid);
    }
    offset += speed * visited2.length;

    // Phase 2 shortest path — mound leads from gate; arrival plays on finish node
    for (let i = 0; i < shortest2.length; i++) {
      const tid = setTimeout(() => {
        const node = shortest2[i];
        const isGateNode = gateNode && node.row === gateNode.row && node.col === gateNode.col;
        const el = document.getElementById(`node-${node.row}-${node.col}`);
        if (i > 0) {
          const prev = shortest2[i - 1];
          const prevEl = document.getElementById(`node-${prev.row}-${prev.col}`);
          if (prevEl) prevEl.className = this._settledPathClass(prev, gateNode);
        }
        if (isGateNode) {
          if (el) el.className = 'node node-gate';
        } else if (i === shortest2.length - 1) {
          if (el) el.className = 'node node-shortest-path-arrival';
          this.context.setIsAnimating(false);
        } else {
          const rotation = this._getMoundRotation(i > 0 ? shortest2[i - 1] : null, node);
          if (el) {
            el.style.setProperty('--mound-rotate', rotation);
            el.className = 'node node-shortest-path-leading';
          }
        }
      }, offset + PATH_STEP_MS * i);
      this.animationTimeouts.push(tid);
    }
    // Swap arrival → final once the arrival GIF has played through
    const s2last = shortest2[shortest2.length - 1];
    const finalTid2 = setTimeout(() => {
      const el = document.getElementById(`node-${s2last.row}-${s2last.col}`);
      if (el && el.className === 'node node-shortest-path-arrival') {
        el.className = 'node node-shortest-path-final';
      }
    }, offset + PATH_STEP_MS * (shortest2.length - 1) + ARRIVAL_DURATION_MS);
    this.animationTimeouts.push(finalTid2);
  }

  selectMaze(mazeName) {
    if (this.context.isAnimating) return;
    const name = mazeName || this.context.mazeItem;

    // Clear the board synchronously before applying the new maze
    this.animationTimeouts.forEach(clearTimeout);
    this.animationTimeouts = [];
    this.context.setIsAnimating(false);
    const clearedGrid = this.handleReset(this.state.grid);

    // Reset all node CSS classes immediately
    for (const row of clearedGrid) {
      for (const node of row) {
        const el = document.getElementById(`node-${node.row}-${node.col}`);
        if (el) {
          if (node.isStart) el.className = 'node node-start';
          else if (node.isFinish) el.className = 'node node-finish';
          else el.className = 'node';
        }
      }
    }

    this.setState(
      { grid: clearedGrid, noPathFound: false, hasGate: false, gateNodeRow: null, gateNodeCol: null },
      () => {
        switch (name) {
          case 'Recursive Division':
            this.visualizeCellularMaze();
            break;
          case 'Recursive Division (horizontal skew)':
            this.visualizeHorizontalSkewMaze();
            break;
          case 'Recursive Division (vertical skew)':
            this.visualizeVerticalSkewMaze();
            break;
          case 'Basic Random Maze':
            this.visualizeBRM();
            break;
          case 'Basic Weight Maze':
            this.visualizeWeightMaze();
            break;
          case 'Simple Stair Pattern':
            this.visualizeStairPattern();
            break;
          case 'Binary Tree':
            this.visualizeBinaryTreeMaze();
            break;
          case 'Sidewinder':
            this.visualizeSidewinderMaze();
            break;
          case 'Rooms & Corridors':
            this.visualizeRoomsMaze();
            break;
          case 'Recursive Backtracker':
            this.visualizeRecursiveBacktracker();
            break;
          case 'Spiral':
            this.visualizeSpiralMaze();
            break;
          case 'Concentric Rings':
            this.visualizeConcentricRings();
            break;
          default:
            window.alert('Select A Maze First!');
        }
      });
  }

  selectSpeed() {
    switch (this.context.speedItem) {
      case 'Fast':
        return 10;
      case 'Average':
        return 20;
      case 'Slow':
        return 30;
      default:
        return 10;
    }
  }

  // Render the visualizer grid and the button to start the visualization
  render() {
    const { grid, mouseIsPressed, noPathFound } = this.state;
    const numCols = grid.length > 0 ? grid[0].length : 0;

    return (
      <div className="pv-container">
        <GrassBackground />
        <div className="grid-layer">
          {noPathFound && (
            <div className="no-path-banner">
              No path found — the finish node is unreachable!
            </div>
          )}
          <div className="grid">
            <div>
              <img src={fenceTopLeft} alt="" className="fence-tile" />
              {Array.from({ length: numCols }, (_, i) => (
                <img key={i} src={fenceTopMiddle} alt="" className="fence-tile" />
              ))}
              <img src={fenceTopRight} alt="" className="fence-tile" />
            </div>
            {grid.map((row, rowIdx) => {
              return (
                <div key={rowIdx}>
                  <img src={fenceLeft} alt="" className="fence-tile" />
                  {row.map((node, nodeIdx) => {
                    const { row, col, isFinish, isStart, isWall, isWeight, isGate, wallVariant } = node;
                    return (
                      <Node
                        key={nodeIdx}
                        col={col}
                        isFinish={isFinish}
                        isStart={isStart}
                        isWall={isWall}
                        isWeight={isWeight}
                        isGate={isGate}
                        wallVariant={wallVariant}
                        mouseIsPressed={mouseIsPressed}
                        onMouseDown={() => this.handleMouseDown(row, col)}
                        onMouseEnter={() =>
                          this.handleMouseEnter(row, col)
                        }
                        onMouseUp={() => this.handleMouseUp()}
                        row={row}></Node>
                    );
                  })}
                  <img src={fenceRight} alt="" className="fence-tile" />
                </div>
              );
            })}
            <div>
              <img src={fenceBottomLeft} alt="" className="fence-tile" />
              {Array.from({ length: numCols }, (_, i) => (
                <img key={i} src={fenceBottomMiddle} alt="" className="fence-tile" />
              ))}
              <img src={fenceBottomRight} alt="" className="fence-tile" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// Create the initial grid for visualization
const getInitialGrid = (
  startRow = START_NODE_ROW,
  startCol = START_NODE_COL,
  finishRow = FINISH_NODE_ROW,
  finishCol = FINISH_NODE_COL,
) => {
  const availableHeight = window.innerHeight - NAVBAR_HEIGHT - FOOTER_HEIGHT;
  const numRows = Math.min(Math.floor((availableHeight - 2 * NODE_HEIGHT) / NODE_HEIGHT), MAX_ROWS);
  // Actual rendered board width: constrained by both max-width and max-height (aspect ratio)
  const infoBoardByWidth = Math.min(INFO_BOARD_WIDTH, window.innerWidth * 0.9);
  const infoBoardByHeight = (window.innerHeight - 270) * INFO_BOARD_ASPECT;
  const infoBoardW = Math.min(infoBoardByWidth, infoBoardByHeight);
  const numCols = Math.min(Math.floor((window.innerWidth - infoBoardW - PV_PADDING_LEFT - 2 * NODE_WIDTH) / NODE_WIDTH), MAX_COLS);

  const grid = [];
  for (let row = 0; row < numRows; row++) {
    const currentRow = [];
    for (let col = 0; col < numCols; col++) {
      currentRow.push(createNode(col, row, startRow, startCol, finishRow, finishCol));
    }
    grid.push(currentRow);
  }
  return grid;
};

// Create an individual node with default properties
const createNode = (col, row, startRow = START_NODE_ROW, startCol = START_NODE_COL, finishRow = FINISH_NODE_ROW, finishCol = FINISH_NODE_COL) => {
  return {
    col,
    row,
    isStart: row === startRow && col === startCol,
    isFinish: row === finishRow && col === finishCol,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    isWeight: false,
    isGate: false,
    previousNode: null,
    gCost: Infinity,
    distanceFromFinish: Infinity,
    isVisitedByStart: false,
    isVisitedByFinish: false,
  };
};

// Toggle the weight state of a node in the grid
const getNewGridWithWeightToggled = (grid, row, col) => {
  const newGrid = grid.map(r => r.slice());
  const node = newGrid[row][col];
  newGrid[row][col] = { ...node, isWeight: !node.isWeight, isWall: false };
  return newGrid;
};

// Place the gate on a cell
const getNewGridWithGatePlaced = (grid, row, col) => {
  const newGrid = grid.map(r => r.slice());
  newGrid[row][col] = { ...newGrid[row][col], isGate: true, isWall: false, isWeight: false };
  return newGrid;
};

// Remove the gate from a cell
const getNewGridWithGateRemoved = (grid, row, col) => {
  const newGrid = grid.map(r => r.slice());
  newGrid[row][col] = { ...newGrid[row][col], isGate: false };
  return newGrid;
};

// Toggle the wall state of a node in the grid
const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.map(r => r.slice());
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
    ...(node.isWall ? {} : { wallVariant: Math.floor(Math.random() * 5) }),
  };
  newGrid[row][col] = newNode;
  return newGrid;
};

// Move the start or finish node to a new cell
const getNewGridWithMovedNode = (grid, newRow, newCol, nodeType, prevRow, prevCol) => {
  const newGrid = grid.map(row => row.slice());
  newGrid[prevRow][prevCol] = { ...newGrid[prevRow][prevCol], isStart: false, isFinish: false };
  newGrid[newRow][newCol] = {
    ...newGrid[newRow][newCol],
    isStart: nodeType === 'start',
    isFinish: nodeType === 'finish',
    isWall: false,
    isWeight: false,
  };
  return newGrid;
};

function createMaze(sourceGrid) {
  // Start fully walled so the toggle-based Prim's DFS carves paths (wall→open)
  // rather than building walls on an already-open grid (open→wall).
  let grid = sourceGrid.map(row =>
    row.map(node => ({ ...node, isWall: !node.isStart && !node.isFinish })),
  );

  const numRows = grid.length;
  const numCols = grid[0].length;

  // Directions to explore
  const directions = [
    { dx: -2, dy: 0 }, // up
    { dx: 2, dy: 0 }, // down
    { dx: 0, dy: -2 }, // left
    { dx: 0, dy: 2 }, // right
  ];

  // Place an obstruction between start and finish at proportional positions
  const wallRow = Math.floor(numRows * 0.4);
  const wallColStart = Math.floor(numCols * 0.24);
  const wallColEnd = Math.floor(numCols * 0.51);
  const wallGapCol = Math.floor(numCols * 0.37);
  for (let i = wallColStart; i < wallColEnd; i++) {
    if (i !== wallGapCol) {
      grid = getNewGridWithWallToggled(grid, wallRow, i);
    }
  }

  // Pick a random cell for maze generation start
  const startRow = Math.min(Math.floor(numRows * 0.4), numRows - 1);
  const startCol = Math.min(Math.floor(numCols * 0.22), numCols - 1);
  grid[startRow][startCol].isVisited = true;

  const cells = [grid[startRow][startCol]];

  while (cells.length) {
    const randomIndex = Math.floor(Math.random() * cells.length);
    const cell = cells[randomIndex];
    const neighbors = [];
    const currentGrid = grid;

    directions.forEach(({ dx, dy }) => {
      const newRow = cell.row + dx;
      const newCol = cell.col + dy;

      if (
        newRow > 0 &&
        newRow < currentGrid.length &&
        newCol > 0 &&
        newCol < currentGrid[0].length &&
        !currentGrid[newRow][newCol].isVisited
      ) {
        neighbors.push({ row: newRow, col: newCol });
      }
    });

    if (neighbors.length) {
      const randomNeighborIndex = Math.floor(Math.random() * neighbors.length);
      const neighbor = neighbors[randomNeighborIndex];

      // Carve a path between cell and neighbor
      const midRow = Math.floor((cell.row + neighbor.row) / 2);
      const midCol = Math.floor((cell.col + neighbor.col) / 2);

      grid = getNewGridWithWallToggled(grid, neighbor.row, neighbor.col);
      grid = getNewGridWithWallToggled(grid, midRow, midCol);

      grid[neighbor.row][neighbor.col].isVisited = true;
      cells.push(grid[neighbor.row][neighbor.col]);
    } else {
      cells.splice(randomIndex, 1); // Remove the cell if it has no unvisited neighbors
    }
  }

  // Reset isVisited on all nodes so algorithms don't skip maze-path cells
  for (let row of grid) {
    for (let node of row) {
      node.isVisited = false;
    }
  }

  // Return the modified grid
  return grid;
}

// Prim's maze with biased direction weights for H/V skew variants
function createSkewedMaze(sourceGrid, skew) {
  // Same fix as createMaze: start fully walled so DFS carves paths correctly.
  let grid = sourceGrid.map(row =>
    row.map(node => ({ ...node, isWall: !node.isStart && !node.isFinish })),
  );

  const horizontalDirs = [
    { dx: 0, dy: -2 },
    { dx: 0, dy: 2 },
    { dx: 0, dy: -2 },
    { dx: 0, dy: 2 },
    { dx: -2, dy: 0 },
    { dx: 2, dy: 0 },
  ];
  const verticalDirs = [
    { dx: -2, dy: 0 },
    { dx: 2, dy: 0 },
    { dx: -2, dy: 0 },
    { dx: 2, dy: 0 },
    { dx: 0, dy: -2 },
    { dx: 0, dy: 2 },
  ];
  const directions = skew === 'horizontal' ? horizontalDirs : verticalDirs;

  const numRows = grid.length;
  const numCols = grid[0].length;
  const wallRow = Math.floor(numRows * 0.4);
  const wallColStart = Math.floor(numCols * 0.24);
  const wallColEnd = Math.floor(numCols * 0.51);
  const wallGapCol = Math.floor(numCols * 0.37);
  for (let i = wallColStart; i < wallColEnd; i++) {
    if (i !== wallGapCol) {
      grid = getNewGridWithWallToggled(grid, wallRow, i);
    }
  }

  const startRow = Math.min(Math.floor(numRows * 0.4), numRows - 1);
  const startCol = Math.min(Math.floor(numCols * 0.22), numCols - 1);
  grid[startRow][startCol].isVisited = true;
  const cells = [grid[startRow][startCol]];

  while (cells.length) {
    const randomIndex = Math.floor(Math.random() * cells.length);
    const cell = cells[randomIndex];
    const neighbors = [];
    const currentGrid = grid;

    directions.forEach(({ dx, dy }) => {
      const newRow = cell.row + dx;
      const newCol = cell.col + dy;
      if (
        newRow > 0 &&
        newRow < currentGrid.length &&
        newCol > 0 &&
        newCol < currentGrid[0].length &&
        !currentGrid[newRow][newCol].isVisited
      ) {
        neighbors.push({ row: newRow, col: newCol });
      }
    });

    if (neighbors.length) {
      const randomNeighborIndex = Math.floor(Math.random() * neighbors.length);
      const neighbor = neighbors[randomNeighborIndex];
      const midRow = Math.floor((cell.row + neighbor.row) / 2);
      const midCol = Math.floor((cell.col + neighbor.col) / 2);
      grid = getNewGridWithWallToggled(grid, neighbor.row, neighbor.col);
      grid = getNewGridWithWallToggled(grid, midRow, midCol);
      grid[neighbor.row][neighbor.col].isVisited = true;
      cells.push(grid[neighbor.row][neighbor.col]);
    } else {
      cells.splice(randomIndex, 1);
    }
  }

  for (let row of grid) {
    for (let node of row) {
      node.isVisited = false;
    }
  }

  return grid;
}

// Binary Tree maze: for each room cell (even coords), carve north or west.
// Produces a perfect maze with a strong diagonal bias toward top-left.
function createBinaryTreeMaze(grid) {
  const numRows = grid.length;
  const numCols = grid[0].length;

  const newGrid = grid.map(row =>
    row.map(node => ({ ...node, isWall: !node.isStart && !node.isFinish })),
  );

  for (let row = 0; row < numRows; row += 2) {
    for (let col = 0; col < numCols; col += 2) {
      const node = newGrid[row][col];
      if (!node.isStart && !node.isFinish) {
        newGrid[row][col] = { ...node, isWall: false };
      }

      const canNorth = row > 0;
      const canWest = col > 0;
      if (!canNorth && !canWest) continue;

      const carveNorth =
        canNorth && canWest ? Math.random() < 0.5 : canNorth;

      if (carveNorth) {
        const n = newGrid[row - 1][col];
        if (!n.isStart && !n.isFinish)
          newGrid[row - 1][col] = { ...n, isWall: false };
      } else {
        const n = newGrid[row][col - 1];
        if (!n.isStart && !n.isFinish)
          newGrid[row][col - 1] = { ...n, isWall: false };
      }
    }
  }

  return newGrid;
}

// Sidewinder maze: process rows left-to-right, randomly closing runs
// by carving north from a random member. Produces a straight top corridor.
function createSidewinderMaze(grid) {
  const numRows = grid.length;
  const numCols = grid[0].length;

  const newGrid = grid.map(row =>
    row.map(node => ({ ...node, isWall: !node.isStart && !node.isFinish })),
  );

  for (let row = 0; row < numRows; row += 2) {
    let run = [];

    for (let col = 0; col < numCols; col += 2) {
      const node = newGrid[row][col];
      if (!node.isStart && !node.isFinish) {
        newGrid[row][col] = { ...node, isWall: false };
      }
      run.push({ row, col });

      const atEasternBoundary = col + 2 >= numCols;
      const atNorthernBoundary = row === 0;
      const closeRun =
        atEasternBoundary || (!atNorthernBoundary && Math.random() < 0.5);

      if (closeRun) {
        if (!atNorthernBoundary) {
          const member = run[Math.floor(Math.random() * run.length)];
          const n = newGrid[member.row - 1][member.col];
          if (!n.isStart && !n.isFinish)
            newGrid[member.row - 1][member.col] = { ...n, isWall: false };
        }
        run = [];
      } else if (col + 1 < numCols) {
        const n = newGrid[row][col + 1];
        if (!n.isStart && !n.isFinish)
          newGrid[row][col + 1] = { ...n, isWall: false };
      }
    }
  }

  return newGrid;
}

// Rooms & Corridors maze: place non-overlapping rooms then connect
// each to the next with an L-shaped corridor.
function createRoomsMaze(grid) {
  const numRows = grid.length;
  const numCols = grid[0].length;
  const NUM_ROOMS = 16;
  const MIN_ROOM = 3;
  const MAX_ROOM = 6;

  const newGrid = grid.map(row =>
    row.map(node => ({
      ...node,
      isWall: !node.isStart && !node.isFinish,
    })),
  );

  const rooms = [];
  for (let attempt = 0; attempt < 500 && rooms.length < NUM_ROOMS; attempt++) {
    const w = MIN_ROOM + Math.floor(Math.random() * (MAX_ROOM - MIN_ROOM + 1));
    const h = MIN_ROOM + Math.floor(Math.random() * (MAX_ROOM - MIN_ROOM + 1));
    const r = 1 + Math.floor(Math.random() * (numRows - h - 2));
    const c = 1 + Math.floor(Math.random() * (numCols - w - 2));

    const overlaps = rooms.some(
      room =>
        r - 1 <= room.r + room.h &&
        r + h + 1 >= room.r &&
        c - 1 <= room.c + room.w &&
        c + w + 1 >= room.c,
    );

    if (!overlaps) {
      rooms.push({ r, c, w, h });
      for (let row = r; row < r + h; row++) {
        for (let col = c; col < c + w; col++) {
          const n = newGrid[row][col];
          if (!n.isStart && !n.isFinish)
            newGrid[row][col] = { ...n, isWall: false };
        }
      }
    }
  }

  for (let i = 1; i < rooms.length; i++) {
    const a = rooms[i - 1];
    const b = rooms[i];
    const r1 = a.r + Math.floor(a.h / 2);
    const c1 = a.c + Math.floor(a.w / 2);
    const r2 = b.r + Math.floor(b.h / 2);
    const c2 = b.c + Math.floor(b.w / 2);

    for (let col = Math.min(c1, c2); col <= Math.max(c1, c2); col++) {
      const n = newGrid[r1][col];
      if (!n.isStart && !n.isFinish) newGrid[r1][col] = { ...n, isWall: false };
    }
    for (let row = Math.min(r1, r2); row <= Math.max(r1, r2); row++) {
      const n = newGrid[row][c2];
      if (!n.isStart && !n.isFinish) newGrid[row][c2] = { ...n, isWall: false };
    }
  }

  return newGrid;
}

// Recursive Backtracker (DFS maze)
// Starts fully walled; carves passages via random DFS. Produces long winding
// corridors with relatively few dead ends — opposite in character to Sidewinder.
function createRecursiveBacktrackerMaze(grid) {
  const numRows = grid.length;
  const numCols = grid[0].length;

  // Start fully walled
  let newGrid = grid.map(row =>
    row.map(node => ({ ...node, isWall: !node.isStart && !node.isFinish })),
  );

  // Work on even-coordinate "room" cells
  const startR = Math.floor(numRows / 4) * 2;
  const startC = Math.floor(numCols / 4) * 2;

  const visited = Array.from({ length: numRows }, () =>
    new Array(numCols).fill(false),
  );

  const stack = [{ row: startR, col: startC }];
  visited[startR][startC] = true;

  const n = newGrid[startR][startC];
  if (!n.isStart && !n.isFinish)
    newGrid[startR][startC] = { ...n, isWall: false };

  while (stack.length) {
    const current = stack[stack.length - 1];
    const { row, col } = current;

    // Collect unvisited room-cell neighbours 2 steps away
    const dirs = [
      { dr: -2, dc: 0 },
      { dr: 2, dc: 0 },
      { dr: 0, dc: -2 },
      { dr: 0, dc: 2 },
    ];
    const unvisited = dirs
      .map(({ dr, dc }) => ({ row: row + dr, col: col + dc, dr, dc }))
      .filter(
        ({ row: r, col: c }) =>
          r >= 0 &&
          r < numRows &&
          c >= 0 &&
          c < numCols &&
          !visited[r][c],
      );

    if (unvisited.length) {
      const chosen =
        unvisited[Math.floor(Math.random() * unvisited.length)];

      // Carve the wall between current and chosen
      const midR = row + Math.floor(chosen.dr / 2);
      const midC = col + Math.floor(chosen.dc / 2);
      const midNode = newGrid[midR][midC];
      if (!midNode.isStart && !midNode.isFinish)
        newGrid[midR][midC] = { ...midNode, isWall: false };

      const chosenNode = newGrid[chosen.row][chosen.col];
      if (!chosenNode.isStart && !chosenNode.isFinish)
        newGrid[chosen.row][chosen.col] = { ...chosenNode, isWall: false };

      visited[chosen.row][chosen.col] = true;
      stack.push({ row: chosen.row, col: chosen.col });
    } else {
      stack.pop();
    }
  }

  return newGrid;
}

// Spiral maze: inward rectangular spiral with a single gap per ring,
// alternating which wall the gap is on each ring.
function createSpiralMaze(grid) {
  const numRows = grid.length;
  const numCols = grid[0].length;

  let newGrid = grid.map(row => row.map(node => ({ ...node })));

  const setWall = (r, c) => {
    if (r < 0 || r >= numRows || c < 0 || c >= numCols) return;
    const n = newGrid[r][c];
    if (!n.isStart && !n.isFinish) newGrid[r][c] = { ...n, isWall: true };
  };
  const clearWall = (r, c) => {
    if (r < 0 || r >= numRows || c < 0 || c >= numCols) return;
    const n = newGrid[r][c];
    newGrid[r][c] = { ...n, isWall: false };
  };

  let top = 1, bottom = numRows - 2, left = 1, right = numCols - 2;
  let ring = 0;

  while (top + 2 <= bottom && left + 2 <= right) {
    // Draw the four sides of this ring
    for (let c = left; c <= right; c++) setWall(top, c);
    for (let c = left; c <= right; c++) setWall(bottom, c);
    for (let r = top; r <= bottom; r++) setWall(r, left);
    for (let r = top; r <= bottom; r++) setWall(r, right);

    // Cut one gap per ring, alternating sides
    const side = ring % 4;
    if (side === 0) clearWall(top, left + Math.floor((right - left) / 2));
    else if (side === 1) clearWall(Math.floor((top + bottom) / 2), right);
    else if (side === 2) clearWall(bottom, left + Math.floor((right - left) / 2));
    else clearWall(Math.floor((top + bottom) / 2), left);

    top += 2; bottom -= 2; left += 2; right -= 2;
    ring++;
  }

  return newGrid;
}

// Concentric Rings with random gap positions
function createConcentricRingsMaze(grid) {
  const numRows = grid.length;
  const numCols = grid[0].length;

  let newGrid = grid.map(row => row.map(node => ({ ...node })));

  const setWall = (r, c) => {
    if (r < 0 || r >= numRows || c < 0 || c >= numCols) return;
    const n = newGrid[r][c];
    if (!n.isStart && !n.isFinish) newGrid[r][c] = { ...n, isWall: true };
  };
  const clearWall = (r, c) => {
    if (r < 0 || r >= numRows || c < 0 || c >= numCols) return;
    const n = newGrid[r][c];
    newGrid[r][c] = { ...n, isWall: false };
  };

  let top = 1, bottom = numRows - 2, left = 1, right = numCols - 2;

  while (top + 2 <= bottom && left + 2 <= right) {
    for (let c = left; c <= right; c++) setWall(top, c);
    for (let c = left; c <= right; c++) setWall(bottom, c);
    for (let r = top; r <= bottom; r++) setWall(r, left);
    for (let r = top; r <= bottom; r++) setWall(r, right);

    // Random gap on a random side — exclude corners so the passage
    // always connects the outer corridor to the inner corridor.
    const side = Math.floor(Math.random() * 4);
    if (side === 0) {
      const c = (left + 1) + Math.floor(Math.random() * (right - left - 1));
      clearWall(top, c);
    } else if (side === 1) {
      const c = (left + 1) + Math.floor(Math.random() * (right - left - 1));
      clearWall(bottom, c);
    } else if (side === 2) {
      const r = (top + 1) + Math.floor(Math.random() * (bottom - top - 1));
      clearWall(r, left);
    } else {
      const r = (top + 1) + Math.floor(Math.random() * (bottom - top - 1));
      clearWall(r, right);
    }

    top += 2; bottom -= 2; left += 2; right -= 2;
  }

  return newGrid;
}



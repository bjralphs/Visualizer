import React, { useState } from 'react';
import './Context.css';

import { useMenuItem } from '../Components/MenuItemContext.js';
import { useMazeItem } from '../Components/MenuItemContext.js';
import { useRunHistory } from '../Components/MenuItemContext.js';
import ALGO_INFO from './algoData';

const Context = () => {
  const { menuItem } = useMenuItem();
  const { mazeItem } = useMazeItem();
  const { runHistory } = useRunHistory();
  const info = ALGO_INFO[menuItem] || null;

  const [bgOpen, setBgOpen] = useState(true);

  return (
    <div className="context">
      <a
        href="https://github.com/bjralphs"
        target="_blank"
        rel="noopener noreferrer"
        className="context-github-link"
        aria-label="View on GitHub"
      >
        <svg className="context-github-icon" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
            0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
            -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
            .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
            -.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27
            .68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12
            .51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48
            0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        GitHub
      </a>

      <div className="context-header">
        <div className="message">
          <span className="message-label">Algorithm:</span><br />{menuItem}
        </div>
        <div className="message">
          <span className="message-label">Maze &amp; Pattern:</span><br />{mazeItem}
        </div>
      </div>

      <div className="context-scroll">

        {info && (
          <div className="bg-dropdown">
            <button
              className="bg-dropdown__toggle"
              aria-expanded={bgOpen}
              aria-controls="bg-dropdown-body"
              onClick={() => setBgOpen(o => !o)}
            >
              <span className="bg-dropdown__title">Background</span>
              <span className="bg-dropdown__chevron">{bgOpen ? '▲' : '▼'}</span>
            </button>

            {bgOpen && (
              <div id="bg-dropdown-body" className="bg-dropdown__body">
                <div className="algo-info__origin">
                  <span className="algo-info__label">Origin</span> {info.origin}, {info.year}
                </div>
                <div className="algo-info__row">
                  <span><span className="algo-info__label">Time</span> {info.timeComplexity}</span>
                  <span className="algo-info__dot">·</span>
                  <span><span className="algo-info__label">Space</span> {info.spaceComplexity}</span>
                </div>
                <div className="algo-info__group">
                  <span className="algo-info__label">Strengths</span>
                  {info.strengths.map((s, i) => (
                    <div key={i} className="algo-info__bullet">· {s}</div>
                  ))}
                </div>
                <div className="algo-info__group">
                  <span className="algo-info__label">Weaknesses</span>
                  {info.weaknesses.map((w, i) => (
                    <div key={i} className="algo-info__bullet">· {w}</div>
                  ))}
                </div>
                <div className="algo-info__group">
                  <span className="algo-info__label">Use Cases</span>
                  {info.useCases.map((u, i) => (
                    <div key={i} className="algo-info__bullet">· {u}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {runHistory.length > 0 && (
          <div className="score-section">
            <span className="message-label">Run History</span>
            {runHistory.map((run, i) => (
              <div key={i} className={`score-entry${i > 0 ? ' score-entry--faded' : ''}`}>
                <span className="score-algo">{(ALGO_INFO[run.algo] && ALGO_INFO[run.algo].shortName) || run.algo}</span>
                <span className="score-stats">
                  {run.visited} visited
                  &nbsp;·&nbsp;
                  {run.path !== null ? `${run.path} path` : 'no path'}
                  &nbsp;·&nbsp;
                  {run.ms}ms
                </span>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};

export default Context;

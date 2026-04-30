import React from 'react';
import SelectionModal from './SelectionModal';
import { useMenuItem } from './MenuItemContext';
import ALGO_INFO from './algoData';

import imgBFS from '../assets/algorithm_selection/breadth_first_search.png';
import imgDFS from '../assets/algorithm_selection/DFS.png';
import imgDijkstra from '../assets/algorithm_selection/Dijkstra.png';
import imgAStar from '../assets/algorithm_selection/a_search.png';
import imgGBFS from '../assets/algorithm_selection/greedy_best_first_search.png';
import imgBidirectional from '../assets/algorithm_selection/bidirectional_search.png';
import imgUCS from '../assets/algorithm_selection/uniform_cost.png';
import imgBellmanFord from '../assets/algorithm_selection/bellman_ford.png';
import imgFloydWarshall from '../assets/algorithm_selection/floyd-warshall.png';
import imgBeam from '../assets/algorithm_selection/beam.png';
import imgWeightedAStar from '../assets/algorithm_selection/weight_a.png';
import imgIDAStar from '../assets/algorithm_selection/IDA.png';
import imgBidirectionalAStar from '../assets/algorithm_selection/bidirectional_a.png';

// Visual metadata keyed by the canonical algorithm name used in ALGO_INFO.
// Adding a new algorithm to algoData.js automatically surfaces it here.
const ALGO_VISUAL = {
    'Breadth-First Search': { icon: imgBFS, color: '#d6eaf8' },
    'Depth-First Search': { icon: imgDFS, color: '#fde8d8' },
    "Dijkstra's Algorithm": { icon: imgDijkstra, color: '#fef9e7' },
    'A* Search': { icon: imgAStar, color: '#d5f5e3' },
    'Greedy Best-First Search': { icon: imgGBFS, color: '#e8daef' },
    'Bidirectional Search': { icon: imgBidirectional, color: '#d6eaf8' },
    'Uniform Cost Search': { icon: imgUCS, color: '#fef9e7' },
    'Bellman-Ford': { icon: imgBellmanFord, color: '#fdebd0' },
    'Floyd-Warshall': { icon: imgFloydWarshall, color: '#eaf2ff' },
    'Beam Search': { icon: imgBeam, color: '#e8f8f5' },
    'Weighted A*': { icon: imgWeightedAStar, color: '#d5f5e3' },
    'IDA*': { icon: imgIDAStar, color: '#d5f5e3' },
    'Bidirectional A*': { icon: imgBidirectionalAStar, color: '#d5f5e3' },
};

// Derive the ordered list from ALGO_INFO so names stay in sync automatically.
const ALGORITHMS = Object.keys(ALGO_INFO).map(name => ({
    name,
    ...ALGO_VISUAL[name],
}));

const AlgorithmModal = ({ isOpen, onClose, clearPath }) => {
    const { menuItem, setMenuItem } = useMenuItem();

    const handleSelect = name => {
        setMenuItem(name);
        if (clearPath) clearPath();
        onClose();
    };

    return (
        <SelectionModal isOpen={isOpen} onClose={onClose} title="Choose an Algorithm">
            <div className="sm-grid sm-grid--4col">
                {ALGORITHMS.map(({ name, icon, color }) => (
                    <button
                        key={name}
                        type="button"
                        className={`sm-card${menuItem === name ? ' sm-card-selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => handleSelect(name)}
                    >
                        <img src={icon} alt={name} className="sm-card-icon" />
                        <p className="sm-card-name">{name}</p>
                        <p className="sm-card-desc">{ALGO_INFO[name] ? ALGO_INFO[name].desc : ''}</p>
                    </button>
                ))}
            </div>
        </SelectionModal>
    );
};

export default AlgorithmModal;


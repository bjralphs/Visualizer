import React from 'react';
import SelectionModal from './SelectionModal';
import { useMazeItem } from './MenuItemContext';

import imgMaze from '../assets/maze_pattern_selection/maze.png';
import imgBasicWeightMaze from '../assets/maze_pattern_selection/basic_weight_maze.png';
import imgBinaryTree from '../assets/maze_pattern_selection/binary_tree.png';
import imgConcentricRings from '../assets/maze_pattern_selection/concentric_rings.png';
import imgRoomsAndCorridors from '../assets/maze_pattern_selection/rooms_and_corridors.png';
import imgSimpleStairPattern from '../assets/maze_pattern_selection/simple_stair_pattern.png';
import imgSpiral from '../assets/maze_pattern_selection/spiral.png';

const MAZES = [
    {
        name: 'Recursive Division',
        icon: imgMaze,
        color: '#d6eaf8',
        desc: 'Repeatedly splits the grid with walls and adds passages; creates elegant structured mazes.',
    },
    {
        name: 'Recursive Division (vertical skew)',
        icon: imgMaze,
        color: '#d6eaf8',
        desc: 'Like Recursive Division but favours vertical walls; creates tall corridor patterns.',
    },
    {
        name: 'Recursive Division (horizontal skew)',
        icon: imgMaze,
        color: '#d6eaf8',
        desc: 'Like Recursive Division but favours horizontal walls; creates wide corridor patterns.',
    },
    {
        name: 'Basic Random Maze',
        icon: imgMaze,
        color: '#fde8d8',
        desc: 'Places walls randomly across the grid; quick, chaotic, and unpredictable.',
    },
    {
        name: 'Basic Weight Maze',
        icon: imgBasicWeightMaze,
        color: '#fef9e7',
        desc: 'Scatters weight nodes randomly; great for testing weighted pathfinding algorithms.',
    },
    {
        name: 'Simple Stair Pattern',
        icon: imgSimpleStairPattern,
        color: '#e8daef',
        desc: 'Creates a repeating diagonal staircase pattern of walls across the grid.',
    },
    {
        name: 'Binary Tree',
        icon: imgBinaryTree,
        color: '#fdebd0',
        desc: 'Carves passages using a binary tree algorithm; creates a noticeable directional bias.',
    },
    {
        name: 'Sidewinder',
        icon: imgMaze,
        color: '#e8f8f5',
        desc: 'A corridor-based algorithm that produces mazes with a distinct horizontal drift.',
    },
    {
        name: 'Rooms & Corridors',
        icon: imgRoomsAndCorridors,
        color: '#eaf2ff',
        desc: 'Generates distinct rooms connected by narrow corridors; feels like a dungeon.',
    },
    {
        name: 'Recursive Backtracker',
        icon: imgMaze,
        color: '#d5f5e3',
        desc: 'Carves a winding perfect maze using depth-first backtracking; no dead ends are left isolated.',
    },
    {
        name: 'Spiral',
        icon: imgSpiral,
        color: '#fef9e7',
        desc: 'Draws an inward spiral of walls with a single winding path threading to the centre.',
    },
    {
        name: 'Concentric Rings',
        icon: imgConcentricRings,
        color: '#fde8d8',
        desc: 'Creates nested rings of walls with small gap passages cut between each ring.',
    },
];

const MazeModal = ({ isOpen, onClose, onGenerate }) => {
    const { mazeItem, setMazeItem } = useMazeItem();

    const handleSelect = name => {
        setMazeItem(name);
        onClose();
        if (onGenerate) onGenerate(name);
    };

    return (
        <SelectionModal isOpen={isOpen} onClose={onClose} title="Choose a Maze & Pattern">
            <div className="sm-grid">
                {MAZES.map(({ name, icon, color, desc }) => (
                    <button
                        key={name}
                        type="button"
                        className={`sm-card${mazeItem === name ? ' sm-card-selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => handleSelect(name)}
                    >
                        <img src={icon} alt={name} className="sm-card-icon" />
                        <p className="sm-card-name">{name}</p>
                        <p className="sm-card-desc">{desc}</p>
                    </button>
                ))}
            </div>
        </SelectionModal>
    );
};

export default MazeModal;

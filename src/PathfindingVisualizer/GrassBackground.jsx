import React, { useRef, useEffect } from 'react';

import grass1 from '../assets/background/grass_1.png';
import grass2 from '../assets/background/grass_2.png';
import grass3 from '../assets/background/grass_3.png';
import grass4 from '../assets/background/grass_4.png';
import grass5 from '../assets/background/grass_5.png';

const TILE = 25;   // matches NODE_WIDTH / NODE_HEIGHT
const GAP = 1;    // matches the node outline width
const STRIDE = TILE + GAP;
const GRID_COLOR = 'rgb(175, 216, 248)';
const SOURCES = [grass1, grass2, grass3, grass4, grass5];

function loadImages(srcs) {
    return Promise.all(
        srcs.map(
            src =>
                new Promise(resolve => {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.src = src;
                }),
        ),
    );
}

export default function GrassBackground() {
    const canvasRef = useRef(null);
    // Keep a seeded layout so resize redraws identically (same random grid).
    const layoutRef = useRef(null);
    const imagesRef = useRef(null);

    function draw() {
        const canvas = canvasRef.current;
        if (!canvas || !imagesRef.current) return;

        const images = imagesRef.current;
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        const cols = Math.ceil(w / STRIDE);
        const rows = Math.ceil(h / STRIDE);

        // Regenerate layout only if dimensions changed
        if (
            !layoutRef.current ||
            layoutRef.current.cols !== cols ||
            layoutRef.current.rows !== rows
        ) {
            const grid = [];
            for (let r = 0; r < rows; r++) {
                const row = [];
                for (let c = 0; c < cols; c++) {
                    row.push(Math.floor(Math.random() * images.length));
                }
                grid.push(row);
            }
            layoutRef.current = { cols, rows, grid };
        }

        const { grid } = layoutRef.current;

        // Fill with gap colour first
        ctx.fillStyle = GRID_COLOR;
        ctx.fillRect(0, 0, w, h);

        // Draw each tile (leave the 1px right/bottom gap unfilled = gap colour shows)
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const img = images[grid[r][c]];
                const x = c * STRIDE;
                const y = r * STRIDE;
                ctx.drawImage(img, x, y, TILE, TILE);
            }
        }
    }

    useEffect(() => {
        loadImages(SOURCES).then(imgs => {
            imagesRef.current = imgs;
            draw();
        });

        const handleResize = () => {
            // Invalidate layout so tiles re-randomise on resize
            layoutRef.current = null;
            draw();
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
            }}
        />
    );
}

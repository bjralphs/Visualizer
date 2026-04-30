import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import './SelectionModal.css';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const SelectionModal = ({ isOpen, onClose, title, children }) => {
    const panelRef = useRef(null);
    const prevFocusRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;

        prevFocusRef.current = document.activeElement;
        document.body.style.overflow = 'hidden';

        const handleKey = e => {
            if (e.key === 'Escape') { onClose(); return; }
            if (e.key === 'Tab' && panelRef.current) {
                const focusable = Array.from(panelRef.current.querySelectorAll(FOCUSABLE));
                if (!focusable.length) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
                } else {
                    if (document.activeElement === last) { e.preventDefault(); first.focus(); }
                }
            }
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) && panelRef.current) {
                const grid = panelRef.current.querySelector('.sm-grid');
                if (!grid) return;
                const cards = Array.from(grid.querySelectorAll('button'));
                const idx = cards.indexOf(document.activeElement);
                if (idx === -1) return;
                e.preventDefault();
                // Determine columns from CSS class (sm-grid--4col → 4, sm-grid--3col → 3, else 1)
                const cols = grid.classList.contains('sm-grid--4col') ? 4
                    : grid.classList.contains('sm-grid--3col') ? 3 : 1;
                let next = idx;
                if (e.key === 'ArrowRight') next = Math.min(idx + 1, cards.length - 1);
                else if (e.key === 'ArrowLeft') next = Math.max(idx - 1, 0);
                else if (e.key === 'ArrowDown') next = Math.min(idx + cols, cards.length - 1);
                else if (e.key === 'ArrowUp') next = Math.max(idx - cols, 0);
                cards[next].focus();
            }
        };

        document.addEventListener('keydown', handleKey);

        const raf = requestAnimationFrame(() => {
            if (panelRef.current) {
                const first = panelRef.current.querySelector(FOCUSABLE);
                if (first) first.focus();
            }
        });

        return () => {
            document.removeEventListener('keydown', handleKey);
            cancelAnimationFrame(raf);
            document.body.style.overflow = '';
            if (prevFocusRef.current) prevFocusRef.current.focus();
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="sm-backdrop" onMouseDown={onClose}>
            <div
                className="sm-panel"
                onMouseDown={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="sm-dialog-title"
                ref={panelRef}
            >
                <div className="sm-header">
                    <h2 className="sm-title" id="sm-dialog-title">{title}</h2>
                    <button className="sm-close" onClick={onClose} aria-label="Close">✕</button>
                </div>
                <div className="sm-body">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default SelectionModal;

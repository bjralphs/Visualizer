import React, { useRef } from 'react';
import './Tooltip.css';

let _ttCounter = 0;

/**
 * Accessible tooltip wrapper.
 *
 * Usage:
 *   <Tooltip text="Description" position="above">
 *     <button>…</button>
 *   </Tooltip>
 *
 * The child element receives `aria-describedby` pointing to the tooltip id.
 * `position` accepts 'above' | 'below' (default 'above').
 */
const Tooltip = ({ text, position = 'above', style, children }) => {
    const idRef = useRef(null);
    if (idRef.current === null) {
        idRef.current = `tt-${++_ttCounter}`;
    }
    const id = idRef.current;
    const child = React.Children.only(children);
    const trigger = React.cloneElement(child, { 'aria-describedby': id });
    return (
        <span className="tt" style={style}>
            {trigger}
            <span id={id} role="tooltip" className={`tt__text tt__text--${position}`}>
                {text}
            </span>
        </span>
    );
};

export default Tooltip;

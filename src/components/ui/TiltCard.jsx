import React from 'react';
import { motion } from 'framer-motion';

// Hover-lift card. Replaces the previous cursor-tracking 3D tilt — that
// version called getBoundingClientRect() on every mousemove across N cards,
// recomputed two springs + two useTransform chains per frame, and forced
// preserve-3d compositing. On lower-end devices it shipped audibly janky
// frames. This version is a single GPU-cheap transform (translateY + scale)
// driven by `whileHover`, which framer-motion runs on the compositor only.
const HOVER_SPRING = { type: 'spring', stiffness: 280, damping: 30, mass: 0.6 };

const TiltCard = ({ children, className = '', onClick, ariaLabel, lift = 6, ...rest }) => {
    return (
        <motion.button
            type="button"
            onClick={onClick}
            aria-label={ariaLabel}
            whileHover={{ y: -lift, scale: 1.02 }}
            whileTap={{ scale: 0.98, y: -lift * 0.4 }}
            transition={HOVER_SPRING}
            className={className}
            {...rest}
        >
            {children}
        </motion.button>
    );
};

export default TiltCard;

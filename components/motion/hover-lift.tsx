"use client";

import { motion } from "framer-motion";

/**
 * Lifts a card on hover and presses it on tap.
 *
 * Spring rather than a fixed duration, so an interrupted hover settles
 * naturally instead of snapping back. As with `Reveal`, the element type isn't
 * branched on `useReducedMotion` — `<MotionConfig reducedMotion="user">` in the
 * providers disables the movement for those users without a hydration mismatch.
 */
const HoverLift = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => (
    <motion.div
        className={className}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
        {children}
    </motion.div>
);

export default HoverLift;

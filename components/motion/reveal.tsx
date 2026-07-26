"use client";

import { motion, type Variants } from "framer-motion";

import { cn } from "@/lib/utils";

// Marks a wrapper that starts hidden and reveals on scroll. A reduced-motion
// CSS rule forces anything with this class visible, so content never depends on
// a scroll observer that a reduced-motion user shouldn't be waiting on.
const REVEAL = "motion-reveal";

/**
 * Shared entrance curve.
 *
 * Matches `ease-out` / `duration-enter` in the Tailwind config, so a card that
 * reveals on scroll and then lifts on hover moves with the same character.
 * Short travel: long slides read as sluggish, not smooth.
 */
const EASE = [0.22, 1, 0.36, 1] as const;
const DURATION = 0.42;

type RevealProps = {
    children: React.ReactNode;
    /** Seconds. Use sparingly — long chains feel sluggish, not polished. */
    delay?: number;
    className?: string;
    /** Distance travelled on entry, in px. */
    y?: number;
};

/**
 * Fades content up as it enters the viewport, once.
 *
 * The element type is deliberately NOT branched on `useReducedMotion`: the
 * server can't read that preference, so a reduced-motion client would render a
 * different element than the server did, producing a hydration mismatch
 * ("Extra attributes from the server: style"). Reduced motion is instead
 * handled globally by `<MotionConfig reducedMotion="user">` in the providers,
 * which keeps the opacity fade but drops the movement.
 */
export const Reveal = ({ children, delay = 0, className, y = 12 }: RevealProps) => (
    <motion.div
        className={cn(REVEAL, className)}
        initial={{ opacity: 0, y }}
        whileInView={{ opacity: 1, y: 0 }}
        // A negative margin would delay the trigger until the element is well
        // inside the viewport, which reads as content arriving late. Firing
        // slightly early keeps it feeling anticipatory.
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: DURATION, delay, ease: EASE }}
    >
        {children}
    </motion.div>
);

const containerVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: DURATION, ease: EASE },
    },
};

/** Staggers its children in as the group scrolls into view. */
export const Stagger = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => (
    <motion.div
        className={className}
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "0px 0px -8% 0px" }}
    >
        {children}
    </motion.div>
);

export const StaggerItem = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => (
    <motion.div className={cn(REVEAL, "h-full", className)} variants={itemVariants}>
        {children}
    </motion.div>
);

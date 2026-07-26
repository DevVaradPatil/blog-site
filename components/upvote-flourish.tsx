"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { Player } from "@lordicon/react";

const ICON = require("@/assets/applause.json");

export type FlourishHandle = { play: () => void };

/**
 * The applause animation, isolated so it can be loaded on demand.
 *
 * `lottie-web` plus the icon JSON is ~100 kB — more than the rest of the post
 * page put together. Splitting it out keeps that weight off the initial load.
 */
const UpvoteFlourish = forwardRef<FlourishHandle, { size?: number }>(
    ({ size = 20 }, ref) => {
        const playerRef = useRef<Player>(null);

        useImperativeHandle(ref, () => ({
            play: () => playerRef.current?.playFromBeginning(),
        }));

        return (
            <Player
                ref={playerRef}
                icon={ICON}
                colorize="currentColor"
                size={size}
            />
        );
    },
);

UpvoteFlourish.displayName = "UpvoteFlourish";

export default UpvoteFlourish;

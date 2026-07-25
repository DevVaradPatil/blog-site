/**
 * Deterministic fallback covers.
 *
 * Any post without an uploaded image still gets a cover that looks deliberate,
 * derived from its id so it never changes between renders. This is what makes
 * a repeat of the Firebase blank-image outage structurally impossible: there is
 * no code path where a post renders with a broken <img>.
 *
 * Pure CSS — no image generation, no bytes stored, no bandwidth spent.
 */

export type CoverPalette = {
    from: string;
    via: string;
    to: string;
    ink: string;
};

/** Muted editorial gradients, chosen to sit behind white/near-black text. */
const PALETTES: CoverPalette[] = [
    { from: "#1e3a5f", via: "#2d5f8a", to: "#4a90a4", ink: "#ffffff" },
    { from: "#3d2c4f", via: "#6b4c7a", to: "#a67ba6", ink: "#ffffff" },
    { from: "#5c3a21", via: "#8a5a3c", to: "#c08552", ink: "#ffffff" },
    { from: "#1f4037", via: "#356859", to: "#6ba292", ink: "#ffffff" },
    { from: "#4a1f30", via: "#7d3350", to: "#b56576", ink: "#ffffff" },
    { from: "#2b2d42", via: "#4a4e69", to: "#8d99ae", ink: "#ffffff" },
    { from: "#3c2a1e", via: "#6f4e37", to: "#a9825f", ink: "#ffffff" },
    { from: "#22333b", via: "#3e5c65", to: "#7a9e9f", ink: "#ffffff" },
];

/** Stable 32-bit hash (FNV-1a) so a given seed always maps to one palette. */
const hash = (seed: string): number => {
    let h = 0x811c9dc5;
    for (let i = 0; i < seed.length; i++) {
        h ^= seed.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
};

export const paletteFor = (seed: string): CoverPalette =>
    PALETTES[hash(seed) % PALETTES.length];

export const coverGradient = (seed: string): string => {
    const { from, via, to } = paletteFor(seed);
    // Angle also derives from the seed, so same-palette covers still differ.
    const angle = (hash(seed) % 8) * 45;
    return `linear-gradient(${angle}deg, ${from} 0%, ${via} 55%, ${to} 100%)`;
};

/**
 * Hosts `next/image` is configured to optimise (must mirror
 * `next.config.mjs` → `images.remotePatterns`).
 */
const RENDERABLE_HOSTS = [
    "res.cloudinary.com",
    "lh3.googleusercontent.com",
    "avatars.githubusercontent.com",
];

/**
 * Whether a stored URL can actually be rendered.
 *
 * `next/image` throws for any hostname missing from `remotePatterns`, so a
 * stale URL from a retired provider would crash the page rather than degrade.
 * Callers use this to fall back to a gradient instead — which is how legacy
 * Firebase URLs stay harmless until the data is migrated.
 */
export const isRenderableImageSrc = (src?: string | null): src is string => {
    if (!src) return false;
    if (src.startsWith("data:") || src.startsWith("blob:")) return true;
    if (src.startsWith("/")) return true;

    try {
        return RENDERABLE_HOSTS.includes(new URL(src).hostname);
    } catch {
        return false;
    }
};

/** Up to two initials from a title/name, for the cover monogram. */
export const initialsFor = (text: string): string =>
    text
        .split(/\s+/)
        .filter((word) => /[a-zA-Z0-9]/.test(word))
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? "")
        .join("");

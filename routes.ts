/**
 * Routes that render without a session.
 *
 * Previously only `/` was public, so every post, profile and the feed itself
 * redirected logged-out visitors to the login page. A blog nobody can read
 * without an account cannot be shared or indexed.
 */
export const publicRoutes = [
    '/',
    '/home',
    '/search',
    '/auth/new-verification',
]

/** Public route families — matched by prefix, since these carry a param. */
export const publicPrefixes = [
    '/post/',
    '/user/',
    '/tag/',
    '/search/',
]

export const isPublicRoute = (pathname: string) =>
    publicRoutes.includes(pathname) ||
    publicPrefixes.some((prefix) => pathname.startsWith(prefix));

export const authRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/error',
    '/auth/reset',
    '/auth/new-password',
]

export const apiAuthPrefix = '/api/auth';

export const DEFAULT_LOGIN_REDIRECT = '/home';

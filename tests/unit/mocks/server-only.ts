// Test-only stand-in for the `server-only` package. The real package throws
// unless it's processed by Next.js's own bundler, which Vitest isn't — see
// vitest.config.ts, which aliases "server-only" to this file for tests only.
export {};

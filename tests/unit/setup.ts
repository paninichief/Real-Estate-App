import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// vitest.config.ts doesn't set `test.globals: true`, so Testing Library's
// automatic afterEach(cleanup) registration (which checks for a global
// `afterEach`) never fires on its own — register it explicitly instead, so
// component tests don't leak DOM nodes between `it` blocks in the same file.
afterEach(() => {
  cleanup();
});

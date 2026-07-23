import { describe, it, expect, vi } from "vitest";

const mockGetUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
  })),
}));

import { getCurrentUser } from "@/lib/auth/get-current-user";

describe("getCurrentUser", () => {
  it("returns the user when Supabase resolves one", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const user = await getCurrentUser();
    expect(user).toEqual({ id: "user-1" });
  });

  it("returns null when signed out", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const user = await getCurrentUser();
    expect(user).toBeNull();
  });

  it("returns null instead of throwing when Supabase isn't configured yet", async () => {
    mockGetUser.mockRejectedValue(new Error("supabaseUrl is required"));
    const user = await getCurrentUser();
    expect(user).toBeNull();
  });
});

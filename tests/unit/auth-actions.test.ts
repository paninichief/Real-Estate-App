import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSignUp = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignInWithOAuth = vi.fn();
const mockSignOut = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      signUp: mockSignUp,
      signInWithPassword: mockSignInWithPassword,
      signInWithOAuth: mockSignInWithOAuth,
      signOut: mockSignOut,
    },
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

import {
  signUpWithPassword,
  signInWithPassword,
  signInWithGoogle,
  signOut,
} from "@/lib/auth/actions";

function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

beforeEach(() => {
  mockSignUp.mockReset();
  mockSignInWithPassword.mockReset();
  mockSignInWithOAuth.mockReset();
  mockSignOut.mockReset();
});

describe("signUpWithPassword", () => {
  it("returns a validation error when email/password are missing, without calling Supabase", async () => {
    const result = await signUpWithPassword({ error: null }, formData({}));
    expect(result.error).toMatch(/required/i);
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("surfaces the Supabase error message on failure", async () => {
    mockSignUp.mockResolvedValue({ error: { message: "Email already registered" } });
    const result = await signUpWithPassword(
      { error: null },
      formData({ email: "a@example.com", password: "password123" }),
    );
    expect(result.error).toBe("Email already registered");
  });

  it("redirects home on success and passes credentials through unchanged", async () => {
    mockSignUp.mockResolvedValue({ error: null });
    await expect(
      signUpWithPassword(
        { error: null },
        formData({ email: "a@example.com", password: "password123" }),
      ),
    ).rejects.toThrow("REDIRECT:/");
    expect(mockSignUp).toHaveBeenCalledWith({
      email: "a@example.com",
      password: "password123",
    });
  });
});

describe("signInWithPassword", () => {
  it("returns a validation error when password is missing", async () => {
    const result = await signInWithPassword(
      { error: null },
      formData({ email: "a@example.com" }),
    );
    expect(result.error).toMatch(/required/i);
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it("surfaces the Supabase error message on invalid credentials", async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });
    const result = await signInWithPassword(
      { error: null },
      formData({ email: "a@example.com", password: "wrong" }),
    );
    expect(result.error).toBe("Invalid login credentials");
  });

  it("redirects home on success", async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });
    await expect(
      signInWithPassword(
        { error: null },
        formData({ email: "a@example.com", password: "password123" }),
      ),
    ).rejects.toThrow("REDIRECT:/");
  });
});

describe("signInWithGoogle", () => {
  it("redirects to the OAuth URL Supabase returns", async () => {
    mockSignInWithOAuth.mockResolvedValue({ data: { url: "https://accounts.google.com/oauth" }, error: null });
    await expect(signInWithGoogle()).rejects.toThrow("REDIRECT:https://accounts.google.com/oauth");
  });

  it("redirects to sign-in with an error flag when Supabase fails", async () => {
    mockSignInWithOAuth.mockResolvedValue({ data: { url: null }, error: { message: "provider not configured" } });
    await expect(signInWithGoogle()).rejects.toThrow("REDIRECT:/sign-in?error=google-oauth-failed");
  });
});

describe("signOut", () => {
  it("calls Supabase signOut and redirects home", async () => {
    mockSignOut.mockResolvedValue({ error: null });
    await expect(signOut()).rejects.toThrow("REDIRECT:/");
    expect(mockSignOut).toHaveBeenCalled();
  });
});

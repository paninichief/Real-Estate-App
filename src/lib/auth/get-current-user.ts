import "server-only";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Returns the current user, or null if signed out — or if Supabase isn't
 * configured yet (e.g. Milestone 1 before a real project exists). Callers
 * should never have to distinguish "signed out" from "auth not configured";
 * both mean "render the site as a guest."
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

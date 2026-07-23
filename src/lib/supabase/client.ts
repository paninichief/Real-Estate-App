import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in Client Components. Reads the public URL/anon key
 * from env vars — see .env.example. Until a real Supabase project is created
 * (Milestone 1 setup step), these values are placeholders and auth calls will fail.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

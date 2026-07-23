import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session cookie on every request. Required by
 * @supabase/ssr's cookie-based auth model — without this, sessions can expire
 * silently in Server Components. See middleware.ts at the project root.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    // Required: touches the session so @supabase/ssr can refresh expired tokens.
    await supabase.auth.getUser();
  } catch {
    // Supabase isn't configured yet (e.g. Milestone 1 before a real project
    // exists) — fall through and serve the request as an unauthenticated guest.
  }

  return supabaseResponse;
}

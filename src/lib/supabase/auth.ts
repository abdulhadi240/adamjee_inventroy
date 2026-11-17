import type { SupabaseClient } from "@supabase/supabase-js";

export type AuthUser = {
  id: string;
  email: string | null;
};

type Jwks = NonNullable<Parameters<SupabaseClient["auth"]["getClaims"]>[1]>;

const JWKS_TTL_MS = 10 * 60 * 1000;

// Signing keys are shared across requests so verifying a session costs no
// network round trip. (A Supabase client is created per request, so its own
// key cache never survives.)
let cachedJwks: Jwks | null = null;
let cachedAt = 0;
let inflight: Promise<Jwks | null> | null = null;

async function loadJwks(): Promise<Jwks | null> {
  if (cachedJwks && Date.now() - cachedAt < JWKS_TTL_MS) return cachedJwks;

  inflight ??= fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/.well-known/jwks.json`,
    { headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! } }
  )
    .then(async (res) => {
      if (!res.ok) return cachedJwks;
      const jwks = (await res.json()) as Jwks;
      if (!jwks.keys?.length) return cachedJwks;
      cachedJwks = jwks;
      cachedAt = Date.now();
      return jwks;
    })
    // Fall back to stale keys; getClaims fetches them itself if we have none
    .catch(() => cachedJwks)
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

/**
 * The signed-in user, or null.
 *
 * Verifies the session JWT's signature locally instead of calling the
 * Supabase Auth server (`auth.getUser()`), which saves a network round trip
 * on every request. Expired tokens are still refreshed. Row-level security
 * re-checks the token on every query, so data access stays protected.
 */
export async function getAuthUser(
  supabase: SupabaseClient
): Promise<AuthUser | null> {
  try {
    const jwks = await loadJwks();
    const { data, error } = await supabase.auth.getClaims(
      undefined,
      jwks ?? undefined
    );
    const sub = data?.claims?.sub;
    if (error || !sub) return null;

    const email = (data.claims as { email?: string }).email;
    return { id: sub, email: email || null };
  } catch {
    return null;
  }
}

import { createBrowserClient } from "@supabase/ssr";

/** Client Supabase côté navigateur. La clé anonyme est publique par
 *  conception : toute la sécurité repose sur les politiques RLS et sur le
 *  fait que la table `question` n'est pas exposée à l'API. */
export function creerClientNavigateur() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

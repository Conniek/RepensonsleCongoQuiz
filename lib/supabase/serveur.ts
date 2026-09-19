import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Client Supabase côté serveur. Le rendu serveur compte pour le SEO et le
 *  GEO : les pages publiques doivent arriver au robot déjà remplies, pas
 *  construites en JavaScript. */
export async function creerClientServeur() {
  const magasin = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return magasin.getAll();
        },
        setAll(aEcrire) {
          try {
            aEcrire.forEach(({ name, value, options }) =>
              magasin.set(name, value, options)
            );
          } catch {
            // Appelé depuis un composant serveur, où l'écriture de cookies est
            // interdite. Sans conséquence : le rafraîchissement de session est
            // assuré côté navigateur.
          }
        },
      },
    }
  );
}

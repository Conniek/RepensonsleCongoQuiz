import { creerClientNavigateur } from "./supabase/client";

/** Délai au-delà duquel on renonce à obtenir une session.
 *
 *  Sans limite, une connexion faible ou un contexte non sécurisé laissaient
 *  l'interface bloquée sur « Chargement » indéfiniment. Mieux vaut un
 *  message et un bouton pour réessayer qu'une attente sans fin. */
const DELAI_MS = 8000;

export class SessionIndisponible extends Error {
  constructor(public readonly motif: "delai" | "contexte" | "refus") {
    super(`Session indisponible : ${motif}`);
  }
}

/** Garantit qu'une session existe, en créant au besoin un compte anonyme.
 *
 *  Le mode invité passe par l'authentification anonyme de Supabase : l'invité
 *  reçoit un vrai identifiant, ses parties sont donc enregistrées côté serveur
 *  dès le premier jour. */
export async function assurerSession() {
  const supabase = creerClientNavigateur();

  const tentative = (async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) return data.session;

    const { data: creee, error } = await supabase.auth.signInAnonymously();
    if (error) throw new SessionIndisponible("refus");
    return creee.session;
  })();

  const delai = new Promise<never>((_, rejeter) =>
    setTimeout(() => rejeter(new SessionIndisponible("delai")), DELAI_MS)
  );

  return Promise.race([tentative, delai]);
}

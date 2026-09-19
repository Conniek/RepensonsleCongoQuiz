import { creerClientNavigateur } from "./supabase/client";

/** Garantit qu'une session existe, en créant au besoin un compte anonyme.
 *
 *  Le mode invité passe par l'authentification anonyme de Supabase : l'invité
 *  reçoit un vrai identifiant, ses parties sont donc enregistrées côté serveur
 *  dès le premier jour. C'est la première des trois fondations exigées pour
 *  ajouter le duel asynchrone plus tard sans refonte. */
export async function assurerSession() {
  const supabase = creerClientNavigateur();

  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session;

  const { data: creee, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return creee.session;
}

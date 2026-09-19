import { fr } from "./fr";

/** Le français fait référence : toute autre langue doit fournir exactement
 *  les mêmes clés, avec les mêmes signatures. TypeScript le vérifie. */
export type Dictionnaire = typeof fr;

const DICTIONNAIRES = { fr } satisfies Record<string, Dictionnaire>;

export type Langue = keyof typeof DICTIONNAIRES;
export const LANGUE_PAR_DEFAUT: Langue = "fr";

/** Renvoie le dictionnaire d'une langue.
 *
 *  Aujourd'hui une seule langue est disponible et l'argument est optionnel.
 *  Le jour où il y en aura plusieurs, la langue viendra du segment d'URL et
 *  cette fonction sera le seul point à modifier. */
export function dictionnaire(langue: Langue = LANGUE_PAR_DEFAUT): Dictionnaire {
  return DICTIONNAIRES[langue] ?? DICTIONNAIRES[LANGUE_PAR_DEFAUT];
}

export { fr };

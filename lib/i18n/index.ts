import { fr } from "./fr";
import { en } from "./en";

/** Le français fait référence : toute autre langue fournit exactement les
 *  mêmes clés, avec les mêmes signatures. TypeScript le vérifie. */
export type Dictionnaire = typeof fr;

const DICTIONNAIRES = { fr, en };

export const LANGUES = ["fr", "en"] as const;
export type Langue = (typeof LANGUES)[number];
export const LANGUE_PAR_DEFAUT: Langue = "fr";

export function estLangue(valeur: string): valeur is Langue {
  return (LANGUES as readonly string[]).includes(valeur);
}

export function dictionnaire(langue: Langue = LANGUE_PAR_DEFAUT): Dictionnaire {
  return DICTIONNAIRES[langue] ?? DICTIONNAIRES[LANGUE_PAR_DEFAUT];
}

export { fr, en };

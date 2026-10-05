import { fr } from "./fr";
import { en } from "./en";

/** Le français est la référence fonctionnelle ; la vérification stricte des
 * chaînes exactes est plus coûteuse que utile pour un dictionnaire qui doit
 * accueillir plusieurs locales, donc on garde un type proprement générique. */
export type Dictionnaire = Record<string, any>;

const DICTIONNAIRES = { fr, en } as const;

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

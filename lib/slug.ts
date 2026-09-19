/** Transforme un libellé de catégorie en segment d'URL.
 *  « Géographie & 26 provinces » devient « geographie-26-provinces ».
 *  La catégorie reste identifiée par son libellé en base ; le slug n'est
 *  qu'une commodité d'URL, résolue par comparaison. */
export function slugifier(libelle: string): string {
  return libelle
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Les niveaux sont une donnée du domaine, pas du texte : leurs libellés
 *  visibles vivent dans le dictionnaire (lib/i18n). */
export const NIVEAUX = ["facile", "moyen", "difficile"] as const;
export type Niveau = (typeof NIVEAUX)[number];

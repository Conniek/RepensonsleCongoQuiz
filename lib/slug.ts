/** Les niveaux sont une donnée du domaine. Leurs libellés visibles vivent
 *  dans le dictionnaire (lib/i18n).
 *
 *  Les catégories, elles, n'ont plus de slug calculé côté client : leur
 *  identifiant est stable en base et leur slug est une colonne, par langue.
 *  C'est ce qui permet de renommer un libellé sans casser ni les URL ni
 *  l'historique des joueurs. */
export const NIVEAUX = ["facile", "moyen", "difficile"] as const;
export type Niveau = (typeof NIVEAUX)[number];

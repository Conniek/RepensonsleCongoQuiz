/** Adaptateur entre les données de l'application et les composants portés
 *  du prototype.
 *
 *  Le prototype parle de `Category.stars.easy`, l'application de lignes dans
 *  la table `maitrise`. Plutôt que de tordre l'un ou l'autre, on traduit ici,
 *  à un seul endroit. Les composants restent fidèles au prototype, et le jour
 *  où une RPC change de forme, ce fichier est le seul à reprendre.
 *
 *  Rien ici ne DÉCIDE quoi que ce soit : l'accès à un contenu payant et le
 *  déverrouillage d'un niveau restent tranchés par le serveur. Ce que ces
 *  fonctions calculent ne sert qu'à l'affichage. */

import type { Niveau } from "@/lib/slug";
import type { CardTone } from "@/ui";

/* ------------------------------------------------------------------ */
/* Ce que renvoie la base                                              */
/* ------------------------------------------------------------------ */

export type CategorieSource = {
  categorie_id: string;
  libelle: string;
  slug: string;
  nb_questions: number;
  produit_requis: string | null;
  illustration?: string | null;
};

export type MaitriseSource = {
  categorie_id: string;
  niveau: "facile" | "moyen" | "difficile";
  etoiles: number;
};

/* ------------------------------------------------------------------ */
/* Ce qu'attendent les composants                                      */
/* ------------------------------------------------------------------ */

export type VueCategorie = {
  id: string;
  slug: string;
  libelle: string;
  nbQuestions: number;
  illustration: string | null;
  produitRequis: string | null;
  accessible: boolean;
  etoiles: { facile: number; moyen: number; difficile: number };
  /** Somme des trois niveaux, deux étoiles par niveau au maximum. */
  etoilesTotal: number;
  /** Avancement en pourcentage, pour la barre de la carte. */
  avancement: number;
  /** Teinte de la carte, stable pour une catégorie donnée. C'est un NOM, pas
   *  une classe : le design system seul sait à quoi il correspond. */
  teinte: CardTone;
};

export const ETOILES_MAX = 6;

/** Six pastels, attribués par rang d'affichage. La couleur reste la même
 *  d'un écran à l'autre tant que l'ordre des catégories ne change pas ;
 *  l'ordre vient de la base, il est donc stable.
 *
 *  Ce sont des noms de teintes, pas des classes : la correspondance vit dans
 *  ui/Card.tsx, où les classes sont écrites en entier pour que Tailwind les
 *  génère. */
const PASTELS = [
  "pastel-bleu",
  "pastel-ocre",
  "pastel-rose",
  "pastel-vert",
  "pastel-violet",
  "pastel-menthe",
] as const;

/** Un droit sur un parcours de langue est aussi couvert par le pack. */
export function aLeDroit(produitRequis: string | null, droits: string[]): boolean {
  if (produitRequis === null) return true;
  if (droits.includes(produitRequis)) return true;
  return produitRequis.startsWith("langue_") && droits.includes("pack_langues");
}

/** Le niveau suivant s'ouvre à deux étoiles sur le précédent. C'est la même
 *  règle que `niveau_debloque` côté serveur, recopiée ici pour griser le
 *  bouton. Le serveur refusera de toute façon une partie prématurée. */
export function niveauOuvert(vue: VueCategorie, niveau: Niveau): boolean {
  if (niveau === "facile") return true;
  if (niveau === "moyen") return vue.etoiles.facile >= 2;
  return vue.etoiles.moyen >= 2;
}

export function vueCategories(
  categories: CategorieSource[],
  maitrise: MaitriseSource[] = [],
  droits: string[] = []
): VueCategorie[] {
  return categories.map((c, index) => {
    const pour = (niveau: MaitriseSource["niveau"]) =>
      maitrise.find((m) => m.categorie_id === c.categorie_id && m.niveau === niveau)
        ?.etoiles ?? 0;

    const etoiles = {
      facile: pour("facile"),
      moyen: pour("moyen"),
      difficile: pour("difficile"),
    };
    const total = etoiles.facile + etoiles.moyen + etoiles.difficile;

    return {
      id: c.categorie_id,
      slug: c.slug,
      libelle: c.libelle,
      nbQuestions: c.nb_questions,
      illustration: c.illustration ?? null,
      produitRequis: c.produit_requis,
      accessible: aLeDroit(c.produit_requis, droits),
      etoiles,
      etoilesTotal: total,
      avancement: Math.round((100 * total) / ETOILES_MAX),
      teinte: PASTELS[index % PASTELS.length],
    };
  });
}

/** Les trois familles affichées séparément sur la page Quiz. */
export function trierParFamille(vues: VueCategorie[]) {
  return {
    libres: vues.filter((v) => v.produitRequis === null),
    plus: vues.filter((v) => v.produitRequis === "plus"),
    langues: vues.filter((v) => v.produitRequis?.startsWith("langue_") ?? false),
  };
}

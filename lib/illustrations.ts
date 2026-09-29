/** Où trouver l'illustration d'une catégorie.
 *
 *  Deux sources, dans cet ordre :
 *    1. un fichier téléversé depuis le back-office, dont on stocke le chemin
 *       dans `categorie.illustration` ;
 *    2. à défaut, un fichier livré avec le code.
 *
 *  On garde le chemin en base plutôt que l'URL complète : le jour où le
 *  domaine de stockage change, il n'y a rien à réécrire dans les données. */

export const BUCKET_CATEGORIES = "categories";

/** URL publique d'un objet du bucket. Le bucket est public en lecture, donc
 *  l'URL est stable et se met en cache par le CDN : pas de lien signé à
 *  renouveler, pas d'aller-retour serveur à chaque affichage. */
export function urlBucket(chemin: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/${BUCKET_CATEGORIES}/${chemin}`;
}

/** L'illustration à afficher pour une catégorie. */
export function urlIllustration(slug: string, illustration?: string | null): string {
  if (illustration) return urlBucket(illustration);
  return `/images/categories/${slug}.avif`;
}

/** Nom de fichier au dépôt : le slug, plus un horodatage.
 *
 *  L'horodatage sert de cache-buster. Sans lui, remplacer l'image d'une
 *  catégorie garderait l'ancienne version affichée tant que le CDN n'a pas
 *  expiré, et l'équipe éditoriale croirait que le téléversement a échoué. */
export function nomFichierIllustration(slug: string, type: string): string {
  const extension = type === "image/webp" ? "webp" : "avif";
  return `${slug}-${Date.now()}.${extension}`;
}

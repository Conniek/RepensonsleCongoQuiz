import { urlIllustration } from "@/lib/illustrations";

/** Visuel d'une carte de catégorie.
 *
 *  Trois niveaux, du plus spécifique au plus robuste :
 *    1. l'illustration téléversée depuis le back-office (`illustration`) ;
 *    2. sinon le fichier livré avec le code, `/images/categories/<slug>.avif` ;
 *    3. et dans tous les cas l'aplat de couleur du CSS, visible dessous.
 *
 *  Le troisième niveau est ce qui rend l'ensemble sûr : si le fichier
 *  statique n'existe pas encore pour une catégorie, l'image ne s'affiche pas
 *  mais la carte garde sa couleur et sa hauteur. Rien ne casse, rien ne saute.
 *
 *  `alt=""` est volontaire : le nom de la catégorie est juste à côté, dans le
 *  titre. Décrire l'image ferait entendre ce nom deux fois à un lecteur
 *  d'écran, sans rien apporter.
 */
export default function CarteVisuel({
  slug,
  illustration,
  prioritaire = false,
}: {
  slug: string;
  illustration?: string | null;
  /** Vrai pour les premières cartes de l'écran : elles sont visibles tout de
   *  suite, donc leur chargement ne doit pas être différé. */
  prioritaire?: boolean;
}) {
  const src = urlIllustration(slug, illustration);

  return (
    <div className="carte-visuel">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        width={640}
        height={400}
        loading={prioritaire ? "eager" : "lazy"}
        fetchPriority={prioritaire ? "high" : "auto"}
        decoding="async"
      />
    </div>
  );
}

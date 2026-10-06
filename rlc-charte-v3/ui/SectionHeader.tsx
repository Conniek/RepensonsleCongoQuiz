import Link from "next/link";

/** Titre de section, avec un lien « Voir tout » facultatif.
 *
 *  Le niveau de titre est un réglage : une section n'est pas toujours au
 *  même étage du plan de la page, et sauter un niveau casse la navigation
 *  par titres. */
export default function SectionHeader({
  id,
  title,
  level = 2,
  linkHref,
  linkLabel,
  linkDescription,
}: {
  id?: string;
  title: string;
  level?: 2 | 3;
  linkHref?: string;
  linkLabel?: string;
  /** Phrase complète lue à la place du libellé court, du type « Voir les 12
   *  catégories ». Sans elle, une page pleine de « Voir tout » est illisible
   *  au lecteur d'écran. */
  linkDescription?: string;
}) {
  const Titre = level === 2 ? "h2" : "h3";

  return (
    <div className="flex items-center justify-between gap-3">
      <Titre id={id} className="m-0">
        {title}
      </Titre>

      {linkHref && linkLabel && (
        <Link href={linkHref} className="text-sm shrink-0">
          <span aria-hidden="true">{linkLabel}</span>
          <span className="visuellement-masque">{linkDescription ?? linkLabel}</span>
        </Link>
      )}
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { dictionnaire, estLangue, LANGUES } from "@/lib/i18n";
import "./splash.css";

export async function generateStaticParams() {
  return LANGUES.map((langue) => ({ langue }));
}

/* Pictos pleins, dessinés en SVG : aucune dépendance, couleur via currentColor. */
const Pictos = {
  histoire: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11 5.6C9.2 4.4 6.6 4 3.5 4.3A1 1 0 0 0 2.6 5.3V17a1 1 0 0 0 1.1 1c3-.2 5.4.2 7.3 1.4V5.6Z" />
      <path d="M13 5.6c1.8-1.2 4.4-1.6 7.5-1.3a1 1 0 0 1 .9 1V17a1 1 0 0 1-1.1 1c-3-.2-5.4.2-7.3 1.4V5.6Z" />
    </svg>
  ),
  geographie: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2c.9 0 1.8.2 2.6.5-.4.6-1 .9-1.6 1.2-.8.4-1.3 1.3-.9 2.2.3.7 1.1 1 1.8.8l1.2-.3c.8-.2 1.5.5 1.3 1.3l-.2.7c-.2.8.4 1.6 1.2 1.6h1.5A8 8 0 0 1 16 18.9V17c0-.8-.6-1.5-1.4-1.6l-1.8-.3a1.7 1.7 0 0 1-1.4-1.6v-.8c0-.9-.7-1.6-1.6-1.7l-2.2-.2a1.7 1.7 0 0 1-1.5-1.5l-.1-.8A8 8 0 0 1 12 4Zm-7.9 8.9 1.6.4c.8.2 1.4.9 1.4 1.7v.6c0 .5.2 1 .6 1.3l.9.8c.4.3.6.8.6 1.3v1.9a8 8 0 0 1-5.1-8Z" />
    </svg>
  ),
  musique: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 3.2a1 1 0 0 0-1.2-1L9.3 4.1a1 1 0 0 0-.8 1V15a3.5 3.5 0 1 0 2 3.2V9.3l7.5-1.5v5.4a3.5 3.5 0 1 0 2 3.2V3.2Z" />
    </svg>
  ),
  nature: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.6 3.4a1 1 0 0 0-1-.4C11.4 4.2 6 7.8 5.1 13.4c-.3 1.6-.1 3.1.4 4.4l-2.2 2.5a1 1 0 1 0 1.5 1.3l2.1-2.4c1.2.6 2.6.9 4.1.8 6-.4 9.3-6.3 9.8-15.6a1 1 0 0 0-.2-1ZM8.4 17.4c1.9-3.3 4.6-6 8-8a1 1 0 1 0-1-1.7c-3.5 2-6.4 4.8-8.4 8.2-.2-.8-.2-1.6-.1-2.4C7.6 9.3 11.6 6.3 18.5 5.2c-.6 7.6-3.4 12-7.8 12.3-.8 0-1.6 0-2.3-.1Z" />
    </svg>
  ),
  economie: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="13" width="4.5" height="8" rx="1.2" />
      <rect x="9.75" y="8" width="4.5" height="13" rx="1.2" />
      <rect x="16.5" y="3" width="4.5" height="18" rx="1.2" />
    </svg>
  ),
} as const;

const CATEGORIES = ["histoire", "geographie", "musique", "nature", "economie"] as const;

export default async function Splash({
  params,
}: {
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();
  const t = dictionnaire(langue);

  return (
    <div className="splash">
      {/* Sélecteur de langue : <details> natif, fonctionne sans JavaScript */}
      <details className="splash-langue">
        <summary aria-label={`${t.splash.choisirLangue} (${langue.toUpperCase()})`}>
          <svg viewBox="0 0 24 24" aria-hidden="true" className="splash-langue-globe">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9M12 3c-2.5 2.5-3.8 5.5-3.8 9s1.3 6.5 3.8 9" />
          </svg>
          <span>{langue.toUpperCase()}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true" className="splash-langue-chevron">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </summary>
        <ul>
          {LANGUES.map((l) => (
            <li key={l}>
              <Link
                href={`/${l}/splash`}
                hrefLang={l}
                aria-current={l === langue ? "true" : undefined}
              >
                {l.toUpperCase()}
              </Link>
            </li>
          ))}
        </ul>
      </details>

      <div className="splash-contenu">
        {/* Le logo contient déjà le nom : alt vide pour ne pas le lire deux fois avec le h1 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="splash-logo"
          src="/images/logo-repensons.png"
          alt=""
          width={480}
          height={480}
          fetchPriority="high"
        />

        <h1 className="splash-titre">{t.marque.nom}</h1>
        <p className="splash-sous-titre">{t.splash.sousTitre}</p>

        <div className="splash-filet" aria-hidden="true">
          <span /><span /><span />
        </div>

        <p className="splash-texte">{t.splash.paragraphe}</p>

        <ul className="splash-categories" aria-label={t.splash.apercuCategories}>
          {CATEGORIES.map((cle) => (
            <li key={cle} className={`splash-cat splash-cat--${cle}`}>
              <span className="splash-cat-picto">{Pictos[cle]}</span>
              <span className="splash-cat-nom">{t.splash.categories[cle]}</span>
            </li>
          ))}
        </ul>

        <Link href={`/${langue}`} className="splash-cta">
          {t.splash.cta}
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

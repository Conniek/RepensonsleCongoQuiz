import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dictionnaire, estLangue, LANGUES, type Langue } from "@/lib/i18n";
import "../lecture.css";

/** Racine de l'application. Il n'y a pas de app/layout.tsx : quand toutes
 *  les routes vivent sous un segment de langue, c'est ce fichier qui porte
 *  <html> et <body>, et l'attribut lang devient enfin dynamique. */

export async function generateStaticParams() {
  return LANGUES.map((langue) => ({ langue }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ langue: string }>;
}): Promise<Metadata> {
  const { langue } = await params;
  if (!estLangue(langue)) return {};
  const t = dictionnaire(langue);
  return {
    title: { default: t.accueil.titrePage, template: `%s — ${t.marque.nom}` },
    description: t.marque.descriptionMeta,
    alternates: {
      canonical: `/${langue}`,
      languages: Object.fromEntries(LANGUES.map((l) => [l, `/${l}`])),
    },
  };
}

export default async function LangueLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();
  const t = dictionnaire(langue);
  const autres = LANGUES.filter((l) => l !== langue);

  return (
    <html lang={langue}>
      <body>
        <nav aria-label={t.navigation.accesRapide} className="evitement">
          <ul>
            <li><a href="#contenu">{t.navigation.allerAuContenu}</a></li>
          </ul>
        </nav>

        <header aria-label={t.marque.nom}>
          <p><Link href={`/${langue}`}>{t.marque.nom}</Link></p>

          <nav aria-label={t.navigation.principale}>
            <ul>
              <li><Link href={`/${langue}`}>{t.navigation.accueil}</Link></li>
              <li><Link href={`/${langue}/profil`}>{t.navigation.profil}</Link></li>
            </ul>
          </nav>

          {/* Le sélecteur renvoie vers l'accueil de l'autre langue, pas vers
              la page équivalente : les slugs diffèrent par langue, et une
              catégorie peut ne pas être traduite. */}
          <nav aria-label={t.langues.choisir} className="selecteur-langue">
            <ul>
              {autres.map((l) => (
                <li key={l}>
                  <Link href={`/${l}`} hrefLang={l} lang={l}>
                    {dictionnaire(l).langues[l]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <main id="contenu">{children}</main>

        <footer aria-label={t.navigation.infosSite}>
          <nav aria-label={t.navigation.secondaire}>
            <ul>
              <li><Link href={`/${langue}/a-propos`}>{t.navigation.aPropos}</Link></li>
              <li><Link href={`/${langue}/accessibilite`}>{t.navigation.accessibilite}</Link></li>
            </ul>
          </nav>
        </footer>
      </body>
    </html>
  );
}

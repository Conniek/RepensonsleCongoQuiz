import type { Metadata } from "next";
import Link from "next/link";
import { dictionnaire, LANGUE_PAR_DEFAUT } from "@/lib/i18n";
import "./lecture.css";

const t = dictionnaire();

export const metadata: Metadata = {
  title: { default: t.accueil.titrePage, template: `%s — ${t.marque.nom}` },
  description: t.marque.descriptionMeta,
};

export default function RacineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={LANGUE_PAR_DEFAUT}>
      <body>
        <nav aria-label={t.navigation.accesRapide} className="evitement">
          <ul>
            <li><a href="#contenu">{t.navigation.allerAuContenu}</a></li>
          </ul>
        </nav>

        <header aria-label={t.marque.nom}>
          <p><Link href="/">{t.marque.nom}</Link></p>
          <nav aria-label={t.navigation.principale}>
            <ul>
              <li><Link href="/">{t.navigation.accueil}</Link></li>
              <li><Link href="/profil">{t.navigation.profil}</Link></li>
            </ul>
          </nav>
        </header>

        <main id="contenu">{children}</main>

        <footer aria-label={t.navigation.infosSite}>
          <nav aria-label={t.navigation.secondaire}>
            <ul>
              <li><Link href="/a-propos">{t.navigation.aPropos}</Link></li>
              <li><Link href="/accessibilite">{t.navigation.accessibilite}</Link></li>
            </ul>
          </nav>
        </footer>
      </body>
    </html>
  );
}

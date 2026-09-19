import type { Metadata } from "next";
import Link from "next/link";
import "./lecture.css";

export const metadata: Metadata = {
  title: {
    default: "Repensons le Congo Quiz — apprendre la RDC en jouant",
    template: "%s — Repensons le Congo Quiz",
  },
  description:
    "Repensons le Congo Quiz est une application gratuite de 1 445 questions sourcées sur la République démocratique du Congo.",
};

export default function RacineLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        {/* Liens d'évitement : premiers éléments focusables du document. */}
        <nav aria-label="Accès rapide" className="evitement">
          <ul>
            <li><a href="#contenu">Aller au contenu</a></li>
          </ul>
        </nav>

        <header aria-label="Repensons le Congo Quiz">
          <p><Link href="/">Repensons le Congo Quiz</Link></p>
          <nav aria-label="Navigation principale">
            <ul>
              <li><Link href="/profil">Profil</Link></li>
            </ul>
          </nav>
        </header>

        <main id="contenu">{children}</main>

        <footer aria-label="Informations sur le site">
          <nav aria-label="Navigation secondaire">
            <ul>
              <li><Link href="/a-propos">À propos du projet</Link></li>
              <li><Link href="/accessibilite">Déclaration d’accessibilité</Link></li>
            </ul>
          </nav>
        </footer>
      </body>
    </html>
  );
}

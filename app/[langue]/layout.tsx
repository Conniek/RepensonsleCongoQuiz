import type { Metadata } from "next";
import { Nunito, Outfit  } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dictionnaire, estLangue, LANGUES } from "@/lib/i18n";
import Barre from "./barre";
/* Une seule famille, Nunito Sans, en fonte variable : toutes les
   graisses tiennent dans un seul fichier, donc un seul téléchargement.
   next/font la récupère au build et la sert depuis notre domaine : aucun
   appel à Google pendant la visite, rien à déclarer côté RGPD.
   `display: swap` affiche le texte immédiatement dans la police système
   puis bascule : jamais d'écran vide en attendant la police. */
const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
});

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

/* L'ordre compte : Tailwind d'abord, puis les feuilles existantes, qui
   gardent ainsi la priorité sur les utilitaires pendant toute la refonte. */
import "../styles/tailwind.css";
import "../styles/jetons.css";
import "../styles/habillage.css";

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
  children, params,
}: {
  children: React.ReactNode;
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();
  const t = dictionnaire(langue);

  return (
    <html lang={langue} className={nunito.variable}>
      <body>
        <nav aria-label={t.navigation.accesRapide} className="evitement">
          <ul>
            <li><a href="#contenu">{t.navigation.allerAuContenu}</a></li>
          </ul>
        </nav>

        <main id="contenu">{children}</main>

        <Barre langue={langue} />

      </body>
    </html>
  );
}
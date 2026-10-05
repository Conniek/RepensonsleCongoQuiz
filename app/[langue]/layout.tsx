import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dictionnaire, estLangue, LANGUES } from "@/lib/i18n";
import Barre from "./barre";
/* Poppins, comme la charte Instagram : les titres en 800, le texte en 500.
   L'export Figma importe aussi Bebas Neue, mais ne l'applique nulle part :
   sa règle `.font-display` renvoie vers Poppins. On ne charge donc pas une
   police que personne n'utilise. */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-poppins",
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
    <html lang={langue} className={poppins.variable}>
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
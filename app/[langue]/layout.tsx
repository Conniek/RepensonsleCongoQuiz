import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dictionnaire, estLangue, LANGUES } from "@/lib/i18n";
import Barre from "./barre";
import Footer from "./footer";
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
      canonical: `/${langue}/home`,
      languages: Object.fromEntries(LANGUES.map((l) => [l, `/${l}/home`])),
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
    <html lang={langue}>
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
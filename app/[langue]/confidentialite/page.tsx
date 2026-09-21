import Link from "next/link";
import { notFound } from "next/navigation";
import { dictionnaire, estLangue, LANGUES } from "@/lib/i18n";
import "../conditions/legal.css";

export async function generateStaticParams() {
  return LANGUES.map((langue) => ({ langue }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) return {};
  return { title: dictionnaire(langue).confidentialite.titre };
}

export default async function PageConfidentialite({
  params,
}: {
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();
  const t = dictionnaire(langue);
  const { confidentialite } = t;

  return (
    <>
      <nav aria-label={t.navigation.filAriane}>
        <ol className="ariane">
          <li><Link href={`/${langue}`}>{t.navigation.accueil}</Link></li>
          <li aria-current="page">{confidentialite.titre}</li>
        </ol>
      </nav>

      <h1 tabIndex={-1}>{confidentialite.titre}</h1>
      <p className="intro-legal">{confidentialite.intro}</p>

      <div className="contenu-legal">
        {confidentialite.sections.map((section, idx) => (
          <section key={idx}>
            <h2>{section.titre}</h2>
            <p>{section.contenu}</p>
          </section>
        ))}
      </div>

      <div className="contact-legal">
        <p>
          {t.navigation.accesRapide && "Des questions ? "}
          <a href={`mailto:contact@repensonslecongoqiz.app`}>
            {t.profil.feedback || "Nous contacter"}
          </a>
        </p>
      </div>
    </>
  );
}
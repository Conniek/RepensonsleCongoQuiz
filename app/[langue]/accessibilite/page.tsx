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
  return { title: dictionnaire(langue).accessibilite.titre };
}

export default async function PageAccessibilite({
  params,
}: {
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();
  const t = dictionnaire(langue);
  const { accessibilite } = t;

  return (
    <>
      <nav aria-label={t.navigation.filAriane}>
        <ol className="ariane">
          <li><Link href={`/${langue}`}>{t.navigation.accueil}</Link></li>
          <li aria-current="page">{accessibilite.titre}</li>
        </ol>
      </nav>

      <h1 tabIndex={-1}>{accessibilite.titre}</h1>
      <p className="intro-legal">{accessibilite.intro}</p>

      <div className="contenu-legal">
        {accessibilite.sections.map((section, idx) => (
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
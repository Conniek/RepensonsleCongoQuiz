import Link from "next/link";
import { notFound } from "next/navigation";
import { creerClientServeur } from "@/lib/supabase/serveur";
import { dictionnaire, estLangue } from "@/lib/i18n";

/** Garde d'accès, côté serveur. Le rôle est vérifié en base : masquer un
 *  lien ne protège rien, les politiques refusent de toute façon lectures et
 *  écritures à qui n'est pas éditeur. */
export default async function AdminLayout({
  children, params,
}: {
  children: React.ReactNode;
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();
  const t = dictionnaire(langue);

  const supabase = await creerClientServeur();
  const [{ data: editeur }, { data: admin }] = await Promise.all([
    supabase.rpc("est_editeur"),
    supabase.rpc("est_admin"),
  ]);

  if (!editeur) {
    return (
      <>
        <h1 tabIndex={-1}>{t.admin.titre}</h1>
        <p role="alert">{t.admin.accesRefuse}</p>
      </>
    );
  }

  return (
    <>
      <nav aria-label={t.admin.acces}>
        <ul className="ariane">
          <li><Link href={`/${langue}/admin`}>{t.admin.tableauDeBord}</Link></li>
          <li><Link href={`/${langue}/admin/questions`}>{t.admin.questions}</Link></li>
          <li><Link href={`/${langue}/admin/recalibration`}>{t.admin.recalibration}</Link></li>
          <li><Link href={`/${langue}/admin/quiz-speciaux`}>{t.contenu.quizSpeciaux}</Link></li>
          <li><Link href={`/${langue}/admin/campagnes`}>{t.contenu.campagnes}</Link></li>
          <li><Link href={`/${langue}/admin/analyse`}>{t.analyse.titre}</Link></li>
          {/* Les inscrits ne sont visibles que des administrateurs : les
              éditeurs suivent la popularité, pas les données de compte. */}
          {admin && (
            <li><Link href={`/${langue}/admin/inscrits`}>{t.inscrits.titre}</Link></li>
          )}
        </ul>
      </nav>
      {children}
    </>
  );
}

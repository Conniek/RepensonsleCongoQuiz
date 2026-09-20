import { notFound } from "next/navigation";
import { creerClientServeur } from "@/lib/supabase/serveur";
import { dictionnaire, estLangue } from "@/lib/i18n";
import Inscrits from "./inscrits";

export const dynamic = "force-dynamic";

export default async function PageInscrits({
  params,
}: {
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();
  const t = dictionnaire(langue);

  const supabase = await creerClientServeur();
  const { data: admin } = await supabase.rpc("est_admin");

  if (!admin) {
    return (
      <>
        <h1 tabIndex={-1}>{t.inscrits.titre}</h1>
        <p role="alert">{t.inscrits.reserveAdmin}</p>
      </>
    );
  }

  return (
    <>
      <h1 tabIndex={-1}>{t.inscrits.titre}</h1>
      <p>{t.inscrits.intro}</p>
      <Inscrits langue={langue} />
    </>
  );
}

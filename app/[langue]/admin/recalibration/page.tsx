import { notFound } from "next/navigation";
import Recalibration from "./recalibration";
import { dictionnaire, estLangue } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function PageRecalibration({
  params,
}: {
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();
  const t = dictionnaire(langue);

  return (
    <>
      <h1 tabIndex={-1}>{t.admin.titreRecalibration}</h1>
      <p>{t.admin.introRecalibration}</p>
      <p className="note">{t.admin.compteursRemisAZero}</p>
      <Recalibration langue={langue} />
    </>
  );
}

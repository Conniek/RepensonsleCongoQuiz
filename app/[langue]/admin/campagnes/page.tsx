import { notFound } from "next/navigation";
import { dictionnaire, estLangue } from "@/lib/i18n";
import Campagnes from "./campagnes";

export const dynamic = "force-dynamic";

export default async function PageCampagnes({
  params,
}: {
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();
  const t = dictionnaire(langue);

  return (
    <>
      <h1 tabIndex={-1}>{t.contenu.campagnes}</h1>
      <p>{t.contenu.introCampagnes}</p>
      <Campagnes langue={langue} />
    </>
  );
}

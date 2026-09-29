import { notFound } from "next/navigation";
import { dictionnaire, estLangue } from "@/lib/i18n";
import IllustrationsClient from "./illustrations-client";

/* Dépend du compte connecté : jamais de mise en cache partagée. */
export const dynamic = "force-dynamic";

export default async function PageIllustrations({
  params,
}: {
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();
  const t = dictionnaire(langue);

  return (
    <>
      <h1 tabIndex={-1}>{t.illustrations.titre}</h1>
      <IllustrationsClient langue={langue} />
    </>
  );
}

import { notFound } from "next/navigation";
import EditionQuestion from "./edition";
import { dictionnaire, estLangue } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function PageEdition({
  params,
}: {
  params: Promise<{ langue: string; id: string }>;
}) {
  const { langue, id } = await params;
  if (!estLangue(langue)) notFound();
  const t = dictionnaire(langue);

  return (
    <>
      <h1 tabIndex={-1}>{t.admin.titreEdition}</h1>
      <EditionQuestion langue={langue} questionId={id} />
    </>
  );
}

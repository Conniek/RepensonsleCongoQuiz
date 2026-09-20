import { notFound } from "next/navigation";
import { dictionnaire, estLangue } from "@/lib/i18n";
import QuizSpeciaux from "./quiz-speciaux";

export const dynamic = "force-dynamic";

export default async function PageQuizSpeciaux({
  params,
}: {
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();
  const t = dictionnaire(langue);

  return (
    <>
      <h1 tabIndex={-1}>{t.contenu.quizSpeciaux}</h1>
      <p>{t.contenu.introQuizSpeciaux}</p>
      <QuizSpeciaux langue={langue} />
    </>
  );
}

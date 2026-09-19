import { Suspense } from "react";
import { notFound } from "next/navigation";
import Jeu from "./jeu";
import type { Niveau } from "@/lib/slug";
import { dictionnaire, estLangue } from "@/lib/i18n";

export const metadata = { title: "Quiz" };

export default async function PagePartie({
  params, searchParams,
}: {
  params: Promise<{ langue: string }>;
  searchParams: Promise<{ categorie?: string; niveau?: string; mode?: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();
  const t = dictionnaire(langue);
  const { categorie, niveau, mode } = await searchParams;

  if (!categorie || !niveau) {
    return (
      <>
        <h1>{t.partie.titrePage}</h1>
        <p role="alert">{t.partie.parametreManquant}</p>
      </>
    );
  }

  return (
    <Suspense fallback={<p>{t.partie.preparation}</p>}>
      <Jeu langue={langue} categorieId={categorie} niveau={niveau as Niveau}
           mode={mode === "defi_du_jour" ? "defi_du_jour" : "solo"} />
    </Suspense>
  );
}

import { Suspense } from "react";
import Jeu from "./jeu";
import type { Niveau } from "@/lib/slug";
import { dictionnaire } from "@/lib/i18n";

const t = dictionnaire();

export const metadata = { title: t.partie.titrePage };

export default async function PagePartie({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string; niveau?: string; mode?: string }>;
}) {
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
      <Jeu
        categorie={categorie}
        niveau={niveau as Niveau}
        mode={mode === "defi_du_jour" ? "defi_du_jour" : "solo"}
      />
    </Suspense>
  );
}

import { Suspense } from "react";
import Jeu from "./jeu";
import type { Niveau } from "@/lib/slug";

export const metadata = { title: "Partie en cours" };

export default async function PagePartie({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string; niveau?: string }>;
}) {
  const { categorie, niveau } = await searchParams;

  if (!categorie || !niveau) {
    return (
      <>
        <h1>Partie</h1>
        <p role="alert">Catégorie ou niveau manquant.</p>
      </>
    );
  }

  return (
    <Suspense fallback={<p>Préparation de la partie…</p>}>
      <Jeu categorie={categorie} niveau={niveau as Niveau} />
    </Suspense>
  );
}

import { notFound } from "next/navigation";
import { estLangue } from "@/lib/i18n";
import Planche from "./planche";

/* Planche de styles du design system.
   Page de travail : non indexée, et destinée à rester hors de la navigation.
   Elle sert à voir toutes les briques d'un coup quand on touche aux jetons. */
export const metadata = { robots: { index: false } };

export default async function PageDesignSystem({
  params,
}: {
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();
  return <Planche />;
}

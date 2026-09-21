import { notFound } from "next/navigation";
import { dictionnaire, estLangue } from "@/lib/i18n";
import Historique from "./historique";

export async function generateMetadata({ params }: { params: Promise<{ langue: string }> }) {
  const { langue } = await params;
  if (!estLangue(langue)) return {};
  return { title: dictionnaire(langue).historique.titre };
}

export default async function PageHistorique({ params }: { params: Promise<{ langue: string }> }) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();
  return <Historique langue={langue} />;
}

import { notFound } from "next/navigation";
import CompteClient from "./compte-client";
import { dictionnaire, estLangue } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) return {};
  const t = dictionnaire(langue);
  return { title: t.compte.titre, description: t.compte.descriptionMeta };
}

export default async function PageCompte({
  params,
}: {
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();
  return <CompteClient langue={langue} />;
}

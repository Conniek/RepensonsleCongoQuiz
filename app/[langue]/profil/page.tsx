import { notFound } from "next/navigation";
import ProfilClient from "./profil-client";
import { dictionnaire, estLangue } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) return {};
  const t = dictionnaire(langue);
  return { title: t.profil.titre, description: t.profil.descriptionMeta };
}

export default async function PageProfil({
  params,
}: {
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();
  return <ProfilClient langue={langue} />;
}

import { notFound } from "next/navigation";
import { dictionnaire, estLangue } from "@/lib/i18n";
import PageProgressionClient from "./progression-client";

export async function generateMetadata({ params }: { params: Promise<{ langue: string }> }) {
  const { langue } = await params;
  if (!estLangue(langue)) return {};
  return { title: dictionnaire(langue).pageProgression.titre };
}

export default async function PageProgression({ params }: { params: Promise<{ langue: string }> }) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();
  return <PageProgressionClient langue={langue} />;
}

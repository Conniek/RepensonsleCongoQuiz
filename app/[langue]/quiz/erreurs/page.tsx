import { notFound } from "next/navigation";
import { dictionnaire, estLangue } from "@/lib/i18n";
import Erreurs from "./erreurs";

export async function generateMetadata({ params }: { params: Promise<{ langue: string }> }) {
  const { langue } = await params;
  if (!estLangue(langue)) return {};
  return { title: dictionnaire(langue).erreurs.titre };
}

export default async function PageErreurs({ params }: { params: Promise<{ langue: string }> }) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();
  return <Erreurs langue={langue} />;
}

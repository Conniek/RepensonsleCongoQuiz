import { notFound } from "next/navigation";
import { estLangue } from "@/lib/i18n";
import "../../styles/jetons.css";

/**
 * Layout spécifique pour la splash screen.
 * Pas de barre de navigation, pas de footer, juste le contenu plein écran.
 */
export default async function SplashLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();

  return (
    <>{children}</>
   
  );
}
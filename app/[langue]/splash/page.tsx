import { notFound } from "next/navigation";
import { creerClientServeur } from "@/lib/supabase/serveur";
import { dictionnaire, estLangue } from "@/lib/i18n";
import Carrousel from "./carrousel";
import "./splash.css";

/* Le branchement dépend de la session : pas de pré-rendu statique ici. */
export const dynamic = "force-dynamic";

export default async function Splash({
  params,
}: {
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();
  const t = dictionnaire(langue);

  /* Première visite = profil sans pseudo. On interroge le serveur plutôt que
     le navigateur : un indicateur local se vide au premier nettoyage de cache
     et renverrait un habitué sur l'inscription. */
  const supabase = await creerClientServeur();
  const { data: auth } = await supabase.auth.getUser();

  let premiereVisite = true;
  if (auth.user) {
    const { data: profil } = await supabase
      .from("profil")
      .select("pseudo")
      .eq("id", auth.user.id)
      .maybeSingle();
    premiereVisite = !profil?.pseudo;
  }

  return (
    <div className="splash">
      <Carrousel
        langue={langue}
        premiereVisite={premiereVisite}
        slides={t.splash.slides}
      />
    </div>
  );
}

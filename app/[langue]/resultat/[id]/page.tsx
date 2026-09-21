import Link from "next/link";
import { notFound } from "next/navigation";
import { creerClientServeur } from "@/lib/supabase/serveur";
import { dictionnaire, estLangue } from "@/lib/i18n";
import type { Niveau } from "@/lib/slug";

export const metadata = { title: "Résultat" };

export default async function PageResultat({
  params,
}: {
  params: Promise<{ langue: string; id: string }>;
}) {
  const { langue, id } = await params;
  if (!estLangue(langue)) notFound();
  const t = dictionnaire(langue);
  const supabase = await creerClientServeur();

  // La politique de sécurité garantit qu'on ne lit que ses propres parties.
  const { data: partie } = await supabase
    .from("partie").select("*").eq("id", id).single();
  if (!partie) notFound();

  const [{ data: reponses }, { data: categorie }] = await Promise.all([
    supabase.from("reponse").select("position, correcte, points")
      .eq("partie_id", id).order("position"),
    supabase.from("categorie_publique").select("libelle, slug")
      .eq("langue", langue).eq("categorie_id", partie.categorie_id).maybeSingle(),
  ]);

  const gagnee = partie.points >= 900 && partie.bonnes >= 5;
  const niveau = partie.niveau as Niveau;
  const gagnes = (partie.badges_gagnes ?? []) as string[];
  const libelle = categorie?.libelle ?? partie.categorie_id;

  return (
    <>
      <h1 tabIndex={-1}>{gagnee ? t.resultat.remportee : t.resultat.terminee}</h1>

      <section aria-labelledby="titre-score">
        <h2 id="titre-score">{t.resultat.titreScore}</h2>
        <dl>
          <dt>{t.resultat.points}</dt>
          <dd>{t.resultat.pointsValeur(partie.points)}</dd>
          <dt>{t.resultat.bonnesReponses}</dt>
          <dd>{t.resultat.bonnesValeur(partie.bonnes, partie.deck.length)}</dd>
          <dt>{t.resultat.experience}</dt>
          <dd>{t.resultat.experienceValeur(partie.xp_gagne)}</dd>
          <dt>{t.resultat.conditionVictoire}</dt>
          <dd>
            {t.resultat.conditionTexte}{" "}
            {gagnee ? t.resultat.conditionAtteinte : t.resultat.conditionNonAtteinte}
          </dd>
        </dl>
        {partie.deck_complete && <p className="note">{t.resultat.deckComplete}</p>}
        {!partie.chrono_actif && <p className="note">{t.resultat.sansChrono}</p>}
      </section>

      {gagnes.length > 0 && (
        <section aria-labelledby="titre-badges">
          <h2 id="titre-badges">{t.badges.nouveaux(gagnes.length)}</h2>
          <ul>{gagnes.map((b) => <li key={b}><strong>{b}</strong></li>)}</ul>
        </section>
      )}

      <section aria-labelledby="titre-detail">
        <h2 id="titre-detail">{t.resultat.titreDetail}</h2>
        <ol>
          {(reponses ?? []).map((r) => (
            <li key={r.position}>
              {t.resultat.ligneReponse(r.position + 1, r.correcte, r.points)}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="titre-suite">
        <h2 id="titre-suite">{t.resultat.titreSuite}</h2>
        <ul>
          <li>
            <Link href={`/${langue}/partie?categorie=${partie.categorie_id}&niveau=${niveau}`}>
              {t.resultat.rejouer(t.niveaux[niveau])}
            </Link>
          </li>
          {categorie && (
            <li>
              <Link href={`/${langue}/categorie/${categorie.slug}`}>
                {t.partie.retourCategorie(libelle)}
              </Link>
            </li>
          )}
          <li><Link href={`/${langue}/profil`}>{t.resultat.voirProgression}</Link></li>
          <li><Link href={`/${langue}/home`}>{t.commun.retourAccueil}</Link></li>
        </ul>
      </section>
    </>
  );
}

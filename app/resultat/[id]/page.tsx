import Link from "next/link";
import { notFound } from "next/navigation";
import { creerClientServeur } from "@/lib/supabase/serveur";
import { slugifier, type Niveau } from "@/lib/slug";
import { dictionnaire } from "@/lib/i18n";

const t = dictionnaire();

export const metadata = { title: t.resultat.titrePage };

export default async function PageResultat({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await creerClientServeur();

  // La politique de sécurité garantit qu'on ne lit que ses propres parties.
  const { data: partie } = await supabase
    .from("partie")
    .select("*")
    .eq("id", id)
    .single();

  if (!partie) notFound();

  const { data: reponses } = await supabase
    .from("reponse")
    .select("position, correcte, points")
    .eq("partie_id", id)
    .order("position");

  const { data: badges } = await supabase
    .from("badge")
    .select("id, libelle, condition");

  const gagnee = partie.points >= 900 && partie.bonnes >= 5;
  const niveau = partie.niveau as Niveau;
  const gagnes = (partie.badges_gagnes ?? []) as string[];

  return (
    <>
      <h1 tabIndex={-1}>
        {gagnee ? t.resultat.remportee : t.resultat.terminee}
      </h1>

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
            {gagnee
              ? t.resultat.conditionAtteinte
              : t.resultat.conditionNonAtteinte}
          </dd>
        </dl>

        {partie.deck_complete && <p className="note">{t.resultat.deckComplete}</p>}
        {!partie.chrono_actif && <p className="note">{t.resultat.sansChrono}</p>}
      </section>

      {gagnes.length > 0 && (
        <section aria-labelledby="titre-badges">
          <h2 id="titre-badges">{t.badges.nouveaux(gagnes.length)}</h2>
          <ul>
            {gagnes.map((idBadge) => {
              const b = badges?.find((x) => x.id === idBadge);
              return (
                <li key={idBadge}>
                  <strong>{b?.libelle ?? idBadge}</strong>
                  {b?.condition ? ` — ${b.condition}.` : ""}
                </li>
              );
            })}
          </ul>
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
            <Link
              href={`/partie?categorie=${encodeURIComponent(partie.categorie)}&niveau=${niveau}`}
            >
              {t.resultat.rejouer(t.niveaux[niveau])}
            </Link>
          </li>
          <li>
            <Link href={`/categorie/${slugifier(partie.categorie)}`}>
              {t.partie.retourCategorie(partie.categorie)}
            </Link>
          </li>
          <li>
            <Link href="/profil">{t.resultat.voirProgression}</Link>
          </li>
          <li>
            <Link href="/">{t.commun.retourAccueil}</Link>
          </li>
        </ul>
      </section>
    </>
  );
}

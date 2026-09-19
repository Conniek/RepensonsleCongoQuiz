import Link from "next/link";
import { notFound } from "next/navigation";
import { creerClientServeur } from "@/lib/supabase/serveur";
import { slugifier, LIBELLE_NIVEAU, type Niveau } from "@/lib/slug";

export const metadata = { title: "Résultat de la partie" };

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
    .select("position, correcte, points, question_id")
    .eq("partie_id", id)
    .order("position");

  const gagnee = partie.points >= 900 && partie.bonnes >= 5;
  const niveau = partie.niveau as Niveau;

  return (
    <>
      <h1 tabIndex={-1}>{gagnee ? "Partie remportée" : "Partie terminée"}</h1>

      <section aria-labelledby="titre-score">
        <h2 id="titre-score">Ton score</h2>
        <dl>
          <dt>Points</dt>
          <dd>{partie.points} points</dd>
          <dt>Bonnes réponses</dt>
          <dd>
            {partie.bonnes} sur {partie.deck.length}
          </dd>
          <dt>Condition de victoire</dt>
          <dd>
            900 points et 5 bonnes réponses sur 7.{" "}
            {gagnee ? "Atteinte." : "Non atteinte cette fois."}
          </dd>
        </dl>

        {/* Honnêteté sur le repli : si le pool était insuffisant, on le dit
            plutôt que de laisser croire que le niveau était complet. */}
        {partie.deck_complete && (
          <p className="note">
            Cette catégorie manque de questions à ce niveau. La partie a été
            complétée avec des questions de difficulté voisine.
          </p>
        )}

        {!partie.chrono_actif && (
          <p className="note">
            Chronomètre désactivé : la partie est valide, sans bonus de rapidité.
          </p>
        )}
      </section>

      <section aria-labelledby="titre-detail">
        <h2 id="titre-detail">Le détail de tes réponses</h2>
        <ol>
          {(reponses ?? []).map((r) => (
            <li key={r.position}>
              Question {r.position + 1} :{" "}
              {r.correcte ? "bonne réponse" : "mauvaise réponse"}, {r.points}{" "}
              points.
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="titre-suite">
        <h2 id="titre-suite">Et maintenant</h2>
        <ul>
          <li>
            <Link href={`/partie?categorie=${encodeURIComponent(partie.categorie)}&niveau=${niveau}`}>
              Rejouer le niveau {LIBELLE_NIVEAU[niveau].toLowerCase()}
            </Link>
          </li>
          <li>
            <Link href={`/categorie/${slugifier(partie.categorie)}`}>
              Revenir à {partie.categorie}
            </Link>
          </li>
          <li>
            <Link href="/">Revenir à l’accueil</Link>
          </li>
        </ul>
      </section>
    </>
  );
}

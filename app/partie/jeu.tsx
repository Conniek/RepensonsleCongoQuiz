"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { assurerSession } from "@/lib/session";
import type { Niveau } from "@/lib/slug";

const DUREE_MS = 15_000;

type Question = {
  id: string;
  enonce: string;
  reponses: string[];
  categorie: string;
  sous_categorie: string | null;
  difficulte: number;
  image_id: string | null;
  image_alt: string | null;
};

type Retour = {
  correcte: boolean;
  bonne_reponse: number;
  explication: string | null;
  source_url: string | null;
  source_titre: string | null;
  points: number;
};

/** Mélange une copie du tableau (Fisher-Yates). */
function melanger<T>(t: T[]): T[] {
  const a = [...t];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Jeu({
  categorie,
  niveau,
}: {
  categorie: string;
  niveau: Niveau;
}) {
  const router = useRouter();
  const supabase = creerClientNavigateur();

  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [partieId, setPartieId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [position, setPosition] = useState(0);

  // L'ordre d'affichage est mélangé, mais l'index envoyé au serveur reste
  // celui du tableau d'origine. Indispensable : dans la banque actuelle,
  // 77 % des bonnes réponses occupent la première position.
  const [ordre, setOrdre] = useState<number[]>([]);

  const [retour, setRetour] = useState<Retour | null>(null);
  const [restant, setRestant] = useState(DUREE_MS);
  const [enPause, setEnPause] = useState(false);
  const [chronoActif, setChronoActif] = useState(true);
  const [alerteTemps, setAlerteTemps] = useState("");

  const debutRef = useRef<number>(0);
  const titreRef = useRef<HTMLHeadingElement>(null);
  const seuilRef = useRef<number>(99);

  // --- Création de la partie ---------------------------------------------
  useEffect(() => {
    let annule = false;

    (async () => {
      try {
        const session = await assurerSession();
        if (!session) throw new Error("Session indisponible");

        const { data: deck, error: e1 } = await supabase.rpc("composer_deck", {
          p_categorie: categorie,
          p_niveau: niveau,
          p_longueur: 7,
        });
        if (e1) throw e1;
        if (!deck?.length) throw new Error("Aucune question disponible");

        const ids = deck.map((d: { question_id: string }) => d.question_id);
        const complete = deck.some((d: { complete: boolean }) => d.complete);

        const { data: partie, error: e2 } = await supabase
          .from("partie")
          .insert({
            utilisateur_id: session.user.id,
            mode: "solo",
            categorie,
            niveau,
            deck: ids,
            deck_complete: complete,
            chrono_actif: chronoActif,
          })
          .select("id")
          .single();
        if (e2) throw e2;

        const { data: qs, error: e3 } = await supabase
          .from("question_publique")
          .select("*")
          .in("id", ids);
        if (e3) throw e3;

        // Respecter l'ordre du deck fixé par le serveur.
        const parId = new Map((qs as Question[]).map((q) => [q.id, q]));
        const ordonnees = ids
          .map((id: string) => parId.get(id))
          .filter(Boolean) as Question[];

        if (annule) return;
        setPartieId(partie.id);
        setQuestions(ordonnees);
        setOrdre(melanger(ordonnees[0].reponses.map((_, i) => i)));
        debutRef.current = Date.now();
        setChargement(false);
      } catch (e) {
        if (!annule) {
          setErreur(e instanceof Error ? e.message : "Erreur inattendue");
          setChargement(false);
        }
      }
    })();

    return () => {
      annule = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorie, niveau]);

  const question = questions[position];

  // --- Réponse ------------------------------------------------------------
  const repondre = useCallback(
    async (choix: number | null) => {
      if (!partieId || retour) return;
      const duree = Date.now() - debutRef.current;

      const { data, error } = await supabase.rpc("valider_reponse", {
        p_partie_id: partieId,
        p_position: position,
        p_choix: choix,
        p_duree_ms: chronoActif ? duree : null,
      });
      if (error) {
        setErreur(error.message);
        return;
      }
      setRetour(data as Retour);
    },
    [partieId, position, retour, chronoActif, supabase]
  );

  // --- Chronomètre --------------------------------------------------------
  useEffect(() => {
    if (!chronoActif || enPause || retour || chargement || !question) return;

    const t = setInterval(() => {
      const reste = Math.max(0, DUREE_MS - (Date.now() - debutRef.current));
      setRestant(reste);

      // Le compteur visuel est masqué aux technologies d'assistance : il se
      // met à jour dix fois par seconde et saturerait le lecteur d'écran.
      // Seuls les seuils sont annoncés, dans une région distincte.
      const s = Math.ceil(reste / 1000);
      if (s <= 5 && seuilRef.current > 5) {
        seuilRef.current = 5;
        setAlerteTemps("5 secondes");
      } else if (s <= 10 && seuilRef.current > 10) {
        seuilRef.current = 10;
        setAlerteTemps("10 secondes");
      }

      if (reste === 0) {
        clearInterval(t);
        void repondre(null);
      }
    }, 100);

    return () => clearInterval(t);
  }, [chronoActif, enPause, retour, chargement, question, repondre]);

  // --- Question suivante --------------------------------------------------
  async function suivante() {
    if (position + 1 < questions.length) {
      const p = position + 1;
      setPosition(p);
      setRetour(null);
      setOrdre(melanger(questions[p].reponses.map((_, i) => i)));
      setRestant(DUREE_MS);
      setAlerteTemps("");
      seuilRef.current = 99;
      debutRef.current = Date.now();
      // Le focus repart du titre : sans cela il reste sur un bouton qui
      // vient de disparaître, et la personne est projetée en haut du
      // document sans explication.
      requestAnimationFrame(() => titreRef.current?.focus());
    } else {
      const { error } = await supabase.rpc("terminer_partie", {
        p_partie_id: partieId,
      });
      if (error) {
        setErreur(error.message);
        return;
      }
      router.push(`/resultat/${partieId}`);
    }
  }

  if (chargement) return <p>Préparation de la partie…</p>;
  if (erreur)
    return (
      <>
        <h1>Partie</h1>
        <p role="alert">La partie n’a pas pu démarrer : {erreur}</p>
      </>
    );
  if (!question) return null;

  return (
    <>
      <h1 tabIndex={-1} ref={titreRef}>
        Question {position + 1} sur {questions.length}
      </h1>

      <p>
        <label htmlFor="avancement">Avancement dans la partie</label>{" "}
        <progress id="avancement" value={position + 1} max={questions.length}>
          {position + 1} sur {questions.length}
        </progress>
      </p>

      <section aria-labelledby="titre-chrono">
        <h2 id="titre-chrono">Temps restant</h2>
        {chronoActif ? (
          <>
            <p aria-hidden="true" className="chrono">
              {(restant / 1000).toFixed(1)} s
            </p>
            <p>
              <button type="button" onClick={() => setEnPause((v) => !v)}>
                {enPause ? "Reprendre" : "Mettre en pause"}
              </button>{" "}
              <button type="button" onClick={() => setChronoActif(false)}>
                Désactiver le chronomètre
              </button>
            </p>
          </>
        ) : (
          <p>
            Chronomètre désactivé. La partie reste valide mais ne rapporte pas
            de bonus de rapidité.
          </p>
        )}
        {/* Région d'alerte distincte, présente dès le chargement. */}
        <p role="status" aria-live="polite" className="visuellement-masque">
          {alerteTemps}
        </p>
      </section>

      <article aria-labelledby="enonce">
        <h2 className="visuellement-masque">Énoncé</h2>
        <p className="meta">
          {question.categorie}
          {question.sous_categorie ? ` · ${question.sous_categorie}` : ""} ·
          difficulté {question.difficulte} sur 5
        </p>

        {question.image_id && (
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/images/${question.image_id}.webp`}
              alt={question.image_alt ?? ""}
              loading="lazy"
              width={900}
              height={600}
            />
          </figure>
        )}

        <p id="enonce" className="enonce">
          {question.enonce}
        </p>

        {/* Des boutons, pas des boutons radio : le clic EST la réponse,
            définitive et chronométrée. */}
        <ul aria-labelledby="enonce" className="reponses">
          {ordre.map((indexOrigine) => {
            const texte = question.reponses[indexOrigine];
            const estBonne = retour?.bonne_reponse === indexOrigine;
            let suffixe = "";
            if (retour) {
              if (estBonne) suffixe = " — bonne réponse";
            }
            return (
              <li key={indexOrigine}>
                <button
                  type="button"
                  aria-disabled={retour ? true : undefined}
                  onClick={() => repondre(indexOrigine)}
                  className={retour && estBonne ? "bonne" : undefined}
                >
                  {texte}
                  {suffixe}
                </button>
              </li>
            );
          })}
        </ul>
      </article>

      {/* Région de retour, présente dès le chargement et vide : une région
          live insérée après coup n'est pas annoncée de façon fiable. */}
      <div role="status" aria-live="polite">
        {retour && (
          <>
            <h2>{retour.correcte ? "Bonne réponse" : "Mauvaise réponse"}</h2>
            {retour.explication && <p>{retour.explication}</p>}
            <p>{retour.points} points gagnés sur cette question.</p>
            {retour.source_url && (
              <p>
                Source :{" "}
                <a href={retour.source_url} rel="noopener" target="_blank">
                  {retour.source_titre ?? "consulter la source"}
                </a>{" "}
                (nouvelle fenêtre)
              </p>
            )}
          </>
        )}
      </div>

      {retour && (
        <p>
          <button type="button" onClick={suivante}>
            {position + 1 < questions.length
              ? "Question suivante"
              : "Voir le résultat"}
          </button>
        </p>
      )}
    </>
  );
}

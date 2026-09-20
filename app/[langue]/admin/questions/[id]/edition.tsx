"use client";

import { useEffect, useState } from "react";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { dictionnaire, LANGUES, type Langue } from "@/lib/i18n";

type Question = {
  id: string; difficulte: number; bonne_reponse: number;
  categorie_id: string; image_id: string | null;
  statut: string; vues: number; reussites: number;
};

type Texte = {
  langue: string; enonce: string; reponses: string[];
  explication: string | null; source_url: string | null;
  source_titre: string | null; sous_categorie: string | null;
  image_alt: string | null; statut: string;
};

export default function EditionQuestion({
  langue, questionId,
}: {
  langue: Langue; questionId: string;
}) {
  const t = dictionnaire(langue);
  const supabase = creerClientNavigateur();

  const [question, setQuestion] = useState<Question | null>(null);
  const [textes, setTextes] = useState<Record<string, Texte>>({});
  const [langueEditee, setLangueEditee] = useState<string>(langue);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    let annule = false;
    (async () => {
      const [{ data: q }, { data: ts }] = await Promise.all([
        supabase.from("question").select("*").eq("id", questionId).single(),
        supabase.from("question_texte").select("*").eq("question_id", questionId),
      ]);
      if (annule) return;
      setQuestion(q as Question);
      const parLangue: Record<string, Texte> = {};
      for (const x of (ts ?? []) as Texte[]) parLangue[x.langue] = x;
      setTextes(parLangue);
    })();
    return () => { annule = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  if (!question) return <p>{t.commun.chargement}</p>;

  // La version de référence donne le nombre de propositions attendu.
  const reference = textes["fr"];
  const nbReponses = reference?.reponses.length ?? 4;
  const courant = textes[langueEditee] ?? {
    langue: langueEditee, enonce: "",
    reponses: Array.from({ length: nbReponses }, () => ""),
    explication: "", source_url: "", source_titre: "",
    sous_categorie: "", image_alt: "", statut: "brouillon",
  };

  function majCourant(champ: keyof Texte, valeur: unknown) {
    setTextes((prec) => ({
      ...prec,
      [langueEditee]: { ...courant, [champ]: valeur } as Texte,
    }));
  }

  function majReponse(index: number, valeur: string) {
    const copie = [...courant.reponses];
    copie[index] = valeur;
    majCourant("reponses", copie);
  }

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setErreur(null);
    setEnvoi(true);
    try {
      const { data, error } = await supabase.rpc("enregistrer_traduction", {
        p_question_id: questionId,
        p_langue: langueEditee,
        p_enonce: courant.enonce,
        p_reponses: courant.reponses,
        p_explication: courant.explication,
        p_source_url: courant.source_url,
        p_source_titre: courant.source_titre,
        p_sous_categorie: courant.sous_categorie,
        p_image_alt: courant.image_alt,
        p_statut: courant.statut,
      });
      if (error) { setErreur(error.message); return; }
      if (data && !data.ok) {
        setErreur(
          data.motif === "nombre_de_reponses"
            ? t.admin.erreurNombreReponses(data.attendu, data.recu)
            : t.admin.erreurSourceObligatoire
        );
        return;
      }
      setMessage(t.admin.enregistre);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <>
      <div role="status" aria-live="polite">{message && <p>{message}</p>}</div>
      <div role="alert">{erreur && <p>{erreur}</p>}</div>

      <section aria-labelledby="titre-invariant">
        <h2 id="titre-invariant">{t.admin.partieInvariante}</h2>
        <dl>
          <dt>{t.admin.filtreCategorie}</dt><dd>{question.categorie_id}</dd>
          <dt>{t.admin.colDifficulte}</dt><dd>{question.difficulte}</dd>
          <dt>{t.admin.colVues}</dt><dd>{question.vues}</dd>
          <dt>{t.admin.colTaux}</dt>
          <dd>
            {question.vues > 0
              ? `${Math.round((100 * question.reussites) / question.vues)} %`
              : t.commun.sansValeur}
          </dd>
        </dl>
        <p className="note">
          {t.admin.bonneReponsePosition(question.bonne_reponse + 1)}
        </p>
      </section>

      <section aria-labelledby="titre-langue">
        <h2 id="titre-langue">{t.admin.traductions}</h2>
        <p>
          <label htmlFor="langue-editee">{t.langues.choisir}</label><br />
          <select id="langue-editee" value={langueEditee}
                  onChange={(e) => setLangueEditee(e.target.value)}>
            {LANGUES.map((l) => (
              <option key={l} value={l}>
                {t.langues[l]}{textes[l] ? "" : " (—)"}
              </option>
            ))}
          </select>
        </p>
      </section>

      <form onSubmit={enregistrer}>
        <h2>{t.admin.partieTraduite(t.langues[langueEditee as Langue])}</h2>

        {/* L'index de la bonne réponse est partagé entre les langues :
            l'avertissement n'est pas décoratif. */}
        <p className="note">{t.admin.avertissementOrdre}</p>

        <p>
          <label htmlFor="enonce">{t.admin.colEnonce}</label><br />
          <textarea id="enonce" rows={3} required value={courant.enonce}
                    onChange={(e) => majCourant("enonce", e.target.value)} />
        </p>

        {courant.reponses.map((r, i) => (
          <p key={i}>
            <label htmlFor={`rep-${i}`}>
              {t.admin.proposition(i + 1)}
              {i === question.bonne_reponse ? " ✓" : ""}
            </label><br />
            <input id={`rep-${i}`} type="text" required value={r}
                   onChange={(e) => majReponse(i, e.target.value)} />
          </p>
        ))}

        <p>
          <label htmlFor="explication">{t.admin.explication}</label><br />
          <textarea id="explication" rows={3} value={courant.explication ?? ""}
                    onChange={(e) => majCourant("explication", e.target.value)} />
        </p>

        <p>
          <label htmlFor="source-url">{t.admin.sourceUrl}</label><br />
          <input id="source-url" type="url" value={courant.source_url ?? ""}
                 onChange={(e) => majCourant("source_url", e.target.value)} />
        </p>

        <p>
          <label htmlFor="source-titre">{t.admin.sourceTitre}</label><br />
          <input id="source-titre" type="text" value={courant.source_titre ?? ""}
                 onChange={(e) => majCourant("source_titre", e.target.value)} />
        </p>

        <p>
          <label htmlFor="sous-categorie">{t.admin.sousCategorie}</label><br />
          <input id="sous-categorie" type="text" value={courant.sous_categorie ?? ""}
                 onChange={(e) => majCourant("sous_categorie", e.target.value)} />
        </p>

        {question.image_id && (
          <p>
            <label htmlFor="image-alt">{t.admin.texteAlternatif}</label><br />
            <input id="image-alt" type="text" value={courant.image_alt ?? ""}
                   aria-describedby="aide-alt"
                   onChange={(e) => majCourant("image_alt", e.target.value)} /><br />
            <span id="aide-alt" className="note">{t.admin.texteAlternatifAide}</span>
          </p>
        )}

        <p>
          <label htmlFor="statut">{t.admin.filtreStatut}</label><br />
          <select id="statut" value={courant.statut}
                  onChange={(e) => majCourant("statut", e.target.value)}>
            <option value="brouillon">{t.admin.statutBrouillon}</option>
            <option value="valide">{t.admin.statutValide}</option>
            <option value="a_reverifier">{t.admin.statutAReverifier}</option>
            <option value="retiree">{t.admin.statutRetiree}</option>
          </select>
        </p>

        <p>
          <button type="submit" aria-disabled={envoi || undefined}>
            {envoi ? t.compte.envoi : t.admin.enregistrer}
          </button>
        </p>
      </form>
    </>
  );
}

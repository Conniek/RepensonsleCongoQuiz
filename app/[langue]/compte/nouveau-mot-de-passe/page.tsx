"use client";

import { useState } from "react";
import Link from "next/link";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { dictionnaire, estLangue, LANGUE_PAR_DEFAUT, type Langue } from "@/lib/i18n";
import { useParams } from "next/navigation";

/** Page atteinte depuis le lien reçu par e-mail. Supabase établit la session
 *  automatiquement à l'arrivée, il ne reste qu'à choisir le mot de passe. */
export default function NouveauMotDePasse() {
  const p = useParams();
  const langue = (estLangue(String(p?.langue)) ? String(p?.langue) : LANGUE_PAR_DEFAUT) as Langue;
  const t = dictionnaire(langue);
  const [motDePasse, setMotDePasse] = useState("");
  const [fait, setFait] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    if (motDePasse.length < 8) {
      setErreur(t.compte.erreurMotDePasseCourt);
      return;
    }
    setEnvoi(true);
    const supabase = creerClientNavigateur();
    const { error } = await supabase.auth.updateUser({ password: motDePasse });
    setEnvoi(false);
    if (error) {
      setErreur(t.compte.erreurGenerique(error.message));
      return;
    }
    setFait(true);
  }

  return (
    <>
      <h1 tabIndex={-1}>{t.compte.titreNouveauMotDePasse}</h1>

      <div role="status" aria-live="polite">
        {fait && (
          <>
            <p>{t.compte.motDePasseChange}</p>
            <p>
              <Link href={`/${langue}/compte`}>{t.compte.connecter}</Link>
            </p>
          </>
        )}
      </div>
      <div role="alert">{erreur && <p>{erreur}</p>}</div>

      {!fait && (
        <form onSubmit={enregistrer}>
          <p>
            <label htmlFor="motdepasse">{t.compte.nouveauMotDePasse}</label>
            <br />
            <input
              id="motdepasse"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              aria-describedby="aide"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
            />
            <br />
            <span id="aide" className="note">
              {t.compte.motDePasseAide}
            </span>
          </p>
          <p>
            <button type="submit" aria-disabled={envoi || undefined}>
              {envoi ? t.compte.envoi : t.compte.enregistrer}
            </button>
          </p>
        </form>
      )}
    </>
  );
}

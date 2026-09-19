"use client";

import { useState } from "react";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { dictionnaire, estLangue, LANGUE_PAR_DEFAUT, type Langue } from "@/lib/i18n";
import { useParams } from "next/navigation";

export default function MotDePasseOublie() {
  const p = useParams();
  const langue = (estLangue(String(p?.langue)) ? String(p?.langue) : LANGUE_PAR_DEFAUT) as Langue;
  const t = dictionnaire(langue);
  const [email, setEmail] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [envoi, setEnvoi] = useState(false);

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    const supabase = creerClientNavigateur();
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/${langue}/compte/nouveau-mot-de-passe`,
    });
    // Le message est le même que l'adresse existe ou non : révéler
    // l'existence d'un compte permettrait d'énumérer les inscrits.
    setEnvoye(true);
    setEnvoi(false);
  }

  return (
    <>
      <h1 tabIndex={-1}>{t.compte.titreReinitialisation}</h1>

      <div role="status" aria-live="polite">
        {envoye && <p>{t.compte.lienEnvoye}</p>}
      </div>

      {!envoye && (
        <>
          <p>{t.compte.reinitialisationTexte}</p>
          <form onSubmit={envoyer}>
            <p>
              <label htmlFor="email">{t.compte.email}</label>
              <br />
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </p>
            <p>
              <button type="submit" aria-disabled={envoi || undefined}>
                {envoi ? t.compte.envoi : t.compte.envoyerLien}
              </button>
            </p>
          </form>
        </>
      )}
    </>
  );
}

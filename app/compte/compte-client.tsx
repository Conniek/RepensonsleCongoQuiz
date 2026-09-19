"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { assurerSession } from "@/lib/session";
import { dictionnaire } from "@/lib/i18n";

type Mode = "creation" | "connexion";

export default function CompteClient() {
  const t = dictionnaire();
  const router = useRouter();
  const supabase = creerClientNavigateur();

  const [mode, setMode] = useState<Mode>("creation");
  const [anonyme, setAnonyme] = useState(true);
  const [email, setEmail] = useState("");
  const [emailActuel, setEmailActuel] = useState<string | null>(null);
  const [motDePasse, setMotDePasse] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const titreRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    (async () => {
      const session = await assurerSession();
      const u = session?.user;
      setAnonyme(u?.is_anonymous ?? true);
      setEmailActuel(u?.email ?? null);
    })();
  }, []);

  async function creerCompte(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setMessage(null);

    if (motDePasse.length < 8) {
      setErreur(t.compte.erreurMotDePasseCourt);
      return;
    }
    if (pseudo.trim().length < 2 || pseudo.trim().length > 24) {
      setErreur(t.compte.erreurPseudoLongueur);
      return;
    }

    setEnvoi(true);
    try {
      await assurerSession();

      // Le pseudo est réservé AVANT la conversion : si l'adresse est déjà
      // prise, on n'a pas laissé un pseudo orphelin derrière soi.
      const { data: p } = await supabase.rpc("definir_pseudo", {
        p_pseudo: pseudo.trim(),
      });
      if (p && !p.ok) {
        setErreur(
          p.motif === "pris"
            ? t.compte.erreurPseudoPris
            : t.compte.erreurPseudoLongueur
        );
        return;
      }

      // Conversion du compte anonyme : le auth.uid() ne change pas, donc
      // parties, étoiles, badges et expérience restent attachés.
      const { error } = await supabase.auth.updateUser({
        email: email.trim(),
        password: motDePasse,
      });

      if (error) {
        setErreur(
          /already|registered|exist/i.test(error.message)
            ? t.compte.erreurEmailUtilise
            : t.compte.erreurGenerique(error.message)
        );
        return;
      }

      setMessage(t.compte.confirmationEnvoyee(email.trim()));
    } finally {
      setEnvoi(false);
      titreRef.current?.focus();
    }
  }

  async function seConnecter(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setMessage(null);
    setEnvoi(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: motDePasse,
      });
      if (error) {
        setErreur(t.compte.erreurIdentifiants);
        return;
      }
      router.push("/profil");
      router.refresh();
    } finally {
      setEnvoi(false);
    }
  }

  async function seDeconnecter() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  // --- Déjà connecté -------------------------------------------------------
  if (!anonyme) {
    return (
      <>
        <h1 tabIndex={-1} ref={titreRef}>
          {t.compte.titre}
        </h1>
        <p>
          {emailActuel ? t.profil.connecteAvec(emailActuel) : t.compte.connecte}
        </p>
        <p>
          <button type="button" onClick={seDeconnecter}>
            {t.compte.deconnecter}
          </button>
        </p>
        <p>
          <Link href="/profil">{t.resultat.voirProgression}</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1 tabIndex={-1} ref={titreRef}>
        {t.compte.titre}
      </h1>
      <p>{t.compte.facultatif}</p>

      {/* Région d'état présente dès le chargement : une région live insérée
          après coup n'est pas annoncée de façon fiable. */}
      <div role="status" aria-live="polite">
        {message && <p>{message}</p>}
      </div>
      <div role="alert">{erreur && <p>{erreur}</p>}</div>

      {mode === "creation" ? (
        <section aria-labelledby="titre-creation">
          <h2 id="titre-creation">{t.compte.titreCreation}</h2>
          <p>{t.compte.progressionConservee}</p>

          <form onSubmit={creerCompte}>
            <p>
              <label htmlFor="pseudo">{t.compte.pseudo}</label>
              <br />
              <input
                id="pseudo"
                name="pseudo"
                type="text"
                required
                minLength={2}
                maxLength={24}
                autoComplete="nickname"
                aria-describedby="aide-pseudo"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
              />
              <br />
              <span id="aide-pseudo" className="note">
                {t.compte.pseudoAide}
              </span>
            </p>

            <p>
              <label htmlFor="email">{t.compte.email}</label>
              <br />
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </p>

            <p>
              <label htmlFor="motdepasse">{t.compte.motDePasse}</label>
              <br />
              <input
                id="motdepasse"
                name="motdepasse"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                aria-describedby="aide-motdepasse"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
              />
              <br />
              <span id="aide-motdepasse" className="note">
                {t.compte.motDePasseAide}
              </span>
            </p>

            <p>
              <button type="submit" aria-disabled={envoi || undefined}>
                {envoi ? t.compte.envoi : t.compte.creer}
              </button>
            </p>
          </form>

          <p>
            <button type="button" onClick={() => setMode("connexion")}>
              {t.compte.dejaUnCompte}
            </button>
          </p>
        </section>
      ) : (
        <section aria-labelledby="titre-connexion">
          <h2 id="titre-connexion">{t.compte.titreConnexion}</h2>

          <form onSubmit={seConnecter}>
            <p>
              <label htmlFor="email-connexion">{t.compte.email}</label>
              <br />
              <input
                id="email-connexion"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </p>
            <p>
              <label htmlFor="motdepasse-connexion">{t.compte.motDePasse}</label>
              <br />
              <input
                id="motdepasse-connexion"
                type="password"
                required
                autoComplete="current-password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
              />
            </p>
            <p>
              <button type="submit" aria-disabled={envoi || undefined}>
                {envoi ? t.compte.envoi : t.compte.connecter}
              </button>
            </p>
          </form>

          <p>
            <Link href="/compte/mot-de-passe-oublie">
              {t.compte.motDePasseOublie}
            </Link>
          </p>
          <p>
            <button type="button" onClick={() => setMode("creation")}>
              {t.compte.pasDeCompte}
            </button>
          </p>
        </section>
      )}
    </>
  );
}

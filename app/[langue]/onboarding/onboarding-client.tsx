"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { assurerSession } from "@/lib/session";
import { dictionnaire, type Langue } from "@/lib/i18n";
import { paysTries } from "@/lib/pays";

const TOTAL = 3;

/** Inscription en trois étapes : pseudo, pays, identifiants.
 *
 *  Chaque étape est enregistrée dès sa validation : qui abandonne à l'étape
 *  trois garde son pseudo et son pays. La conversion finale passe par
 *  `updateUser` sur la session anonyme : l'identifiant ne change pas, donc
 *  parties, étoiles et expérience restent attachés au même compte. */
export default function OnboardingClient({ langue }: { langue: Langue }) {
  const t = dictionnaire(langue);
  const router = useRouter();
  const supabase = useMemo(() => creerClientNavigateur(), []);
  const titreRef = useRef<HTMLHeadingElement>(null);

  const [etape, setEtape] = useState(1);
  const [pseudo, setPseudo] = useState("");
  const [pseudoLibre, setPseudoLibre] = useState<boolean | null>(null);
  const [pays, setPays] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [motDePasseVisible, setMotDePasseVisible] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const listePays = useMemo(() => paysTries(langue), [langue]);

  /* La session anonyme doit exister avant le premier enregistrement : sans
     elle, `definir_pseudo` refuse et l'étape 1 échouerait sans raison
     compréhensible pour la personne. */
  useEffect(() => {
    assurerSession().catch(() => setErreur(t.commun.erreurReseau));
  }, [t.commun.erreurReseau]);

  /* Le focus suit l'étape : sans cela, un lecteur d'écran reste sur le bouton
     précédent et n'annonce jamais le nouvel écran. */
  useEffect(() => {
    titreRef.current?.focus();
  }, [etape]);

  async function verifierPseudo(valeur: string) {
    setPseudo(valeur);
    setPseudoLibre(null);
    const propre = valeur.trim();
    if (propre.length < 2 || propre.length > 24) return;

    const { data } = await supabase.rpc("pseudo_disponible", { p_pseudo: propre });
    setPseudoLibre(data === true);
  }

  async function validerPseudo() {
    const propre = pseudo.trim();
    if (propre.length < 2 || propre.length > 24) {
      setErreur(t.onboarding.pseudoCourt);
      return;
    }

    setEnvoi(true);
    try {
      await assurerSession();
      const { data } = await supabase.rpc("definir_pseudo", { p_pseudo: propre });
      if (data && !data.ok) {
        setErreur(data.motif === "pris" ? t.onboarding.pseudoPris : t.onboarding.pseudoCourt);
        return;
      }
      setErreur(null);
      setEtape(2);
    } finally {
      setEnvoi(false);
    }
  }

  async function validerPays() {
    if (!pays) {
      setErreur(t.onboarding.paysManquant);
      return;
    }

    setEnvoi(true);
    try {
      const { error } = await supabase.rpc("definir_pays", { p_pays: pays });
      if (error) {
        setErreur(t.onboarding.erreurGenerique(error.message));
        return;
      }
      setErreur(null);
      setEtape(3);
    } finally {
      setEnvoi(false);
    }
  }

  async function validerCompte() {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setErreur(t.onboarding.emailInvalide);
      return;
    }
    if (motDePasse.length < 8) {
      setErreur(t.onboarding.motDePasseCourt);
      return;
    }

    setEnvoi(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: email.trim(),
        password: motDePasse,
      });

      if (error) {
        setErreur(
          /already|registered|exist/i.test(error.message)
            ? t.onboarding.emailUtilise
            : t.onboarding.erreurGenerique(error.message)
        );
        return;
      }

      router.push(`/${langue}`);
    } finally {
      setEnvoi(false);
    }
  }

  function precedent() {
    setErreur(null);
    if (etape > 1) setEtape(etape - 1);
    else router.push(`/${langue}/splash`);
  }

  return (
    <div className="onb">
      <div className="onb-barre">
        <button type="button" className="onb-retour" onClick={precedent}>
          <span aria-hidden="true">←</span>
          <span className="visuellement-masque">{t.onboarding.retour}</span>
        </button>

        <p className="onb-etape">{t.onboarding.etape(etape, TOTAL)}</p>

        <Link href={`/${langue}`} className="onb-plus-tard">
          {t.onboarding.plusTard}
        </Link>
      </div>

      <progress className="onb-jauge" value={etape} max={TOTAL}>
        {t.onboarding.etape(etape, TOTAL)}
      </progress>

      {etape === 1 && (
        <section className="onb-etape-contenu">
          <h1 ref={titreRef} tabIndex={-1}>{t.onboarding.pseudoTitre}</h1>
          <p className="onb-intro">{t.onboarding.pseudoTexte}</p>

          <label htmlFor="pseudo">{t.onboarding.pseudoLabel}</label>
          <input
            id="pseudo"
            type="text"
            value={pseudo}
            autoComplete="nickname"
            maxLength={24}
            aria-describedby="pseudo-aide"
            onChange={(e) => verifierPseudo(e.target.value)}
          />
          <p id="pseudo-aide" className="onb-aide">{t.onboarding.pseudoAide}</p>

          <p className="onb-etat" role="status">
            {pseudoLibre === true && t.onboarding.pseudoLibre}
            {pseudoLibre === false && t.onboarding.pseudoPris}
          </p>

          {erreur && <p className="onb-erreur" role="alert">{erreur}</p>}

          <button type="button" className="onb-action" disabled={envoi} onClick={validerPseudo}>
            {envoi ? t.onboarding.enCours : t.onboarding.suivant}
          </button>
        </section>
      )}

      {etape === 2 && (
        <section className="onb-etape-contenu">
          <h1 ref={titreRef} tabIndex={-1}>{t.onboarding.paysTitre}</h1>
          <p className="onb-intro">{t.onboarding.paysTexte}</p>

          <label htmlFor="pays">{t.onboarding.paysLabel}</label>
          <select id="pays" value={pays} onChange={(e) => setPays(e.target.value)}>
            <option value="">{t.onboarding.paysVide}</option>
            {listePays.prioritaires.map((p) => (
              <option key={`tete-${p.code}`} value={p.code}>{p.nom}</option>
            ))}
            <optgroup label={t.onboarding.paysAutres}>
              {listePays.autres.map((p) => (
                <option key={p.code} value={p.code}>{p.nom}</option>
              ))}
            </optgroup>
          </select>

          {erreur && <p className="onb-erreur" role="alert">{erreur}</p>}

          <button type="button" className="onb-action" disabled={envoi} onClick={validerPays}>
            {envoi ? t.onboarding.enCours : t.onboarding.suivant}
          </button>
        </section>
      )}

      {etape === 3 && (
        <section className="onb-etape-contenu">
          <h1 ref={titreRef} tabIndex={-1}>{t.onboarding.motDePasseTitre}</h1>
          <p className="onb-intro">{t.onboarding.motDePasseTexte}</p>

          <label htmlFor="email">{t.onboarding.emailLabel}</label>
          <input
            id="email"
            type="email"
            value={email}
            autoComplete="email"
            aria-describedby="email-aide"
            onChange={(e) => setEmail(e.target.value)}
          />
          <p id="email-aide" className="onb-aide">{t.onboarding.emailAide}</p>

          <label htmlFor="mot-de-passe">{t.onboarding.motDePasseLabel}</label>
          <div className="onb-champ-mot-de-passe">
            <input
              id="mot-de-passe"
              type={motDePasseVisible ? "text" : "password"}
              value={motDePasse}
              autoComplete="new-password"
              aria-describedby="mot-de-passe-aide"
              onChange={(e) => setMotDePasse(e.target.value)}
            />
            <button
              type="button"
              className="onb-bascule"
              aria-pressed={motDePasseVisible}
              onClick={() => setMotDePasseVisible((v) => !v)}
            >
              {motDePasseVisible ? t.onboarding.masquerMotDePasse : t.onboarding.afficherMotDePasse}
            </button>
          </div>
          <p id="mot-de-passe-aide" className="onb-aide">{t.onboarding.motDePasseAide}</p>

          {erreur && <p className="onb-erreur" role="alert">{erreur}</p>}

          <button type="button" className="onb-action" disabled={envoi} onClick={validerCompte}>
            {envoi ? t.onboarding.enCours : t.onboarding.terminer}
          </button>
        </section>
      )}
    </div>
  );
}

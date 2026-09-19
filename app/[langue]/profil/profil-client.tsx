"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { assurerSession } from "@/lib/session";
import { dictionnaire, type Langue } from "@/lib/i18n";

type Badge = {
  id: string;
  libelle: string;
  condition: string;
  objectif: number;
  avancement: number;
  obtenu: boolean;
};

type Maitrise = { categorie_id: string; libelle: string; slug: string; etoiles: number };

type Etat = {
  xp: number;
  pseudo: string | null;
  rang: string;
  rang_seuil: number;
  rang_suivant: string | null;
  xp_rang_suivant: number | null;
  serie_jours: number;
  serie_record: number;
  anonyme: boolean;
  parties: number;
  taux_reussite: number | null;
  badges: Badge[];
  maitrise: Maitrise[];
};

export default function ProfilClient({ langue }: { langue: Langue }) {
  const t = dictionnaire(langue);
  const [etat, setEtat] = useState<Etat | null>(null);
  const [pret, setPret] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [motCle, setMotCle] = useState("");
  const [messageDonnees, setMessageDonnees] = useState<string | null>(null);

  async function exporter() {
    const supabase = creerClientNavigateur();
    const { data } = await supabase.rpc("exporter_mes_donnees");
    if (!data) return;
    // Téléchargement côté navigateur : aucune donnée personnelle ne transite
    // par un serveur tiers.
    const lien = document.createElement("a");
    lien.href = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    );
    lien.download = "repensons-le-congo-mes-donnees.json";
    lien.click();
    URL.revokeObjectURL(lien.href);
  }

  async function supprimer() {
    const supabase = creerClientNavigateur();
    const { error } = await supabase.rpc("supprimer_mon_compte");
    if (error) {
      setMessageDonnees(t.compte.erreurGenerique(error.message));
      return;
    }
    await supabase.auth.signOut();
    window.location.href = `/${langue}`;
  }

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        await assurerSession();
        const supabase = creerClientNavigateur();
        const { data } = await supabase.rpc("progression", { p_langue: langue });
        if (!annule && data) setEtat(data as Etat);
      } finally {
        if (!annule) setPret(true);
      }
    })();
    return () => {
      annule = true;
    };
  }, [langue]);

  if (!pret) return <p>{t.profil.chargement}</p>;

  if (!etat) {
    return (
      <>
        <h1 tabIndex={-1}>{t.profil.titre}</h1>
        <p>{t.profil.erreur}</p>
      </>
    );
  }

  const obtenus = etat.badges.filter((b) => b.obtenu);
  const aVenir = etat.badges.filter((b) => !b.obtenu);
  const enCours = etat.xp_rang_suivant != null;

  return (
    <>
      <h1 tabIndex={-1}>{etat.pseudo ?? t.profil.titre}</h1>

      <section aria-labelledby="titre-rang">
        <h2 id="titre-rang">{t.profil.titreRang}</h2>
        <p>
          {t.profil.rangPhrase(etat.rang, etat.xp)}
          {enCours &&
            t.profil.resteAvantRang(
              etat.xp_rang_suivant! - etat.xp,
              etat.rang_suivant!
            )}
        </p>
        {enCours && (
          <progress
            value={etat.xp - etat.rang_seuil}
            max={etat.xp_rang_suivant! - etat.rang_seuil}
            aria-hidden="true"
          />
        )}
      </section>

      <section aria-labelledby="titre-stats">
        <h2 id="titre-stats">{t.profil.titreStats}</h2>
        <dl>
          <dt>{t.profil.partiesJouees}</dt>
          <dd>{etat.parties}</dd>
          <dt>{t.profil.tauxReussite}</dt>
          <dd>
            {etat.taux_reussite != null
              ? `${etat.taux_reussite} %`
              : t.commun.sansValeur}
          </dd>
          <dt>{t.profil.serieEnCours}</dt>
          <dd>
            <time dateTime={`P${etat.serie_jours}D`}>
              {t.profil.jours(etat.serie_jours)}
            </time>
          </dd>
          <dt>{t.profil.meilleureSerie}</dt>
          <dd>
            <time dateTime={`P${etat.serie_record}D`}>
              {t.profil.jours(etat.serie_record)}
            </time>
          </dd>
        </dl>
      </section>

      <section id="badges" aria-labelledby="titre-badges">
        <h2 id="titre-badges">{t.badges.titre}</h2>
        <p>{t.badges.compteur(obtenus.length, etat.badges.length)}</p>

        <h3>{t.badges.obtenus}</h3>
        {obtenus.length === 0 ? (
          <p>{t.badges.aucun}</p>
        ) : (
          <ul>
            {obtenus.map((b) => (
              <li key={b.id}>
                <strong>{b.libelle}</strong> — {b.condition}.
              </li>
            ))}
          </ul>
        )}

        <h3>{t.badges.aDebloquer}</h3>
        <ul>
          {aVenir.map((b) => (
            // La classe ne fait que griser : l'état est déjà écrit dans le
            // texte, la couleur ne porte jamais l'information seule.
            <li key={b.id} className="badge-verrouille">
              <strong>{b.libelle}</strong> — {b.condition}.{" "}
              {t.badges.avancement(b.avancement, b.objectif)}.
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="titre-maitrise">
        <h2 id="titre-maitrise">{t.profil.titreMaitrise}</h2>
        {etat.maitrise.length === 0 ? (
          <p>{t.profil.aucuneEtoile}</p>
        ) : (
          <table>
            <caption>{t.profil.legendeMaitrise}</caption>
            <thead>
              <tr>
                <th scope="col">{t.profil.colCategorie}</th>
                <th scope="col">{t.profil.colEtoiles}</th>
              </tr>
            </thead>
            <tbody>
              {etat.maitrise.map((m) => (
                <tr key={m.categorie_id}>
                  <th scope="row">
                    <Link href={`/${langue}/categorie/${m.slug}`}>
                      {m.libelle}
                    </Link>
                  </th>
                  <td>{m.etoiles}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section aria-labelledby="titre-compte">
        <h2 id="titre-compte">{t.profil.titreCompte}</h2>
        <p>{etat.anonyme ? t.profil.compteAnonyme : t.profil.compteSynchronise}</p>
        <p>
          <Link href={`/${langue}/compte`}>
            {etat.anonyme ? t.profil.creerUnCompte : t.profil.gererMonCompte}
          </Link>
        </p>
      </section>

      {!etat.anonyme && (
        <section aria-labelledby="titre-donnees">
          <h2 id="titre-donnees">{t.compte.titreDonnees}</h2>

          <div role="status" aria-live="polite">
            {messageDonnees && <p>{messageDonnees}</p>}
          </div>

          <p>{t.compte.exporterAide}</p>
          <p>
            <button type="button" onClick={exporter}>
              {t.compte.exporter}
            </button>
          </p>

          <p>{t.compte.supprimerAide}</p>
          {!confirmation ? (
            <p>
              <button type="button" onClick={() => setConfirmation(true)}>
                {t.compte.supprimer}
              </button>
            </p>
          ) : (
            <>
              <p>{t.compte.supprimerConfirmation}</p>
              <p>
                <label htmlFor="mot-cle">{t.compte.supprimerMotCle}</label>
                <br />
                <input
                  id="mot-cle"
                  type="text"
                  value={motCle}
                  onChange={(e) => setMotCle(e.target.value)}
                />
              </p>
              <p>
                <button
                  type="button"
                  aria-disabled={motCle !== t.compte.supprimerMotCle || undefined}
                  onClick={() => {
                    if (motCle === t.compte.supprimerMotCle) void supprimer();
                  }}
                >
                  {t.compte.supprimerValider}
                </button>{" "}
                <button
                  type="button"
                  onClick={() => {
                    setConfirmation(false);
                    setMotCle("");
                  }}
                >
                  {t.compte.annuler}
                </button>
              </p>
            </>
          )}
        </section>
      )}
    </>
  );
}

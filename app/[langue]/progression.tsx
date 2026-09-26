"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { assurerSession, SessionIndisponible } from "@/lib/session";
import { dictionnaire, type Langue } from "@/lib/i18n";
import { Flamme, PictoBadge, Verrou, Cadeau } from "./pictos";

type Badge = {
  id: string; libelle: string; condition: string;
  objectif: number; avancement: number; obtenu: boolean;
};

type Etat = {
  xp: number; pseudo: string | null; rang: string; rang_seuil: number;
  rang_suivant: string | null; xp_rang_suivant: number | null;
  serie_jours: number; serie_record: number; parties: number;
  taux_reussite: number | null; badges: Badge[];
};

type Defi = {
  categorie_id: string; libelle: string; slug: string;
  niveau: string; recompense_xp: number; fait: boolean;
};

export default function Progression({
  langue,
  avecSalutation = false,
}: {
  langue: Langue;
  /** Sur l'accueil, la progression porte aussi le titre de page : une
   *  salutation nommée. Ailleurs, le titre appartient à la page. */
  avecSalutation?: boolean;
}) {
  const t = dictionnaire(langue);
  const [etat, setEtat] = useState<Etat | null>(null);
  const [defi, setDefi] = useState<Defi | null>(null);
  const [pret, setPret] = useState(false);
  const [echec, setEchec] = useState<"delai" | "contexte" | "refus" | null>(null);
  const [essai, setEssai] = useState(0);

  useEffect(() => {
    let annule = false;
    setEchec(null);
    setPret(false);
    (async () => {
      try {
        await assurerSession();
        const supabase = creerClientNavigateur();
        const [p, d] = await Promise.all([
          supabase.rpc("progression", { p_langue: langue }),
          supabase.rpc("defi_du_jour", { p_langue: langue }),
        ]);
        if (annule) return;
        if (p.data) setEtat(p.data as Etat);
        if (d.data) setDefi(d.data as Defi);
      } catch (e) {
        if (!annule) setEchec(e instanceof SessionIndisponible ? e.motif : "refus");
      } finally {
        if (!annule) setPret(true);
      }
    })();
    return () => { annule = true; };
  }, [langue, essai]);

  if (!pret) {
    return (
      <section aria-labelledby="titre-progression">
        <h2 id="titre-progression" className="visuellement-masque">{t.progression.titre}</h2>
        <p>{t.progression.chargement}</p>
      </section>
    );
  }

  // Jamais d'attente sans fin : un message, et de quoi réessayer.
  if (echec) {
    return (
      <section aria-labelledby="titre-progression">
        <h2 id="titre-progression">{t.progression.titre}</h2>
        <p role="alert">
          {echec === "contexte" ? t.commun.contexteNonSecurise : t.profil.erreur}
        </p>
        {echec !== "contexte" && (
          <p>
            <button type="button" onClick={() => setEssai((n) => n + 1)}>
              {t.commun.reessayer}
            </button>
          </p>
        )}
      </section>
    );
  }

  const enCours = etat?.xp_rang_suivant != null;
  const restant = enCours ? etat!.xp_rang_suivant! - etat!.xp : 0;
  const obtenus = etat?.badges.filter((b) => b.obtenu) ?? [];
  const prochain = (etat?.badges ?? [])
    .filter((b) => !b.obtenu && b.avancement > 0)
    .sort((a, b) => b.avancement / b.objectif - a.avancement / a.objectif)[0];

  const salutation = !etat
    ? null
    : etat.pseudo
      ? etat.parties > 0
        ? t.accueil.salutRetour(etat.pseudo)
        : t.accueil.salutPremier(etat.pseudo)
      : etat.parties > 0
        ? t.accueil.salutAnonymeRetour
        : t.accueil.salutAnonymePremier;

  return (
    <>
      {avecSalutation && salutation && (
        <h1 className="salutation" tabIndex={-1}>{salutation}</h1>
      )}

      <section
        id="progression"
        className={etat && etat.parties > 0 ? "progression" : undefined}
        aria-labelledby="titre-progression"
      >
        <h2 id="titre-progression" className="visuellement-masque">{t.progression.titre}</h2>

        {etat && etat.parties > 0 ? (
          <>
            {/* Anneau de réussite. La valeur est posée en propriété
                personnalisée — une donnée, pas une décision d'apparence.
                Le pourcentage visible est doublé, pour le lecteur d'écran,
                de la phrase complète qui lui donne son sens. */}
            {etat.taux_reussite != null && (
              <div className="anneau" style={{ "--taux": etat.taux_reussite } as React.CSSProperties}>
                <span className="anneau-centre">
                  <b>{etat.taux_reussite}%</b>
                  <small aria-hidden="true">{t.progression.deReussite}</small>
                  <span className="visuellement-masque">
                    {t.progression.tauxReussite(etat.taux_reussite, etat.parties)}
                  </span>
                </span>
              </div>
            )}

            <div className="progression-corps">
              <p className="rang">{etat.rang}</p>

              {enCours && (
                <progress value={etat.xp - etat.rang_seuil}
                          max={etat.xp_rang_suivant! - etat.rang_seuil}
                          aria-hidden="true" />
              )}

              {/* Visible : le chiffre. Lu : la phrase complète. */}
              {enCours ? (
                <p className="compteur">
                  <strong>{etat.xp}</strong> / {etat.xp_rang_suivant}{" "}
                  <span aria-hidden="true">{t.progression.avantRangSuivant}</span>
                  <span className="visuellement-masque">
                    {t.progression.resteAvantRang(restant, etat.rang_suivant!, etat.xp, etat.xp_rang_suivant!)}
                  </span>
                </p>
              ) : (
                <p className="compteur">{t.progression.rangMaximal(etat.xp)}</p>
              )}
            </div>

            {/* Série : le chiffre en grand, avec son picto. */}
            {etat.serie_jours > 0 && (
              <p className="serie">
                <Flamme taille={22} />
                <b>{etat.serie_jours}</b>
                <small aria-hidden="true">{t.progression.joursAffilee(etat.serie_jours)}</small>
                <span className="visuellement-masque">
                  <time dateTime={`P${etat.serie_jours}D`}>
                    {t.progression.serie(etat.serie_jours)}
                  </time>
                  {etat.serie_record > etat.serie_jours && t.progression.record(etat.serie_record)}
                </span>
              </p>
            )}
          </>
        ) : (
          <p>{t.progression.jamaisJoue}</p>
        )}
      </section>

      {etat && etat.badges.length > 0 && (
        <section aria-labelledby="titre-badges">
          <div className="titre-section">
            <h2 id="titre-badges">{t.badges.titre}</h2>
            <Link href={`/${langue}/progression#badges`}>
              <span aria-hidden="true">{t.badges.voirTout}</span>
              <span className="visuellement-masque">{t.badges.voirTous(etat.badges.length)}</span>
            </Link>
          </div>

          {obtenus.length === 0 ? (
            <p>{t.badges.aucun}</p>
          ) : (
            <ul className="medaillons">
              {obtenus.slice(0, 3).map((b) => (
                <li key={b.id}>
                  <span className="pastille"><PictoBadge id={b.id} /></span>
                  <span className="nom">{b.libelle}</span>
                  {/* La condition n'encombre pas l'écran mais reste du texte
                      réellement présent, donc lu. */}
                  <span className="visuellement-masque">, {t.badges.obtenuLe}. {b.condition}.</span>
                </li>
              ))}
              {prochain && (
                <li className="a-venir">
                  <span className="pastille"
                        style={{ "--avancement": Math.round((100 * prochain.avancement) / prochain.objectif) } as React.CSSProperties}>
                    <Verrou taille={22} />
                  </span>
                  <span className="nom">{prochain.libelle}</span>
                  <span className="compteur-badge" aria-hidden="true">
                    {prochain.avancement}/{prochain.objectif}
                  </span>
                  <span className="visuellement-masque">
                    , {t.badges.avancement(prochain.avancement, prochain.objectif)}. {prochain.condition}.
                  </span>
                </li>
              )}
            </ul>
          )}
        </section>
      )}

      {defi && !defi.fait && (
        <section className="defi" aria-labelledby="titre-defi">
          <div className="defi-visuel" aria-hidden="true" />
          <div className="defi-corps">
            <p className="sur-titre">{t.defi.titre}</p>
            <h2 id="titre-defi">{defi.libelle}</h2>
            <p className="recompense">
              <Cadeau taille={18} />
              {t.defi.recompense(defi.recompense_xp)}
            </p>
            <Link
              className="action"
              href={`/${langue}/partie?categorie=${defi.categorie_id}&niveau=${defi.niveau}&mode=defi_du_jour`}
            >
              <span aria-hidden="true">{t.defi.jouerMaintenant}</span>
              <span className="visuellement-masque">{t.defi.jouer(defi.libelle)}</span>
            </Link>
          </div>
        </section>
      )}

      {defi && defi.fait && (
        <section aria-labelledby="titre-defi-fait">
          <h2 id="titre-defi-fait">{t.defi.titre}</h2>
          <p>{t.defi.dejaFait}</p>
        </section>
      )}
    </>
  );
}

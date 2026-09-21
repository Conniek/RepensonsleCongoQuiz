"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { assurerSession } from "@/lib/session";
import { dictionnaire, type Langue } from "@/lib/i18n";
import { Personne, Flamme, Livre, Etoile, Coupe, PictoBadge, Verrou } from "../pictos";
import Fenetre from "../fenetre";

type Badge = {
  id: string; libelle: string; condition: string;
  objectif: number; avancement: number; obtenu: boolean;
};
type Categorie = { categorie_id: string; libelle: string; slug: string };

type Etat = {
  pseudo: string | null; rang: string; anonyme: boolean;
  serie_jours: number; parties: number;
  etoiles_total: number; etoiles_max: number;
  theme_favori: string | null;
  categories_jouees: Categorie[];
  badges: Badge[];
};

export default function PageProgressionClient({ langue }: { langue: Langue }) {
  const t = dictionnaire(langue);
  const [etat, setEtat] = useState<Etat | null>(null);
  const [echec, setEchec] = useState(false);
  const [fenetre, setFenetre] = useState(false);

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        await assurerSession();
        const { data } = await creerClientNavigateur().rpc("progression", { p_langue: langue });
        if (!annule) data ? setEtat(data as Etat) : setEchec(true);
      } catch {
        if (!annule) setEchec(true);
      }
    })();
    return () => { annule = true; };
  }, [langue]);

  if (echec) {
    return (
      <>
        <h1 tabIndex={-1}>{t.pageProgression.titre}</h1>
        <p role="alert">{t.profil.erreur}</p>
      </>
    );
  }
  if (!etat) {
    return (
      <>
        <h1 tabIndex={-1}>{t.pageProgression.titre}</h1>
        <p>{t.commun.chargement}</p>
      </>
    );
  }

  const obtenus = etat.badges.filter((b) => b.obtenu);
  const aVenir = etat.badges.filter((b) => !b.obtenu);

  return (
    <>
      <h1 className="visuellement-masque" tabIndex={-1}>{t.pageProgression.titre}</h1>

      {/* Identité du joueur : avatar par défaut, pseudo, rang, série. */}
      <section className="identite" aria-label={t.pageProgression.titre}>
        <span className="avatar" aria-hidden="true"><Personne taille={40} /></span>
        <div>
          {etat.pseudo ? (
            <p className="pseudo">{etat.pseudo}</p>
          ) : (
            <p className="pseudo">
              <Link href={`/${langue}/compte`}>{t.pageProgression.ajouterPseudo}</Link>
            </p>
          )}
          <p className="rang-joueur">{etat.rang}</p>
          {etat.serie_jours > 0 && (
            <p className="serie-joueur">
              <Flamme taille={18} />
              {t.progression.serie(etat.serie_jours)}
            </p>
          )}
        </div>
      </section>

      <section aria-labelledby="titre-thematiques">
        <h2 id="titre-thematiques">{t.pageProgression.thematiques}</h2>
        {etat.categories_jouees.length === 0 ? (
          <p>{t.pageProgression.aucuneThematique}</p>
        ) : (
          <ul className="etiquettes">
            {etat.categories_jouees.map((c) => (
              <li key={c.categorie_id}>
                <Link href={`/${langue}/categorie/${c.slug}`}>{c.libelle}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {etat.anonyme && (
        <section className="sauvegarde" aria-labelledby="titre-sauvegarde">
          <h2 id="titre-sauvegarde">{t.pageProgression.sauvegardeTitre}</h2>
          <p>{t.pageProgression.sauvegardeTexte}</p>
          <Link className="action" href={`/${langue}/compte`}>
            {t.pageProgression.sauvegardeAction}
          </Link>
        </section>
      )}

      {/* Quatre indicateurs. Une liste de définitions : chaque valeur est
          annoncée avec son libellé, dans l'ordre. */}
      <section aria-labelledby="titre-indicateurs">
        <h2 id="titre-indicateurs">{t.pageProgression.indicateurs}</h2>
        <dl className="indicateurs">
          <div>
            <dt><Livre taille={22} /> {t.pageProgression.kpiQuiz}</dt>
            <dd>{etat.parties}</dd>
          </div>
          <div>
            <dt><Flamme taille={22} /> {t.pageProgression.kpiSerie}</dt>
            <dd>{etat.serie_jours}</dd>
          </div>
          <div>
            <dt><Coupe taille={22} /> {t.pageProgression.kpiTheme}</dt>
            <dd>{etat.theme_favori ?? t.commun.sansValeur}</dd>
          </div>
          <div>
            <dt><Etoile taille={22} /> {t.pageProgression.kpiEtoiles}</dt>
            <dd>{t.pageProgression.kpiEtoilesValeur(etat.etoiles_total, etat.etoiles_max)}</dd>
          </div>
        </dl>
      </section>

      <section id="badges" aria-labelledby="titre-badges-prog">
        <div className="titre-section">
          <h2 id="titre-badges-prog">{t.pageProgression.badges}</h2>
          <button type="button" className="lien-bouton" onClick={() => setFenetre(true)}>
            <span aria-hidden="true">{t.pageProgression.voirPlus}</span>
            <span className="visuellement-masque">
              {t.pageProgression.voirTousLesBadges(etat.badges.length)}
            </span>
          </button>
        </div>

        {obtenus.length === 0 ? (
          <p>{t.pageProgression.aucunBadge}</p>
        ) : (
          <ul className="medaillons medaillons-grille">
            {obtenus.map((b) => (
              <li key={b.id}>
                <span className="pastille"><PictoBadge id={b.id} /></span>
                <span className="nom">{b.libelle}</span>
                <span className="visuellement-masque">, {t.badges.obtenuLe}. {b.condition}.</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Fenetre
        ouverte={fenetre}
        surFermeture={() => setFenetre(false)}
        titre={t.pageProgression.tousLesBadges}
        libelleFermer={t.pageProgression.fermer}
      >
        <h3>{t.pageProgression.obtenus}</h3>
        {obtenus.length === 0 ? (
          <p>{t.pageProgression.aucunBadge}</p>
        ) : (
          <ul className="medaillons medaillons-grille">
            {obtenus.map((b) => (
              <li key={b.id}>
                <span className="pastille"><PictoBadge id={b.id} /></span>
                <span className="nom">{b.libelle}</span>
                <span className="condition">{b.condition}</span>
              </li>
            ))}
          </ul>
        )}

        <h3>{t.pageProgression.aDebloquer}</h3>
        <ul className="medaillons medaillons-grille">
          {aVenir.map((b) => (
            <li key={b.id} className="a-venir">
              <span className="pastille"
                    style={{ "--avancement": Math.round((100 * b.avancement) / b.objectif) } as React.CSSProperties}>
                <Verrou taille={20} />
              </span>
              <span className="nom">{b.libelle}</span>
              <span className="condition">{b.condition}</span>
              <span className="compteur-badge">
                {t.badges.avancement(b.avancement, b.objectif)}
              </span>
            </li>
          ))}
        </ul>
      </Fenetre>
    </>
  );
}

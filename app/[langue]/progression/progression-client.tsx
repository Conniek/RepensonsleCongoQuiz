"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { assurerSession } from "@/lib/session";
import { dictionnaire, type Langue } from "@/lib/i18n";
import { PictoBadge, Verrou } from "../pictos";
import Fenetre from "../fenetre";
import Classement from "./classement";
import Card from "@/ui/Card";
import Meter from "@/ui/Meter";
import Ring from "@/ui/Ring";
import Stars from "@/ui/Stars";

type Badge = {
  id: string; libelle: string; condition: string;
  objectif: number; avancement: number; obtenu: boolean;
};
type Categorie = { categorie_id: string; libelle: string; slug: string };
type MaitriseCategorie = { categorie_id: string; etoiles: number };
const TEINTES_THEMATIQUES = [
  "pastel-creme",
  "pastel-bleu",
  "pastel-rose",
  "pastel-vert",
  "pastel-violet",
  "pastel-menthe",
] as const;

function iconeThematique(categorie: Categorie): string {
  const texte = `${categorie.slug} ${categorie.libelle}`.toLocaleLowerCase();
  if (texte.includes("histoire") || texte.includes("history")) return "🏛️";
  if (texte.includes("géograph") || texte.includes("geograph")) return "🗺️";
  if (texte.includes("culture") || texte.includes("art")) return "🎭";
  if (texte.includes("nature") || texte.includes("faune")) return "🦁";
  if (texte.includes("politique") || texte.includes("politic")) return "⚖️";
  if (texte.includes("économ") || texte.includes("econom")) return "💰";
  return "📚";
}

type Etat = {
  pseudo: string | null; rang: string; anonyme: boolean;
  xp: number; rang_seuil: number; rang_suivant: string | null;
  xp_rang_suivant: number | null; taux_reussite: number | null;
  serie_jours: number; serie_record: number; parties: number; bonnes_total: number;
  etoiles_total: number; etoiles_max: number;
  theme_favori: string | null;
  categories_jouees: Categorie[];
  maitrise: MaitriseCategorie[];
  badges: Badge[];
};

export default function PageProgressionClient({ langue }: { langue: Langue }) {
  const t = dictionnaire(langue);
  const [etat, setEtat] = useState<Etat | null>(null);
  const [echec, setEchec] = useState(false);
  const [fenetre, setFenetre] = useState(false);
  const entete = (
    <header className="progression-entete">
      <div className="brand-mark" aria-hidden="true">
        <div className="brand-mark__crest" aria-hidden="true"><span /></div>
        <p className="brand-mark__name">Repensons<br />le Congo</p>
      </div>
      <h1 className="visuellement-masque">{t.pageProgression.titre}</h1>
    </header>
  );

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
        {entete}
        <p role="alert">{t.profil.erreur}</p>
      </>
    );
  }
  if (!etat) {
    return (
      <>
        {entete}
        <p>{t.commun.chargement}</p>
      </>
    );
  }

  const obtenus = etat.badges.filter((b) => b.obtenu);
  const aVenir = etat.badges.filter((b) => !b.obtenu);
  const pseudo = etat.pseudo?.trim() || t.pageProgression.invite;
  const tauxReussite = etat.taux_reussite ?? 0;
  const avancementRang =
    etat.xp_rang_suivant != null && etat.xp_rang_suivant > 0
      ? Math.min(100, Math.round((100 * etat.xp) / etat.xp_rang_suivant))
    : 100;

  return (
    <>
      {entete}

      <section className="progression-resume" aria-labelledby="titre-resume-progression">
        <h2 id="titre-resume-progression">
          {t.pageProgression.salutation(pseudo)}
        </h2>
        <Card tone="bleu-roi" shadow="flottante" className="flex items-center gap-4">
          <h3 className="visuellement-masque">{t.progression.titre}</h3>

          <Ring value={tauxReussite} label={t.progression.reussite} />

          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest opacity-70 m-0 p-0">
              {t.progression.rangActuel}
            </p>
            <p className="font-black text-xl leading-tight m-0">{etat.rang}</p>

            <p className="mt-2 mb-1">
              <Meter
                value={avancementRang}
                tone="xp"
                label={
                  etat.xp_rang_suivant != null
                    ? t.progression.xpSurSeuil(etat.xp, etat.xp_rang_suivant)
                    : t.progression.rangMaximal(etat.xp)
                }
              />
              <span className="block text-[10px] opacity-70">
                {etat.xp_rang_suivant != null
                  ? t.progression.xpSurSeuil(etat.xp, etat.xp_rang_suivant)
                  : t.progression.rangMaximal(etat.xp)}
              </span>
            </p>
          </div>

          <p className="m-0 flex flex-col items-center shrink-0">
            <span aria-hidden="true" className="text-xl">🔥</span>
            <span className="font-black text-lg leading-none">{etat.serie_jours}</span>
            <span className="text-[9px] uppercase tracking-wide opacity-70 leading-none">
              {t.progression.jours}
            </span>
            <span className="visuellement-masque">
              {t.progression.serieJours(etat.serie_jours)}
            </span>
          </p>
        </Card>
      </section>

      {/* Le classement passe avant les thématiques : c'est la première
          chose qu'on vient regarder, et il donne une raison de rejouer. */}
      <Classement langue={langue} />

      {/* Erreurs et historique quittent la page Quiz pour vivre ici, avec le
          reste de ce qui regarde en arrière. */}
      <ul className="raccourcis">
        <li>
          <Link href={`/${langue}/quiz/erreurs`}>{t.quizHub.erreurs}</Link>
        </li>
        <li>
          <Link href={`/${langue}/quiz/historique`}>{t.quizHub.historique}</Link>
        </li>
      </ul>

      <section aria-labelledby="titre-thematiques">
        <h2 id="titre-thematiques">{t.pageProgression.thematiques}</h2>
        {etat.categories_jouees.length === 0 ? (
          <p>{t.pageProgression.aucuneThematique}</p>
        ) : (
          <ul className="progression-thematiques">
            {etat.categories_jouees.map((c, index) => {
              const etoiles = etat.maitrise.find((m) => m.categorie_id === c.categorie_id)?.etoiles ?? 0;
              return (
                <li key={c.categorie_id}>
                  <Link href={`/${langue}/categorie/${c.slug}`}>
                    <Card
                      tone={TEINTES_THEMATIQUES[index % TEINTES_THEMATIQUES.length]}
                      className="progression-theme"
                    >
                      <span className="progression-theme-icone" aria-hidden="true">
                        {iconeThematique(c)}
                      </span>
                      <span className="progression-theme-nom">{c.libelle}</span>
                      <Stars
                        value={etoiles}
                        label={t.quizHub.etoilesSur(etoiles, 6)}
                      />
                      <span className="progression-theme-compteur" aria-hidden="true">
                        {etoiles}/6
                      </span>
                    </Card>
                  </Link>
                </li>
              );
            })}
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
            <dt>
              <span aria-hidden="true">🎮</span>
              <span>{t.pageProgression.kpiQuiz}</span>
            </dt>
            <dd>{etat.parties}</dd>
          </div>
          <div>
            <dt>
              <span aria-hidden="true">✅</span>
              <span>{t.pageProgression.kpiBonnes}</span>
            </dt>
            <dd>{etat.bonnes_total}</dd>
          </div>
          <div>
            <dt>
              <span aria-hidden="true">🔥</span>
              <span>{t.pageProgression.kpiSerie}</span>
            </dt>
            <dd>{t.pageProgression.jours(etat.serie_jours)}</dd>
          </div>
          <div>
            <dt>
              <span aria-hidden="true">🏅</span>
              <span>{t.pageProgression.kpiRecordSerie}</span>
            </dt>
            <dd>{t.pageProgression.jours(etat.serie_record)}</dd>
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

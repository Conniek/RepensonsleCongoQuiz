"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { assurerSession } from "@/lib/session";
import { dictionnaire } from "@/lib/i18n";

type Badge = {
  id: string;
  libelle: string;
  condition: string;
  objectif: number;
  avancement: number;
  obtenu: boolean;
};

type Etat = {
  xp: number;
  rang: string;
  rang_seuil: number;
  rang_suivant: string | null;
  xp_rang_suivant: number | null;
  serie_jours: number;
  serie_record: number;
  parties: number;
  taux_reussite: number | null;
  badges: Badge[];
};

type Defi = {
  categorie: string;
  niveau: string;
  recompense_xp: number;
  fait: boolean;
};

/** Progression du joueur et défi du jour.
 *  Données personnelles, donc chargées après montage : la page d'accueil
 *  reste rendue sur le serveur et indexable. */
export default function Progression() {
  const t = dictionnaire();
  const [etat, setEtat] = useState<Etat | null>(null);
  const [defi, setDefi] = useState<Defi | null>(null);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        await assurerSession();
        const supabase = creerClientNavigateur();
        const [p, d] = await Promise.all([
          supabase.rpc("progression"),
          supabase.rpc("defi_du_jour"),
        ]);
        if (annule) return;
        if (p.data) setEtat(p.data as Etat);
        if (d.data) setDefi(d.data as Defi);
      } finally {
        if (!annule) setPret(true);
      }
    })();
    return () => {
      annule = true;
    };
  }, []);

  if (!pret) {
    return (
      <section aria-labelledby="titre-progression">
        <h2 id="titre-progression">{t.progression.titre}</h2>
        <p>{t.progression.chargement}</p>
      </section>
    );
  }

  const enCours = etat?.xp_rang_suivant != null;
  const restant = enCours ? etat!.xp_rang_suivant! - etat!.xp : 0;

  const obtenus = etat?.badges.filter((b) => b.obtenu) ?? [];
  const restants = (etat?.badges.length ?? 0) - obtenus.length;

  return (
    <>
      <section id="progression" aria-labelledby="titre-progression">
        <h2 id="titre-progression">{t.progression.titre}</h2>

        {etat && etat.parties > 0 ? (
          <>
            {/* L'information est portée par le TEXTE. L'élément <progress>
                ne fait que la redoubler visuellement : sa valeur est
                annoncée de façon inégale selon les lecteurs d'écran. */}
            <p>
              {t.progression.rangActuel} <strong>{etat.rang}</strong>.{" "}
              {enCours
                ? t.progression.resteAvantRang(
                    restant,
                    etat.rang_suivant!,
                    etat.xp,
                    etat.xp_rang_suivant!
                  )
                : t.progression.rangMaximal(etat.xp)}
            </p>
            {enCours && (
              <progress
                value={etat.xp - etat.rang_seuil}
                max={etat.xp_rang_suivant! - etat.rang_seuil}
                aria-hidden="true"
              />
            )}

            {etat.taux_reussite != null && (
              <p>{t.progression.tauxReussite(etat.taux_reussite, etat.parties)}</p>
            )}

            {etat.serie_jours > 0 && (
              <p>
                <time dateTime={`P${etat.serie_jours}D`}>
                  {t.progression.serie(etat.serie_jours)}
                </time>
                {etat.serie_record > etat.serie_jours &&
                  t.progression.record(etat.serie_record)}
              </p>
            )}
          </>
        ) : (
          <p>{t.progression.jamaisJoue}</p>
        )}
      </section>

      {defi && (
        <section aria-labelledby="titre-defi">
          <h2 id="titre-defi">{t.defi.titre}</h2>
          <h3>{defi.categorie}</h3>
          {defi.fait ? (
            <p>{t.defi.dejaFait}</p>
          ) : (
            <>
              <p>{t.defi.presentation(defi.recompense_xp)}</p>
              <p>
                <Link
                  href={`/partie?categorie=${encodeURIComponent(defi.categorie)}&niveau=${defi.niveau}&mode=defi_du_jour`}
                >
                  {t.defi.jouer(defi.categorie)}
                </Link>
              </p>
            </>
          )}
        </section>
      )}

      {etat && etat.badges.length > 0 && (
        <section aria-labelledby="titre-badges">
          <h2 id="titre-badges">{t.badges.titre}</h2>

          {/* Seuls les badges OBTENUS sont listés ici. Une grille de huit
              médaillons dont six grisés affiche surtout ce qu'on n'a pas.
              Le détail et les conditions sont sur le profil. */}
          {obtenus.length === 0 ? (
            <p>{t.badges.aucun}</p>
          ) : (
            <>
              <p>{t.badges.compteur(obtenus.length, etat.badges.length)}</p>
              <ul>
                {obtenus.map((b) => (
                  <li key={b.id}>
                    <strong>{b.libelle}</strong> — {b.condition}.
                  </li>
                ))}
              </ul>
            </>
          )}

          {restants > 0 && <p>{t.badges.resteADebloquer(restants)}</p>}

          <p>
            <Link href="/profil">{t.badges.voirTous(etat.badges.length)}</Link>
          </p>
        </section>
      )}
    </>
  );
}

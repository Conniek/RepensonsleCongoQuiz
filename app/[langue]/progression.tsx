"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { assurerSession } from "@/lib/session";
import { dictionnaire, type Langue } from "@/lib/i18n";

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

export default function Progression({ langue }: { langue: Langue }) {
  const t = dictionnaire(langue);
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
          supabase.rpc("progression", { p_langue: langue }),
          supabase.rpc("defi_du_jour", { p_langue: langue }),
        ]);
        if (annule) return;
        if (p.data) setEtat(p.data as Etat);
        if (d.data) setDefi(d.data as Defi);
      } finally {
        if (!annule) setPret(true);
      }
    })();
    return () => { annule = true; };
  }, [langue]);

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
            {/* L'information est portée par le TEXTE ; <progress> ne fait
                que la redoubler visuellement. */}
            <p>
              {t.progression.rangActuel} <strong>{etat.rang}</strong>.{" "}
              {enCours
                ? t.progression.resteAvantRang(restant, etat.rang_suivant!, etat.xp, etat.xp_rang_suivant!)
                : t.progression.rangMaximal(etat.xp)}
            </p>
            {enCours && (
              <progress value={etat.xp - etat.rang_seuil}
                        max={etat.xp_rang_suivant! - etat.rang_seuil}
                        aria-hidden="true" />
            )}
            {etat.taux_reussite != null && (
              <p>{t.progression.tauxReussite(etat.taux_reussite, etat.parties)}</p>
            )}
            {etat.serie_jours > 0 && (
              <p>
                <time dateTime={`P${etat.serie_jours}D`}>
                  {t.progression.serie(etat.serie_jours)}
                </time>
                {etat.serie_record > etat.serie_jours && t.progression.record(etat.serie_record)}
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
          <h3>{defi.libelle}</h3>
          {defi.fait ? (
            <p>{t.defi.dejaFait}</p>
          ) : (
            <>
              <p>{t.defi.presentation(defi.recompense_xp)}</p>
              <p>
                <Link href={`/${langue}/partie?categorie=${defi.categorie_id}&niveau=${defi.niveau}&mode=defi_du_jour`}>
                  {t.defi.jouer(defi.libelle)}
                </Link>
              </p>
            </>
          )}
        </section>
      )}

      {etat && etat.badges.length > 0 && (
        <section aria-labelledby="titre-badges">
          <h2 id="titre-badges">{t.badges.titre}</h2>
          {/* Seuls les badges OBTENUS ici : l'accueil récompense, le profil informe. */}
          {obtenus.length === 0 ? (
            <p>{t.badges.aucun}</p>
          ) : (
            <>
              <p>{t.badges.compteur(obtenus.length, etat.badges.length)}</p>
              <ul>
                {obtenus.map((b) => (
                  <li key={b.id}><strong>{b.libelle}</strong> — {b.condition}.</li>
                ))}
              </ul>
            </>
          )}
          {restants > 0 && <p>{t.badges.resteADebloquer(restants)}</p>}
          <p>
            <Link href={`/${langue}/profil`}>{t.badges.voirTous(etat.badges.length)}</Link>
          </p>
        </section>
      )}
    </>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { assurerSession } from "@/lib/session";
import { dictionnaire, type Langue } from "@/lib/i18n";
import { PictoBadge } from "./pictos";
import {
  vueCategories,
  type CategorieSource,
  type MaitriseSource,
  type VueCategorie,
} from "@/lib/vues";
import { CarteTheme } from "./quiz/carte-theme";
import SelecteurNiveau from "./quiz/selecteur-niveau";

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
  niveau: "facile" | "moyen" | "difficile"; recompense_xp: number; fait: boolean;
};

/** Anneau de réussite.
 *
 *  Dessiné en `conic-gradient`, comme dans le prototype : aucune image, aucun
 *  SVG, et il suit la taille du texte. Le pourcentage est écrit au centre,
 *  donc l'anneau lui-même est décoratif. */
function Anneau({ pourcentage, langue }: { pourcentage: number; langue: Langue }) {
  const t = dictionnaire(langue);
  const p = Math.min(Math.max(pourcentage, 0), 100);

  return (
    <p
      className="anneau m-0 shrink-0 grid place-items-center"
      style={{ ["--part" as string]: `${p}%` }}
    >
      <span className="anneau-centre grid place-items-center rounded-rond text-center">
        <span className="block font-black leading-none">{p} %</span>
        <span className="block text-[10px] uppercase tracking-wide opacity-70 leading-none">
          {t.progression.reussite}
        </span>
      </span>
    </p>
  );
}

export default function AccueilEcran({
  langue,
  categories,
}: {
  langue: Langue;
  categories: CategorieSource[];
}) {
  const t = dictionnaire(langue);
  const supabase = useMemo(() => creerClientNavigateur(), []);

  const [etat, setEtat] = useState<Etat | null>(null);
  const [defi, setDefi] = useState<Defi | null>(null);
  const [maitrise, setMaitrise] = useState<MaitriseSource[]>([]);
  const [droits, setDroits] = useState<string[]>([]);
  const [choisi, setChoisi] = useState<VueCategorie | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await assurerSession();
        const [p, d, m, dr] = await Promise.all([
          supabase.rpc("progression", { p_langue: langue }),
          supabase.rpc("defi_du_jour", { p_langue: langue }),
          supabase.from("maitrise").select("categorie_id, niveau, etoiles"),
          supabase.rpc("mes_droits"),
        ]);
        setEtat((p.data ?? null) as Etat);
        setDefi((d.data ?? null) as Defi);
        setMaitrise((m.data ?? []) as MaitriseSource[]);
        setDroits(((dr.data ?? []) as { produit: string }[]).map((x) => x.produit));
      } catch {
        /* La page reste lisible sans session : seules la progression et les
           badges manquent. Le catalogue, lui, vient du serveur. */
      }
    })();
  }, [supabase, langue]);

  const vues = vueCategories(categories, maitrise, droits).filter(
    (v) => v.produitRequis === null
  );

  const premierQuiz = !etat || etat.parties === 0;
  const salutation = !etat
    ? null
    : etat.pseudo
      ? premierQuiz
        ? t.accueil.salutPremier(etat.pseudo)
        : t.accueil.salutRetour(etat.pseudo)
      : premierQuiz
        ? t.accueil.salutAnonymePremier
        : t.accueil.salutAnonymeRetour;

  const reussite = etat?.taux_reussite ?? 0;
  const obtenus = (etat?.badges ?? []).filter((b) => b.obtenu);
  const enCours = (etat?.badges ?? [])
    .filter((b) => !b.obtenu && b.avancement > 0)
    .sort((a, b) => b.avancement / b.objectif - a.avancement / a.objectif)
    .slice(0, 2);
  const badgesMontres = [...obtenus.slice(0, 3), ...enCours].slice(0, 4);

  /* Avancement vers le rang suivant. Au dernier rang, la barre est pleine :
     il n'y a plus de seuil à atteindre, et afficher 0 % serait un contresens. */
  const avancementRang =
    etat?.xp_rang_suivant != null && etat.xp_rang_suivant > 0
      ? Math.min(100, Math.round((100 * etat.xp) / etat.xp_rang_suivant))
      : 100;

  return (
    <div className="pb-24 pt-12">
      {/* Reprise de la phrase d'orientation, pour les moteurs et les lecteurs
          d'écran : elle n'a pas de place visible dans cette mise en page. */}
      <p className="visuellement-masque">
        {t.marque.presentation(
          categories.reduce((s, c) => s + c.nb_questions, 0),
          categories.length
        )}
      </p>

      {/* En-tête */}
      <header className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest opacity-60 m-0">
            {t.quizHub.surtitre}
          </p>
          <h1>{salutation ?? t.accueil.salutAnonymePremier}</h1>
          <p className="text-sm opacity-70 m-0">{t.accueil.heroBaseline}</p>
        </div>

        <p className="shrink-0 m-0 flex flex-col items-center gap-0.5">
          <span
            className="w-14 h-14 rounded-l grid place-items-center text-3xl bg-splash"
            aria-hidden="true"
          >
            🇨🇩
          </span>
          <span className="text-[10px] font-semibold opacity-60">RDC</span>
        </p>
      </header>

      {/* Carte de rang */}
      {etat && (
        <section
          aria-labelledby="titre-rang"
          className="mt-4 p-4 rounded-l bg-primaire text-primaire-contraste shadow-flottante flex items-center gap-4"
        >
          <h2 id="titre-rang" className="visuellement-masque">
            {t.progression.titre}
          </h2>

          <Anneau pourcentage={Math.round(reussite)} langue={langue} />

          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 m-0">
              {t.progression.rangActuel}
            </p>
            <p className="font-black text-xl leading-tight m-0">{etat.rang}</p>

            <p className="mt-2 mb-1">
              <progress
                className="w-full h-2"
                value={avancementRang}
                max={100}
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
        </section>
      )}

      {/* Badges */}
      {badgesMontres.length > 0 && (
        <section aria-labelledby="titre-badges" className="mt-6">
          <div className="flex items-center justify-between">
            <h2 id="titre-badges">{t.progression.badges}</h2>
            <Link href={`/${langue}/progression#badges`} className="text-sm">
              {t.commun.voirTout}
            </Link>
          </div>

          <ul className="list-none p-0 mt-3 flex gap-4 overflow-x-auto">
            {badgesMontres.map((b) => (
              <li key={b.id} className="shrink-0 w-16 text-center">
                <span
                  className={`block w-16 h-16 rounded-rond grid place-items-center ${
                    b.obtenu ? "bg-accent" : "bg-doux"
                  }`}
                >
                  <PictoBadge id={b.id} taille={28} />
                </span>
                <span className="block text-xs font-black leading-tight mt-1">
                  {b.libelle}
                </span>
                <span className="block text-[10px] uppercase tracking-wide opacity-60">
                  {b.obtenu
                    ? t.progression.badgeObtenu
                    : `${b.avancement}/${b.objectif}`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Bonnes réponses */}
      {etat && etat.parties > 0 && (
        <p className="mt-4 flex items-center gap-3 px-4 py-3 rounded-l bg-doux">
          <span aria-hidden="true" className="text-3xl">🌿</span>
          <span className="font-black text-2xl">{Math.round(reussite)} %</span>
          <span className="text-xs">
            <span className="block font-bold uppercase tracking-wide">
              {t.progression.partBonnesReponses}
            </span>
          </span>
        </p>
      )}

      {/* Quiz du jour */}
      {defi && !defi.fait && (
        <section aria-labelledby="titre-defi" className="mt-6">
          <h2 id="titre-defi" className="visuellement-masque">{t.defi.titre}</h2>
             
  
          <Link
            href={`/${langue}/partie?categorie=${defi.categorie_id}&niveau=${defi.niveau}&defi=1`}
            className="flex rounded-l overflow-hidden no-underline text-encre bg-accent shadow-flottante"
          >
                    <img src="public/categories/congo-contemporain-1790804453948.avif" alt="Un large fleuve bordé de forêt dense, traversé par une pirogue." width="900" height="600" />
      
            <span className="flex-1 p-4">
              <span className="block text-[10px] font-black uppercase tracking-widest opacity-70">
                {t.defi.titre}
              </span>
              <span className="block font-black leading-tight mt-1">{defi.libelle}</span>
              <span className="block text-xs font-semibold mt-1">
                {t.defi.recompense(defi.recompense_xp)}
              </span>
              <span className="mt-3 block py-2 px-3 rounded-m text-center text-xs font-black uppercase tracking-widest bg-encre text-fond">
                {t.defi.jouerMaintenant}
              </span>
            </span>
          </Link>
        </section>
      )}

      {/* Catégories */}
      <section aria-labelledby="titre-categories" className="mt-6">
        <div className="flex items-center justify-between">
          <h2 id="titre-categories" className="m-0">{t.accueil.titreCategories}</h2>
          <Link href={`/${langue}/categorie`} className="text-sm">
            {t.commun.voirTout}
            <span className="visuellement-masque">
              {" "}
              {t.accueil.voirToutesCategories(vues.length)}
            </span>
          </Link>
        </div>

        <ul className="list-none p-0 mt-3 grid grid-cols-2 gap-3">
          {vues.slice(0, 8).map((vue, index) => (
            <CarteTheme
              key={vue.id}
              vue={vue}
              langue={langue}
              prioritaire={index < 2}
              onJouer={setChoisi}
            />
          ))}
        </ul>
      </section>

      {choisi && (
        <SelecteurNiveau vue={choisi} langue={langue} onFermer={() => setChoisi(null)} />
      )}
    </div>
  );
}

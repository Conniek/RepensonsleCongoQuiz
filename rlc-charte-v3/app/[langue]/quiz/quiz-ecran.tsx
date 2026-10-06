"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { assurerSession } from "@/lib/session";
import { dictionnaire, type Langue } from "@/lib/i18n";
import type { Niveau } from "@/lib/slug";
import {
  trierParFamille,
  vueCategories,
  type CategorieSource,
  type MaitriseSource,
  type VueCategorie,
} from "@/lib/vues";
import { CarteTheme } from "./carte-theme";
import SelecteurNiveau from "./selecteur-niveau";

type Defi = {
  categorie_id: string;
  libelle: string;
  niveau: Niveau;
  recompense_xp: number;
  fait: boolean;
} | null;

type Reco = {
  categorie_id: string;
  libelle: string;
  slug: string;
  niveau: Niveau;
  etoiles_niveau: number;
};

export default function QuizEcran({
  langue,
  categories,
}: {
  langue: Langue;
  categories: CategorieSource[];
}) {
  const t = dictionnaire(langue);
  const supabase = useMemo(() => creerClientNavigateur(), []);

  const [maitrise, setMaitrise] = useState<MaitriseSource[]>([]);
  const [droits, setDroits] = useState<string[]>([]);
  const [defi, setDefi] = useState<Defi>(null);
  const [recos, setRecos] = useState<Reco[]>([]);
  const [choisi, setChoisi] = useState<VueCategorie | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await assurerSession();
        const [m, d, r, dr] = await Promise.all([
          supabase.from("maitrise").select("categorie_id, niveau, etoiles"),
          supabase.rpc("defi_du_jour", { p_langue: langue }),
          supabase.rpc("recommandations", { p_langue: langue }),
          supabase.rpc("mes_droits"),
        ]);
        setMaitrise((m.data ?? []) as MaitriseSource[]);
        setDefi((d.data ?? null) as Defi);
        setRecos((r.data ?? []) as Reco[]);
        setDroits(((dr.data ?? []) as { produit: string }[]).map((x) => x.produit));
      } catch {
        /* Sans session, la page reste lisible : thèmes visibles, progression
           simplement absente. On ne bloque jamais la lecture du catalogue. */
      }
    })();
  }, [supabase, langue]);

  const vues = vueCategories(categories, maitrise, droits);
  const { libres, plus, langues } = trierParFamille(vues);

  return (
    <div className="pb-24">
      <p className="text-xs font-bold uppercase tracking-widest opacity-60 m-0">
        {t.quizHub.surtitre}
      </p>
      <h1 className="mt-1">{t.quizHub.titre}</h1>

      {/* Défi du jour */}
      {defi && (
        <section aria-labelledby="titre-defi" className="mb-6">
          <h2 id="titre-defi" className="visuellement-masque">{t.defi.titre}</h2>

          {defi.fait ? (
            <p className="flex items-center gap-3 p-4 rounded-l bg-pastel-creme m-0">
              <span aria-hidden="true" className="text-2xl">✓</span>
              <span>
                <span className="block font-black">{t.quizHub.defiFait}</span>
                <span className="block text-xs opacity-70">{t.quizHub.defiFaitTexte}</span>
              </span>
            </p>
          ) : (
            <Link
              href={`/${langue}/partie?categorie=${defi.categorie_id}&niveau=${defi.niveau}&defi=1`}
              className="flex items-center gap-3 p-4 rounded-l no-underline bg-encre text-sur-encre shadow-flottante"
            >
              <span aria-hidden="true" className="text-2xl">⚡</span>
              <span className="flex-1">
                <span className="block font-black">{t.defi.titre}</span>
                <span className="block text-xs opacity-80">
                  {t.quizHub.defiAnnonce(defi.libelle, t.niveaux[defi.niveau], defi.recompense_xp)}
                </span>
              </span>
              <span aria-hidden="true">→</span>
            </Link>
          )}
        </section>
      )}

      {/* Thèmes : les libres, puis les verrouillés, dans la même grille */}
      <section aria-labelledby="titre-themes">
        <h2 id="titre-themes">{t.quizHub.themes}</h2>
        <ul className="list-none p-0 m-0 grid grid-cols-2 gap-3">
          {libres.map((vue, index) => (
            <CarteTheme
              key={vue.id}
              vue={vue}
              langue={langue}
              prioritaire={index < 2}
              onJouer={setChoisi}
            />
          ))}
          {/* La carte connaît son état : verrouillée, elle montre le cadenas
              et mène aux offres. Rien à décider ici. */}
          {plus.map((vue) => (
            <CarteTheme key={vue.id} vue={vue} langue={langue} onJouer={setChoisi} />
          ))}
        </ul>
      </section>

      {/* Langues */}
      {langues.length > 0 && (
        <section aria-labelledby="titre-langues" className="mt-6">
          <h2 id="titre-langues">{t.quizHub.langues}</h2>
          <p className="text-sm opacity-70">{t.quizHub.languesTexte}</p>
          <ul className="list-none p-0 m-0 grid grid-cols-2 gap-3">
            {langues.map((vue) => (
              <CarteTheme key={vue.id} vue={vue} langue={langue} onJouer={setChoisi} />
            ))}
          </ul>
        </section>
      )}

      {/* Pour toi — conservé, contrairement au prototype qui l'avait retiré */}
      {recos.length > 0 && (
        <section aria-labelledby="titre-pour-toi" className="mt-6">
          <h2 id="titre-pour-toi">{t.quizHub.pourToi}</h2>
          <ul className="list-none p-0 m-0 flex flex-col gap-2">
            {recos.map((r) => (
              <li key={`${r.categorie_id}-${r.niveau}`}>
                <Link
                  href={`/${langue}/partie?categorie=${r.categorie_id}&niveau=${r.niveau}`}
                  className="flex items-center gap-3 p-4 rounded-l bg-carte no-underline text-encre shadow-carte"
                >
                  <span className="flex-1">
                    <span className="block font-black">{r.libelle}</span>
                    <span className="block text-xs opacity-70">
                      {t.niveaux[r.niveau]} · {t.quizHub.etoilesAGagner(2 - r.etoiles_niveau)}
                    </span>
                  </span>
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {choisi && (
        <SelecteurNiveau vue={choisi} langue={langue} onFermer={() => setChoisi(null)} />
      )}
    </div>
  );
}

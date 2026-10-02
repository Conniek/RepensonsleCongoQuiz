"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { dictionnaire, type Langue } from "@/lib/i18n";
import { NIVEAUX } from "@/lib/slug";
import { niveauOuvert, type VueCategorie } from "@/lib/vues";

/** Sélecteur de niveau.
 *
 *  Construit sur l'élément <dialog> natif : il apporte le piège à focus, la
 *  fermeture par Échap et le retour du focus au bouton d'origine, sans une
 *  ligne de code. Les recopier à la main, c'est se tromper quelque part. */
export default function SelecteurNiveau({
  vue,
  langue,
  onFermer,
}: {
  vue: VueCategorie;
  langue: Langue;
  onFermer: () => void;
}) {
  const t = dictionnaire(langue);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onFermer}
      aria-label={t.quizHub.choisirNiveau(vue.libelle)}
      className="m-0 mt-auto w-full max-w-[430px] mx-auto rounded-t-l bg-carte p-6 pb-10 backdrop:bg-black/55"
    >
      <h2 className="mt-0">{vue.libelle}</h2>
      <p className="text-sm opacity-70">{t.quizHub.questions(vue.nbQuestions)}</p>

      <ul className="list-none p-0 m-0 flex flex-col gap-3">
        {NIVEAUX.map((niveau) => {
          const ouvert = niveauOuvert(vue, niveau);
          const libelle = t.niveaux[niveau];

          return (
            <li key={niveau}>
              {ouvert ? (
                <Link
                  href={`/${langue}/partie?categorie=${vue.id}&niveau=${niveau}`}
                  className={`${vue.teinte} flex items-center gap-3 p-4 rounded-l no-underline text-encre`}
                >
                  <span className="flex-1 font-black">{libelle}</span>
                  <span className="px-3 py-1 rounded-s text-xs font-black uppercase tracking-wide bg-encre text-fond">
                    {t.quizHub.jouer}
                  </span>
                </Link>
              ) : (
                /* Verrouillé : on garde l'élément, on annonce la condition.
                   `aria-disabled` plutôt que `disabled`, pour qu'il reste
                   atteignable au clavier et donc lisible. */
                <p
                  aria-disabled="true"
                  className="flex items-center gap-3 p-4 rounded-l bg-doux border border-bordure m-0"
                  tabIndex={0}
                >
                  <span aria-hidden="true">🔒</span>
                  <span className="flex-1">
                    <span className="block font-black">{libelle}</span>
                    <span className="block text-xs opacity-70">
                      {niveau === "moyen"
                        ? t.categorie.conditionMoyen
                        : t.categorie.conditionDifficile}
                    </span>
                  </span>
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <form method="dialog" className="mt-4">
        <button type="submit" className="w-full">{t.quizHub.annuler}</button>
      </form>
    </dialog>
  );
}

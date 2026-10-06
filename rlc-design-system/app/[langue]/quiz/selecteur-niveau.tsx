"use client";

import Link from "next/link";
import { Button, Card, Modal } from "@/ui";
import { dictionnaire, type Langue } from "@/lib/i18n";
import { NIVEAUX } from "@/lib/slug";
import { niveauOuvert, type VueCategorie } from "@/lib/vues";
import { toneClass } from "@/ui";

/** Choix du niveau, ouvert depuis une carte de thème.
 *
 *  Les niveaux non atteints restent affichés et annoncés, avec leur
 *  condition : c'est ce qui donne envie de les atteindre, et les masquer les
 *  rendrait invisibles aux lecteurs d'écran. */
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

  return (
    <Modal label={t.quizHub.choisirNiveau(vue.libelle)} onClose={onFermer}>
      <h2 className="mt-0">{vue.libelle}</h2>
      <p className="text-sm opacity-70">{t.quizHub.questions(vue.nbQuestions)}</p>

      <ul className="list-none p-0 m-0 flex flex-col gap-3">
        {NIVEAUX.map((niveau) => {
          const ouvert = niveauOuvert(vue, niveau);
          const libelle = t.niveaux[niveau];

          if (!ouvert) {
            return (
              <li key={niveau}>
                {/* `aria-disabled` et non `disabled` : l'élément reste
                    atteignable au clavier, donc lisible. */}
                <p
                  aria-disabled="true"
                  tabIndex={0}
                  className="flex items-center gap-3 p-4 rounded-l bg-doux border border-bordure m-0"
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
              </li>
            );
          }

          return (
            <li key={niveau}>
              <Link
                href={`/${langue}/partie?categorie=${vue.id}&niveau=${niveau}`}
                className={`${toneClass(vue.teinte)} flex items-center gap-3 p-4 rounded-l no-underline`}
              >
                <span className="flex-1 font-black">{libelle}</span>
                <span className="px-3 py-1 rounded-s text-xs font-black uppercase tracking-wide bg-encre text-fond">
                  {t.quizHub.jouer}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <form method="dialog" className="mt-4">
        <Button type="submit" intent="discret" full>
          {t.quizHub.annuler}
        </Button>
      </form>
    </Modal>
  );
}

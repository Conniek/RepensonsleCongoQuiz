"use client";

import Link from "next/link";
import { Button, Card, Meter, Stars, Tag } from "@/ui";
import { urlIllustration } from "@/lib/illustrations";
import { dictionnaire, type Langue } from "@/lib/i18n";
import { ETOILES_MAX, type VueCategorie } from "@/lib/vues";

/** Carte d'un thème.
 *
 *  Un seul composant, deux états : jouable ou verrouillé. C'est la règle du
 *  design system — une variante plutôt qu'un composant de plus.
 *
 *  Le titre est un LIEN vers la catégorie, qui se partage et s'ouvre dans un
 *  onglet ; « Jouer » est un BOUTON qui ouvre la fenêtre de choix du niveau.
 *  Le prototype n'avait qu'un gros bouton, ce qui supprimait toute
 *  navigation. */
export function CarteTheme({
  vue,
  langue,
  prioritaire = false,
  onJouer,
}: {
  vue: VueCategorie;
  langue: Langue;
  prioritaire?: boolean;
  onJouer: (vue: VueCategorie) => void;
}) {
  const t = dictionnaire(langue);
  const verrouille = !vue.accessible;
  const estPlus = vue.produitRequis === "plus";
  const offre = estPlus ? t.quizHub.offrePlus : t.quizHub.offreLangue;

  return (
    <li className="contents">
      <Card tone={vue.teinte} padding={false} className="relative flex flex-col">
        <Link
          href={
            verrouille
              ? `/${langue}/offres?produit=${vue.produitRequis}`
              : `/${langue}/categorie/${vue.slug}`
          }
          className="block no-underline text-encre"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urlIllustration(vue.slug, vue.illustration)}
            alt=""
            width={640}
            height={400}
            loading={prioritaire ? "eager" : "lazy"}
            decoding="async"
            className={`w-full h-28 object-cover ${
              verrouille ? "grayscale-[0.7] brightness-90" : ""
            }`}
          />

          <div className="p-3 flex flex-col gap-1.5">
            <p className="m-0 font-black leading-tight">{vue.libelle}</p>

            {verrouille ? (
              <p className="m-0 text-xs opacity-70">{t.quizHub.inclusDans(offre)}</p>
            ) : (
              <>
                <p className="m-0 text-xs uppercase tracking-wide opacity-60">
                  {t.quizHub.questions(vue.nbQuestions)}
                </p>

                <Stars
                  value={vue.etoilesTotal}
                  max={ETOILES_MAX}
                  label={t.quizHub.etoilesSur(vue.etoilesTotal, ETOILES_MAX)}
                />

                <p className="flex items-center gap-2 m-0">
                  <Meter
                    value={vue.etoilesTotal}
                    max={ETOILES_MAX}
                    label={t.quizHub.avancement(vue.avancement)}
                    className="flex-1"
                  />
                  <span aria-hidden="true" className="text-[10px] font-semibold opacity-60">
                    {vue.avancement} %
                  </span>
                </p>
              </>
            )}
          </div>
        </Link>

        {verrouille && (
          <p className="absolute top-2 right-2 m-0">
            <Tag tone={estPlus ? "encre" : "jaune"} icone="🔒">
              {offre}
            </Tag>
          </p>
        )}

        <p className="px-3 pb-3 mt-auto m-0">
          {verrouille ? (
            <Button
              href={`/${langue}/offres?produit=${vue.produitRequis}`}
              small
              full
              arrow
            >
              {t.quizHub.debloquer}
              <span className="visuellement-masque"> {vue.libelle}</span>
            </Button>
          ) : (
            <Button onClick={() => onJouer(vue)} small full>
              {t.quizHub.jouer}
              <span className="visuellement-masque"> — {vue.libelle}</span>
            </Button>
          )}
        </p>
      </Card>
    </li>
  );
}

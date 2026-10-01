"use client";

import Link from "next/link";
import { urlIllustration } from "@/lib/illustrations";
import { dictionnaire, type Langue } from "@/lib/i18n";
import { ETOILES_MAX, type VueCategorie } from "@/lib/vues";

/** Les étoiles.
 *
 *  Le prototype empile six caractères « ★ ». Un lecteur d'écran les lirait
 *  un par un, soit « étoile étoile étoile » sans fin. On les masque donc, et
 *  on donne le compte en toutes lettres à côté. */
function Etoiles({ total, langue }: { total: number; langue: Langue }) {
  const t = dictionnaire(langue);
  return (
    <p className="flex items-center gap-0.5 m-0">
      <span aria-hidden="true" className="text-[13px] leading-none">
        {"★".repeat(total)}
        <span className="opacity-25">{"★".repeat(ETOILES_MAX - total)}</span>
      </span>
      <span className="visuellement-masque">
        {t.quizHub.etoilesSur(total, ETOILES_MAX)}
      </span>
    </p>
  );
}

/** Carte d'un thème jouable.
 *
 *  Le prototype en fait un seul gros bouton qui ouvre une fenêtre de choix
 *  du niveau. On garde cette rapidité, mais on sépare les deux gestes :
 *  le titre est un LIEN vers la page de la catégorie, qui se partage et
 *  s'ouvre dans un onglet ; « Jouer » est un BOUTON qui ouvre la fenêtre.
 *  Un bouton unique aurait supprimé toute possibilité de naviguer. */
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

  return (
    <li className={`${vue.teinte} rounded-l overflow-hidden shadow-carte`}>
      <Link
        href={`/${langue}/categorie/${vue.slug}`}
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
          className="w-full h-28 object-cover"
        />

        <div className="p-3 flex flex-col gap-1.5">
          <p className="m-0 font-black leading-tight">{vue.libelle}</p>
          <p className="m-0 text-xs uppercase tracking-wide opacity-60">
            {t.quizHub.questions(vue.nbQuestions)}
          </p>

          <Etoiles total={vue.etoilesTotal} langue={langue} />

          {/* La barre double l'information des étoiles : une personne qui ne
              distingue pas le jaune du gris lit quand même l'avancement. */}
          <p className="flex items-center gap-2 m-0">
            <progress
              className="flex-1 h-1.5"
              value={vue.etoilesTotal}
              max={ETOILES_MAX}
            />
            <span className="text-[10px] font-semibold opacity-60">
              {vue.avancement} %
            </span>
            <span className="visuellement-masque">
              {t.quizHub.avancement(vue.avancement)}
            </span>
          </p>

        </div>
      </Link>

      <p className="px-3 pb-3 m-0">
        <button
          type="button"
          onClick={() => onJouer(vue)}
          className="w-full py-2 rounded-m text-xs font-black uppercase tracking-widest bg-encre text-fond"
        >
          {t.quizHub.jouer}
          <span className="visuellement-masque"> — {vue.libelle}</span>
        </button>
      </p>
    </li>
  );
}

/** Carte d'un thème verrouillé.
 *
 *  Elle garde sa place, sa taille et son annonce : c'est le contenu qu'on
 *  veut vendre, le masquer serait absurde, et le retirer le rendrait
 *  invisible aux lecteurs d'écran. */
export function CarteThemeVerrouille({
  vue,
  langue,
}: {
  vue: VueCategorie;
  langue: Langue;
}) {
  const t = dictionnaire(langue);
  const estPlus = vue.produitRequis === "plus";
  const offre = estPlus ? t.quizHub.offrePlus : t.quizHub.offreLangue;

  return (
    <li className={`${vue.teinte} rounded-l overflow-hidden shadow-carte relative opacity-90`}>
      <Link
        href={`/${langue}/offres?produit=${vue.produitRequis}`}
        className="block no-underline text-encre"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={urlIllustration(vue.slug, vue.illustration)}
          alt=""
          width={640}
          height={400}
          loading="lazy"
          decoding="async"
          className="w-full h-28 object-cover grayscale-[0.7] brightness-90"
        />

        <p
          className={`absolute top-2 right-2 m-0 px-2 py-0.5 rounded-rond text-xs font-black ${
            estPlus ? "bg-primaire text-primaire-contraste" : "bg-accent text-accent-contraste"
          }`}
        >
          <span aria-hidden="true">🔒 </span>
          {offre}
        </p>

        <div className="p-3">
          <p className="m-0 mb-1 font-black leading-tight">{vue.libelle}</p>
          <p className="m-0 text-xs opacity-70">{t.quizHub.inclusDans(offre)}</p>

          <span className="mt-2 block py-2 rounded-m text-center text-xs font-black uppercase tracking-widest bg-encre text-fond">
            {t.quizHub.debloquer}
            <span className="visuellement-masque"> {vue.libelle}</span>
            <span aria-hidden="true"> →</span>
          </span>
        </div>
      </Link>
    </li>
  );
}

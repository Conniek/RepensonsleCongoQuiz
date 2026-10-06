import type { ReactNode } from "react";

/** Teintes disponibles. Les classes sont écrites en entier : Tailwind lit le
 *  code comme du texte, une classe assemblée à l'exécution ne serait jamais
 *  générée. */
/* Les six teintes de la charte, et leur couleur de texte mesurée.
 *
 *  Le texte n'est jamais choisi au jugé : sur le bleu clair de la charte, du
 *  blanc tomberait à 2,63 contre 1, loin sous le seuil. C'est de l'encre. */
const TONS = {
  carte: "bg-carte text-encre",
  creme: "bg-creme text-encre",
  sourd: "bg-sourd text-encre",
  encre: "bg-encre text-sur-encre",
  bleu: "bg-bleu text-sur-bleu",
  rouge: "bg-rouge text-sur-rouge",
  vert: "bg-vert text-sur-vert",
  "bleu-profond": "bg-bleu-profond text-sur-bleu-profond",
} as const;

export type CardTone = keyof typeof TONS;

export function toneClass(tone: CardTone) {
  return TONS[tone];
}

export default function Card({
  tone = "carte",
  padding = true,
  outline,
  shadow = "carte",
  className = "",
  children,
}: {
  tone?: CardTone;
  /** Faux quand la carte commence par une image à fleur de bord. */
  padding?: boolean;
  /** Filet d'encre. Vrai par défaut sur les teintes claires : le fond de la
   *  page étant jaune, une carte crème ne s'en détache que de 1,3 contre 1.
   *  C'est le trait qui dessine la carte, pas la couleur. */
  outline?: boolean;
  shadow?: "carte" | "flottante" | "aucune";
  className?: string;
  children: ReactNode;
}) {
  const ombre =
    shadow === "flottante" ? "shadow-flottante" : shadow === "carte" ? "shadow-carte" : "";

  const clair = tone === "carte" || tone === "creme" || tone === "sourd";
  const filet = (outline ?? clair) ? "border-2 border-encre" : "";

  return (
    <div
      className={`rounded-l overflow-hidden ${TONS[tone]} ${filet} ${ombre} ${
        padding ? "p-4" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

import type { ReactNode } from "react";

/** Teintes disponibles. Les classes sont écrites en entier : Tailwind lit le
 *  code comme du texte, une classe assemblée à l'exécution ne serait jamais
 *  générée. */
/* Les six teintes de la charte, et leur couleur de texte mesurée.
 *
 *  Le texte n'est jamais choisi au jugé : sur le bleu clair de la charte, du
 *  blanc tomberait à 2,63 contre 1, loin sous le seuil. C'est de l'encre. */
/* Les six pastels des cartes de catégories, plus les aplats pleins.
 *
 *  Tous les pastels portent le texte en encre, entre 13,5 et 16 contre 1.
 *  Pour les aplats pleins, la couleur de texte est nommée : sur le bleu clair
 *  de la charte, du blanc tomberait à 2,63, loin sous le seuil. */
const TONS = {
  "pastel-creme": "bg-pastel-creme text-encre",
  "pastel-bleu": "bg-pastel-bleu text-encre",
  "pastel-rose": "bg-pastel-rose text-encre",
  "pastel-vert": "bg-pastel-vert text-encre",
  "pastel-violet": "bg-pastel-violet text-encre",
  "pastel-menthe": "bg-pastel-menthe text-encre",
  carte: "bg-carte text-encre",
  blanc: "bg-blanc text-encre",
  creme: "bg-creme text-encre",
  encre: "bg-encre text-sur-encre",
  "bleu-roi": "bg-bleu-roi white-sur-bleu-profond",
  bleu: "bg-bleu text-sur-bleu",
  rouge: "bg-rouge text-sur-rouge",
  vert: "bg-vert text-sur-vert",
} as const;

export type CardTone = keyof typeof TONS;

export function toneClass(tone: CardTone) {
  return TONS[tone];
}

export default function Card({
  tone = "pastel-creme",
  padding = true,
  outline,
  shadow = "carte",
  className = "",
  children,
}: {
  tone?: CardTone;
  /** Faux quand la carte commence par une image à fleur de bord. */
  padding?: boolean;
  /** Filet d'encre, désactivé par défaut. Sur fond jaune, ce sont le rayon
   *  et l'ombre portée qui dessinent la carte, comme sur les maquettes : les
   *  pastels ne se détachent du fond que de 1,1 contre 1. */
  outline?: boolean;
  shadow?: "carte" | "flottante" | "aucune";
  className?: string;
  children: ReactNode;
}) {
  const ombre =
    shadow === "flottante" ? "shadow-flottante" : shadow === "carte" ? "shadow-carte" : "";

  const filet = outline ? "border-2 border-encre" : "";

  return (
    <div
      className={`rounded overflow-hidden ${TONS[tone]} ${filet} ${ombre} ${
        padding ? "p-4" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

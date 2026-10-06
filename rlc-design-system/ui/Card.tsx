import type { ReactNode } from "react";

/** Teintes disponibles. Les classes sont écrites en entier : Tailwind lit le
 *  code comme du texte, une classe assemblée à l'exécution ne serait jamais
 *  générée. */
const TONS = {
  blanc: "bg-carte text-encre",
  creme: "bg-doux text-encre",
  bleu: "bg-primaire text-primaire-contraste",
  ocre: "bg-accent text-accent-contraste",
  "pastel-bleu": "bg-pastel-bleu text-encre",
  "pastel-ocre": "bg-pastel-ocre text-encre",
  "pastel-rose": "bg-pastel-rose text-encre",
  "pastel-vert": "bg-pastel-vert text-encre",
  "pastel-violet": "bg-pastel-violet text-encre",
  "pastel-menthe": "bg-pastel-menthe text-encre",
} as const;

export type CardTone = keyof typeof TONS;

export function toneClass(tone: CardTone) {
  return TONS[tone];
}

export default function Card({
  tone = "blanc",
  padding = true,
  shadow = "carte",
  className = "",
  children,
}: {
  tone?: CardTone;
  /** Faux quand la carte commence par une image à fleur de bord. */
  padding?: boolean;
  shadow?: "carte" | "flottante" | "aucune";
  className?: string;
  children: ReactNode;
}) {
  const ombre =
    shadow === "flottante" ? "shadow-flottante" : shadow === "carte" ? "shadow-carte" : "";

  return (
    <div
      className={`rounded-l overflow-hidden ${TONS[tone]} ${ombre} ${
        padding ? "p-4" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

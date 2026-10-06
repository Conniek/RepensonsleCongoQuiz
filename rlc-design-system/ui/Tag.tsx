import type { ReactNode } from "react";

const TONS = {
  bleu: "bg-primaire text-primaire-contraste",
  ocre: "bg-accent text-accent-contraste",
  creme: "bg-doux text-encre",
  contour: "bg-transparent text-encre border border-bordure",
} as const;

export type TagTone = keyof typeof TONS;

/** Étiquette courte : « Plus », « Nouveau », « Session invité », « Gratuit ».
 *
 *  L'icône est décorative. Si elle porte un sens, par exemple un cadenas,
 *  ce sens doit être dans le texte à côté, pas dans l'image. */
export default function Tag({
  tone = "creme",
  icone,
  children,
}: {
  tone?: TagTone;
  icone?: ReactNode;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-rond text-[11px] font-black uppercase tracking-wide ${TONS[tone]}`}
    >
      {icone && <span aria-hidden="true">{icone}</span>}
      {children}
    </span>
  );
}

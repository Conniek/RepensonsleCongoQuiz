import type { ReactNode } from "react";

/* Les deux étiquettes de l'identité Instagram : pastille d'encre à texte
 *  jaune, et son inverse cerclée d'encre. */
const TONS = {
  encre: "bg-encre text-sur-encre",
  jaune: "bg-jaune text-encre border border-encre",
  rouge: "bg-rouge text-sur-rouge",
  contour: "bg-transparent text-encre border border-encre",
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

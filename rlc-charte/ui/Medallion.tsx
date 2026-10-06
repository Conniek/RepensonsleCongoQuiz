import type { ReactNode } from "react";

/** Badge rond : une récompense, obtenue ou en cours.
 *
 *  Distinct de `Tag` : `Medallion` représente ce qu'on a gagné, `Tag`
 *  qualifie un contenu. L'état ne tient pas qu'à la couleur, le libellé
 *  secondaire le dit aussi. */
export default function Medallion({
  picto,
  label,
  sublabel,
  obtained = false,
}: {
  picto: ReactNode;
  label: string;
  /** « Obtenu », « 3/5 », « Expert ». */
  sublabel: string;
  obtained?: boolean;
}) {
  return (
    <span className="block w-16 text-center">
      <span
        className={`block w-16 h-16 rounded-rond grid place-items-center ${
          obtained ? "bg-jaune border-2 border-encre" : "bg-sourd opacity-60"
        }`}
      >
        {picto}
      </span>
      <span className="block text-xs font-black leading-tight mt-1">{label}</span>
      <span className="block text-[10px] uppercase tracking-wide opacity-60">
        {sublabel}
      </span>
    </span>
  );
}

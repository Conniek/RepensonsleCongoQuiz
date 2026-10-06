"use client";

/** Choix court et exclusif : Monde / Mon pays, Semaine / Mois / Tout, FR / EN.
 *
 *  Écarté : une liste déroulante, qui cache l'état courant. Ici tout est
 *  visible, et l'état actif est porté par `aria-pressed`, pas seulement par
 *  la couleur. */
export default function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  /** Ce que le groupe choisit, par exemple « Portée du classement ». */
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (valeur: T) => void;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex gap-0.5 p-1 rounded-rond bg-doux"
    >
      {options.map((o) => {
        const actif = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={actif}
            onClick={() => onChange(o.value)}
            className={`px-4 py-2 rounded-rond text-xs font-black ${
              actif ? "bg-encre text-fond" : "bg-transparent text-encre"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

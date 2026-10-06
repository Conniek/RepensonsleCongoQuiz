const TONS = {
  /* Avancement d'un thème : bleu sur fond clair. */
  avancement: "[&::-webkit-progress-value]:bg-encre",
  /* Expérience : ocre, posé sur un aplat bleu. */
  xp: "[&::-webkit-progress-value]:bg-jaune",
  /* Temps restant : rouge. Le compte à rebours n'est pas un composant à part,
     c'est la même barre avec un autre ton. */
  temps: "[&::-webkit-progress-value]:bg-rouge",
} as const;

export type MeterTone = keyof typeof TONS;

/** Barre de progression.
 *
 *  S'appuie sur `<progress>` natif : la valeur est annoncée, et la barre
 *  reste lisible en contraste forcé, là où un `div` coloré disparaît. */
export default function Meter({
  value,
  max = 100,
  tone = "avancement",
  label,
  className = "",
}: {
  value: number;
  max?: number;
  tone?: MeterTone;
  /** Phrase lue. Sans elle, la barre n'annonce qu'un nombre nu. */
  label: string;
  className?: string;
}) {
  return (
    <progress
      value={value}
      max={max}
      aria-label={label}
      className={`w-full h-2 ${TONS[tone]} ${className}`}
    >
      {label}
    </progress>
  );
}

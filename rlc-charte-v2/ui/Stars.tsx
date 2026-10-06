/** Étoiles d'un thème.
 *
 *  Le dessin est masqué aux lecteurs d'écran et doublé d'un texte : six
 *  caractères « ★ » lus à la suite ne veulent rien dire. Le texte est fourni
 *  par l'appelant, parce que lui seul connaît la langue. */
export default function Stars({
  value,
  max = 6,
  label,
  size = 13,
}: {
  value: number;
  max?: number;
  /** Phrase lue, du type « 3 étoiles sur 6 ». */
  label: string;
  size?: number;
}) {
  const pleines = Math.max(0, Math.min(value, max));

  return (
    <span className="inline-flex items-center">
      <span aria-hidden="true" style={{ fontSize: size }} className="leading-none">
        <span className="text-encre">{"★".repeat(pleines)}</span>
        <span className="opacity-25">{"★".repeat(max - pleines)}</span>
      </span>
      <span className="visuellement-masque">{label}</span>
    </span>
  );
}

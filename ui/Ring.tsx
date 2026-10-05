/** Anneau de pourcentage.
 *
 *  Dessiné en `conic-gradient` : aucune image, aucun SVG, et il suit la
 *  taille demandée. Le chiffre est écrit au centre, donc l'anneau lui-même
 *  n'a rien à annoncer. */
export default function Ring({
  value,
  label,
  size = 84,
}: {
  value: number;
  /** Mot sous le chiffre, par exemple « réussite ». */
  label: string;
  size?: number;
}) {
  const p = Math.min(Math.max(Math.round(value), 0), 100);

  return (
    <span
      className="anneau grid place-items-center shrink-0"
      style={{ ["--part" as string]: `${p}%`, width: size, height: size }}
    >
      <span className="anneau-centre grid place-items-center rounded-rond text-center">
        <span className="block font-black leading-none" style={{ fontSize: size * 0.22 }}>
          {p} %
        </span>
        <span
          className="block uppercase tracking-wide opacity-70 leading-none"
          style={{ fontSize: size * 0.1 }}
        >
          {label}
        </span>
      </span>
    </span>
  );
}

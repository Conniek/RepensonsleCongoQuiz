/** Logo « Repensons le Congo ».
 *
 *  Le lettrage est du texte, pas une image : il reste net à toute taille,
 *  se traduit en nombre d'octets par zéro, et se lit par les moteurs comme
 *  par les lecteurs d'écran. Le contour vient de `-webkit-text-stroke`,
 *  avec un repli : si la propriété n'est pas comprise, le texte s'affiche
 *  plein plutôt que de disparaître.
 *
 *  L'écusson est décoratif : le nom est écrit juste à côté. */
export default function BrandWordmark({
  baseline,
  compact = false,
}: {
  /** « Idées. Débats. Histoire. » — passée par l'appelant, donc traduisible. */
  baseline?: string;
  compact?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-3 text-encre">
      <span
        aria-hidden="true"
        className="relative shrink-0 w-11 h-11 rounded-rond overflow-hidden bg-bleu border-2 border-encre"
      >
        <span className="absolute left-[-20%] top-[42%] w-[140%] h-[22%] -rotate-[38deg] bg-rouge border-y-2 border-jaune" />
        <span className="absolute left-1.5 top-0.5 text-jaune text-xs">★</span>
      </span>

      <span>
        <span
          className="block font-medium uppercase leading-[0.95] tracking-[0.04em] text-transparent"
          style={{ WebkitTextStroke: "1px var(--fig-encre)" }}
        >
          <span className={compact ? "text-lg" : "text-2xl"}>
            Repensons
            <br />
            le Congo
          </span>
        </span>

        {baseline && !compact && (
          <span className="block mt-1 text-[10px] font-bold uppercase tracking-[0.18em]">
            {baseline}
          </span>
        )}
      </span>
    </span>
  );
}

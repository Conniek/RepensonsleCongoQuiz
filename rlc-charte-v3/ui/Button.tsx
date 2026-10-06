import Link from "next/link";
import type { ReactNode } from "react";

const INTENTIONS = {
  /* Encre et jaune : l'action principale, le couple de la marque. */
  principal: "bg-encre text-sur-encre border-encre",
  /* Posé SUR un aplat d'encre : les couleurs s'inversent. */
  inverse: "bg-jaune text-encre border-encre",
  /* Contour seul : action secondaire, à côté d'une principale. */
  discret: "bg-transparent text-encre border-encre",
} as const;

export type ButtonIntent = keyof typeof INTENTIONS;

type Commun = {
  intent?: ButtonIntent;
  /** Compacte, pour les boutons dans une carte de catégorie. */
  small?: boolean;
  full?: boolean;
  /** Flèche ou chevron à droite. Décoratif : le libellé doit se suffire. */
  arrow?: boolean;
  className?: string;
  children: ReactNode;
};

/** Un seul rendu pour deux éléments.
 *
 *  Avec `href`, c'est un lien : il se partage, s'ouvre dans un onglet, se
 *  copie. Sans `href`, c'est un bouton. Rendre un `<button>` qui navigue
 *  priverait la personne de tout cela, et un `<a>` qui agit tromperait les
 *  lecteurs d'écran. */
export default function Button({
  href,
  onClick,
  type = "button",
  disabled,
  intent = "principal",
  small = false,
  full = false,
  arrow = false,
  className = "",
  children,
  ...reste
}: Commun & {
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  "aria-disabled"?: boolean;
}) {
  const classes = [
    "inline-flex items-center justify-center gap-3 no-underline",
    "font-black uppercase tracking-widest",
    small ? "min-h-11 px-4 text-[11px]" : "min-h-14 px-6 text-xs",
    "rounded-rond border-2",
    INTENTIONS[intent],
    full ? "w-full" : "",
    disabled ? "opacity-60" : "",
    className,
  ].join(" ");

  const contenu = (
    <>
      {children}
      {arrow && <span aria-hidden="true">→</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...reste}>
        {contenu}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes} {...reste}>
      {contenu}
    </button>
  );
}

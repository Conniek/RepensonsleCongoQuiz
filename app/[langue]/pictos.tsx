/** Pictogrammes de l'interface.
 *
 *  Tracés à la main en SVG plutôt que chargés depuis une bibliothèque :
 *  aucun téléchargement, aucune dépendance, et ils héritent de la couleur
 *  du texte. Tous sont décoratifs — l'information est toujours portée par
 *  le texte à côté — d'où aria-hidden systématique. */

type Props = { taille?: number };

const base = (taille: number) => ({
  width: taille, height: taille, viewBox: "0 0 24 24",
  fill: "none", stroke: "currentColor",
  strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const Flamme = ({ taille = 20 }: Props) => (
  <svg {...base(taille)}><path d="M12 2c1 5 5 6 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 1-3-1-6 1-9z" /></svg>
);

export const Eclair = ({ taille = 20 }: Props) => (
  <svg {...base(taille)}><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg>
);

export const Coupe = ({ taille = 20 }: Props) => (
  <svg {...base(taille)}>
    <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
    <path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />
    <path d="M10 14h4v3h-4zM8 20h8" />
  </svg>
);

export const Cible = ({ taille = 20 }: Props) => (
  <svg {...base(taille)}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" /></svg>
);

export const Boussole = ({ taille = 20 }: Props) => (
  <svg {...base(taille)}><circle cx="12" cy="12" r="9" /><path d="m15 9-2.5 5.5L7 17l2.5-5.5z" /></svg>
);

export const Etoile = ({ taille = 20, pleine = false }: Props & { pleine?: boolean }) => (
  <svg {...base(taille)} fill={pleine ? "currentColor" : "none"}>
    <path d="m12 3 2.6 5.8 6.4.6-4.8 4.2 1.4 6.2L12 16.6 6.4 19.8l1.4-6.2L3 9.4l6.4-.6z" />
  </svg>
);

export const Maison = ({ taille = 20 }: Props) => (
  <svg {...base(taille)}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>
);

export const Livre = ({ taille = 20 }: Props) => (
  <svg {...base(taille)}><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M8 7h7M8 11h7" /></svg>
);

export const Personne = ({ taille = 20 }: Props) => (
  <svg {...base(taille)}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
);

export const Globe = ({ taille = 20 }: Props) => (
  <svg {...base(taille)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
  </svg>
);

export const Cadeau = ({ taille = 20 }: Props) => (
  <svg {...base(taille)}>
    <rect x="3" y="9" width="18" height="12" rx="2" /><path d="M3 13h18M12 9v12" />
    <path d="M12 9S9.5 3 7.5 4.5 10 9 12 9zM12 9s2.5-6 4.5-4.5S14 9 12 9z" />
  </svg>
);

export const Verrou = ({ taille = 20 }: Props) => (
  <svg {...base(taille)}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
);

/** Associe un badge à son pictogramme. Repli sur la cible pour tout badge
 *  ajouté plus tard sans avoir mis à jour cette table. */
export function PictoBadge({ id, taille = 26 }: { id: string; taille?: number }) {
  switch (id) {
    case "serie_7":
    case "serie_30":         return <Flamme taille={taille} />;
    case "premiere_victoire":return <Coupe taille={taille} />;
    case "incollable":       return <Cible taille={taille} />;
    case "explorateur":      return <Boussole taille={taille} />;
    case "cent_bonnes":      return <Eclair taille={taille} />;
    case "maitre_categorie": return <Etoile taille={taille} pleine />;
    case "veteran":          return <Livre taille={taille} />;
    default:                 return <Cible taille={taille} />;
  }
}

export const Graphique = ({ taille = 20 }: Props) => (
  <svg {...base(taille)}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
);

export const Croix = ({ taille = 20 }: Props) => (
  <svg {...base(taille)}><path d="M18 6 6 18M6 6l12 12" /></svg>
);

export const Horloge = ({ taille = 20 }: Props) => (
  <svg {...base(taille)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);

export const Document = ({ taille = 20 }: Props) => (
  <svg {...base(taille)}><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></svg>
);

export const DocumentErreur = ({ taille = 20 }: Props) => (
  <svg {...base(taille)}><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M10 12l4 4M14 12l-4 4" /></svg>
);

export const Sablier = ({ taille = 20 }: Props) => (
  <svg {...base(taille)}><path d="M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9" /></svg>
);

export const Bulle = ({ taille = 20 }: Props) => (
  <svg {...base(taille)}><path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12z" /></svg>
);

export const Enveloppe = ({ taille = 20 }: Props) => (
  <svg {...base(taille)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
);

export const Bouclier = ({ taille = 20 }: Props) => (
  <svg {...base(taille)}><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z" /></svg>
);

export const Accessibilite = ({ taille = 20 }: Props) => (
  <svg {...base(taille)}><circle cx="12" cy="4.5" r="1.5" /><path d="M5 8l7 1.5L19 8M12 9.5V14m0 0-3 7m3-7 3 7" /></svg>
);

export const Chevron = ({ taille = 20 }: Props) => (
  <svg {...base(taille)}><path d="m9 18 6-6-6-6" /></svg>
);

export const Carte = ({ taille = 20 }: Props) => (
  <svg {...base(taille)}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M7 15h4" /></svg>
);

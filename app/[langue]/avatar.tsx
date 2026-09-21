/**
 * Avatar générique par défaut pour l'accueil.
 * SVG simple, coloré aux teintes de la marque, sans dépendance externe.
 */
export default function Avatar() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Fond circulaire — bleu marque */}
      <circle cx="24" cy="24" r="24" fill="#1e3a8a" />

      {/* Tête */}
      <circle cx="24" cy="16" r="8" fill="#f5a623" />

      {/* Épaules et corps */}
      <path
        d="M 16 24 Q 16 28 20 28 L 28 28 Q 32 28 32 24"
        fill="#f5a623"
      />

      {/* Accroches visuelles — bande jaune et rouge (couleurs du drapeau) */}
      <rect x="12" y="14" width="3" height="20" fill="#fde047" opacity="0.7" />
      <rect x="33" y="14" width="3" height="20" fill="#ef4444" opacity="0.7" />

      {/* Visage simple — deux points et sourire */}
      <circle cx="21" cy="15" r="1.5" fill="#1e3a8a" />
      <circle cx="27" cy="15" r="1.5" fill="#1e3a8a" />
      <path d="M 21 18 Q 24 19 27 18" stroke="#1e3a8a" strokeWidth="1" fill="none" />
    </svg>
  );
}

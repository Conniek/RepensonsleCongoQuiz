"use client";

import { useEffect, useRef } from "react";
import { Croix } from "./pictos";

/** Fenêtre modale.
 *
 *  Repose sur l'élément natif <dialog> ouvert par showModal() : piège à
 *  focus, touche Échap et restitution du focus à l'élément déclencheur sont
 *  fournis par le navigateur. C'est une des rares fois où l'élément natif
 *  fait tout le travail qu'on referait mal à la main. */
export default function Fenetre({
  ouverte, surFermeture, titre, libelleFermer, children,
}: {
  ouverte: boolean;
  surFermeture: () => void;
  titre: string;
  libelleFermer: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (ouverte && !d.open) d.showModal();
    if (!ouverte && d.open) d.close();
  }, [ouverte]);

  return (
    <dialog
      ref={ref}
      className="fenetre"
      aria-labelledby="fenetre-titre"
      onClose={surFermeture}
    >
      <div className="fenetre-entete">
        <button type="button" className="fenetre-fermer" onClick={surFermeture}>
          <Croix />
          <span className="visuellement-masque">{libelleFermer}</span>
        </button>
        <h2 id="fenetre-titre">{titre}</h2>
      </div>
      <div className="fenetre-corps">{children}</div>
    </dialog>
  );
}

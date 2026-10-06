"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Fenêtre modale.
 *
 *  Enveloppe l'élément `<dialog>` natif, qui apporte le piège à focus, la
 *  fermeture par Échap et le retour du focus à l'élément d'origine. Les
 *  réimplémenter à la main, c'est se tromper quelque part.
 *
 *  Elle s'ouvre par le bas, comme dans le prototype. */
export default function Modal({
  label,
  onClose,
  children,
}: {
  /** Ce que la fenêtre propose, par exemple « Choisir un niveau pour Histoire ». */
  label: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-label={label}
      className="m-0 mt-auto w-full max-w-[430px] mx-auto rounded-t-l bg-carte text-encre border-t-2 border-x-2 border-encre p-6 pb-10"
    >
      {children}
    </dialog>
  );
}

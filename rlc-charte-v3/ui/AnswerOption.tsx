"use client";

import type { ReactNode } from "react";

const ETATS = {
  neutre: "bg-carte border-encre",
  juste: "bg-vert text-sur-vert border-vert",
  faux: "bg-rouge text-sur-rouge border-rouge",
  /* La bonne réponse, montrée après une erreur : même vert, trait pointillé,
     pour qu'on la distingue de celle qu'on a choisie. */
  attendu: "bg-carte border-vert border-dashed",
} as const;

export type AnswerState = keyof typeof ETATS;

/** Proposition de réponse.
 *
 *  L'état n'est jamais porté par la seule couleur : la lettre reste, le
 *  cadre change de style, et `marqueur` ajoute un signe lisible. */
export default function AnswerOption({
  letter,
  state = "neutre",
  marqueur,
  onClick,
  disabled,
  children,
}: {
  /** A, B, C, D. */
  letter: string;
  state?: AnswerState;
  /** Signe facultatif à droite, par exemple ✓ ou ✗. */
  marqueur?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 p-4 rounded-l border-2 text-left ${ETATS[state]}`}
    >
      <span
        aria-hidden="true"
        className="w-8 h-8 shrink-0 rounded-rond bg-jaune text-encre border border-encre grid place-items-center text-xs font-black"
      >
        {letter}
      </span>
      <span className="flex-1">{children}</span>
      {marqueur && <span className="shrink-0">{marqueur}</span>}
    </button>
  );
}

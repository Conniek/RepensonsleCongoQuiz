/** Design system de Repensons le Congo.
 *
 *  Ce dossier ne connaît ni Supabase, ni le dictionnaire, ni les routes : il
 *  ne reçoit que des valeurs et des libellés déjà traduits. C'est cette
 *  frontière qui permettra d'en faire un paquet le jour où une deuxième
 *  application démarre, sans rien réécrire.
 *
 *  Les décisions, et ce qui a été écarté, sont dans DECISIONS.md. */

export { default as Card, toneClass, type CardTone } from "./Card";
export { default as Button, type ButtonIntent } from "./Button";
export { default as Tag, type TagTone } from "./Tag";
export { default as Stars } from "./Stars";
export { default as Meter, type MeterTone } from "./Meter";
export { default as Ring } from "./Ring";
export { default as StatTile } from "./StatTile";
export { default as Medallion } from "./Medallion";
export { default as SectionHeader } from "./SectionHeader";
export { default as Segmented } from "./Segmented";
export { default as Modal } from "./Modal";
export { default as AnswerOption, type AnswerState } from "./AnswerOption";

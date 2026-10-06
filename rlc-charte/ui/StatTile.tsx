import type { ReactNode } from "react";
import Card from "./Card";

/** Chiffre, libellé, icône : « 23 parties jouées », « 7 jours d'affilée ». */
export default function StatTile({
  value,
  label,
  icone,
}: {
  value: ReactNode;
  label: string;
  icone?: ReactNode;
}) {
  return (
    <Card tone="blanc">
      <p className="m-0 flex items-center gap-3">
        {icone && (
          <span aria-hidden="true" className="text-2xl">
            {icone}
          </span>
        )}
        <span>
          <span className="block font-black text-xl leading-none">{value}</span>
          <span className="block text-xs opacity-70 mt-1">{label}</span>
        </span>
      </p>
    </Card>
  );
}

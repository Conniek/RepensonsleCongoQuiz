import CompteClient from "./compte-client";
import { dictionnaire } from "@/lib/i18n";

const t = dictionnaire();

export const metadata = {
  title: t.compte.titre,
  description: t.compte.descriptionMeta,
};

export default function PageCompte() {
  return <CompteClient />;
}

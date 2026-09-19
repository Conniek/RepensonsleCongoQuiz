import ProfilClient from "./profil-client";
import { dictionnaire } from "@/lib/i18n";

const t = dictionnaire();

export const metadata = {
  title: t.profil.titre,
  description: t.profil.descriptionMeta,
};

export default function PageProfil() {
  return <ProfilClient />;
}

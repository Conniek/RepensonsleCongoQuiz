"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dictionnaire, type Langue } from "@/lib/i18n";
import { Maison, Livre, Graphique, Personne } from "./pictos";

/** Barre de navigation principale.
 *
 *  Composant client pour une seule raison : connaître la page courante.
 *  La version précédente posait aria-current="page" sur « Accueil » en dur,
 *  ce qui annonçait « page courante » au lecteur d'écran partout, y compris
 *  sur le profil. */
export default function Barre({ langue }: { langue: Langue }) {
  const t = dictionnaire(langue);
  const chemin = usePathname() ?? "";

  // Pas de barre sur l'écran d'introduction : elle apparaît dès l'accueil.
  if (chemin === `/${langue}/splash` || chemin.startsWith(`/${langue}/onboarding`)) return null;

  const entrees = [
    { href: `/${langue}`,             libelle: t.navigation.accueil,     Picto: Maison,    exact: true },
    { href: `/${langue}/quiz`,        libelle: t.navigation.quiz,        Picto: Livre,     exact: false },
    { href: `/${langue}/progression`, libelle: t.navigation.progression, Picto: Graphique, exact: false },
    { href: `/${langue}/profil`,      libelle: t.navigation.profil,      Picto: Personne,  exact: false },
  ];

  return (
    <nav aria-label={t.navigation.principale} className="barre">
      <ul>
        {entrees.map(({ href, libelle, Picto, exact }) => {
          const actif = exact ? chemin === href : chemin.startsWith(href);
          return (
            <li key={href}>
              <Link href={href} aria-current={actif ? "page" : undefined}>
                <Picto />
                <span>{libelle}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

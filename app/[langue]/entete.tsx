import { dictionnaire, type Langue } from "@/lib/i18n";

/** En-tête de marque.
 *
 *  Le logo est une vraie image avec son texte alternatif, plutôt qu'une
 *  image de fond derrière du texte masqué : en mode contraste forcé, une
 *  image de fond disparaît et le titre deviendrait invisible. Le texte
 *  alternatif est lu par les moteurs comme par les lecteurs d'écran. */
export default function Entete({ langue }: { langue: Langue }) {
  const t = dictionnaire(langue);

  return (
    <div className="entete">
      <div className="entete-titre">
        <p className="sur-titre">{t.marque.pays}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <h1 tabIndex={-1}>
          <img src="/images/logo4.png" alt={t.marque.nom} width={900} height={300} />
        </h1>
        <p className="accroche">{t.marque.slogan}</p>
      </div>

    </div>
  );
}

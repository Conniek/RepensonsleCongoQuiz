"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { dictionnaire, LANGUES, type Langue } from "@/lib/i18n";

/** Carrousel d'introduction.
 *
 *  Il n'avance JAMAIS tout seul : le contrat d'accessibilité interdit un
 *  contenu en mouvement que l'on ne contrôle pas. Le glissement au doigt est
 *  un confort, jamais le seul moyen : points, boutons et flèches du clavier
 *  font la même chose.
 *
 *  `premiereVisite` vient du serveur : l'absence de pseudo sur le profil. La
 *  dernière diapositive mène alors à l'inscription, sinon à l'accueil. */
export default function Carrousel({
  langue,
  premiereVisite,
  slides,
}: {
  langue: Langue;
  premiereVisite: boolean;
  slides: readonly {
    titre: string;
    sousTitre: string;
    texte: string;
    points: readonly string[];
    icone?: string;
    iconesPoints?: readonly string[];
  }[];
}) {
  const t = dictionnaire(langue);
  const router = useRouter();
  const [position, setPosition] = useState(0);
  const departX = useRef<number | null>(null);
  const regionRef = useRef<HTMLDivElement>(null);

  const dernier = position === slides.length - 1;
  const couverture = position === 0;
  const destination = premiereVisite ? `/${langue}/onboarding` : `/${langue}`;

  function allerA(index: number) {
    setPosition(Math.max(0, Math.min(slides.length - 1, index)));
  }

  function suivant() {
    if (dernier) router.push(destination);
    else allerA(position + 1);
  }

  function auClavier(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") { e.preventDefault(); allerA(position + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); allerA(position - 1); }
  }

  function debutGlissement(e: React.TouchEvent) {
    departX.current = e.touches[0].clientX;
  }

  function finGlissement(e: React.TouchEvent) {
    if (departX.current === null) return;
    const ecart = departX.current - e.changedTouches[0].clientX;
    if (Math.abs(ecart) > 48) allerA(position + (ecart > 0 ? 1 : -1));
    departX.current = null;
  }

  const slide = slides[position];

  return (
    <div
      className="splash-carrousel"
      role="region"
      aria-roledescription="carousel"
      aria-label={t.splash.region}
      ref={regionRef}
      tabIndex={-1}
      onKeyDown={auClavier}
      onTouchStart={debutGlissement}
      onTouchEnd={finGlissement}
    >
      <div className="splash-barre">
        <Link href={`/${langue}`} className="splash-passer">
          {t.splash.passer}
        </Link>

        <ul className="splash-langues" aria-label={t.splash.choisirLangue}>
          {LANGUES.map((l) => (
            <li key={l}>
              <Link
                href={`/${l}/splash`}
                hrefLang={l}
                aria-current={l === langue ? "true" : undefined}
              >
                {l.toUpperCase()}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div
        className={`splash-slide${couverture ? " splash-slide--couverture" : ""}`}
        role="group"
        aria-roledescription={t.splash.diapositive}
        aria-label={t.splash.positionSlide(position + 1, slides.length)}
      >
        {couverture ? (
          <>
            <div className="splash-embleme" aria-hidden="true">
              <span className="splash-embleme-feuille splash-embleme-feuille--gauche">🌿</span>
              <div className="splash-embleme-drapeau">
                <span className="splash-embleme-etoile">★</span>
                <span className="splash-embleme-personnage">🤴🏿</span>
              </div>
              <span className="splash-embleme-feuille splash-embleme-feuille--droite">🌿</span>
            </div>

            <div className="splash-marque">
              <div className="brand-mark splash-brand-mark">
                <div className="brand-mark__crest" aria-hidden="true"><span /></div>
                <div className="splash-marque-texte">
                  <h1 className="brand-mark__name">Repensons<br />le Congo</h1>
                  <p className="splash-signature">{t.splash.signatureMarque}</p>
                </div>
              </div>
              <p className="splash-sous-titre">{t.splash.sousTitre}</p>
            </div>

            <ul className="splash-categories" aria-label={t.splash.apercuCategories}>
              {[
                { icone: "🏛️", nom: t.splash.categories.histoire },
                { icone: "🗺️", nom: t.splash.categories.geographie },
                { icone: "🎭", nom: t.splash.categories.culture },
                { icone: "🌍", nom: t.splash.categories.nature },
                { icone: "🎵", nom: t.splash.categories.musique },
              ].map((categorie) => (
                <li key={categorie.nom}>
                  <span aria-hidden="true">{categorie.icone}</span>
                  {categorie.nom}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <div className="splash-slide-icone" aria-hidden="true">
              {slide.icone}
            </div>
            <h1 className="splash-titre">{slide.titre}</h1>
            <p className="splash-sous-titre">{slide.sousTitre}</p>

            <p className="splash-texte">{slide.texte}</p>

            <ul className="splash-points">
              {slide.points.map((point, index) => (
                <li key={point}>
                  <span aria-hidden="true">{slide.iconesPoints?.[index]}</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="splash-pilotage">
        <ul className="splash-points-nav">
          {slides.map((_, index) => (
            <li key={index}>
              <button
                type="button"
                className={index === position ? "actif" : undefined}
                aria-label={t.splash.allerSlide(index + 1)}
                aria-current={index === position ? "true" : undefined}
                onClick={() => allerA(index)}
              />
            </li>
          ))}
        </ul>

        {dernier ? (
          <Link href={destination} className="splash-cta">
            {t.splash.cta}
          </Link>
        ) : (
          <button type="button" className="splash-cta" onClick={suivant}>
            {t.splash.suivant}
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

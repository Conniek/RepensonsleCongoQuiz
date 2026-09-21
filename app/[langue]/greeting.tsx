"use client";

import { dictionnaire, type Langue } from "@/lib/i18n";
import Avatar from "./avatar";
import "./greeting.css";

interface GreetingProps {
  langue: Langue;
  pseudo: string | null;
  xp: number;
}

/**
 * Composant de bienvenue en haut de l'accueil.
 * Affiche : avatar + pseudo + points/diamonds.
 */
export default function Greeting({ langue, pseudo, xp }: GreetingProps) {
  const t = dictionnaire(langue);

  return (
    <div className="greeting">
      <div className="greeting-header">
        <div className="greeting-avatar">
          <Avatar />
        </div>
        <div className="greeting-text">
          <h1 className="greeting-title">{t.accueilUtilisateur.bonjour(pseudo)}</h1>
          <p className="greeting-subtitle">{t.accueilUtilisateur.pret}</p>
        </div>
      </div>
      <div className="greeting-stats">
        <div className="stat-item">
          <span className="stat-label">✨</span>
          <span className="stat-value">{t.accueilUtilisateur.diamonds(xp)}</span>
        </div>
      </div>
    </div>
  );
}

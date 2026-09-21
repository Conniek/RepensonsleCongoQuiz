"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { dictionnaire, type Langue } from "@/lib/i18n";
import "./splash.css";

export default function SplashScreen() {
  const params = useParams();
  const langue = (params.langue as string) || "fr";
  const t = dictionnaire(langue as Langue);

  useEffect(() => {
    // Marquer que l'utilisateur a vu la splash
    localStorage.setItem("splash_vu", "true");
  }, []);

  return (
    <div className="splash-container">
      <div className="splash-visual">
        <img
          src="/images/logo4.png"
          alt={t.splash.titre}
          width="200"
          height="200"
        />
      </div>

      <div className="splash-content">
        <h1 className="splash-title">{t.splash.titre}</h1>
        <p className="splash-subtitle">{t.splash.sousTitre}</p>
        <p className="splash-description">{t.splash.paragraphe}</p>
      </div>

      <div className="splash-footer">
        <Link href={`/${langue}/home`} className="splash-cta">
          {t.splash.cta}
        </Link>
      </div>
    </div>
  );
}
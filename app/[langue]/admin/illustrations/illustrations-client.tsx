"use client";

import { useEffect, useMemo, useState } from "react";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { dictionnaire, type Langue } from "@/lib/i18n";
import {
  BUCKET_CATEGORIES,
  nomFichierIllustration,
  urlIllustration,
} from "@/lib/illustrations";

type Ligne = {
  categorie_id: string;
  libelle: string;
  slug: string;
  illustration: string | null;
};

const TYPES_ACCEPTES = ["image/avif", "image/webp"];
const POIDS_MAX = 512_000; // 500 ko

/** Illustrations des catégories, côté back-office.
 *
 *  Le fichier part dans le bucket `categories`, puis son chemin est écrit
 *  dans `categorie.illustration`. Les deux opérations sont protégées par le
 *  rôle éditeur : les politiques refusent l'écriture à quiconque d'autre,
 *  même si cette page était atteinte directement. */
export default function IllustrationsClient({ langue }: { langue: Langue }) {
  const t = dictionnaire(langue);
  const supabase = useMemo(() => creerClientNavigateur(), []);

  const [lignes, setLignes] = useState<Ligne[]>([]);
  const [charge, setCharge] = useState(false);
  const [enCours, setEnCours] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("categorie_publique")
        .select("categorie_id, libelle, slug, illustration")
        .eq("langue", langue)
        .order("libelle");
      setLignes((data ?? []) as Ligne[]);
      setCharge(true);
    })();
  }, [supabase, langue]);

  async function televerser(ligne: Ligne, fichier: File) {
    setErreur(null);
    setMessage(null);

    /* Deux contrôles avant l'envoi. Le bucket les refait côté serveur, mais
       autant le dire tout de suite plutôt que de laisser partir 4 Mo pour
       recevoir une erreur ensuite. */
    if (!TYPES_ACCEPTES.includes(fichier.type)) {
      setErreur(t.illustrations.mauvaisFormat);
      return;
    }
    if (fichier.size > POIDS_MAX) {
      setErreur(t.illustrations.tropLourd);
      return;
    }

    setEnCours(ligne.categorie_id);
    try {
      const chemin = nomFichierIllustration(ligne.slug, fichier.type);

      const { error: erreurDepot } = await supabase.storage
        .from(BUCKET_CATEGORIES)
        .upload(chemin, fichier, { cacheControl: "31536000", upsert: false });

      if (erreurDepot) {
        setErreur(t.illustrations.echecDepot(erreurDepot.message));
        return;
      }

      const { error: erreurMaj } = await supabase
        .from("categorie")
        .update({ illustration: chemin })
        .eq("id", ligne.categorie_id);

      if (erreurMaj) {
        setErreur(t.illustrations.echecDepot(erreurMaj.message));
        return;
      }

      /* L'ancien fichier n'est pas supprimé : garder la version précédente
         permet de revenir en arrière, et douze images pèsent moins qu'une
         mauvaise manipulation irréversible. */
      setLignes((liste) =>
        liste.map((l) =>
          l.categorie_id === ligne.categorie_id ? { ...l, illustration: chemin } : l
        )
      );
      setMessage(t.illustrations.deposee(ligne.libelle));
    } finally {
      setEnCours(null);
    }
  }

  async function retirer(ligne: Ligne) {
    setEnCours(ligne.categorie_id);
    try {
      const { error } = await supabase
        .from("categorie")
        .update({ illustration: null })
        .eq("id", ligne.categorie_id);

      if (error) {
        setErreur(t.illustrations.echecDepot(error.message));
        return;
      }

      setLignes((liste) =>
        liste.map((l) =>
          l.categorie_id === ligne.categorie_id ? { ...l, illustration: null } : l
        )
      );
      setMessage(t.illustrations.retiree(ligne.libelle));
    } finally {
      setEnCours(null);
    }
  }

  if (!charge) return <p>{t.commun.chargement}</p>;

  return (
    <>
      <p>{t.illustrations.intro}</p>
      <p className="note">{t.illustrations.consigne}</p>

      <p role="status" aria-live="polite">{message}</p>
      {erreur && <p role="alert" className="onb-erreur">{erreur}</p>}

      <ul className="illustrations">
        {lignes.map((ligne) => (
          <li key={ligne.categorie_id}>
            <div className="carte-visuel">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={urlIllustration(ligne.slug, ligne.illustration)}
                alt=""
                loading="lazy"
                decoding="async"
              />
            </div>

            <h2>{ligne.libelle}</h2>
            <p className="carte-compte">
              {ligne.illustration
                ? t.illustrations.sourceBase
                : t.illustrations.sourceFichier(ligne.slug)}
            </p>

            <label htmlFor={`fichier-${ligne.categorie_id}`}>
              {t.illustrations.choisir}
            </label>
            <input
              id={`fichier-${ligne.categorie_id}`}
              type="file"
              accept={TYPES_ACCEPTES.join(",")}
              disabled={enCours === ligne.categorie_id}
              onChange={(e) => {
                const fichier = e.target.files?.[0];
                if (fichier) televerser(ligne, fichier);
                e.target.value = "";
              }}
            />

            {ligne.illustration && (
              <button
                type="button"
                disabled={enCours === ligne.categorie_id}
                onClick={() => retirer(ligne)}
              >
                {t.illustrations.retirer}
              </button>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

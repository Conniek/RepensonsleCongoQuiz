"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { assurerSession } from "@/lib/session";
import { dictionnaire, LANGUES, type Langue } from "@/lib/i18n";
import { WHATSAPP_NUMERO, EMAIL_CONTACT } from "@/lib/contact";
import { paysTries } from "@/lib/pays";
import {
  Personne, Carte, Globe, Bulle, Enveloppe, Document, Bouclier, Accessibilite, Chevron,
} from "../pictos";
import Fenetre from "../fenetre";

type Droit = { produit: string; fin_le: string | null; a_vie: boolean };

export default function ProfilClient({ langue }: { langue: Langue }) {
  const t = dictionnaire(langue);
  const router = useRouter();

  const [anonyme, setAnonyme] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [pseudo, setPseudo] = useState<string | null>(null);
  const [droits, setDroits] = useState<Droit[]>([]);
  const [langueChoisie, setLangueChoisie] = useState<Langue>(langue);
  const [pays, setPays] = useState("");
  const listePays = paysTries(langue);
  const [message, setMessage] = useState("");
  const [compteOuvert, setCompteOuvert] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [motCle, setMotCle] = useState("");
  const formatDate = new Intl.DateTimeFormat(langue, { dateStyle: "long" });

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const session = await assurerSession();
        const s = creerClientNavigateur();
        const [p, d, prof] = await Promise.all([
          s.rpc("progression", { p_langue: langue }),
          s.rpc("mes_droits"),
          s.from("profil").select("pays").eq("id", session!.user.id).maybeSingle(),
        ]);
        if (annule) return;
        setAnonyme(session?.user?.is_anonymous ?? true);
        setEmail(session?.user?.email ?? null);
        setPseudo(p.data?.pseudo ?? null);
        setDroits((d.data ?? []) as Droit[]);
        setPays(prof.data?.pays ?? "");
      } catch {
        // Le profil reste utilisable : les liens d'information fonctionnent
        // sans session.
      }
    })();
    return () => { annule = true; };
  }, [langue]);

  async function enregistrerPays(e: React.FormEvent) {
    e.preventDefault();
    await creerClientNavigateur().rpc("definir_pays", { p_pays: pays || null });
    setMessage(t.pageProfil.paysEnregistre);
  }

  async function enregistrerLangue(e: React.FormEvent) {
    e.preventDefault();
    await creerClientNavigateur().rpc("definir_langue", { p_langue: langueChoisie });
    // Cookie lu par le proxy pour rediriger vers cette langue à la prochaine
    // visite de la racine du site.
    document.cookie = `langue=${langueChoisie}; path=/; max-age=31536000; samesite=lax`;
    setMessage(t.pageProfil.langueEnregistree);
    if (langueChoisie !== langue) router.push(`/${langueChoisie}/profil`);
  }

  async function seDeconnecter() {
    await creerClientNavigateur().auth.signOut();
    window.location.href = `/${langue}`;
  }

  async function supprimer() {
    const { error } = await creerClientNavigateur().rpc("supprimer_mon_compte");
    if (error) { setMessage(t.compte.erreurGenerique(error.message)); return; }
    await creerClientNavigateur().auth.signOut();
    window.location.href = `/${langue}`;
  }

  return (
    <>
      <h1 tabIndex={-1}>{t.pageProfil.titre}</h1>

      <div role="status" aria-live="polite">{message && <p>{message}</p>}</div>

      {anonyme && (
        <section className="sauvegarde" aria-labelledby="titre-sauvegarde-profil">
          <h2 id="titre-sauvegarde-profil">{t.pageProfil.sauvegardeTitre}</h2>
          <Link className="action" href={`/${langue}/compte`}>{t.pageProfil.sauvegardeAction}</Link>
        </section>
      )}

      {/* Premier groupe : compte, abonnement, langue. */}
      <ul className="groupe-reglages">
        <li>
          <button type="button" className="ligne-reglage" onClick={() => setCompteOuvert(true)}>
            <Personne taille={22} />
            <span className="ligne-libelle">{t.pageProfil.monCompte}</span>
            <Chevron taille={18} />
          </button>
        </li>
        <li>
          <Link className="ligne-reglage" href={`/${langue}/offres`}>
            <Carte taille={22} />
            <span className="ligne-libelle">{t.pageProfil.abonnement}</span>
            <span className="ligne-valeur">
              {droits.length === 0
                ? t.pageProfil.abonnementGratuit
                : droits.map((d) => t.pageProfil.produit(d.produit)).join(", ")}
            </span>
            <Chevron taille={18} />
          </Link>
          {droits.length > 0 && (
            <ul className="detail-droits">
              {droits.map((d) => (
                <li key={d.produit}>
                  {t.pageProfil.produit(d.produit)} —{" "}
                  {d.a_vie ? t.pageProfil.aVie : t.pageProfil.jusquAu(formatDate.format(new Date(d.fin_le!)))}
                </li>
              ))}
            </ul>
          )}
        </li>
        <li>
          <form className="ligne-reglage ligne-formulaire" onSubmit={enregistrerPays}>
            <Globe taille={22} />
            <label htmlFor="pays-profil" className="ligne-libelle">{t.pageProfil.pays}</label>
            <select id="pays-profil" value={pays}
                    onChange={(e) => setPays(e.target.value)}>
              <option value="">{t.pageProfil.paysNonRenseigne}</option>
              {listePays.prioritaires.map((c) => (
                <option key={`tete-${c.code}`} value={c.code}>{c.nom}</option>
              ))}
              {listePays.autres.map((c) => (
                <option key={c.code} value={c.code}>{c.nom}</option>
              ))}
            </select>
            <button type="submit">{t.pageProfil.enregistrer}</button>
          </form>
        </li>
        <li>
          <form className="ligne-reglage ligne-formulaire" onSubmit={enregistrerLangue}>
            <Globe taille={22} />
            <label htmlFor="langue-defaut" className="ligne-libelle">{t.pageProfil.langueDefaut}</label>
            <select id="langue-defaut" value={langueChoisie}
                    onChange={(e) => setLangueChoisie(e.target.value as Langue)}>
              {LANGUES.map((l) => (
                <option key={l} value={l} lang={l}>{dictionnaire(l).langues[l]}</option>
              ))}
            </select>
            <button type="submit">{t.pageProfil.enregistrer}</button>
          </form>
        </li>
      </ul>

      {/* Deuxième groupe : nous contacter. Chaque lien n'apparaît que si
          sa coordonnée est renseignée dans lib/contact.ts. */}
      {(WHATSAPP_NUMERO || EMAIL_CONTACT) && (
        <ul className="groupe-reglages">
          {WHATSAPP_NUMERO && (
            <li>
              <a className="ligne-reglage" href={`https://wa.me/${WHATSAPP_NUMERO}`}
                 target="_blank" rel="noopener">
                <Bulle taille={22} />
                <span className="ligne-libelle">
                  {t.pageProfil.whatsapp}
                  <span className="visuellement-masque"> {t.pageProfil.nouvelleFenetre}</span>
                </span>
                <Chevron taille={18} />
              </a>
            </li>
          )}
          {EMAIL_CONTACT && (
            <li>
              <a className="ligne-reglage" href={`mailto:${EMAIL_CONTACT}`}>
                <Enveloppe taille={22} />
                <span className="ligne-libelle">{t.pageProfil.feedback}</span>
                <Chevron taille={18} />
              </a>
            </li>
          )}
        </ul>
      )}

      {/* Troisième groupe : informations légales. */}
      <ul className="groupe-reglages">
        <li>
          <Link className="ligne-reglage" href={`/${langue}/conditions`}>
            <Document taille={22} />
            <span className="ligne-libelle">{t.pageProfil.cgu}</span>
            <Chevron taille={18} />
          </Link>
        </li>
        <li>
          <Link className="ligne-reglage" href={`/${langue}/confidentialite`}>
            <Bouclier taille={22} />
            <span className="ligne-libelle">{t.pageProfil.confidentialite}</span>
            <Chevron taille={18} />
          </Link>
        </li>
        <li>
          <Link className="ligne-reglage" href={`/${langue}/accessibilite`}>
            <Accessibilite taille={22} />
            <span className="ligne-libelle">{t.pageProfil.accessibilite}</span>
            <Chevron taille={18} />
          </Link>
        </li>
      </ul>

      <Fenetre
        ouverte={compteOuvert}
        surFermeture={() => { setCompteOuvert(false); setConfirmation(false); setMotCle(""); }}
        titre={t.pageProfil.monCompte}
        libelleFermer={t.pageProfil.fermer}
      >
        <dl>
          <dt>{t.pageProfil.pseudo}</dt>
          <dd>{pseudo ?? t.pageProfil.pasDePseudo}</dd>
          <dt>{t.pageProfil.email}</dt>
          <dd>{email ?? t.pageProfil.pasDeCompte}</dd>
        </dl>

        {anonyme ? (
          <p><Link className="action" href={`/${langue}/compte`}>{t.pageProfil.creerCompte}</Link></p>
        ) : (
          <p><button type="button" onClick={seDeconnecter}>{t.pageProfil.deconnecter}</button></p>
        )}

        <p className="note">{t.compte.supprimerAide}</p>
        {!confirmation ? (
          <p>
            <button type="button" onClick={() => setConfirmation(true)}>
              {t.pageProfil.supprimerDonnees}
            </button>
          </p>
        ) : (
          <>
            <p>{t.compte.supprimerConfirmation}</p>
            <p>
              <label htmlFor="mot-cle-profil">{t.compte.supprimerMotCle}</label><br />
              <input id="mot-cle-profil" type="text" value={motCle}
                     onChange={(e) => setMotCle(e.target.value)} />
            </p>
            <p>
              <button type="button"
                      aria-disabled={motCle !== t.compte.supprimerMotCle || undefined}
                      onClick={() => { if (motCle === t.compte.supprimerMotCle) void supprimer(); }}>
                {t.compte.supprimerValider}
              </button>
            </p>
          </>
        )}
      </Fenetre>
    </>
  );
}

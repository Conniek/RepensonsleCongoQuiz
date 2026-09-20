"use client";

import { useState } from "react";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { dictionnaire, type Langue } from "@/lib/i18n";

type Inscrit = {
  id: string; email: string; pseudo: string | null; role: string;
  anonyme: boolean; xp: number; parties: number;
  inscrit_le: string; derniere_partie: string | null;
};

export default function Inscrits({ langue }: { langue: Langue }) {
  const t = dictionnaire(langue);
  const supabase = creerClientNavigateur();

  const [terme, setTerme] = useState("");
  const [resultats, setResultats] = useState<Inscrit[] | null>(null);
  const [message, setMessage] = useState("");
  const [aSupprimer, setASupprimer] = useState<string | null>(null);
  const [motCle, setMotCle] = useState("");

  const roles = [
    { valeur: "joueur", libelle: t.inscrits.roleJoueur },
    { valeur: "editeur", libelle: t.inscrits.roleEditeur },
    { valeur: "admin", libelle: t.inscrits.roleAdmin },
  ];

  async function rechercher(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const { data } = await supabase.rpc("rechercher_inscrit", { p_terme: terme });
    setResultats((data ?? []) as Inscrit[]);
  }

  async function changerRole(id: string, role: string) {
    const { data, error } = await supabase.rpc("definir_role", {
      p_utilisateur: id, p_role: role,
    });
    if (error) { setMessage(error.message); return; }
    if (data && !data.ok) {
      setMessage(data.motif === "auto_retrait"
        ? t.inscrits.erreurAutoRetrait : data.motif);
      return;
    }
    setMessage(t.inscrits.roleChange);
    setResultats((prec) =>
      prec?.map((x) => (x.id === id ? { ...x, role } : x)) ?? null);
  }

  async function exporter(id: string) {
    const { data } = await supabase.rpc("exporter_donnees_de", { p_utilisateur: id });
    if (!data) return;
    const lien = document.createElement("a");
    lien.href = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    lien.download = `donnees-${id}.json`;
    lien.click();
    URL.revokeObjectURL(lien.href);
  }

  async function supprimer(id: string) {
    const { error } = await supabase.rpc("supprimer_compte_de", { p_utilisateur: id });
    if (error) { setMessage(error.message); return; }
    setMessage(t.inscrits.supprime);
    setResultats((prec) => prec?.filter((x) => x.id !== id) ?? null);
    setASupprimer(null);
    setMotCle("");
  }

  return (
    <>
      <form onSubmit={rechercher}>
        <p>
          <label htmlFor="terme">{t.inscrits.rechercher}</label><br />
          <input id="terme" type="search" minLength={3} required
                 aria-describedby="aide-terme" value={terme}
                 onChange={(e) => setTerme(e.target.value)} /><br />
          <span id="aide-terme" className="note">{t.inscrits.rechercherAide}</span>
        </p>
        <p><button type="submit">{t.inscrits.lancer}</button></p>
      </form>

      <div role="status" aria-live="polite">{message && <p>{message}</p>}</div>

      {resultats !== null && (
        resultats.length === 0 ? (
          <p>{t.inscrits.aucunResultat}</p>
        ) : (
          <table>
            <caption>{t.inscrits.titre}</caption>
            <thead>
              <tr>
                <th scope="col">{t.inscrits.colEmail}</th>
                <th scope="col">{t.inscrits.colPseudo}</th>
                <th scope="col">{t.inscrits.colParties}</th>
                <th scope="col">{t.inscrits.colRole}</th>
                <th scope="col">{t.commun.voirTout}</th>
              </tr>
            </thead>
            <tbody>
              {resultats.map((i) => (
                <tr key={i.id}>
                  <th scope="row">{i.email}</th>
                  <td>{i.pseudo ?? t.commun.sansValeur}</td>
                  <td>{i.parties}</td>
                  <td>
                    <label htmlFor={`role-${i.id}`} className="visuellement-masque">
                      {t.inscrits.changerRole}
                    </label>
                    <select id={`role-${i.id}`} value={i.role}
                            onChange={(e) => changerRole(i.id, e.target.value)}>
                      {roles.map((r) => (
                        <option key={r.valeur} value={r.valeur}>{r.libelle}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button type="button" onClick={() => exporter(i.id)}>
                      {t.inscrits.exporter}
                    </button>{" "}
                    {aSupprimer === i.id ? (
                      <>
                        <span className="note">{t.inscrits.supprimerConfirmation}</span>
                        <label htmlFor={`mot-${i.id}`} className="visuellement-masque">
                          {t.compte.supprimerMotCle}
                        </label>
                        <input id={`mot-${i.id}`} type="text" value={motCle}
                               onChange={(e) => setMotCle(e.target.value)} />
                        <button type="button"
                                aria-disabled={motCle !== t.compte.supprimerMotCle || undefined}
                                onClick={() => {
                                  if (motCle === t.compte.supprimerMotCle) void supprimer(i.id);
                                }}>
                          {t.compte.supprimerValider}
                        </button>
                      </>
                    ) : (
                      <button type="button" onClick={() => setASupprimer(i.id)}>
                        {t.inscrits.supprimer}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </>
  );
}

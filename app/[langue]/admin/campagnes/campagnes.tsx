"use client";

import { useEffect, useState } from "react";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { dictionnaire, type Langue } from "@/lib/i18n";

type Campagne = {
  id: string; titre: string; description: string | null; type: string;
  date_debut: string | null; date_fin: string | null;
  statut: string; mise_en_avant: boolean;
};

const VIDE = {
  titre: "", description: "", type: "quiz_thematique",
  date_debut: "", date_fin: "", statut: "brouillon", mise_en_avant: false,
};

export default function Campagnes({ langue }: { langue: Langue }) {
  const t = dictionnaire(langue);
  const supabase = creerClientNavigateur();

  const [liste, setListe] = useState<Campagne[]>([]);
  const [form, setForm] = useState(VIDE);
  const [message, setMessage] = useState("");

  async function charger() {
    const { data } = await supabase.from("campagne").select("*").order("cree_le", { ascending: false });
    setListe((data ?? []) as Campagne[]);
  }

  useEffect(() => { void charger(); /* eslint-disable-next-line */ }, []);

  async function creer(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("campagne").insert({
      titre: form.titre,
      description: form.description || null,
      type: form.type,
      // Aucune date d'événement n'est codée dans l'application : elles sont
      // saisies ici, et l'ouverture comme l'archivage suivent ces dates.
      date_debut: form.date_debut || null,
      date_fin: form.date_fin || null,
      statut: form.statut,
      mise_en_avant: form.mise_en_avant,
    });
    if (error) { setMessage(error.message); return; }
    setMessage(t.contenu.enregistre);
    setForm(VIDE);
    await charger();
  }

  const statuts = [
    { v: "brouillon", l: t.contenu.statutBrouillon },
    { v: "programmee", l: t.contenu.statutProgrammee },
    { v: "active", l: t.contenu.statutActive },
    { v: "archivee", l: t.contenu.statutArchivee },
  ];

  return (
    <>
      <div role="status" aria-live="polite">{message && <p>{message}</p>}</div>

      <section aria-labelledby="titre-nouvelle">
        <h2 id="titre-nouvelle">{t.contenu.nouvelleCampagne}</h2>
        <form onSubmit={creer}>
          <p>
            <label htmlFor="c-titre">{t.contenu.campagneTitre}</label><br />
            <input id="c-titre" type="text" required value={form.titre}
                   onChange={(e) => setForm({ ...form, titre: e.target.value })} />
          </p>
          <p>
            <label htmlFor="c-description">{t.contenu.campagneDescription}</label><br />
            <textarea id="c-description" rows={2} value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </p>
          <p>
            <label htmlFor="c-type">{t.contenu.campagneType}</label><br />
            <select id="c-type" value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="quiz_thematique">{t.contenu.typeQuiz}</option>
              <option value="comparateur_civique">{t.contenu.typeComparateur}</option>
            </select>
          </p>
          <p>
            <label htmlFor="c-debut">{t.contenu.campagneDebut}</label><br />
            <input id="c-debut" type="date" value={form.date_debut}
                   onChange={(e) => setForm({ ...form, date_debut: e.target.value })} />
          </p>
          <p>
            <label htmlFor="c-fin">{t.contenu.campagneFin}</label><br />
            <input id="c-fin" type="date" value={form.date_fin}
                   onChange={(e) => setForm({ ...form, date_fin: e.target.value })} />
          </p>
          <p>
            <label htmlFor="c-statut">{t.contenu.campagneStatut}</label><br />
            <select id="c-statut" value={form.statut}
                    onChange={(e) => setForm({ ...form, statut: e.target.value })}>
              {statuts.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
            </select>
          </p>
          <p>
            <input id="c-avant" type="checkbox" checked={form.mise_en_avant}
                   onChange={(e) => setForm({ ...form, mise_en_avant: e.target.checked })} />
            {" "}
            <label htmlFor="c-avant">{t.contenu.miseEnAvant}</label>
          </p>
          <p><button type="submit">{t.contenu.enregistrer}</button></p>
        </form>
      </section>

      <section aria-labelledby="titre-liste">
        <h2 id="titre-liste">{t.contenu.campagnes}</h2>
        {liste.length === 0 ? (
          <p>{t.contenu.aucuneCampagne}</p>
        ) : (
          <table>
            <caption>{t.contenu.campagnes}</caption>
            <thead>
              <tr>
                <th scope="col">{t.contenu.campagneTitre}</th>
                <th scope="col">{t.contenu.campagneType}</th>
                <th scope="col">{t.contenu.campagneDebut}</th>
                <th scope="col">{t.contenu.campagneFin}</th>
                <th scope="col">{t.contenu.campagneStatut}</th>
              </tr>
            </thead>
            <tbody>
              {liste.map((c) => (
                <tr key={c.id}>
                  <th scope="row">{c.titre}</th>
                  <td>{c.type === "quiz_thematique" ? t.contenu.typeQuiz : t.contenu.typeComparateur}</td>
                  <td>{c.date_debut ?? t.commun.sansValeur}</td>
                  <td>{c.date_fin ?? t.commun.sansValeur}</td>
                  <td>{statuts.find((s) => s.v === c.statut)?.l ?? c.statut}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}

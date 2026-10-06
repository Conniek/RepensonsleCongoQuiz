"use client";

import { useState } from "react";
import {
  AnswerOption,
  Button,
  Card,
  Medallion,
  Meter,
  Modal,
  Ring,
  SectionHeader,
  Segmented,
  Stars,
  StatTile,
  Tag,
  type CardTone,
} from "@/ui";

const TEINTES: CardTone[] = [
  "carte", "creme", "sourd", "encre",
  "bleu", "rouge", "vert", "bleu-profond",
];

/** Planche de styles.
 *
 *  Les libellés y sont en dur, et c'est le seul endroit où c'est permis :
 *  cette page ne s'adresse pas aux joueurs, elle sert à régler les jetons et
 *  à voir d'un coup l'effet d'un changement. */
export default function Planche() {
  const [portee, setPortee] = useState<"monde" | "pays">("monde");
  const [ouverte, setOuverte] = useState(false);

  return (
    <div className="pb-24 flex flex-col gap-8">
      <h1>Design system</h1>

      <section>
        <SectionHeader title="Card — 8 teintes de la charte" />
        <ul className="list-none p-0 mt-3 grid grid-cols-2 gap-3">
          {TEINTES.map((tone) => (
            <li key={tone}>
              <Card tone={tone}>
                <p className="m-0 text-xs font-black">{tone}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionHeader title="Button — 3 intentions" />
        <div className="mt-3 flex flex-wrap gap-3">
          <Button>Principal</Button>
          <Button intent="discret">Discret</Button>
          <Button arrow>Avec flèche</Button>
          <Button small>Compact</Button>
          <Button href="#" arrow>Lien</Button>
          <Button disabled>Indisponible</Button>
        </div>
        <Card tone="encre" className="mt-3">
          <Button intent="inverse" full arrow>Inverse, sur fond coloré</Button>
        </Card>
      </section>

      <section>
        <SectionHeader title="Tag" />
        <p className="mt-3 flex flex-wrap gap-2">
          <Tag tone="encre" icone="🔒">Plus</Tag>
          <Tag tone="jaune">Nouveau</Tag>
          <Tag tone="rouge">Offre de la semaine</Tag>
          <Tag tone="contour">Gratuit</Tag>
        </p>
      </section>

      <section>
        <SectionHeader title="Stars, Meter, Ring" />
        <div className="mt-3 flex flex-col gap-4">
          <Stars value={3} label="3 étoiles sur 6" />
          <Meter value={50} label="50 % du thème" />
          <Meter value={62} tone="temps" label="5 secondes restantes" />
          <Card tone="encre">
            <Meter value={82} tone="xp" label="1240 sur 1500 XP" />
          </Card>
          <Ring value={61} label="réussite" />
        </div>
      </section>

      <section>
        <SectionHeader title="StatTile, Medallion" />
        <ul className="list-none p-0 mt-3 grid grid-cols-2 gap-3">
          <li><StatTile value="23" label="Parties jouées" icone="🎮" /></li>
          <li><StatTile value="7 j" label="Série en cours" icone="🔥" /></li>
        </ul>
        <p className="mt-3 flex gap-4">
          <Medallion picto={<span aria-hidden="true">🏆</span>} label="Première victoire" sublabel="Obtenu" obtained />
          <Medallion picto={<span aria-hidden="true">🦍</span>} label="Faune" sublabel="3/5" />
        </p>
      </section>

      <section>
        <SectionHeader title="Segmented" />
        <p className="mt-3">
          <Segmented
            label="Portée du classement"
            value={portee}
            onChange={setPortee}
            options={[
              { value: "monde", label: "Monde" },
              { value: "pays", label: "Mon pays" },
            ]}
          />
        </p>
      </section>

      <section>
        <SectionHeader title="AnswerOption — 4 états" />
        <div className="mt-3 flex flex-col gap-2">
          <AnswerOption letter="A">1958</AnswerOption>
          <AnswerOption letter="B" state="juste" marqueur="✓">1960</AnswerOption>
          <AnswerOption letter="C" state="faux" marqueur="✗">1965</AnswerOption>
          <AnswerOption letter="D" state="attendu" marqueur="←">Réponse attendue</AnswerOption>
        </div>
      </section>

      <section>
        <SectionHeader title="Modal" />
        <p className="mt-3">
          <Button onClick={() => setOuverte(true)}>Ouvrir la fenêtre</Button>
        </p>
        {ouverte && (
          <Modal label="Exemple de fenêtre" onClose={() => setOuverte(false)}>
            <h2 className="mt-0">Fenêtre modale</h2>
            <p>Échap ferme, le focus reste à l&apos;intérieur et revient au bouton.</p>
            <form method="dialog">
              <Button type="submit" intent="discret" full>Fermer</Button>
            </form>
          </Modal>
        )}
      </section>
    </div>
  );
}

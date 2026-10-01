import { notFound } from "next/navigation";
import { estLangue } from "@/lib/i18n";

/* =========================================================================
   Page de contrôle de l'étape 0 — À SUPPRIMER une fois la refonte terminée.

   Elle ne sert qu'à vérifier trois choses d'un coup d'œil :
     - Tailwind compile et ses classes s'appliquent ;
     - les jetons du prototype sont bien lus (les couleurs sont justes) ;
     - le preflight n'est pas actif, donc rien d'existant n'a bougé.
   ========================================================================= */

export default async function TestTailwind({
  params,
}: {
  params: Promise<{ langue: string }>;
}) {
  const { langue } = await params;
  if (!estLangue(langue)) notFound();

  const pastels = [
    ["pastel-bleu", "bg-pastel-bleu"],
    ["pastel-ocre", "bg-pastel-ocre"],
    ["pastel-rose", "bg-pastel-rose"],
    ["pastel-vert", "bg-pastel-vert"],
    ["pastel-violet", "bg-pastel-violet"],
    ["pastel-menthe", "bg-pastel-menthe"],
  ] as const;

  return (
    <>
      <h1>Contrôle Tailwind</h1>

      <p className="rounded-m bg-primaire p-4 text-primaire-contraste">
        Ce bloc est bleu, avec des coins arrondis et du texte clair. S&apos;il
        est bleu, Tailwind compile et lit les jetons.
      </p>

      <p className="mt-4 rounded-m bg-accent p-4 text-accent-contraste">
        Celui-ci est ocre avec du texte sombre.
      </p>

      <ul className="mt-4 grid grid-cols-3 gap-2 list-none p-0">
        {pastels.map(([nom, classe]) => (
          <li key={nom} className={`${classe} rounded-s p-3 text-center text-xs`}>
            {nom}
          </li>
        ))}
      </ul>

      <h2>Et le reste de la page ?</h2>
      <p>
        Ce paragraphe et ces titres n&apos;ont aucune classe Tailwind : ils
        doivent s&apos;afficher exactement comme sur les autres pages. Si les
        titres ont perdu leur taille ou leur graisse, c&apos;est que le
        preflight s&apos;est activé, et il faut le signaler.
      </p>

      <p>
        <button type="button">Bouton d&apos;origine, inchangé</button>
      </p>
    </>
  );
}

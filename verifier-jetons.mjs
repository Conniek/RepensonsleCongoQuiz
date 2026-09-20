#!/usr/bin/env node
/**
 * Vérifie qu'aucune valeur littérale n'a été écrite hors de jetons.css.
 *
 * C'est la discipline qui rend le design system utile : le jour où vous
 * changez d'identité visuelle, ou que vous déclinez l'application à la charte
 * d'un partenaire, seul jetons.css doit changer. Un seul « padding: 15px »
 * écrit un soir de fatigue, et le système commence à mentir.
 *
 * Usage : npm run verifier:jetons
 */

import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const RACINE = process.cwd();
const FICHIER_JETONS = "app/jetons.css";

// Ce qui est interdit ailleurs que dans le fichier de jetons.
const INTERDITS = [
  { nom: "couleur hexadécimale", motif: /#[0-9a-fA-F]{3,8}\b/g },
  { nom: "couleur rgb/hsl", motif: /\b(?:rgba?|hsla?|oklch)\s*\(/g },
  { nom: "longueur en pixels", motif: /(?<![-\w#])\d+px\b/g },
  { nom: "longueur en rem", motif: /(?<![-\w#])\d+(?:\.\d+)?rem\b/g },
];

// Exceptions légitimes : valeurs sans rapport avec l'identité visuelle.
const TOLERES = [
  /\b0px\b/, /\b1px\b/, /\b2px\b/,      // traits de bordure et repères
  /\b100%\b/, /\b50%\b/,
  /0\.01ms/,                             // neutralisation des animations
];

async function fichiersCss(dossier) {
  const sortie = [];
  for (const entree of await readdir(dossier, { withFileTypes: true })) {
    if (entree.name.startsWith(".") || entree.name === "node_modules") continue;
    const chemin = join(dossier, entree.name);
    if (entree.isDirectory()) sortie.push(...(await fichiersCss(chemin)));
    else if (entree.name.endsWith(".css")) sortie.push(chemin);
  }
  return sortie;
}

const fichiers = await fichiersCss(join(RACINE, "app"));
let fautes = 0;

for (const fichier of fichiers) {
  const relatif = relative(RACINE, fichier);
  if (relatif === FICHIER_JETONS) continue;

  const lignes = (await readFile(fichier, "utf8")).split("\n");

  lignes.forEach((ligne, index) => {
    const nue = ligne.trim();
    if (nue.startsWith("/*") || nue.startsWith("*") || nue.startsWith("//")) return;

    // Exception documentée : une variable CSS ne fonctionne pas dans une
    // media query. Les points de rupture restent donc littéraux, et ils
    // sont listés en commentaire dans jetons.css pour rester trouvables.
    if (nue.startsWith("@media")) return;

    for (const { nom, motif } of INTERDITS) {
      for (const trouve of ligne.matchAll(motif)) {
        if (TOLERES.some((t) => t.test(trouve[0]))) continue;
        console.error(
          `  ${relatif}:${index + 1}  ${nom} « ${trouve[0]} »\n` +
          `    ${nue.slice(0, 90)}`
        );
        fautes++;
      }
    }
  });
}

// Le style en ligne dans le JSX contourne le contrôle : on le signale aussi.
async function fichiersTsx(dossier) {
  const sortie = [];
  for (const entree of await readdir(dossier, { withFileTypes: true })) {
    if (entree.name.startsWith(".") || entree.name === "node_modules") continue;
    const chemin = join(dossier, entree.name);
    if (entree.isDirectory()) sortie.push(...(await fichiersTsx(chemin)));
    else if (entree.name.endsWith(".tsx")) sortie.push(chemin);
  }
  return sortie;
}

for (const fichier of await fichiersTsx(join(RACINE, "app"))) {
  const relatif = relative(RACINE, fichier);
  const lignes = (await readFile(fichier, "utf8")).split("\n");
  lignes.forEach((ligne, index) => {
    if (/style=\{\{/.test(ligne) && !/width:\s*`/.test(ligne)) {
      console.error(`  ${relatif}:${index + 1}  style en ligne dans le JSX\n    ${ligne.trim().slice(0, 90)}`);
      fautes++;
    }
  });
}

if (fautes > 0) {
  console.error(`\n${fautes} valeur(s) littérale(s) hors de ${FICHIER_JETONS}.`);
  console.error("Remplace-les par un jeton, ou ajoute le jeton manquant dans jetons.css.\n");
  process.exit(1);
}

console.log(`Aucune valeur littérale hors de ${FICHIER_JETONS}. Le design system tient.`);

/** Liste des pays, en codes ISO 3166-1 alpha-2.
 *
 *  On ne stocke AUCUN libellé : `Intl.DisplayNames` traduit le code dans la
 *  langue demandée, donc la liste ne se maintient ni ne se traduit. C'est
 *  aussi le bon choix éco-conception : deux cents libellés en deux langues
 *  dans le dictionnaire, ce sont deux cents lignes à télécharger pour un
 *  écran vu une seule fois.
 *
 *  Les quatre premiers sont mis en tête de liste : ils couvrent l'essentiel
 *  de la diaspora visée. Ils restent présents à leur place alphabétique, pour
 *  qu'une recherche au clavier les trouve là où on les attend. */

export const PAYS_PRIORITAIRES = ["FR", "CD", "BE", "CA"] as const;

export const PAYS = [
  "AD","AE","AF","AG","AL","AM","AO","AR","AT","AU","AZ","BA","BB","BD","BE",
  "BF","BG","BH","BI","BJ","BN","BO","BR","BS","BT","BW","BY","BZ","CA","CD",
  "CF","CG","CH","CI","CL","CM","CN","CO","CR","CU","CV","CY","CZ","DE","DJ",
  "DK","DM","DO","DZ","EC","EE","EG","ER","ES","ET","FI","FJ","FR","GA","GB",
  "GD","GE","GH","GM","GN","GQ","GR","GT","GW","GY","HN","HR","HT","HU","ID",
  "IE","IL","IN","IQ","IR","IS","IT","JM","JO","JP","KE","KG","KH","KI","KM",
  "KN","KP","KR","KW","KZ","LA","LB","LC","LI","LK","LR","LS","LT","LU","LV",
  "LY","MA","MC","MD","ME","MG","MH","MK","ML","MM","MN","MR","MT","MU","MV",
  "MW","MX","MY","MZ","NA","NE","NG","NI","NL","NO","NP","NR","NZ","OM","PA",
  "PE","PG","PH","PK","PL","PT","PW","PY","QA","RO","RS","RU","RW","SA","SB",
  "SC","SD","SE","SG","SI","SK","SL","SM","SN","SO","SR","SS","ST","SV","SY",
  "SZ","TD","TG","TH","TJ","TL","TM","TN","TO","TR","TT","TV","TW","TZ","UA",
  "UG","US","UY","UZ","VA","VC","VE","VN","VU","WS","YE","ZA","ZM","ZW",
] as const;

export type CodePays = (typeof PAYS)[number];

export function estCodePays(valeur: string): valeur is CodePays {
  return (PAYS as readonly string[]).includes(valeur);
}

/** Libellé du pays dans la langue demandée, avec repli sur le code brut
 *  si l'environnement ne connaît pas `Intl.DisplayNames`. */
export function nomPays(code: string, langue: string): string {
  try {
    const noms = new Intl.DisplayNames([langue], { type: "region" });
    return noms.of(code) ?? code;
  } catch {
    return code;
  }
}

/** Les pays triés pour l'affichage : les quatre prioritaires d'abord, puis
 *  tous les autres par ordre alphabétique de la langue courante. */
export function paysTries(langue: string) {
  const prioritaires = PAYS_PRIORITAIRES.map((code) => ({
    code,
    nom: nomPays(code, langue),
  }));

  const autres = PAYS.map((code) => ({ code, nom: nomPays(code, langue) })).sort(
    (a, b) => a.nom.localeCompare(b.nom, langue)
  );

  return { prioritaires, autres };
}

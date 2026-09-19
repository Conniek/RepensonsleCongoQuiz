/** Dictionnaire français — langue de référence.
 *
 *  Toute chaîne visible par l'utilisateur vit ici, jamais dans un composant.
 *  Les entrées sont soit des chaînes, soit des fonctions quand il y a une
 *  valeur à insérer ou un pluriel à accorder. Ce choix donne la vérification
 *  de type gratuitement : une clé absente ou un paramètre oublié est une
 *  erreur de compilation, pas un « undefined » découvert en production.
 *
 *  Pour ajouter une langue : copier ce fichier, traduire, et l'enregistrer
 *  dans lib/i18n/index.ts. TypeScript signalera toute entrée manquante. */

const pluriel = (n: number, singulier: string, plur = singulier + "s") =>
  n > 1 ? plur : singulier;

export const fr = {
  langue: "fr",

  marque: {
    nom: "Repensons le Congo Quiz",
    slogan: "Un grand pays, mille histoires. Joue, apprends et célèbre le Congo.",
    presentation: (questions: number, categories: number) =>
      `Repensons le Congo Quiz est une application gratuite de culture générale sur la République démocratique du Congo. Elle réunit ${questions} questions réparties en ${categories} catégories, chacune accompagnée d’une explication et d’un lien vers sa source.`,
    descriptionMeta:
      "Repensons le Congo Quiz est une application gratuite de 1 445 questions sourcées sur la République démocratique du Congo.",
  },

  navigation: {
    accesRapide: "Accès rapide",
    allerAuContenu: "Aller au contenu",
    principale: "Navigation principale",
    secondaire: "Navigation secondaire",
    filAriane: "Fil d’Ariane",
    accueil: "Accueil",
    profil: "Profil",
    aPropos: "À propos du projet",
    accessibilite: "Déclaration d’accessibilité",
    infosSite: "Informations sur le site",
  },

  commun: {
    chargement: "Chargement…",
    voirTout: "Voir tout",
    retourAccueil: "Revenir à l’accueil",
    nouvelleFenetre: "(nouvelle fenêtre)",
    sansValeur: "—",
  },

  niveaux: {
    facile: "Facile",
    moyen: "Moyen",
    difficile: "Difficile",
  },

  accueil: {
    titrePage: "Repensons le Congo Quiz — apprendre la RDC en jouant",
    titreCategories: "Les catégories",
    nbQuestions: (n: number) => `${n} questions.`,
    erreurCategories:
      "Les catégories n’ont pas pu être chargées. Réessaie dans un instant.",
  },

  progression: {
    titre: "Ta progression",
    chargement: "Chargement de ta progression…",
    jamaisJoue:
      "Tu n’as pas encore joué. Lance une première partie pour commencer à gagner des points d’expérience et des badges.",
    rangActuel: "Rang actuel :",
    resteAvantRang: (restant: number, rang: string, xp: number, seuil: number) =>
      `Il te reste ${restant} points d’expérience pour atteindre le rang suivant, ${rang}. Tu en as ${xp} sur ${seuil}.`,
    rangMaximal: (xp: number) =>
      `Tu as atteint le rang le plus élevé, avec ${xp} points d’expérience.`,
    tauxReussite: (taux: number, parties: number) =>
      `Tu as répondu correctement à ${taux} % des questions posées, sur ${parties} ${pluriel(parties, "partie")}.`,
    serie: (jours: number) =>
      `Tu joues ${jours} ${pluriel(jours, "jour")} d’affilée. Reviens demain pour ne pas perdre ta série.`,
    record: (jours: number) => ` Ton record est de ${jours} jours.`,
  },

  defi: {
    titre: "Le quiz du jour",
    dejaFait: "Tu as déjà relevé le défi du jour. Reviens demain pour le suivant.",
    presentation: (xp: number) =>
      `Sept questions de niveau facile. Tu gagneras ${xp} points d’expérience supplémentaires en le remportant.`,
    jouer: (categorie: string) => `Jouer le quiz du jour sur ${categorie}`,
  },

  badges: {
    titre: "Tes badges",
    compteur: (obtenus: number, total: number) =>
      `Tu as obtenu ${obtenus} ${pluriel(obtenus, "badge")} sur ${total}.`,
    aucun: "Tu n’as pas encore de badge. Remporte une partie pour décrocher le premier.",
    resteADebloquer: (n: number) =>
      `${n} ${pluriel(n, "badge")} ${pluriel(n, "reste", "restent")} à débloquer.`,
    voirTous: (n: number) => `Voir les ${n} badges et leurs conditions`,
    obtenus: "Obtenus",
    aDebloquer: "À débloquer",
    obtenuLe: "obtenu",
    avancement: (avancement: number, objectif: number) =>
      `en cours : ${avancement} sur ${objectif}`,
    nouveaux: (n: number) =>
      `Nouveau${n > 1 ? "x" : ""} badge${n > 1 ? "s" : ""} débloqué${n > 1 ? "s" : ""}`,
  },

  categorie: {
    descriptionMeta: (n: number, categorie: string) =>
      `${n} questions sur ${categorie} en République démocratique du Congo, réparties en trois niveaux de difficulté.`,
    intro: (n: number) => `${n} questions réparties en trois niveaux.`,
    titreNiveaux: "Choisis ton niveau",
    questionsNiveau: (n: number) => `${n} questions à ce niveau.`,
    etoiles: (n: number) => `${n} ${pluriel(n, "étoile")} sur 2.`,
    poolInsuffisant:
      "Cette catégorie manque de questions à ce niveau. La partie sera complétée par des questions de difficulté voisine.",
    jouerNiveau: (niveau: string) => `Jouer le niveau ${niveau.toLowerCase()}`,
    conditionMoyen:
      "Remporte deux parties au niveau facile pour débloquer ce niveau.",
    conditionDifficile:
      "Remporte deux parties au niveau moyen pour débloquer ce niveau.",
    conditionGenerique:
      "Remporte deux parties au niveau précédent pour débloquer ce niveau.",
    annonceVerrou: (niveau: string) =>
      `Le niveau ${niveau.toLowerCase()} est verrouillé.`,
    annonceVerrous: (n: number) => `${n} niveaux sont verrouillés.`,
    titreRegles: "Comment gagner une étoile",
    regles:
      "Une partie compte sept questions. Pour la remporter il faut atteindre 900 points et au moins cinq bonnes réponses sur sept. Chaque victoire rapporte une étoile, deux par niveau, et deux étoiles débloquent le niveau suivant.",
  },

  partie: {
    titrePage: "Partie en cours",
    preparation: "Préparation de la partie…",
    parametreManquant: "Catégorie ou niveau manquant.",
    question: (position: number, total: number) =>
      `Question ${position} sur ${total}`,
    avancement: "Avancement dans la partie",
    titreChrono: "Temps restant",
    secondes: (s: string) => `${s} s`,
    mettreEnPause: "Mettre en pause",
    reprendre: "Reprendre",
    desactiverChrono: "Désactiver le chronomètre",
    chronoDesactive:
      "Chronomètre désactivé. La partie reste valide mais ne rapporte pas de bonus de rapidité.",
    alerte10: "10 secondes",
    alerte5: "5 secondes",
    enonce: "Énoncé",
    meta: (categorie: string, sousCategorie: string | null, difficulte: number) =>
      `${categorie}${sousCategorie ? ` · ${sousCategorie}` : ""} · difficulté ${difficulte} sur 5`,
    bonneReponseSuffixe: " — bonne réponse",
    bonneReponse: "Bonne réponse",
    mauvaiseReponse: "Mauvaise réponse",
    pointsGagnes: (n: number) => `${n} points gagnés sur cette question.`,
    source: "Source :",
    consulterSource: "consulter la source",
    questionSuivante: "Question suivante",
    voirResultat: "Voir le résultat",
    niveauVerrouille:
      "Ce niveau est verrouillé. Remporte deux parties au niveau précédent pour y accéder.",
    erreurDemarrage: (message: string) =>
      `La partie n’a pas pu démarrer : ${message}`,
    retourCategorie: (categorie: string) => `Revenir à ${categorie}`,
  },

  resultat: {
    titrePage: "Résultat de la partie",
    remportee: "Partie remportée",
    terminee: "Partie terminée",
    titreScore: "Ton score",
    points: "Points",
    pointsValeur: (n: number) => `${n} points`,
    bonnesReponses: "Bonnes réponses",
    bonnesValeur: (bonnes: number, total: number) => `${bonnes} sur ${total}`,
    experience: "Expérience gagnée",
    experienceValeur: (n: number) => `${n} points d’expérience`,
    conditionVictoire: "Condition de victoire",
    conditionTexte: "900 points et 5 bonnes réponses sur 7.",
    conditionAtteinte: "Atteinte.",
    conditionNonAtteinte: "Non atteinte cette fois.",
    deckComplete:
      "Cette catégorie manque de questions à ce niveau. La partie a été complétée avec des questions de difficulté voisine.",
    sansChrono:
      "Chronomètre désactivé : la partie est valide, sans bonus de rapidité.",
    titreDetail: "Le détail de tes réponses",
    ligneReponse: (position: number, correcte: boolean, points: number) =>
      `Question ${position} : ${correcte ? "bonne réponse" : "mauvaise réponse"}, ${points} points.`,
    titreSuite: "Et maintenant",
    rejouer: (niveau: string) => `Rejouer le niveau ${niveau.toLowerCase()}`,
    voirProgression: "Voir ta progression",
  },

  profil: {
    titre: "Ton profil",
    descriptionMeta:
      "Ta progression dans Repensons le Congo Quiz : rang, série, badges et maîtrise par catégorie.",
    chargement: "Chargement de ton profil…",
    erreur: "Ta progression n’a pas pu être chargée.",
    titreRang: "Rang",
    rangPhrase: (rang: string, xp: number) =>
      `Tu es ${rang}, avec ${xp} points d’expérience.`,
    resteAvantRang: (restant: number, rang: string) =>
      ` Il t’en reste ${restant} pour devenir ${rang}.`,
    titreStats: "Statistiques",
    partiesJouees: "Parties jouées",
    tauxReussite: "Taux de réussite",
    serieEnCours: "Série en cours",
    meilleureSerie: "Meilleure série",
    jours: (n: number) => `${n} ${pluriel(n, "jour")}`,
    titreMaitrise: "Maîtrise par catégorie",
    aucuneEtoile: "Tu n’as pas encore gagné d’étoile.",
    legendeMaitrise: "Étoiles obtenues dans chaque catégorie, sur six",
    colCategorie: "Catégorie",
    colEtoiles: "Étoiles sur 6",
    titreCompte: "Ton compte",
    compteAnonyme:
      "Tu joues sans compte. Ta progression est enregistrée, mais elle est liée à ce navigateur : elle sera perdue si tu changes d’appareil.",
    creerUnCompte: "Créer un compte pour conserver ma progression",
    gererMonCompte: "Gérer mon compte",
    connecteAvec: (email: string) => `Tu es connecté avec ${email}.`,
    compteSynchronise: "Ta progression est synchronisée avec ton compte.",
  },
  compte: {
    titre: "Ton compte",
    descriptionMeta:
      "Crée un compte pour retrouver ta progression sur tous tes appareils.",

    facultatif:
      "Le compte est facultatif. Tu peux jouer, progresser et gagner des badges sans en créer un. Il sert uniquement à retrouver ta progression si tu changes d’appareil ou de navigateur.",

    titreCreation: "Créer un compte",
    progressionConservee:
      "Ta progression actuelle sera conservée : tes parties, tes étoiles, tes badges et ton expérience restent attachés à ton compte.",
    titreConnexion: "Se connecter",
    dejaUnCompte: "J’ai déjà un compte",
    pasDeCompte: "Je n’ai pas encore de compte",

    email: "Adresse e-mail",
    motDePasse: "Mot de passe",
    motDePasseAide: "Au moins 8 caractères.",
    pseudo: "Pseudo",
    pseudoAide:
      "Entre 2 et 24 caractères. Il sera visible des autres joueurs quand les défis arriveront.",

    creer: "Créer mon compte",
    connecter: "Me connecter",
    deconnecter: "Me déconnecter",
    envoi: "Envoi en cours…",

    confirmationEnvoyee: (email: string) =>
      `Un e-mail de confirmation vient d’être envoyé à ${email}. Ouvre-le pour activer ton compte. En attendant, tu peux continuer à jouer normalement.`,
    connecte: "Tu es connecté. Ta progression est synchronisée.",

    erreurEmailUtilise:
      "Cette adresse est déjà associée à un compte. Connecte-toi avec ce compte. Attention : la progression enregistrée sur cet appareil ne sera alors plus accessible.",
    erreurIdentifiants: "Adresse e-mail ou mot de passe incorrect.",
    erreurPseudoPris: "Ce pseudo est déjà pris. Essaie-en un autre.",
    erreurPseudoLongueur: "Le pseudo doit contenir entre 2 et 24 caractères.",
    erreurMotDePasseCourt: "Le mot de passe doit contenir au moins 8 caractères.",
    erreurGenerique: (message: string) => `Une erreur est survenue : ${message}`,

    motDePasseOublie: "Mot de passe oublié ?",
    titreReinitialisation: "Réinitialiser ton mot de passe",
    reinitialisationTexte:
      "Indique ton adresse e-mail. Tu recevras un lien pour choisir un nouveau mot de passe.",
    envoyerLien: "Envoyer le lien",
    lienEnvoye:
      "Si un compte existe avec cette adresse, un lien vient d’être envoyé. Pense à regarder tes indésirables.",
    titreNouveauMotDePasse: "Choisir un nouveau mot de passe",
    nouveauMotDePasse: "Nouveau mot de passe",
    enregistrer: "Enregistrer",
    motDePasseChange: "Ton mot de passe a été modifié. Tu peux te connecter.",

    titreDonnees: "Tes données",
    exporter: "Télécharger mes données",
    exporterAide:
      "Un fichier contenant ton profil, tes parties, tes réponses, tes étoiles et tes badges.",
    supprimer: "Supprimer mon compte",
    supprimerAide:
      "La suppression est définitive. Ton profil, tes parties, ta progression et tes badges sont effacés et ne peuvent pas être restaurés.",
    supprimerConfirmation:
      "Cette action est définitive. Pour confirmer, écris SUPPRIMER dans le champ ci-dessous.",
    supprimerMotCle: "SUPPRIMER",
    supprimerValider: "Supprimer définitivement",
    annuler: "Annuler",
    compteSupprime: "Ton compte a été supprimé.",
  },

} as const;

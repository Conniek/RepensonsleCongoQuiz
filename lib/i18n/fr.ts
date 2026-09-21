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
    pays: "République démocratique du Congo",
    slogan: "Un grand pays, mille histoires. Joue, apprends et célèbre le Congo.",
    presentation: (questions: number, categories: number) =>
      `Repensons le Congo Quiz est une application gratuite de culture générale sur la République démocratique du Congo. Elle réunit ${questions} questions réparties en ${categories} catégories, chacune accompagnée d’une explication et d’un lien vers sa source.`,
    descriptionMeta:
      "Repensons le Congo Quiz est une application gratuite de 1 445 questions sourcées sur la République démocratique du Congo.",
  },

quizHub: {
    titre: "Quiz",
    etoilesGagnees: (n: number) => `${n} ${pluriel(n, "étoile")} ${pluriel(n, "gagnée")}`,
    titreCarrousel: "À l'affiche",
    duJour: "Du jour",
    jouer: "Jouer",
    saisonnier: "Saisonnier",
    voirDetails: "Voir les détails",
    erreurs: "Erreurs",
    erreursCompte: (n: number) => `${n} ${pluriel(n, "erreur")}`,
    historique: "Historique",
    pourToi: "Pour toi",
    pourToiVide: "Aucune recommandation pour le moment.",
    etoilesAGagner: (n: number) => `${n} ${pluriel(n, "étoile")} à gagner`,
    themes: "Thèmes",
    etoilesTheme: (n: number) => `${n} sur 6`,
    upsellTitre: "Aller plus loin",
    upsellTexte: "Débloquez plus de contenus thématiques.",
    upsellAction: "Voir les offres",
  },

  pageProgression: {
    titre: "Ta progression",
    ajouterPseudo: "Ajouter un pseudo",
    thematiques: "Thématiques jouées",
    aucuneThematique: "Aucune thématique jouée pour le moment.",
    sauvegardeTitre: "Sauvegarder",
    sauvegardeTexte: "Crée un compte pour sauvegarder ta progression.",
    sauvegardeAction: "Créer un compte",
    indicateurs: "Indicateurs",
    kpiQuiz: "Quiz terminés",
    kpiSerie: "Série en cours",
    kpiTheme: "Thème favori",
    kpiEtoiles: "Étoiles",
    kpiEtoilesValeur: (total: number, max: number) => `${total} sur ${max}`,
    badges: "Badges",
    voirPlus: "Voir plus",
    voirTousLesBadges: (n: number) => `Voir les ${n} badges`,
    aucunBadge: "Aucun badge obtenu pour l'instant.",
    tousLesBadges: "Tous les badges",
    fermer: "Fermer",
    obtenus: "Obtenus",
    aDebloquer: "À débloquer",
  },

  pageProfil: {
    titre: "Ton profil",
    sauvegardeTitre: "Sauvegarder",
    sauvegardeAction: "Créer un compte",
    monCompte: "Mon compte",
    abonnement: "Abonnement",
    abonnementGratuit: "Gratuit",
    produit: (p: string) => p,
    aVie: "À vie",
    jusquAu: (date: string) => `Jusqu'au ${date}`,
    langueDefaut: "Langue par défaut",
    enregistrer: "Enregistrer",
    whatsapp: "Nous contacter sur WhatsApp",
    nouvelleFenetre: "(nouvelle fenêtre)",
    feedback: "Nous envoyer un e-mail",
    cgu: "Conditions d'utilisation",
    confidentialite: "Politique de confidentialité",
    accessibilite: "Accessibilité",
    fermer: "Fermer",
    pseudo: "Pseudo",
    pasDePseudo: "Aucun",
    email: "E-mail",
    pasDeCompte: "Aucun compte",
    creerCompte: "Créer un compte",
    deconnecter: "Se déconnecter",
    supprimerDonnees: "Supprimer mes données",
    langueEnregistree: "Langue enregistrée avec succès.",
  },

  navigation: {
    accesRapide: "Accès rapide",
    allerAuContenu: "Aller au contenu",
    principale: "Navigation principale",
    secondaire: "Navigation secondaire",
    filAriane: "Fil d’Ariane",
    accueil: "Accueil",
    profil: "Profil",
    quiz: "Quiz",
    langue: "Langue",
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
    reessayer: "Réessayer",
    contexteNonSecurise:
      "Ta progression ne peut pas se charger sur cette adresse. Utilise l’adresse sécurisée de l’application (https).",
  },

  niveaux: {
    facile: "Facile",
    moyen: "Moyen",
    difficile: "Difficile",
  },

  accueil: {
    titrePage: "Repensons le Congo Quiz — apprendre la RDC en jouant",
    titreCategories: "Catégories",
    voirTout: "Voir tout",
    voirToutesCategories: (n: number) => `Voir les ${n} catégories`,
    titreToutesCategories: "Toutes les catégories",
    jouer: "Jouer",
    etoilesSur: (obtenues: number, total: number) =>
      `${obtenues} étoile${obtenues > 1 ? "s" : ""} sur ${total}`,
    maitrise: (pourcentage: number) => `${pourcentage} % de maîtrise`,
    nbQuestions: (n: number) => `${n} questions.`,
    erreurCategories:
      "Les catégories n’ont pas pu être chargées. Réessaie dans un instant.",
  },

  progression: {
    titre: "Ta progression",
    avantRangSuivant: "points avant le rang suivant",
    joursAffilee: (n: number) => `jour${n > 1 ? "s" : ""} d’affilée`,
    deReussite: "de réussite",
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
    recompense: (xp: number) => `+ ${xp} points d’expérience`,
    jouerMaintenant: "Jouer maintenant",
    dejaFait: "Tu as déjà relevé le défi du jour. Reviens demain pour le suivant.",
    presentation: (xp: number) =>
      `Sept questions de niveau facile. Tu gagneras ${xp} points d’expérience supplémentaires en le remportant.`,
    jouer: (categorie: string) => `Jouer le quiz du jour sur ${categorie}`,
  },

  badges: {
    titre: "Tes badges",
    voirTout: "Voir tout",
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

  langues: {
    fr: "Français",
    en: "English",
    choisir: "Choisir la langue",
    changerVers: (langue: string) => `Lire cette page en ${langue}`,
  },

  disponibilite: {
    categorieIndisponible:
      "Cette catégorie n’est pas encore disponible dans cette langue.",
    traductionEnCours: (pourcentage: number) =>
      `Traduction en cours : ${pourcentage} % des questions sont disponibles.`,
    banniereLangue:
      "La version anglaise est en cours de traduction. Seules les catégories complètes sont jouables pour l’instant.",
    aucuneCategorie:
      "Aucune catégorie n’est encore disponible dans cette langue. Reviens bientôt.",
  },

  admin: {
    titre: "Administration",
    acces: "Espace éditorial",
    tableauDeBord: "Tableau de bord",
    questions: "Questions",
    traductions: "Traductions",
    recalibration: "Recalibration",

    // Tableau de bord
    questionsTotales: "Questions au total",
    questionsValidees: "Questions validées",
    aRecalibrer: "À recalibrer",
    sansTexteAlternatif: "Images sans texte alternatif",
    titreCompletude: "Avancement des traductions",
    titreQuizSousSeuil: "Quiz spéciaux sous le seuil",
    quizSousSeuil: (titre: string, nb: number) =>
      `${titre} : ${nb} question${nb > 1 ? "s" : ""} rattachée${nb > 1 ? "s" : ""}.`,
    aucunQuizSousSeuil: "Tous les quiz spéciaux ont assez de questions.",

    // Liste
    rechercher: "Rechercher dans les énoncés",
    filtreCategorie: "Catégorie",
    filtreDifficulte: "Difficulté",
    filtreStatut: "Statut",
    toutes: "Toutes",
    tous: "Tous",
    resultats: (n: number) => `${n} question${n > 1 ? "s" : ""}.`,
    aucunResultat: "Aucune question ne correspond à ces filtres.",
    colEnonce: "Énoncé",
    colDifficulte: "Difficulté",
    colTaux: "Taux de réussite",
    colVues: "Présentations",
    colStatut: "Statut",
    editer: "Modifier",

    // Édition
    titreEdition: "Modifier la question",
    partieInvariante: "Propriétés communes à toutes les langues",
    partieTraduite: (langue: string) => `Texte en ${langue}`,
    avertissementOrdre:
      "L’ordre des propositions est commun à toutes les langues : la bonne réponse est identifiée par sa position. Traduis chaque proposition à sa place, n’en ajoute ni n’en retire aucune, et ne les réordonne pas.",
    bonneReponsePosition: (n: number) =>
      `Bonne réponse : proposition ${n}. Cette position ne se modifie pas depuis l’écran de traduction.`,
    proposition: (n: number) => `Proposition ${n}`,
    explication: "Explication",
    sourceUrl: "Adresse de la source",
    sourceTitre: "Titre de la source",
    sousCategorie: "Sous-catégorie",
    texteAlternatif: "Texte alternatif de l’image",
    texteAlternatifAide:
      "Décris ce qu’il faut voir pour pouvoir répondre. Jamais « illustration de la question ».",
    statutBrouillon: "Brouillon",
    statutValide: "Validé",
    statutAReverifier: "À revérifier",
    statutRetiree: "Retirée",
    enregistrer: "Enregistrer",
    enregistre: "Modifications enregistrées.",
    erreurNombreReponses: (attendu: number, recu: number) =>
      `Le nombre de propositions doit rester identique à la version de référence : ${attendu} attendues, ${recu} reçues.`,
    erreurSourceObligatoire:
      "Une question validée doit porter une source. Renseigne l’adresse ou repasse en brouillon.",

    // Recalibration
    titreRecalibration: "Questions à recalibrer",
    introRecalibration:
      "Questions dont le taux de réussite observé s’éloigne de la difficulté déclarée, sur un échantillon d’au moins 50 présentations.",
    motifTropFacile: "Réussie trop souvent pour son niveau",
    motifTropDifficile: "Ratée trop souvent pour son niveau",
    suggestion: (n: number) => `Passer en difficulté ${n}`,
    appliquer: "Appliquer",
    applique: "Difficulté mise à jour. Les compteurs repartent de zéro.",
    aucuneARecalibrer:
      "Aucune question à recalibrer pour l’instant. L’écran se remplira à mesure que les parties s’accumulent.",
    compteursRemisAZero:
      "Changer la difficulté remet les compteurs à zéro : l’échantillon précédent portait sur l’ancien classement.",

    accesRefuse: "Cet espace est réservé à l’équipe éditoriale.",
  },

  analyse: {
    titre: "Analyse",
    joueurs: "Joueurs",
    total: "Profils au total",
    avecCompte: "Avec un compte",
    actifs7: "Actifs sur 7 jours",
    actifs30: "Actifs sur 30 jours",

    titreRetention: "Rétention par cohorte",
    introRetention:
      "Les cohortes sont fixées sur la première partie jouée, pas sur l’inscription : la conversion d’un compte anonyme ne déplace donc pas les courbes rétroactivement.",
    colCohorte: "Semaine d’arrivée",
    colJoueurs: "Joueurs",
    colJ1: "Revenus à 1 jour",
    colJ7: "Revenus à 7 jours",
    colJ30: "Revenus à 30 jours",

    titreCompletion: "Complétion des parties",
    colSemaine: "Semaine",
    colLancees: "Lancées",
    colTerminees: "Terminées",
    colAbandonnees: "Abandonnées",
    colTauxCompletion: "Taux de complétion",
    colGagnees: "Remportées",

    titreAbandon: "Abandon par question",
    introAbandon:
      "Position atteinte avant l’abandon. Un pic sur une position précise signale un problème de rythme ou une question mal calibrée.",
    colDerniereQuestion: "Dernière question atteinte",
    colParties: "Parties",

    titrePopularite: "Popularité des catégories",
    colNiveau: "Niveau",
    colPointsMoyens: "Points moyens",
    colTauxVictoire: "Taux de victoire",

    titreAngleMort: "Angle mort éditorial",
    jamaisServies: (n: number) =>
      `${n} question${n > 1 ? "s" : ""} validée${n > 1 ? "s" : ""} n’${n > 1 ? "ont" : "a"} jamais été servie${n > 1 ? "s" : ""}.`,
    aucunAngleMort: "Toutes les questions validées ont déjà été servies au moins une fois.",
    aucuneDonnee: "Pas encore assez de parties pour afficher cette analyse.",
  },

  inscrits: {
    titre: "Inscrits",
    reserveAdmin: "Cette section est réservée aux administrateurs.",
    intro:
      "La recherche est ciblée, pour traiter une demande précise. Il n’existe volontairement aucune liste complète des adresses.",
    rechercher: "Rechercher par adresse ou pseudo",
    rechercherAide: "Au moins trois caractères.",
    lancer: "Rechercher",
    aucunResultat: "Aucun inscrit ne correspond.",
    colEmail: "Adresse",
    colPseudo: "Pseudo",
    colRole: "Rôle",
    colParties: "Parties",
    colInscrit: "Inscrit le",
    roleJoueur: "Joueur",
    roleEditeur: "Éditeur",
    roleAdmin: "Administrateur",
    changerRole: "Changer le rôle",
    roleChange: "Rôle mis à jour.",
    erreurAutoRetrait:
      "Tu ne peux pas retirer tes propres droits d’administrateur : plus personne ne pourrait en attribuer.",
    exporter: "Exporter ses données",
    supprimer: "Supprimer ce compte",
    supprimerConfirmation:
      "Cette suppression est définitive et efface toute la progression de cette personne. Écris SUPPRIMER pour confirmer.",
    supprime: "Compte supprimé.",
  },

  contenu: {
    quizSpeciaux: "Quiz spéciaux",
    introQuizSpeciaux:
      "Un quiz spécial regroupe les questions portant un même tag. Le rattachement est explicite : il n’est jamais recalculé à partir du texte des questions.",
    colTitre: "Titre",
    colTag: "Tag",
    colRattachees: "Questions rattachées",
    colSeuil: "Seuil d’ouverture",
    colActif: "Actif",
    sousLeSeuil: "Sous le seuil : ce quiz reste visible et annonce sa condition d’ouverture.",
    enregistrer: "Enregistrer",
    enregistre: "Modifications enregistrées.",

    campagnes: "Campagnes",
    introCampagnes:
      "Conteneur de contenu temporaire, daté et administrable. Aucune date d’événement n’est codée dans l’application.",
    nouvelleCampagne: "Nouvelle campagne",
    campagneTitre: "Titre",
    campagneDescription: "Description",
    campagneType: "Type",
    typeQuiz: "Quiz thématique",
    typeComparateur: "Comparateur civique",
    campagneDebut: "Début",
    campagneFin: "Fin",
    campagneStatut: "Statut",
    statutBrouillon: "Brouillon",
    statutProgrammee: "Programmée",
    statutActive: "Active",
    statutArchivee: "Archivée",
    miseEnAvant: "Mise en avant sur l’accueil",
    aucuneCampagne: "Aucune campagne pour l’instant.",
  },

  offres: {
    titre: "Trois façons d’apprendre",
    intro:
      "Le quiz reste gratuit. Les offres ajoutent du contenu, elles ne verrouillent rien.",
    independantes:
      "Plus et Parcours de langue sont indépendants : chacun s’achète seul.",

    gratuitCategorie: "Culture générale",
    gratuitEtiquette: "Gratuit",
    gratuitTitre: "Quiz général RDC",
    gratuitTexte: (questions: number, categories: number) =>
      `Les ${questions} questions et les ${categories} catégories restent accessibles gratuitement : histoire, géographie, musique, personnages, institutions, langues, gastronomie, économie, nature et plus encore.`,
    gratuitPoint1: "Facile · Moyen · Difficile",
    gratuitPoint2: "Progression, expérience, badges et défi quotidien",
    gratuitPoint3: "Questions illustrées et explications sourcées",
    gratuitPublicite: "Financé par la publicité. Les offres payantes la retirent.",

    plusCategorie: "Repensons le Congo Plus",
    plusEtiquette: "Nouveau",
    plusTitre: "Le Congo ne s’arrête pas au quiz.",
    plusTexte:
      "Débloque des quiz exclusifs sur les grandes figures, les histoires méconnues et les régions de la RDC.",
    plusPoint1: "Des sujets qu’on connaît… beaucoup moins qu’on ne le croit.",
    plusPoint2: "Sans aucune publicité.",
    plusPrix: "1,99 € / mois",
    plusPrixDetail: "ou 11,99 € par an",
    plusAction: "Découvrir Plus",

    langueCategorie: "Parcours de langue",
    langueTitre: "Parle la langue de tes parents.",
    langueTexte:
      "Un parcours complet en cinq niveaux, des salutations à la conversation courante, avec l’audio enregistré par des locuteurs natifs.",
    langueDisponible: "Lingala",
    langueBientot: (langue: string) => `${langue} · bientôt`,
    languePrix: "19,99 € à vie",
    languePrixDetail: "ou 4,99 € par mois · achat unique, sans renouvellement",
    langueAction: "Commencer le lingala",
  },

  regles: {
    titre: "Comment se joue une partie",
    texte:
      "Sept questions, quinze secondes chacune. Il faut 900 points et cinq bonnes réponses pour gagner une étoile. Deux étoiles débloquent le niveau suivant.",
  },

  splash: {
    titre: "Repensons le Congo Quiz",
    sousTitre: "Un grand pays, mille histoires.",
    paragraphe:
      "Apprenez la République démocratique du Congo à travers 1 445 questions sourcées : histoire, géographie, musique, gastronomie, langues, nature, économie et bien plus. Chaque réponse inclut une explication et un lien vers sa source.",
    cta: "Commencer le quiz",
  },

  accueilUtilisateur: {
    bonjour: (pseudo: string | null) => pseudo ? `Salut, ${pseudo} !` : "Salut !",
    diamonds: (n: number) => `${n} points`,
    pret: "Prêt à jouer ?",
  },

  erreurs: {
    titre: "Mes erreurs",
    intro: "Les questions auxquelles vous avez répondu incorrectement. C'est l'occasion d'apprendre !",
    aucune: "Pas encore d'erreur. Continue à jouer !",
    bonneReponse: "Bonne réponse :",
    voirPlus: "Charger plus",
  },

  historique: {
    titre: "Historique",
    aucun: "Aucune partie jouée pour le moment.",
    legende: "Historique des parties jouées",
    colDate: "Date",
    colCategorie: "Catégorie",
    colNiveau: "Niveau",
    colScore: "Score",
    colResultat: "Résultat",
    score: (points: number, bonnes: number, total: number) =>
      `${points} points · ${bonnes}/${total}`,
    gagnee: "✓ Gagnée",
    perdue: "Perdue",
  },

  conditions: {
    titre: "Conditions d'utilisation",
    intro: "Dernière mise à jour : septembre 2026",
    sections: [
      {
        titre: "1. Acceptation des conditions",
        contenu: "En utilisant Repensons le Congo Quiz, vous acceptez ces conditions d'utilisation. Si vous n'êtes pas d'accord, veuillez ne pas utiliser l'application.",
      },
      {
        titre: "2. Licence d'utilisation",
        contenu: "Nous vous accordons le droit d'utiliser cette application à titre personnel et non commercial. Vous ne pouvez pas reproduire, modifier ou distribuer l'application sans permission.",
      },
      {
        titre: "3. Comptes utilisateur",
        contenu: "Vous êtes responsable de la confidentialité de vos identifiants de compte. Vous acceptez de vous connecter immédiatement si vous découvrez une utilisation non autorisée de votre compte.",
      },
      {
        titre: "4. Limitation de responsabilité",
        contenu: "L'application est fournie « telle quelle ». Nous ne garantissons pas l'exactitude, l'exhaustivité ou l'utilité de son contenu.",
      },
      {
        titre: "5. Modifications",
        contenu: "Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prennent effet immédiatement.",
      },
    ],
  },

  confidentialite: {
    titre: "Politique de confidentialité",
    intro: "Dernière mise à jour : septembre 2026",
    sections: [
      {
        titre: "1. Données collectées",
        contenu: "Nous collectons les données nécessaires au fonctionnement de l'application : pseudo, email, progression et résultats de quiz.",
      },
      {
        titre: "2. Utilisation des données",
        contenu: "Vos données sont utilisées pour sauvegarder votre progression, améliorer l'expérience utilisateur et générer des statistiques anonymes.",
      },
      {
        titre: "3. Partage des données",
        contenu: "Nous ne partageons pas vos données personnelles avec des tiers. Vos données restent confidentielles et sécurisées.",
      },
      {
        titre: "4. Cookies",
        contenu: "L'application peut utiliser des cookies et des technologies similaires pour améliorer votre expérience.",
      },
      {
        titre: "5. Droits d'accès",
        contenu: "Vous pouvez à tout moment accéder à vos données personnelles ou demander leur suppression.",
      },
      {
        titre: "6. Modification de la politique",
        contenu: "Cette politique peut être modifiée à tout moment. Nous vous informerons de tout changement significatif.",
      },
    ],
  },

  accessibilite: {
    titre: "Déclaration d'accessibilité",
    intro: "Repensons le Congo Quiz s'engage à être accessible à tous.",
    sections: [
      {
        titre: "Accessibilité numérique",
        contenu: "L'application est conçue en conformité avec les recommandations WCAG 2.1 niveau AA pour assurer une accessibilité maximale.",
      },
      {
        titre: "Lecteurs d'écran",
        contenu: "L'application est compatible avec les lecteurs d'écran courants (NVDA, JAWS, VoiceOver) pour les utilisateurs malvoyants.",
      },
      {
        titre: "Navigation au clavier",
        contenu: "Vous pouvez naviguer dans l'application entièrement au clavier. Toutes les fonctionnalités sont accessibles sans souris.",
      },
      {
        titre: "Contraste et lisibilité",
        contenu: "Les textes maintiennent un contraste suffisant pour une bonne lisibilité. Les polices sont conçues pour la clarté.",
      },
      {
        titre: "Sous-titres et alternatives",
        contenu: "Tout contenu visuel ou audio bénéficie d'alternatives textuelles ou de sous-titres.",
      },
      {
        titre: "Signaler un problème",
        contenu: "Si vous rencontrez un problème d'accessibilité, contactez-nous via le formulaire de feedback ou par email.",
      },
    ],
  },

} as const;
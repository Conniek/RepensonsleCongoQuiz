import type { Dictionnaire } from "./index";

/** English dictionary. Its type is derived from the French one, which is the
 *  reference: TypeScript rejects any missing entry or diverging signature. */

const plural = (n: number, singular: string, plur = singular + "s") =>
  n > 1 ? plur : singular;

export const en: Dictionnaire = {
  langue: "en",

  marque: {
    nom: "Repensons le Congo Quiz",
    pays: "Democratic Republic of the Congo",
    slogan: "One vast country, a thousand stories. Play, learn, celebrate the Congo.",
    presentation: (questions: number, categories: number) =>
      `Repensons le Congo Quiz is a free general-knowledge app about the Democratic Republic of the Congo. It gathers ${questions} questions across ${categories} categories, each with an explanation and a link to its source.`,
    descriptionMeta:
      "Repensons le Congo Quiz is a free app with sourced questions about the Democratic Republic of the Congo.",
  },

  navigation: {
    accesRapide: "Quick links",
    allerAuContenu: "Skip to content",
    principale: "Main navigation",
    secondaire: "Secondary navigation",
    filAriane: "Breadcrumb",
    accueil: "Home",
    profil: "Profile",
    quiz: "Quiz",
    langue: "Language",
    aPropos: "About the project",
    accessibilite: "Accessibility statement",
    infosSite: "Site information",
  },

  commun: {
    chargement: "Loading…",
    voirTout: "See all",
    retourAccueil: "Back to home",
    nouvelleFenetre: "(opens in a new window)",
    sansValeur: "—",
    reessayer: "Try again",
    contexteNonSecurise:
      "Your progress can’t load on this address. Please use the app’s secure address (https).",
  },

  niveaux: { facile: "Easy", moyen: "Medium", difficile: "Hard" },

  accueil: {
    titrePage: "Repensons le Congo Quiz — learn about the DRC by playing",
    titreCategories: "Categories",
    voirTout: "See all",
    voirToutesCategories: (n: number) => `See all ${n} categories`,
    titreToutesCategories: "All categories",
    jouer: "Play",
    etoilesSur: (obtenues: number, total: number) =>
      `${obtenues} star${obtenues > 1 ? "s" : ""} out of ${total}`,
    maitrise: (pourcentage: number) => `${pourcentage} % mastered`,
    nbQuestions: (n: number) => `${n} questions.`,
    erreurCategories: "Categories could not be loaded. Please try again shortly.",
  },

  progression: {
    titre: "Your progress",
    avantRangSuivant: "points to the next rank",
    joursAffilee: (n: number) => `day${n > 1 ? "s" : ""} in a row`,
    deReussite: "success",
    chargement: "Loading your progress…",
    jamaisJoue:
      "You haven’t played yet. Start a first round to begin earning experience and badges.",
    rangActuel: "Current rank:",
    resteAvantRang: (restant: number, rang: string, xp: number, seuil: number) =>
      `You need ${restant} more experience points to reach the next rank, ${rang}. You have ${xp} out of ${seuil}.`,
    rangMaximal: (xp: number) =>
      `You have reached the highest rank, with ${xp} experience points.`,
    tauxReussite: (taux: number, parties: number) =>
      `You answered ${taux} % of questions correctly, across ${parties} ${plural(parties, "round")}.`,
    serie: (jours: number) =>
      `You have played ${jours} ${plural(jours, "day")} in a row. Come back tomorrow to keep your streak.`,
    record: (jours: number) => ` Your record is ${jours} days.`,
  },

  defi: {
    titre: "Quiz of the day",
    recompense: (xp: number) => `+ ${xp} experience points`,
    jouerMaintenant: "Play now",
    dejaFait: "You have already taken today’s challenge. Come back tomorrow.",
    presentation: (xp: number) =>
      `Seven easy questions. Winning earns you ${xp} extra experience points.`,
    jouer: (categorie: string) => `Play today’s quiz on ${categorie}`,
  },

  badges: {
    titre: "Your badges",
    voirTout: "See all",
    compteur: (obtenus: number, total: number) =>
      `You have earned ${obtenus} ${plural(obtenus, "badge")} out of ${total}.`,
    aucun: "No badges yet. Win a round to earn your first one.",
    resteADebloquer: (n: number) =>
      `${n} ${plural(n, "badge")} still to unlock.`,
    voirTous: (n: number) => `See all ${n} badges and how to earn them`,
    obtenus: "Earned",
    aDebloquer: "To unlock",
    obtenuLe: "earned",
    avancement: (avancement: number, objectif: number) =>
      `in progress: ${avancement} of ${objectif}`,
    nouveaux: (n: number) => `New badge${n > 1 ? "s" : ""} unlocked`,
  },

  categorie: {
    descriptionMeta: (n: number, categorie: string) =>
      `${n} questions about ${categorie} in the Democratic Republic of the Congo, across three difficulty levels.`,
    intro: (n: number) => `${n} questions across three levels.`,
    titreNiveaux: "Choose your level",
    questionsNiveau: (n: number) => `${n} questions at this level.`,
    etoiles: (n: number) => `${n} ${plural(n, "star")} out of 2.`,
    poolInsuffisant:
      "This category has few questions at this level. The round will be filled with questions of nearby difficulty.",
    jouerNiveau: (niveau: string) => `Play the ${niveau.toLowerCase()} level`,
    conditionMoyen: "Win two rounds at the easy level to unlock this level.",
    conditionDifficile: "Win two rounds at the medium level to unlock this level.",
    conditionGenerique: "Win two rounds at the previous level to unlock this level.",
    annonceVerrou: (niveau: string) => `The ${niveau.toLowerCase()} level is locked.`,
    annonceVerrous: (n: number) => `${n} levels are locked.`,
    titreRegles: "How to earn a star",
    regles:
      "A round has seven questions. To win it you need 900 points and at least five correct answers out of seven. Each win earns a star, two per level, and two stars unlock the next level.",
  },

  partie: {
    titrePage: "Round in progress",
    preparation: "Preparing the round…",
    parametreManquant: "Missing category or level.",
    question: (position: number, total: number) => `Question ${position} of ${total}`,
    avancement: "Progress through the round",
    titreChrono: "Time left",
    secondes: (s: string) => `${s} s`,
    mettreEnPause: "Pause",
    reprendre: "Resume",
    desactiverChrono: "Turn off the timer",
    chronoDesactive:
      "Timer off. The round still counts but earns no speed bonus.",
    alerte10: "10 seconds",
    alerte5: "5 seconds",
    enonce: "Question",
    meta: (categorie: string, sousCategorie: string | null, difficulte: number) =>
      `${categorie}${sousCategorie ? ` · ${sousCategorie}` : ""} · difficulty ${difficulte} of 5`,
    bonneReponseSuffixe: " — correct answer",
    bonneReponse: "Correct",
    mauvaiseReponse: "Incorrect",
    pointsGagnes: (n: number) => `${n} points earned on this question.`,
    source: "Source:",
    consulterSource: "view the source",
    questionSuivante: "Next question",
    voirResultat: "See the result",
    niveauVerrouille:
      "This level is locked. Win two rounds at the previous level to reach it.",
    erreurDemarrage: (message: string) => `The round could not start: ${message}`,
    retourCategorie: (categorie: string) => `Back to ${categorie}`,
  },

  resultat: {
    titrePage: "Round result",
    remportee: "Round won",
    terminee: "Round finished",
    titreScore: "Your score",
    points: "Points",
    pointsValeur: (n: number) => `${n} points`,
    bonnesReponses: "Correct answers",
    bonnesValeur: (bonnes: number, total: number) => `${bonnes} of ${total}`,
    experience: "Experience earned",
    experienceValeur: (n: number) => `${n} experience points`,
    conditionVictoire: "Winning condition",
    conditionTexte: "900 points and 5 correct answers out of 7.",
    conditionAtteinte: "Met.",
    conditionNonAtteinte: "Not met this time.",
    deckComplete:
      "This category has few questions at this level. The round was filled with questions of nearby difficulty.",
    sansChrono: "Timer off: the round counts, without a speed bonus.",
    titreDetail: "Your answers in detail",
    ligneReponse: (position: number, correcte: boolean, points: number) =>
      `Question ${position}: ${correcte ? "correct" : "incorrect"}, ${points} points.`,
    titreSuite: "What next",
    rejouer: (niveau: string) => `Play the ${niveau.toLowerCase()} level again`,
    voirProgression: "See your progress",
  },

  profil: {
    titre: "Your profile",
    descriptionMeta:
      "Your progress in Repensons le Congo Quiz: rank, streak, badges and mastery by category.",
    chargement: "Loading your profile…",
    erreur: "Your progress could not be loaded.",
    titreRang: "Rank",
    rangPhrase: (rang: string, xp: number) =>
      `You are ${rang}, with ${xp} experience points.`,
    resteAvantRang: (restant: number, rang: string) =>
      ` You need ${restant} more to become ${rang}.`,
    titreStats: "Statistics",
    partiesJouees: "Rounds played",
    tauxReussite: "Success rate",
    serieEnCours: "Current streak",
    meilleureSerie: "Best streak",
    jours: (n: number) => `${n} ${plural(n, "day")}`,
    titreMaitrise: "Mastery by category",
    aucuneEtoile: "You haven’t earned a star yet.",
    legendeMaitrise: "Stars earned in each category, out of six",
    colCategorie: "Category",
    colEtoiles: "Stars out of 6",
    titreCompte: "Your account",
    compteAnonyme:
      "You are playing without an account. Your progress is saved, but tied to this browser: it will be lost if you switch devices.",
    creerUnCompte: "Create an account to keep my progress",
    gererMonCompte: "Manage my account",
    connecteAvec: (email: string) => `You are signed in as ${email}.`,
    compteSynchronise: "Your progress is synced with your account.",
  },

  compte: {
    titre: "Your account",
    descriptionMeta: "Create an account to find your progress on any device.",
    facultatif:
      "An account is optional. You can play, progress and earn badges without one. It only serves to recover your progress if you change device or browser.",
    titreCreation: "Create an account",
    progressionConservee:
      "Your current progress is kept: your rounds, stars, badges and experience stay attached to your account.",
    titreConnexion: "Sign in",
    dejaUnCompte: "I already have an account",
    pasDeCompte: "I don’t have an account yet",
    email: "Email address",
    motDePasse: "Password",
    motDePasseAide: "At least 8 characters.",
    pseudo: "Display name",
    pseudoAide:
      "Between 2 and 24 characters. It will be visible to other players once challenges arrive.",
    creer: "Create my account",
    connecter: "Sign me in",
    deconnecter: "Sign out",
    envoi: "Sending…",
    confirmationEnvoyee: (email: string) =>
      `A confirmation email has just been sent to ${email}. Open it to activate your account. In the meantime you can keep playing.`,
    connecte: "You are signed in. Your progress is synced.",
    erreurEmailUtilise:
      "This address already belongs to an account. Sign in with it. Note: the progress saved on this device will then no longer be reachable.",
    erreurIdentifiants: "Incorrect email address or password.",
    erreurPseudoPris: "That display name is taken. Try another one.",
    erreurPseudoLongueur: "The display name must be between 2 and 24 characters.",
    erreurMotDePasseCourt: "The password must be at least 8 characters.",
    erreurGenerique: (message: string) => `Something went wrong: ${message}`,
    motDePasseOublie: "Forgotten password?",
    titreReinitialisation: "Reset your password",
    reinitialisationTexte:
      "Enter your email address. You will receive a link to choose a new password.",
    envoyerLien: "Send the link",
    lienEnvoye:
      "If an account exists with this address, a link has just been sent. Check your spam folder.",
    titreNouveauMotDePasse: "Choose a new password",
    nouveauMotDePasse: "New password",
    enregistrer: "Save",
    motDePasseChange: "Your password has been changed. You can sign in.",
    titreDonnees: "Your data",
    exporter: "Download my data",
    exporterAide:
      "A file containing your profile, rounds, answers, stars and badges.",
    supprimer: "Delete my account",
    supprimerAide:
      "Deletion is permanent. Your profile, rounds, progress and badges are erased and cannot be restored.",
    supprimerConfirmation:
      "This action is permanent. To confirm, type DELETE in the field below.",
    supprimerMotCle: "DELETE",
    supprimerValider: "Delete permanently",
    annuler: "Cancel",
    compteSupprime: "Your account has been deleted.",
  },

  langues: {
    fr: "Français",
    en: "English",
    choisir: "Choose language",
    changerVers: (langue: string) => `Read this page in ${langue}`,
  },

  disponibilite: {
    categorieIndisponible: "This category is not available in this language yet.",
    traductionEnCours: (pourcentage: number) =>
      `Translation in progress: ${pourcentage} % of questions are available.`,
    banniereLangue:
      "The English version is being translated. Only fully translated categories are playable for now.",
    aucuneCategorie:
      "No category is available in this language yet. Please come back soon.",
  },
  admin: {
    titre: "Administration",
    acces: "Editorial area",
    tableauDeBord: "Dashboard",
    questions: "Questions",
    traductions: "Translations",
    recalibration: "Recalibration",

    questionsTotales: "Total questions",
    questionsValidees: "Approved questions",
    aRecalibrer: "To recalibrate",
    sansTexteAlternatif: "Images without alternative text",
    titreCompletude: "Translation progress",
    titreQuizSousSeuil: "Special quizzes below threshold",
    quizSousSeuil: (titre: string, nb: number) =>
      `${titre}: ${nb} question${nb > 1 ? "s" : ""} attached.`,
    aucunQuizSousSeuil: "Every special quiz has enough questions.",

    rechercher: "Search question text",
    filtreCategorie: "Category",
    filtreDifficulte: "Difficulty",
    filtreStatut: "Status",
    toutes: "All",
    tous: "All",
    resultats: (n: number) => `${n} question${n > 1 ? "s" : ""}.`,
    aucunResultat: "No question matches these filters.",
    colEnonce: "Question",
    colDifficulte: "Difficulty",
    colTaux: "Success rate",
    colVues: "Times shown",
    colStatut: "Status",
    editer: "Edit",

    titreEdition: "Edit question",
    partieInvariante: "Properties shared across languages",
    partieTraduite: (langue: string) => `Text in ${langue}`,
    avertissementOrdre:
      "The order of the options is shared across languages: the correct answer is identified by its position. Translate each option in place, do not add or remove any, and do not reorder them.",
    bonneReponsePosition: (n: number) =>
      `Correct answer: option ${n}. This position cannot be changed from the translation screen.`,
    proposition: (n: number) => `Option ${n}`,
    explication: "Explanation",
    sourceUrl: "Source URL",
    sourceTitre: "Source title",
    sousCategorie: "Sub-category",
    texteAlternatif: "Image alternative text",
    texteAlternatifAide:
      "Describe what must be seen in order to answer. Never “illustration of the question”.",
    statutBrouillon: "Draft",
    statutValide: "Approved",
    statutAReverifier: "Needs review",
    statutRetiree: "Withdrawn",
    enregistrer: "Save",
    enregistre: "Changes saved.",
    erreurNombreReponses: (attendu: number, recu: number) =>
      `The number of options must match the reference version: ${attendu} expected, ${recu} received.`,
    erreurSourceObligatoire:
      "An approved question must carry a source. Add the URL or switch back to draft.",

    titreRecalibration: "Questions to recalibrate",
    introRecalibration:
      "Questions whose observed success rate drifts from their declared difficulty, over a sample of at least 50 appearances.",
    motifTropFacile: "Answered correctly too often for its level",
    motifTropDifficile: "Missed too often for its level",
    suggestion: (n: number) => `Move to difficulty ${n}`,
    appliquer: "Apply",
    applique: "Difficulty updated. Counters restart from zero.",
    aucuneARecalibrer:
      "No question to recalibrate yet. This screen fills up as rounds accumulate.",
    compteursRemisAZero:
      "Changing the difficulty resets the counters: the previous sample referred to the old classification.",

    accesRefuse: "This area is reserved for the editorial team.",
  },

  analyse: {
    titre: "Analytics",
    joueurs: "Players",
    total: "Total profiles",
    avecCompte: "With an account",
    actifs7: "Active over 7 days",
    actifs30: "Active over 30 days",

    titreRetention: "Retention by cohort",
    introRetention:
      "Cohorts are anchored on the first round played, not on sign-up: converting an anonymous account therefore does not shift the curves retroactively.",
    colCohorte: "Arrival week",
    colJoueurs: "Players",
    colJ1: "Returned within 1 day",
    colJ7: "Returned within 7 days",
    colJ30: "Returned within 30 days",

    titreCompletion: "Round completion",
    colSemaine: "Week",
    colLancees: "Started",
    colTerminees: "Finished",
    colAbandonnees: "Abandoned",
    colTauxCompletion: "Completion rate",
    colGagnees: "Won",

    titreAbandon: "Drop-off by question",
    introAbandon:
      "Position reached before abandoning. A spike at one position signals a pacing problem or a badly calibrated question.",
    colDerniereQuestion: "Last question reached",
    colParties: "Rounds",

    titrePopularite: "Category popularity",
    colNiveau: "Level",
    colPointsMoyens: "Average points",
    colTauxVictoire: "Win rate",

    titreAngleMort: "Editorial blind spot",
    jamaisServies: (n: number) =>
      `${n} approved question${n > 1 ? "s have" : " has"} never been served.`,
    aucunAngleMort: "Every approved question has been served at least once.",
    aucuneDonnee: "Not enough rounds yet to show this analysis.",
  },

  inscrits: {
    titre: "Members",
    reserveAdmin: "This section is reserved for administrators.",
    intro:
      "Search is targeted, to handle a specific request. There is deliberately no full list of addresses.",
    rechercher: "Search by address or display name",
    rechercherAide: "At least three characters.",
    lancer: "Search",
    aucunResultat: "No member matches.",
    colEmail: "Address",
    colPseudo: "Display name",
    colRole: "Role",
    colParties: "Rounds",
    colInscrit: "Joined",
    roleJoueur: "Player",
    roleEditeur: "Editor",
    roleAdmin: "Administrator",
    changerRole: "Change role",
    roleChange: "Role updated.",
    erreurAutoRetrait:
      "You cannot remove your own administrator rights: nobody would be able to grant them again.",
    exporter: "Export their data",
    supprimer: "Delete this account",
    supprimerConfirmation:
      "This deletion is permanent and erases all of this person’s progress. Type DELETE to confirm.",
    supprime: "Account deleted.",
  },

  contenu: {
    quizSpeciaux: "Special quizzes",
    introQuizSpeciaux:
      "A special quiz gathers the questions carrying one tag. The link is explicit: it is never recomputed from the question text.",
    colTitre: "Title",
    colTag: "Tag",
    colRattachees: "Attached questions",
    colSeuil: "Opening threshold",
    colActif: "Active",
    sousLeSeuil: "Below threshold: this quiz stays visible and states its opening condition.",
    enregistrer: "Save",
    enregistre: "Changes saved.",

    campagnes: "Campaigns",
    introCampagnes:
      "A dated, manageable container for temporary content. No event date is hard-coded in the application.",
    nouvelleCampagne: "New campaign",
    campagneTitre: "Title",
    campagneDescription: "Description",
    campagneType: "Type",
    typeQuiz: "Themed quiz",
    typeComparateur: "Civic comparator",
    campagneDebut: "Start",
    campagneFin: "End",
    campagneStatut: "Status",
    statutBrouillon: "Draft",
    statutProgrammee: "Scheduled",
    statutActive: "Active",
    statutArchivee: "Archived",
    miseEnAvant: "Featured on the home page",
    aucuneCampagne: "No campaign yet.",
  },

  offres: {
    titre: "Three ways to learn",
    intro: "The quiz stays free. The paid offers add content, they lock nothing.",
    independantes:
      "Plus and the Language course are independent: each can be bought on its own.",

    gratuitCategorie: "General knowledge",
    gratuitEtiquette: "Free",
    gratuitTitre: "General DRC quiz",
    gratuitTexte: (questions: number, categories: number) =>
      `All ${questions} questions and ${categories} categories stay free: history, geography, music, figures, institutions, languages, food, economy, nature and more.`,
    gratuitPoint1: "Easy · Medium · Hard",
    gratuitPoint2: "Progress, experience, badges and daily challenge",
    gratuitPoint3: "Illustrated questions and sourced explanations",
    gratuitPublicite: "Funded by advertising. The paid offers remove it.",

    plusCategorie: "Repensons le Congo Plus",
    plusEtiquette: "New",
    plusTitre: "The Congo doesn’t stop at the quiz.",
    plusTexte:
      "Unlock exclusive quizzes on major figures, little-known histories and the regions of the DRC.",
    plusPoint1: "Subjects we know… far less well than we think.",
    plusPoint2: "No advertising at all.",
    plusPrix: "€1.99 / month",
    plusPrixDetail: "or €11.99 per year",
    plusAction: "Discover Plus",

    langueCategorie: "Language course",
    langueTitre: "Speak your parents’ language.",
    langueTexte:
      "A full course in five levels, from greetings to everyday conversation, with audio recorded by native speakers.",
    langueDisponible: "Lingala",
    langueBientot: (langue: string) => `${langue} · coming soon`,
    languePrix: "€19.99 for life",
    languePrixDetail: "or €4.99 per month · one-off purchase, no renewal",
    langueAction: "Start Lingala",
  },

  regles: {
    titre: "How a round works",
    texte:
      "Seven questions, fifteen seconds each. You need 900 points and five correct answers to earn a star. Two stars unlock the next level.",
  },

};

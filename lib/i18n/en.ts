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
    verrouille: "Locked",
    inclusDans: (offre: string) => `Included in ${offre}`,
    offrePlus: "Plus",
    offreLangue: "Language path",
    debloquer: "Unlock",
    debloquerTheme: (theme: string) => `Unlock ${theme}`,
    langues: "Languages",
    languesTexte:
      "Learn Lingala level by level, with audio recorded by native speakers.",
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
    pays: "Country",
    paysNonRenseigne: "Not set",
    paysEnregistre: "Country saved.",
    langueDefaut: "Default language",
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
    accesRapide: "Quick links",
    allerAuContenu: "Skip to content",
    principale: "Main navigation",
    secondaire: "Secondary navigation",
    filAriane: "Breadcrumb",
    accueil: "Home",
    profil: "Profile",
    quiz: "Quiz",
    progression: "Progress",
    langue: "Language",
    aPropos: "About the project",
    accessibilite: "Accessibility statement",
    infosSite: "Site information",
  },

  conditions: {
    titre: "Terms of use",
    intro:
      "These terms govern the use of Repensons le Congo Quiz. They are written to be read: if anything is unclear, write to us and we will rephrase it.",
    sections: [
      {
        titre: "What the app offers",
        contenu:
          "Repensons le Congo Quiz offers quizzes about the Democratic Republic of the Congo. Every answer comes with an explanation and a link to its source. The service is provided as is, without any guarantee of absolute accuracy: despite our sourcing work, mistakes remain possible and can be reported to us.",
      },
      {
        titre: "Account and progress",
        contenu:
          "You can play without an account: your progress is then tied to an anonymous session linked to the browser you use. Creating an account with an email address and a password preserves that progress and gives access to the leaderboard. You are responsible for keeping your password confidential.",
      },
      {
        titre: "Nickname and leaderboard",
        contenu:
          "The nickname you choose is public: it appears on the leaderboard alongside your country and experience. We may change or remove a nickname that is insulting, misleading or impersonates someone. No other account data is made public.",
      },
      {
        titre: "Paid content",
        contenu:
          "Some quizzes and learning paths are paid. A one-off purchase grants permanent access to that content; a subscription stays active until cancelled. Prices are shown including tax before payment. The statutory right of withdrawal applies under European regulations.",
      },
      {
        titre: "Fair use",
        contenu:
          "The app is intended for personal use. Bulk extraction of questions, resale of the content and automated play to distort the leaderboard are prohibited. Access may be suspended in case of abuse.",
      },
    ],
  },

  confidentialite: {
    titre: "Privacy policy",
    intro:
      "We collect only what the game needs. No data resale, no advertising tracking.",
    sections: [
      {
        titre: "Data we keep",
        contenu:
          "Your nickname, your country, your email address if you created an account, and your progress: games played, answers, points, stars, experience, daily streak and badges. That is all.",
      },
      {
        titre: "Why we keep it",
        contenu:
          "To restore your progress from one session to the next, compute the leaderboard, suggest questions that fit your level and let you review your mistakes. Your email address is used to sign in and to reset your password.",
      },
      {
        titre: "Anonymous session",
        contenu:
          "If you play without an account, an anonymous session is created automatically to hold your progress. It contains no name and no address. An anonymous session left inactive is deleted, along with the games attached to it.",
      },
      {
        titre: "What we do not do",
        contenu:
          "We do not sell or rent your data. We use no advertising trackers. We do not combine your activity with data from other services.",
      },
      {
        titre: "Hosting and processors",
        contenu:
          "Data is hosted by Supabase, on infrastructure located in the European Union. Payment, once enabled, will be handled by a specialised provider who alone processes card details: we never see them.",
      },
      {
        titre: "Your rights",
        contenu:
          "You can export all of your data and delete your account from the Profile page, without going through us. Deletion removes the account and its games, with no delay and no residual copy. For any question, write to us.",
      },
    ],
  },

  accessibilite: {
    titre: "Accessibility statement",
    intro:
      "Accessibility is part of this app's specification, not of its finishing touches. Here is where we stand, without embellishment.",
    sections: [
      {
        titre: "Target level",
        contenu:
          "We aim for level AA of the WCAG 2.2 guidelines. The app is built and tested with that goal, but it has not yet been audited externally: we therefore claim no certified conformance.",
      },
      {
        titre: "Keyboard navigation",
        contenu:
          "Every function works with a keyboard, including the intro carousel, the quiz answers and the leaderboard. Focus stays visible at all times and follows the screen being shown. A skip link leads straight to the content.",
      },
      {
        titre: "Time and motion",
        contenu:
          "The game timer can be switched off at any moment from the game screen, without losing the current game. Nothing scrolls or changes on its own: the carousel only moves when you ask it to.",
      },
      {
        titre: "Colour and contrast",
        contenu:
          "No information is carried by colour alone: a correct answer, a locked theme or a leaderboard row is also distinguished by text, a label or a shape. Contrast aims for a minimum ratio of 4.5 to 1.",
      },
      {
        titre: "Locked content",
        contenu:
          "A paid theme or a level you have not unlocked stays visible and is announced to screen readers, along with the condition to meet. We never hide unavailable content: knowing it exists is part of the information.",
      },
      {
        titre: "Known limits and feedback",
        contenu:
          "Not all images illustrating questions have a satisfactory text alternative, and the back office has not been audited yet. If you hit an obstacle, write to us describing the page and the tool you use: we fix those reports first.",
      },
    ],
  },

  erreurs: {
    titre: "My mistakes",
    intro:
      "The questions you missed, with the correct answer and its source. They will come back in your next games.",
    aucune: "Nothing to review right now. Keep it up.",
    bonneReponse: "Correct answer:",
  },

  historique: {
    titre: "History",
    legende: "Your finished games, most recent first.",
    aucun: "No finished games yet.",
    colDate: "Date",
    colCategorie: "Topic",
    colNiveau: "Level",
    colScore: "Score",
    colResultat: "Result",
    score: (points: number, bonnes: number, total: number) =>
      `${points} points · ${bonnes} correct out of ${total}`,
    gagnee: "Won",
    perdue: "Lost",
  },

  splash: {
    sousTitre: "One vast country, a thousand stories.",
    paragraphe:
      "Discover the Democratic Republic of the Congo through 1,445 sourced questions: history, geography, music, food, languages, nature, economy and much more. Every answer comes with an explanation and a link to its source.",
    cta: "Start the quiz",
    choisirLangue: "Choose language",
    apercuCategories: "A few quiz categories",
    categories: {
      histoire: "History",
      geographie: "Geography",
      musique: "Music",
      nature: "Nature",
      economie: "Economy and more",
    },

    // Intro carousel.
    region: "Introduction carousel",
    passer: "Skip",
    suivant: "Next",
    precedent: "Previous",
    diapositive: "slide",
    positionSlide: (n: number, total: number) => `${n} of ${total}`,
    allerSlide: (n: number) => `Go to slide ${n}`,
    slides: [
      {
        titre: "Repensons le Congo Quiz",
        sousTitre: "One vast country, a thousand stories.",
        texte:
          "1,445 sourced questions about the Democratic Republic of the Congo: history, geography, culture, nature and much more.",
        points: ["History", "Geography", "Culture", "Nature", "Music"],
      },
      {
        titre: "Learn while you play",
        sousTitre: "Every answer explained and sourced.",
        texte:
          "After each question you get the full explanation and a link to the source. A quiz and a lesson at once.",
        points: ["Verified sources", "Explanations", "Direct links", "12 categories"],
      },
      {
        titre: "Progress every day",
        sousTitre: "Stars, levels, leaderboard.",
        texte:
          "Take the daily challenge, earn stars and climb the leaderboard. Five ranks, from Curious about Congo to Memory of Congo.",
        points: ["Six stars per topic", "Badges", "Daily streaks", "Leaderboard"],
      },
      {
        titre: "Special quizzes and languages",
        sousTitre: "Content that goes further.",
        texte:
          "Event quizzes and the full Lingala learning path, recorded by native speakers.",
        points: ["Elections quiz", "Independence quiz", "Lingala path", "Native audio"],
      },
    ],
  },

  onboarding: {
    titre: "Welcome",
    etape: (n: number, total: number) => `Step ${n} of ${total}`,
    retour: "Back to the previous step",
    plusTard: "Later",
    suivant: "Next",
    terminer: "Create my account",
    enCours: "Saving…",

    pseudoTitre: "Choose your nickname",
    pseudoTexte: "This is the name shown on the leaderboard.",
    pseudoLabel: "Nickname",
    pseudoAide: "Between 2 and 24 characters. Other players will see it.",
    pseudoLibre: "This nickname is available.",
    pseudoPris: "This nickname is already taken.",
    pseudoCourt: "The nickname must be between 2 and 24 characters.",

    paysTitre: "Where are you joining from?",
    paysTexte: "So we can place you in your country's leaderboard.",
    paysLabel: "Country",
    paysVide: "Select a country",
    paysManquant: "Choose a country to continue.",
    paysAutres: "All countries",

    motDePasseTitre: "Almost there",
    motDePasseTexte:
      "A password saves your progress and gives you access to the leaderboard.",
    emailLabel: "Email address",
    emailAide: "This is your login identifier.",
    emailInvalide: "This email address does not look valid.",
    emailUtilise: "This address is already in use.",
    motDePasseLabel: "Password",
    motDePasseAide: "Eight characters minimum.",
    motDePasseCourt: "The password must be at least eight characters.",
    afficherMotDePasse: "Show password",
    masquerMotDePasse: "Hide password",
    erreurGenerique: (message: string) => `Sign-up failed: ${message}`,
  },

  classement: {
    titre: "Leaderboard",
    portee: "Leaderboard scope",
    monde: "World",
    pays: "My country",
    periode: "Period",
    semaine: "Week",
    mois: "Month",
    tout: "All time",
    colPosition: "Position",
    colJoueur: "Player",
    colPoints: "Experience",
    moi: "(you)",
    vide: "Nobody is ranked for this period yet.",
    sansPays: "Add your country in your profile to see the national leaderboard.",
    maPosition: (n: number) => `You are ranked ${n}`,
    chargement: "Loading leaderboard…",
  },

  commun: {
    chargement: "Loading…",
    erreurReseau: "The connection failed. Check your network and try again.",
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
    salutPremier: (pseudo: string) => `Hi ${pseudo}, ready for your first quiz?`,
    salutRetour: (pseudo: string) => `Hi ${pseudo}, shall we pick up where you left off?`,
    salutAnonymePremier: "Ready for your first quiz?",
    salutAnonymeRetour: "Ready to pick up again?",
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
    scoreCourant: (n: number) => `${n} points`,
    scoreCourantDetail: (n: number) => `Current score: ${n} points`,
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
    titreEtoile: "Your star",
    etoileGagnee: "Star earned!",
    pasDEtoile: "No star this time. You need 900 points and 5 correct answers.",
    etoilesNiveau: (n: number) => `${n} star${n > 1 ? "s" : ""} out of 2 at this level`,
    niveauSuivantOuvert: "Two stars: the next level is now open.",
    titreXp: "How your experience is calculated",
    xpBase: "Points converted",
    xpVictoire: "Win bonus",
    xpDefi: "Daily challenge bonus",
    xpTotal: "Total",
    titreDetail: "Your answers in detail",
    ligneReponse: (position: number, correcte: boolean, points: number) =>
      `Question ${position}: ${correcte ? "correct" : "incorrect"}, ${points} points.`,
    titreSuite: "What next",
    niveauOuvertTitre: "Next level unlocked",
    niveauOuvertTexte: (niveau: string) =>
      `Two stars earned: the ${niveau.toLowerCase()} level is waiting for you.`,
    jouerNiveauSuivant: (niveau: string) => `Play the ${niveau.toLowerCase()} level`,
    toutFait: "You have earned both stars on all three levels of this topic.",
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
    plusPrix: "€15.99 for life",
    plusPrixDetail: "or €0.99 per special quiz",
    plusAction: "Discover Plus",

    langueCategorie: "Language course",
    langueTitre: "Speak your parents’ language.",
    langueTexte:
      "A full course in five levels, from greetings to everyday conversation, with audio recorded by native speakers.",
    langueDisponible: "Lingala",
    langueBientot: (langue: string) => `${langue} · coming soon`,
    languePrix: "€19.99 for life",
    languePrixDetail: "or €4.99 per month · one-off purchase, no renewal",
    bientotDisponible: "Coming soon",
    paiementBientot: "Payment is coming soon. Nothing is charged today.",
    offreMiseEnAvant: "The offer that unlocks the theme you asked for",
    langueAction: "Start Lingala",
  },

  regles: {
    titre: "How a round works",
    texte:
      "Seven questions, fifteen seconds each. You need 900 points and five correct answers to earn a star. Two stars unlock the next level.",
  },

};

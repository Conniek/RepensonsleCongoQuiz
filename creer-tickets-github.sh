#!/usr/bin/env bash
# Cree les 35 tickets du backlog dans GitHub, puis les ajoute au projet.
#
# Prerequis :
#   1. gh installe et connecte :  brew install gh && gh auth login
#      Le scope "project" est necessaire :  gh auth refresh -s project
#   2. Un projet cree sur GitHub (Projects > New project > Board)
#
# Usage :
#   ./creer-tickets-github.sh <numero-du-projet>
# Le numero est le dernier segment de l'URL du projet :
#   https://github.com/users/Conniek/projects/3   ->  3
set -euo pipefail

DEPOT="Conniek/RepensonsleCongoQuiz"
PROJET="${1:?Donne le numero du projet, ex : ./creer-tickets-github.sh 3}"
PROPRIETAIRE="Conniek"

# Les etiquettes, creees une fois. || true : on ignore si elles existent deja.
for e in bug us technique produit; do
  gh label create "$e" --repo "$DEPOT" --force >/dev/null 2>&1 || true
done

creer() {   # creer <etiquette> <titre> <corps>
  echo "-> $2"
  url=$(gh issue create --repo "$DEPOT" --title "$2" --body "$3" --label "$1")
  gh project item-add "$PROJET" --owner "$PROPRIETAIRE" --url "$url" >/dev/null
}


creer "bug" "B1 - Le defi du jour peut tomber sur une categorie payante" "defi_du_jour tire parmi toutes les categories jouables. Des qu'une categorie porte produit_requis, composer_deck refuse la partie et un non-abonne recoit une erreur.

**Correction** : ajouter and produit_requis is null aux deux requetes de la fonction, dans une nouvelle migration.

**Critere** : avec une categorie marquee plus, le defi du jour ne la propose jamais a un non-abonne."

creer "bug" "B2 - Un parcours de langue vide reste achetable" "Le swahili et le kikongo affichent 0 question et un prix avec cadenas.

**Critere** : un parcours de moins de 7 questions s'affiche comme a venir, sans bouton d'achat."

creer "bug" "B3 - La page Offres promet la suppression d'une publicite inexistante" "L'offre Plus annonce la suppression de la publicite, alors qu'aucune publicite n'est en ligne.

**Critere** : la mention disparait tant que U10 n'est pas livre."

creer "bug" "B4 - Tarifs incoherents entre maquettes et dictionnaires" "Arbitrage : Plus 15,99 EUR/an ou 1,99 EUR/mois, parcours de langue 11,99 EUR a vie.
Les maquettes affichent encore 11,99/an, 9,99 et 19,99 selon les ecrans.

**Critere** : un seul prix par offre, identique partout, en francais et en anglais."

creer "bug" "B5 - layout.tsx importe ./footer" "Le fichier footer.tsx etait absent de l'archive transmise. Si l'import ne resout pas, le build casse.

**Critere** : ls app/[langue]/footer.tsx renvoie le fichier, ou l'import est retire."

creer "bug" "B6 - Barre de defilement horizontale possible" "Depuis le passage du bandeau en pleine largeur (width 100vw + margin negative).

**Critere** : aucune barre horizontale sur l'accueil, en 320px comme en 1440px."

creer "bug" "B7 - Aucune categorie payante en base" "produit_requis est null sur les 12 categories : les cadenas n'ont rien a verrouiller.

**Critere** : au moins une categorie ou un quiz porte un produit, et le cadenas s'affiche."

creer "bug" "B8 - Fichiers morts dans le depot" "app/page.module.css, et footer.css s'il n'y a pas de footer.tsx.

**Critere** : plus aucun fichier non importe dans app/."

creer "us" "U1 - Paiement Stripe" "Achat de l'offre Plus et du parcours de langue depuis la page Offres.

**Critere** : l'achat aboutit, un webhook ecrit la ligne dans entitlement, et le contenu se deverrouille sans rechargement manuel.

La table entitlement attend deja une source et une reference Stripe ; fin_le a null signifie un acces a vie."

creer "us" "U2 - PWA : manifeste, service worker, icones" "Rien n'existe cote client aujourd'hui, alors que la documentation annonce une PWA et que la RPC pack_hors_ligne existe depuis le debut.

**Critere** : l'installation est proposee sur mobile, et l'application s'ouvre hors ligne sur les questions du pack."

creer "us" "U3 - Contenu payant reel" "Creer les categories ou quiz vendus, avec leurs questions sourcees, et les marquer.

**Critere** : un abonne joue un contenu payant de bout en bout."

creer "us" "U4 - Relecture juridique des pages legales" "Conditions, confidentialite et accessibilite : les textes livres sont une base, pas un engagement signe.

**Critere** : relus et valides par les porteurs du projet."

creer "us" "U5 - Confirmation d'adresse e-mail" "A l'inscription, verifier l'adresse et permettre le renvoi du message.

**Critere** : sans confirmation, un mot de passe oublie ne condamne pas le compte."

creer "us" "U6 - Sitemap et robots" "Aucun sitemap.xml ni robots.txt dans le depot.

**Critere** : les deux existent et refletent les routes reelles, y compris la redirection de / vers /fr/splash."

creer "us" "U7 - Illustrations des 12 categories" "**Critere** : chaque categorie a son image 16/10, moins de 100 ko, visible sur l'accueil et sur la page des categories."

creer "us" "U8 - Quiz speciaux visibles" "Depend de D1 : categories marquees plus, ou branchement de la table quiz_special.

**Critere** : les quiz evenementiels apparaissent sur la page Quiz, verrouilles pour les non-abonnes."

creer "us" "U9 - Parcours lingala complet" "Cinq niveaux, audio par locuteurs natifs, exercices de prononciation : c'est ce que promet la page Offres.

**Critere** : les cinq niveaux sont jouables avec leur audio."

creer "us" "U10 - Publicite en version gratuite" "Depend de D3. Si regie publicitaire : bandeau de consentement, et mise a jour de la politique de confidentialite qui affirme aujourd'hui l'absence de traceur.

**Critere** : la publicite s'affiche pour les non-abonnes, et la politique dit la verite."

creer "us" "U11 - Moderation des pseudos" "Les conditions d'utilisation l'annoncent deja.

**Critere** : un pseudo insultant ou usurpant une identite peut etre renomme depuis le back-office."

creer "us" "U12 - Gestion des categories en back-office" "Aujourd'hui seules les illustrations sont gerables sans SQL.

**Critere** : creer une categorie, la traduire et la marquer payante depuis l'interface."

creer "us" "U13 - Ecran de partie aligne sur la maquette" "**Critere** : minuteur visible et mise en page conformes au proto."

creer "us" "U14 - Traduction anglaise des contenus" "Les questions et categories, pas seulement l'interface. La vue completude_traduction mesure le reste a faire.

**Critere** : les categories jouables en anglais atteignent le seuil de 7 questions."

creer "us" "U15 - Defi du jour moins repetitif" "Le tirage boucle sur douze jours.

**Critere** : la ponderation favorise les categories les moins jouees par la personne."

creer "technique" "T1 - Audit d'accessibilite" "La declaration promet le niveau AA : il faut pouvoir le soutenir.

**Critere** : passage clavier et lecteur d'ecran sur les huit ecrans principaux, contrastes mesures, ecarts corriges ou declares."

creer "technique" "T2 - Alternatives des images de questions" "Cite comme limite connue dans la declaration d'accessibilite.

**Critere** : chaque image a une alternative utile, ou est decorative a raison."

creer "technique" "T3 - Accessibilite du back-office" "Non audite, et exclu de la declaration.

**Critere** : utilisable au clavier de bout en bout."

creer "technique" "T4 - Tests de bout en bout" "Aucun test automatise dans le depot.

**Critere** : inscription, partie gagnee, partie perdue, deverrouillage de niveau et achat sont couverts."

creer "technique" "T5 - Poids des images livrees" "Les logos de public/images montent a 2,4 Mo.

**Critere** : aucune image livree ne depasse 200 ko."

creer "technique" "T6 - Theme sombre" "Les jetons le prevoient, mais les ecrans recents utilisent des couleurs figees.

**Critere** : soit le theme sombre est coherent partout, soit il est assume comme non pris en charge."

creer "technique" "T7 - Vue materialisee du classement" "Inutile tant que la base est petite, prevu dans le cahier des charges.

**Critere** : a declencher si le classement depasse une seconde de calcul."

creer "technique" "T8 - Documentation du design system" "Jetons, graisses, boutons, cartes : rien n'est ecrit.

**Critere** : un document reference les jetons et les variantes de boutons."

creer "produit" "D1 - Decision : quiz speciaux, categories ou table dediee" "Determine U8 et la facon dont le contenu sera saisi.

Categories marquees plus : tout fonctionne deja (cadenas, offres, etoiles, classement), il n'y a qu'a creer le contenu.
Table quiz_special : prevue pour des quiz dates, avec campagne, mais rien ne l'affiche cote joueur."

creer "produit" "D2 - Decision : pack toutes langues et son prix" "A 11,99 EUR l'unite, un pack autour de 29,99 EUR devient interessant a partir de la troisieme langue. Le droit pack_langues existe deja en base.

A prevoir dans les textes maintenant plutot que de refaire la page Offres dans six mois."

creer "produit" "D3 - Decision : publicite, regie ou vente directe" "Une regie classique impose un bandeau de consentement, qui devient le premier ecran apres le splash, et alourdit les pages.
Des encarts vendus en direct a des partenaires de la diaspora evitent tout cela, mais demandent de la prospection.

A trancher avant U10 et avant toute mise a jour de la politique de confidentialite."

creer "produit" "D4 - Decision : afficher un prix de lancement" "« Prix de lancement, les acheteurs actuels gardent leur acces » donne une raison d'acheter tout de suite et laisse la place a une hausse quand le catalogue grandit."

echo
echo "Termine. Ouvre le projet et range les cartes dans les colonnes :"
echo "  A trancher : D1 D2 D3 D4 U8 U10 T6"
echo "  A verifier : B5 B6"
echo "  le reste    : A faire"

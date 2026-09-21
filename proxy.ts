import { NextResponse, type NextRequest } from "next/server";
import { LANGUES, LANGUE_PAR_DEFAUT, estLangue } from "@/lib/i18n";

/** Redirige vers une URL localisée.
 *
 *  Ordre de priorité : la langue choisie par la personne dans son profil
 *  (cookie « langue »), sinon la langue par défaut. La détection par
 *  l'en-tête du navigateur reste désactivée tant que l'anglais n'a pas de
 *  contenu : un navigateur anglophone atterrirait sur une version vide.
 *
 *  Remplace middleware.ts : Next.js 16 a renommé cette convention. */
export function proxy(requete: NextRequest) {
  const { pathname } = requete.nextUrl;

  const aDejaUneLangue = LANGUES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (aDejaUneLangue) return NextResponse.next();

  const choisie = requete.cookies.get("langue")?.value;
  const langue = choisie && estLangue(choisie) ? choisie : LANGUE_PAR_DEFAUT;

  const url = requete.nextUrl.clone();
  url.pathname = `/${langue}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|images|icons|.*\\.).*)"],
};

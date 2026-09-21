import { NextResponse, type NextRequest } from "next/server";
import { LANGUES, LANGUE_PAR_DEFAUT } from "@/lib/i18n";

export function proxy(requete: NextRequest) {
  const { pathname } = requete.nextUrl;

  const aDejaUneLangue = LANGUES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  
  if (aDejaUneLangue) {
    // Si on accède à /fr ou /en exactement → rediriger vers splash
    const langueMatch = pathname.match(/^\/([a-z]{2})$/);
    if (langueMatch) {
      const url = requete.nextUrl.clone();
      url.pathname = `/${langueMatch[1]}/splash`;
      return NextResponse.redirect(url);
    }
    
    return NextResponse.next();
  }

  // L'URL n'a pas de langue → ajouter la langue par défaut
  const preferee = LANGUE_PAR_DEFAUT;
  const url = requete.nextUrl.clone();
  url.pathname = `/${preferee}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|images|icons|.*\\.).*)"],
};
import { NextResponse, type NextRequest } from "next/server";
import { LANGUES, LANGUE_PAR_DEFAUT } from "@/lib/i18n";

/** Redirige vers une URL localisée. Toute page vit sous /fr/ ou /en/ :
 *  deux URL distinctes, donc deux pages indexables, reliées par hreflang. */
export function proxy(requete: NextRequest) {
  const { pathname } = requete.nextUrl;

  const aDejaUneLangue = LANGUES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (aDejaUneLangue) return NextResponse.next();

  // On respecte la préférence du navigateur, sans la subir : seules les
  // langues réellement servies sont proposées.
    const preferee = LANGUE_PAR_DEFAUT;

  const url = requete.nextUrl.clone();
  // Première arrivée sur le site : écran d'introduction.
  url.pathname = pathname === "/" ? `/${preferee}/splash` : `/${preferee}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|images|icons|.*\\.).*)"],
};

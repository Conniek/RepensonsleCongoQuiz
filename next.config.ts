import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Développement uniquement : autorise le chargement des ressources de
  // développement depuis le réseau local, pour tester sur un téléphone.
  // Sans cette ligne, le JavaScript client ne s'exécute pas quand on ouvre
  // l'application via une adresse 192.168.x.x, et les composants qui en
  // dépendent restent figés sur leur premier rendu.
  // Sans effet en production.
  allowedDevOrigins: ["192.168.1.11"],
};

export default nextConfig;

/** Tailwind 4 se branche par un seul greffon PostCSS.
 *  Pas de fichier tailwind.config.js : en version 4, la configuration est
 *  écrite en CSS, dans app/styles/tailwind.css. */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;

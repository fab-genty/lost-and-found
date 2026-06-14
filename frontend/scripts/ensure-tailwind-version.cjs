// flowbite-react@0.11 (cible Tailwind v4) importe `tailwindcss/version.js`, absent
// de tailwindcss v3.x. Sans ce fichier, le plugin vite de flowbite-react fait
// échouer `vite build` (ERR_MODULE_NOT_FOUND) au chargement de vite.config.ts.
// Ce script (lancé en postinstall) recrée un stub minimal pointant la version
// réellement installée, pour que get-tailwind-version détecte la major (3).
const fs = require("fs");
const path = require("path");

function resolveTailwindDir() {
  try {
    return path.dirname(require.resolve("tailwindcss/package.json"));
  } catch (_) {
    return path.join(__dirname, "..", "node_modules", "tailwindcss");
  }
}

const tailwindDir = resolveTailwindDir();
const versionFile = path.join(tailwindDir, "version.js");

if (fs.existsSync(versionFile)) {
  process.exit(0);
}

let version = "3.4.17";
try {
  version = require(path.join(tailwindDir, "package.json")).version || version;
} catch (_) {
  /* fallback ci-dessus */
}

fs.writeFileSync(versionFile, `module.exports = ${JSON.stringify(version)};\n`);
console.log(`[ensure-tailwind-version] stub écrit: ${versionFile} (${version})`);

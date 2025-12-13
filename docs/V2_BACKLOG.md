# V2 Backlog

## Epic A — Durées par catégorie (Settings)
- En tant qu’utilisateur, je peux changer la durée par défaut d’une catégorie.
- En tant qu’utilisateur, je peux réinitialiser toutes les durées par défaut.
- En tant qu’utilisateur, un nouvel aliment reprend automatiquement la durée par défaut de sa catégorie.
- En tant qu’utilisateur, je peux modifier la durée d’un aliment sans changer les réglages globaux.
- En tant qu’utilisateur, les réglages sont sauvegardés sur mon téléphone (persistants).
- En tant qu’utilisateur, les réglages restent disponibles hors-ligne.

## Epic B — Scan code‑barres
- En tant qu’utilisateur, je peux ouvrir un écran “Scan”.
- En tant qu’utilisateur, je peux autoriser/refuser l’accès caméra (et l’app gère le refus proprement).
- En tant qu’utilisateur, je peux scanner un EAN‑13 et récupérer le code.
- En tant qu’utilisateur, l’app utilise BarcodeDetector.getSupportedFormats() pour s’adapter au device.
- En tant qu’utilisateur, si BarcodeDetector n’existe pas, un polyfill est utilisé automatiquement.
- En tant qu’utilisateur, après scan je peux créer un aliment avec le code pré-rempli.
- En tant qu’utilisateur, je peux ressaisir le code manuellement si le scan échoue.
- En tant qu’utilisateur, je peux re-scanner sans recharger l’app.

## Epic C — Foyer sans backend (export/import + partage)
- En tant qu’utilisateur, je peux exporter mes données (items + réglages) en JSON.
- En tant qu’utilisateur, je peux importer un export JSON.
- En tant qu’utilisateur, lors de l’import je peux choisir “Fusionner” ou “Remplacer”.
- En tant qu’utilisateur, l’import gère les doublons (même id) en gardant le plus récent.
- En tant qu’utilisateur, je peux partager mon export via le partage Android si disponible.
- En tant qu’utilisateur, si le partage n’est pas disponible, je peux au moins télécharger le fichier.

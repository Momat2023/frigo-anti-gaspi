<div align="center">

# 🧊 Frigo Anti-Gaspi

### Gérez votre frigo intelligemment, réduisez le gaspillage alimentaire

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Momat2023/frigo-anti-gaspi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Lighthouse Performance](https://img.shields.io/badge/Lighthouse-97%2F100-brightgreen)](https://developers.google.com/web/tools/lighthouse)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue)](https://web.dev/progressive-web-apps/)

[🌐 Demo Live](https://frigo-anti-gaspi.vercel.app) • [📖 Documentation](#fonctionnalités) • [🚀 Démarrage rapide](#installation)

![Frigo Anti-Gaspi](screenshots/hero.png)

</div>

---

## 📋 À propos

**Frigo Anti-Gaspi** est une Progressive Web App (PWA) qui vous aide à gérer votre réfrigérateur et à réduire le gaspillage alimentaire grâce à :

- 🎯 Suivi intelligent des dates de péremption
- 📸 Scan automatique de codes-barres
- 🍳 Suggestions de recettes personnalisées
- 🏆 Système de gamification motivant
- 🔔 Notifications push programmables
- 📱 Installation mobile en un clic

> **Impact :** En moyenne, chaque Français jette 29 kg de nourriture par an. Cette app vous aide à réduire ce gaspillage tout en économisant de l'argent.

---

## ✨ Fonctionnalités

### 🍽️ Gestion Intelligente des Aliments

- **Ajout manuel ou scan** - Entrez vos produits manuellement ou scannez leur code-barres
- **Reconnaissance automatique** - Intégration Open Food Facts pour récupérer automatiquement nom, image, catégorie et Nutri-Score
- **Dates suggérées** - Durées de conservation recommandées par catégorie
- **Tri par urgence** - Algorithme de priorisation des aliments à consommer en premier
- **Organisation par zone** - Frigo, congélateur, placard

### 📊 Gamification & Statistiques

<div align="center">

| Badge | Condition | Récompense |
|-------|-----------|------------|
| 🌱 Premier pas | Consommer votre premier aliment | 5 points |
| 🔥 Semaine parfaite | 7 jours sans gaspillage | 50 points |
| 🏆 Héros anti-gaspi | 50 aliments sauvés | 100 points |
| ⚡ Maître du streak | 30 jours consécutifs | 200 points |

</div>

- **8 badges déblocables** progressivement
- **Streak counter** - Jours consécutifs sans gaspillage
- **Graphiques d'évolution** - Visualisez vos progrès hebdomadaires
- **Argent économisé** - Calcul automatique basé sur les prix moyens

### 🍳 Suggestions de Recettes

- **Recherche intelligente** - Trouvez des recettes basées sur vos ingrédients urgents
- **Base TheMealDB** - Accès à des milliers de recettes gratuites
- **Détails complets** - Photos, ingrédients, instructions étape par étape, vidéos YouTube
- **Traduction automatique** - Conversion français-anglais pour de meilleurs résultats

### 🔔 Notifications Push

- **Rappels programmés** - Alertes avant expiration (0-3 jours configurables)
- **Notifications de badges** - Célébrez vos accomplissements
- **Système intelligent** - Vérification périodique automatique
- **Permission native** - Intégration système iOS/Android

### 📱 Progressive Web App

- **Installation en un clic** - Aucun store requis
- **Mode hors ligne** - Fonctionne sans connexion Internet
- **Performances optimales** - Score Lighthouse 97/100
- **Cross-platform** - Android, iOS, Desktop
- **Mises à jour automatiques** - Toujours la dernière version

---

## 🛠️ Technologies

### Frontend

| Technologie | Version | Usage |
|------------|---------|-------|
| [React](https://react.dev/) | 18.x | Framework UI avec hooks |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Typage statique |
| [Vite](https://vitejs.dev/) | 5.x | Build tool ultra-rapide |
| [React Router](https://reactrouter.com/) | 6.x | Navigation SPA |

### Backend & Storage

| Technologie | Usage |
|------------|-------|
| [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) (idb) | Base de données locale persistante |
| [LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) | Cache des préférences utilisateur |

### APIs & Services

| Service | Usage | Coût |
|---------|-------|------|
| [Open Food Facts](https://world.openfoodfacts.org/) | Base de données produits alimentaires | ✅ Gratuit |
| [TheMealDB](https://www.themealdb.com/) | API de recettes | ✅ Gratuit |

### PWA & Performance

| Technologie | Usage |
|------------|-------|
| [Vite PWA Plugin](https://vite-pwa-org.netlify.app/) | Service Worker et manifest |
| [Workbox](https://developers.google.com/web/tools/workbox) | Stratégies de cache |
| [@zxing/library](https://github.com/zxing-js/library) | Scan de codes-barres |

---

## 🚀 Installation

### Prérequis

- Node.js 18+ ([Télécharger](https://nodejs.org/))
- npm ou yarn

### Développement local

1. Cloner le projet
git clone https://github.com/Momat2023/frigo-anti-gaspi.git
cd frigo-anti-gaspi

2. Installer les dépendances
npm install

3. Lancer le serveur de développement
npm run dev

L'app est accessible sur http://localhost:5173
text

### Build de production

Compiler pour la production
npm run build

Prévisualiser le build
npm run preview

text

### Linter & Tests

Vérifier le code
npm run lint

Type checking
npm run type-check

text

---

## 🌐 Déploiement

### Vercel (Recommandé)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Momat2023/frigo-anti-gaspi)

Via CLI
npm install -g vercel
vercel login
vercel --prod

text

### Netlify

npm install -g netlify-cli
netlify login
netlify deploy --prod

text

### Docker

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 4173
CMD ["npm", "run", "preview", "--", "--host"]

text
undefined
docker build -t frigo-anti-gaspi .
docker run -p 4173:4173 frigo-anti-gaspi

text

---

## 📂 Architecture du projet

frigo-anti-gaspi/
├── public/ # Assets statiques
│ ├── pwa-192x192.png # Icône PWA
│ └── pwa-512x512.png
├── src/
│ ├── data/ # Logique métier
│ │ ├── db.ts # Configuration IndexedDB
│ │ ├── stats.ts # Calculs statistiques & badges
│ │ ├── export.ts # Import/Export données
│ │ └── types.ts # Types TypeScript
│ ├── hooks/ # Custom React hooks
│ │ └── useBadgeNotification.ts
│ ├── pages/ # Pages de l'application
│ │ ├── Home.tsx # Écran principal
│ │ ├── AddItem.tsx # Ajout d'aliments
│ │ ├── Scan.tsx # Scanner code-barres
│ │ ├── Stats.tsx # Statistiques & badges
│ │ ├── Recipes.tsx # Suggestions de recettes
│ │ ├── Settings.tsx # Paramètres
│ │ ├── ItemDetail.tsx # Détails d'un aliment
│ │ └── Onboarding.tsx # Premier lancement
│ ├── services/ # APIs & services externes
│ │ ├── openFoodFacts.ts
│ │ ├── recipes.ts
│ │ └── notifications.ts
│ ├── ui/ # Composants UI réutilisables
│ │ ├── Header.tsx
│ │ ├── BadgeToast.tsx
│ │ ├── MotivationWidget.tsx
│ │ └── InstallPrompt.tsx
│ ├── App.tsx # Router principal
│ ├── main.tsx # Point d'entrée
│ └── index.css # Styles globaux
├── index.html # HTML principal
├── vite.config.ts # Configuration Vite + PWA
├── tsconfig.json # Configuration TypeScript
└── package.json # Dépendances

text

---

## 📸 Screenshots

<div align="center">

### 🏠 Écran principal
![Home](screenshots/home.png)

*Widget de motivation, aliments urgents et actions rapides*

---

### 📊 Statistiques & Badges
![Stats](screenshots/stats.png)

*Graphiques d'évolution et badges déblocables*

---

### 🍳 Suggestions de recettes
![Recipes](screenshots/recipes.png)

*Recettes personnalisées basées sur vos aliments*

---

### 📱 Installation PWA
![PWA Install](screenshots/pwa.png)

*Installation en un clic sur mobile*

</div>

---

## 🎯 Roadmap

### Version 1.1 (Q1 2026)

- [ ] Mode sombre avec détection automatique
- [ ] Export CSV des données
- [ ] Historique complet avec timeline
- [ ] Widget iOS/Android natif

### Version 1.2 (Q2 2026)

- [ ] Upload de photos personnalisées
- [ ] Partage de frigo entre utilisateurs
- [ ] Intégration liste de courses
- [ ] Support multi-langue (EN, ES, DE)

### Version 2.0 (Q3 2026)

- [ ] Intelligence artificielle pour suggestions de menus
- [ ] Intégration avec supermarchés (prix en temps réel)
- [ ] Application native iOS/Android (via Capacitor)
- [ ] Mode communautaire (partage de recettes)

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment participer :

### Processus

1. **Fork** le projet
2. **Créez** une branche (`git checkout -b feature/AmazingFeature`)
3. **Committez** vos changements (`git commit -m 'Add AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrez** une Pull Request

### Guidelines

- Suivez les conventions de code existantes
- Ajoutez des tests si applicable
- Mettez à jour la documentation
- Assurez-vous que `npm run lint` passe
- Une PR = une fonctionnalité

### Issues

Avant d'ouvrir une issue, vérifiez qu'elle n'existe pas déjà. Utilisez les labels :
- 🐛 `bug` - Quelque chose ne fonctionne pas
- ✨ `enhancement` - Nouvelle fonctionnalité
- 📝 `documentation` - Amélioration de la doc
- ❓ `question` - Besoin d'aide

---

## 📊 Performance

### Lighthouse Scores

<div align="center">

| Métrique | Score | Statut |
|----------|-------|--------|
| Performance | 97/100 | ✅ Excellent |
| Accessibility | 89/100 | ✅ Bon |
| Best Practices | 96/100 | ✅ Excellent |
| SEO | 100/100 | ✅ Parfait |
| PWA | ✅ | ✅ Valide |

</div>

### Métriques Web Vitals

- **LCP** (Largest Contentful Paint) : < 1.2s
- **FID** (First Input Delay) : < 50ms
- **CLS** (Cumulative Layout Shift) : < 0.1

---

## 📝 License

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

### Ce que cela signifie

✅ Usage commercial autorisé  
✅ Modification autorisée  
✅ Distribution autorisée  
✅ Usage privé autorisé  
⚠️ Aucune garantie fournie

---

## 💡 Crédits & Remerciements

### APIs & Services

- **[Open Food Facts](https://world.openfoodfacts.org/)** - Base de données collaborative de produits alimentaires
- **[TheMealDB](https://www.themealdb.com/)** - API gratuite de recettes culinaires
- **[Vercel](https://vercel.com/)** - Hébergement et déploiement

### Inspiration

Projet inspiré par les statistiques alarmantes du gaspillage alimentaire en France :
- 10 millions de tonnes de nourriture gaspillée par an
- 29 kg par personne et par an
- 100€ de pertes financières par foyer

---

## 📧 Contact & Support

<div align="center">

**Créé avec ❤️ pour réduire le gaspillage alimentaire**

[![GitHub](https://img.shields.io/badge/GitHub-Profile-black?logo=github)](https://github.com/Momat2023)

[⭐ Star ce projet](https://github.com/Momat2023/frigo-anti-gaspi) si vous le trouvez utile !

**Problème ou question ?** [Ouvrir une issue](https://github.com/Momat2023/frigo-anti-gaspi/issues)

</div>

---

<div align="center">

Made with [React](https://react.dev/) • Powered by [Vite](https://vitejs.dev/) • Deployed on [Vercel](https://vercel.com/)

**Version 1.0.0** • Dernière mise à jour : Décembre 2025

</div>

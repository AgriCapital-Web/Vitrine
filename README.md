# AgriCapital — Site institutionnel

> **Investir la terre. Cultiver l'avenir.**

Site vitrine officiel d'**AgriCapital**, entreprise ivoirienne spécialisée dans la structuration, le développement et l'accompagnement d'actifs agricoles productifs, avec un positionnement particulier autour du foncier agricole et du palmier à huile.

🌐 **Site officiel :** https://www.agricapital.ci

---

## 1. Identité du projet

**Nom du projet :** AgriCapital — Vitrine institutionnelle  
**Marque :** AgriCapital  
**Domaine canonique :** https://www.agricapital.ci  
**Technologie :** React + TypeScript + Vite  
**UI :** Tailwind CSS + composants Radix/shadcn  
**Routing :** React Router  
**Données / services :** intégrations Supabase présentes dans le projet  
**Multilingue :** français, anglais, arabe, espagnol, allemand et chinois

Le dépôt constitue la base technique du site institutionnel AgriCapital et de ses différents espaces associés.

---

## 2. Positionnement

Le site doit présenter AgriCapital comme une entreprise agricole structurée, crédible et orientée terrain.

Le discours de marque s'articule notamment autour de :

- la terre et le foncier agricole ;
- les actifs agricoles productifs ;
- la création et le développement de plantations ;
- le palmier à huile ;
- l'accompagnement des propriétaires terriens et porteurs de projets ;
- les solutions agricoles et patrimoniales proposées par AgriCapital ;
- l'exécution et le suivi sur le terrain ;
- la construction d'un patrimoine agricole dans la durée.

**Signature de marque :**

> **AgriCapital — Investir la terre. Cultiver l'avenir.**

---

## 3. Architecture fonctionnelle

Le site public comprend notamment :

- Accueil
- À propos
- Notre capacité
- Évolution
- Équipe
- Solutions
- PalmInvest
- TerraPalm
- PalmTerroir
- Actualités
- Témoignages
- FAQ
- Le trésor caché du foncier
- Le trésor caché du palmier
- Contact
- Demande de partenariat

La navigation principale est organisée autour de quatre pôles :

1. **AgriCapital**
2. **Solutions**
3. **Ressources**
4. **Contact**

Un espace client est également accessible depuis la navigation.

---

## 4. Identité éditoriale

Toute nouvelle page, composant, métadonnée, contenu ou fonctionnalité ajoutée au projet doit rester cohérente avec AgriCapital.

### Principes

- Ton institutionnel, professionnel et accessible.
- Priorité aux faits, au terrain et à l'exécution.
- Positionnement premium sans discours artificiellement luxueux.
- Communication claire sur les solutions proposées.
- Pas de promesses de rendement ou de résultats garantis lorsqu'elles ne sont pas juridiquement et commercialement établies.
- Utilisation cohérente du nom **AgriCapital**.
- Les contenus doivent renforcer la confiance, la compréhension du modèle et la prise de contact.

### Formulations de référence

- **Investir la terre. Cultiver l'avenir.**
- **Actifs agricoles productifs**
- **Patrimoine agricole**
- **Palmier à huile**
- **Solutions agricoles structurées**
- **Accompagnement de terrain**
- **Valorisation du foncier**

---

## 5. Stack technique

### Frontend

- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Radix UI / composants de type shadcn
- Lucide React
- React Hook Form
- Zod
- Recharts
- React Leaflet
- TipTap

### Données et intégrations

Le projet contient les éléments nécessaires à l'utilisation de **Supabase** ainsi que des migrations de base de données.

Les fonctionnalités connectées doivent respecter l'architecture existante et ne pas introduire de dépendance inutile.

### SEO

Le projet comprend une couche SEO dédiée avec notamment :

- titres et descriptions par page ;
- Open Graph ;
- Twitter Cards ;
- URL canoniques ;
- hreflang multilingue ;
- données structurées Schema.org ;
- sitemap ;
- robots.txt ;
- gestion du domaine canonique `www.agricapital.ci`.

Les environnements de prévisualisation ne doivent pas devenir des versions indexables concurrentes du site officiel.

---

## 6. Multilingue

Les langues actuellement prises en charge sont :

- 🇫🇷 Français
- 🇬🇧 Anglais
- 🇸🇦 Arabe
- 🇪🇸 Espagnol
- 🇩🇪 Allemand
- 🇨🇳 Chinois

Le français constitue la langue principale du site.

Toute nouvelle fonctionnalité éditoriale importante doit prévoir son intégration dans le système multilingue existant.

---

## 7. Identité visuelle

L'interface doit rester cohérente avec l'identité AgriCapital :

- univers agricole et institutionnel ;
- palette et composants issus du design system existant ;
- photographie de terrain privilégiée ;
- espaces blancs généreux ;
- hiérarchie typographique claire ;
- navigation simple ;
- appels à l'action lisibles ;
- affichage soigné sur mobile, tablette et ordinateur.

Les visuels doivent servir le positionnement AgriCapital et non détourner l'attention de la marque.

---

## 8. Domaine et environnement canonique

Le domaine officiel de référence est :

**https://www.agricapital.ci**

Le projet contient une logique de protection du domaine canonique afin d'éviter que les environnements de prévisualisation ou d'hébergement temporaire soient considérés comme des sites concurrents.

Les URLs publiques, balises canoniques, données structurées et métadonnées SEO doivent continuer à pointer vers le domaine officiel.

---

## 9. Développement local

### Installation

    npm install

### Développement

    npm run dev

### Build de production

    npm run build

### Lint

    npm run lint

### Prévisualisation

    npm run preview

---

## 10. Règles pour les futures évolutions

Avant d'ajouter une nouvelle fonctionnalité :

1. Vérifier qu'elle sert directement le positionnement AgriCapital.
2. Réutiliser les composants et le design system existants.
3. Préserver le responsive mobile.
4. Préserver le référencement naturel.
5. Prévoir les traductions lorsque le contenu est public.
6. Ne pas créer de doublon fonctionnel.
7. Ne pas introduire de contenu ou d'identité provenant d'un ancien projet.
8. Vérifier les liens internes et les URLs canoniques.
9. Tester le build avant livraison.
10. Maintenir une séparation claire entre le site public et les espaces administratifs ou clients.

---

## 11. Qualité et cohérence de marque

**AgriCapital doit être identifiable partout dans le projet.**

Le nom, les métadonnées, les textes, les titres, les descriptions, les informations de contact, les liens sociaux, les données structurées et les éléments visuels doivent correspondre à l'identité AgriCapital.

Aucune référence à une ancienne activité, ancienne marque ou ancien projet ne doit apparaître dans l'expérience publique.

---

## 12. Contact

**AgriCapital SARL**  
📍 Gonaté, Côte d'Ivoire  
📞 +225 05 64 55 17 17  
✉️ contact@agricapital.ci  
🌐 https://www.agricapital.ci

Réseaux :

- LinkedIn : https://www.linkedin.com/company/agricapital-ci
- Facebook : https://www.facebook.com/share/1K9g91ffHn/
- WhatsApp : https://wa.me/2250564551717

---

## 13. Marque

**AgriCapital**  
**Investir la terre. Cultiver l'avenir.**

© AgriCapital. Tous droits réservés.

export default function handler(_req: any, res: any) {
  const html = `<!doctype html>
<html lang="fr-CI">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Plantation clé en main en Côte d’Ivoire | AgriCapital</title>
<meta name="description" content="De l’accès au foncier sécurisé à la plantation clé en main, AgriCapital accompagne vos projets agricoles avec ou sans terre à Gonaté, Daloa et dans le Haut-Sassandra.">
<meta name="keywords" content="plantation clé en main, foncier agricole sécurisé, plantation de palmier à huile, avec ou sans terre, Gonaté, Daloa, Haut-Sassandra, Côte d’Ivoire, AgriCapital">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="https://www.agricapital.ci/plantation-cle-en-main">
<meta property="og:title" content="Plantation clé en main avec ou sans terre | AgriCapital">
<meta property="og:description" content="Accès au foncier agricole sécurisé et accompagnement de plantations de palmier à huile en Côte d’Ivoire, avec ou sans terre.">
<meta property="og:url" content="https://www.agricapital.ci/plantation-cle-en-main">
<meta property="og:image" content="https://www.agricapital.ci/og-image.png">
</head>
<body>
<header><p>AgriCapital — Investir la terre. Cultiver l’avenir.</p><nav><a href="/">Accueil</a> · <a href="/solutions">Solutions agricoles</a> · <a href="/contact">Contact</a></nav></header>
<main>
<h1>Plantation clé en main en Côte d’Ivoire : avec ou sans terre</h1>
<p>AgriCapital accompagne les porteurs de projets agricoles depuis la réflexion foncière jusqu’à la création et au suivi d’une plantation de palmier à huile. Selon votre situation, vous pouvez déjà disposer d’un terrain ou rechercher une solution d’accès au foncier à étudier et à sécuriser avant tout engagement.</p>
<section><h2>Sans terre : étudier l’accès au foncier agricole sécurisé</h2><p>Pour les personnes qui ne possèdent pas encore de terre, l’étude porte sur la disponibilité, la localisation, les documents fonciers et les vérifications nécessaires. Aucun terrain ne doit être considéré comme sécurisé avant ces contrôles.</p><p><a href="/palminvest">Découvrir PalmInvest</a></p></section>
<section><h2>Avec votre propre terre : développer une plantation</h2><p>Pour les propriétaires, le projet peut commencer par l’analyse du terrain, l’organisation de la parcelle, la préparation du projet de plantation et la définition du suivi technique adapté.</p><p><a href="/terrapalm">Découvrir TerraPalm</a></p></section>
<section><h2>Création et suivi d’une plantation de palmier à huile</h2><p>Selon l’offre retenue, l’accompagnement peut couvrir la préparation, la mise en place, les pratiques agronomiques, le suivi de l’évolution et l’organisation des opérations sur le terrain. Les étapes, les coûts et les responsabilités sont précisés au cas par cas avant engagement.</p><p><a href="/palmterroir">Découvrir PalmTerroir</a></p></section>
<section><h2>AgriCapital à Gonaté, Daloa et dans le Haut-Sassandra</h2><p>AgriCapital est implantée à Gonaté, dans la zone de Daloa, au sein du Haut-Sassandra en Côte d’Ivoire. Vous recherchez une plantation de palmier à huile clé en main à Gonaté, Daloa ou ailleurs en Côte d’Ivoire ? Contactez-nous pour décrire votre projet et vérifier les options réellement disponibles.</p><p><a href="/contact">Contacter AgriCapital</a></p></section>
<section><h2>Questions fréquentes</h2><h3>Peut-on lancer un projet sans posséder de terre ?</h3><p>Oui, une étude peut être engagée sans terrain déjà détenu. La disponibilité foncière, les documents et la sécurisation du terrain doivent être vérifiés avant toute décision ou contractualisation.</p><h3>La rentabilité est-elle garantie ?</h3><p>Aucun projet agricole ne doit être présenté comme sans risque. Les rendements, délais et coûts dépendent notamment du terrain, de la conduite culturale, des conditions climatiques et du cadre contractuel.</p></section>
</main>
<footer><a href="/solutions">Solutions et services</a> · <a href="/actualites">Actualités</a> · <a href="/contact">Contact</a></footer>
</body>
</html>`;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.setHeader("X-Content-Type-Options", "nosniff");
  return res.status(200).send(html);
}

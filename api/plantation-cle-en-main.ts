export default function handler(_req: any, res: any) {
  const base = "https://www.agricapital.ci";
  const title = "Investissement agricole & plantation clé en main en Côte d’Ivoire | AgriCapital";
  const description = "AgriCapital accompagne l’investissement agricole en Côte d’Ivoire : plantation de palmier à huile clé en main, avec ou sans terre. Transparence et suivi documenté à Gonaté et Daloa.";
  const canonical = base + "/plantation-cle-en-main";
  const html = `<!doctype html>
<html lang="fr-CI">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title><meta name="description" content="${description}">
<meta name="keywords" content="AgriCapital, investissement agricole Côte d’Ivoire, investissement foncier, plantation clé en main, plantation de palmier à huile, avec ou sans terre, foncier agricole, patrimoine agricole, actifs agricoles productifs, Gonaté, Daloa, Haut-Sassandra, PalmInvest, TerraPalm, PalmTerroir, témoignages clients AgriCapital">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website"><meta property="og:site_name" content="AgriCapital">
<meta property="og:title" content="${title}"><meta property="og:description" content="${description}">
<meta property="og:url" content="${canonical}"><meta property="og:image" content="${base}/og-image.png">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${base}/og-image.png">
<script type="application/ld+json">${JSON.stringify({
  "@context":"https://schema.org","@type":"Service","name":"Investissement agricole et plantation clé en main",
  "serviceType":"Accompagnement de projets agricoles et plantations de palmier à huile",
  "description":description,"url":canonical,
  "provider":{"@type":"Organization","name":"AgriCapital SARL","url":base},
  "areaServed":[{"@type":"Country","name":"Côte d’Ivoire"},{"@type":"Place","name":"Gonaté et Daloa, Haut-Sassandra"}]
})}</script>
</head>
<body>
<header><a href="/">AgriCapital — Investir la terre. Cultiver l’avenir.</a><nav><a href="/solutions">Solutions agricoles</a> · <a href="/temoignages">Témoignages clients</a> · <a href="/contact">Contact</a></nav></header>
<main>
<h1>Investissement agricole et plantation clé en main en Côte d’Ivoire, avec ou sans terre</h1>
<p>AgriCapital développe une approche intégrée du projet agricole : valorisation du foncier, création de plantation et accompagnement dans la durée. Que vous disposiez déjà d’une terre ou que vous envisagiez un projet à partir de zéro, nous vous aidons à examiner une démarche adaptée à votre situation.</p>
<section><h2>Le foncier au cœur du projet agricole</h2><p>L’accès à la terre et sa valorisation constituent des étapes importantes d’un projet agricole. AgriCapital privilégie une approche attentive à la situation foncière, au contexte du projet et à la clarté des engagements.</p><p><a href="/tresor-foncier">Explorer le potentiel du foncier</a></p></section>
<section><h2>Plantation de palmier à huile clé en main</h2><p>Une vision d’ensemble relie préparation, mise en place de la plantation, coordination des opérations et suivi technique selon le périmètre convenu pour chaque projet.</p><p><a href="/palminvest">PalmInvest</a> · <a href="/terrapalm">TerraPalm</a> · <a href="/palmterroir">PalmTerroir</a></p></section>
<section><h2>Transparence et suivi documenté</h2><p>La confiance repose sur des engagements présentés clairement, un cadre contractuel compréhensible et une visibilité sur l’avancement du projet. Les modalités sont expliquées au fil des échanges, sans promesse uniforme ni résultat garanti.</p><p><a href="/notre-approche">Comprendre notre approche</a></p></section>
<section><h2>AgriCapital à Gonaté, Daloa et dans le Haut-Sassandra</h2><p>Notre présence à Gonaté, dans la zone de Daloa en Côte d’Ivoire, ancre notre démarche dans les réalités du terrain. Nous accompagnons la réflexion autour du foncier agricole, du palmier à huile et de la structuration de projets agricoles.</p><p><a href="/fondateur">Présentation du fondateur</a> · <a href="/temoignages">Témoignages et présentation clients</a> · <a href="/actualites">Actualités AgriCapital</a></p></section>
</main><footer><a href="/solutions">Solutions</a> · <a href="/temoignages">Témoignages clients</a> · <a href="/contact">Contact</a></footer>
</body></html>`;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.setHeader("X-Content-Type-Options", "nosniff");
  return res.status(200).send(html);
}

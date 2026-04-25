# ProspectFlow — Pappers Hunting

App single-file (HTML/JS vanilla) pour identifier et qualifier des dirigeants à partir de Pappers, BODACC et LinkedIn.

## Cibles supportées

- **Holdings (NAF 6420Z)** — sociétés holding actives, filtrables par dépt / CP / capital / forme juridique / date de création.
- **Créations récentes** — 3 derniers mois par défaut.
- **Cessions d'entreprise (BODACC)** — annonces "Ventes et cessions" avec filtre capital côté client (par défaut ≥ 100 k€ pour exclure les commerces de détail).
- **Recherche libre** — tous les filtres dispo, pas de preset.

## Pipeline (4 étapes, cap dur 20 prospects/clic)

1. **Source** : Pappers `/recherche` OU BODACC `annonces-commerciales` (cessions).
2. **Détails Pappers** `/entreprise` → extraction dirigeants (représentants, BE, ou via PM holding mère).
3. **Mandats Pappers** + **LinkedIn via Serper** (matching strict prénom+nom dans le title, seuil 60/100).
4. **BODACC events** (créations / modifications / radiations).

## Démarrage

1. Ouvrir `index.html` dans un navigateur (Chrome/Edge/Firefox) — pas de build, pas de serveur.
2. Renseigner les filtres dans la sidebar gauche.
3. Cliquer **Rechercher & Enrichir**.
4. **Charger plus** pour la page suivante (toujours 20 max).
5. Export Excel ou JSON depuis la topbar.

## Persistance

- **localStorage** : prospects + historique des recherches (auto-save).
- **Export/Import JSON** : pour changer de PC ou partager une base entre collabs.

## Clés API (en clair dans `index.html`)

⚠️ Le repo est **privé** car les clés sont hardcodées (Pappers, Serper). Ne pas le rendre public sans extraction des clés vers un fichier `config.local.js` gitignored.

- **Pappers** : v2 — facturation au request_cost (suivi en topbar)
- **Serper** : 2500 crédits / mois (suivi en topbar)
- **BODACC** : API publique gratuite (datadila.opendatasoft.com)

## Données

`prospectflow_data.json` est **gitignored** : c'est de la donnée perso (PII : nom, naissance, adresse). Chaque collab a sa propre base locale + peut exporter/importer pour partager.

## Architecture

Tout est dans `index.html` (~620 lignes). Sections :
- Lignes 1-160 : CSS
- Lignes 161-254 : HTML (topbar, sidebar, main grid)
- Lignes 256-619 : JavaScript (pipeline, persistance, render, export)

Pas de build step. Vanilla JS, fetch API, pas de framework.

# ProspectFlow — Pappers Hunting

App single-file (HTML/JS vanilla) pour **identifier, trier et qualifier des dirigeants** en situation patrimoniale (création de holding, cession d'entreprise, dirigeant âgé à fort capital) à partir de Pappers, BODACC, LinkedIn et du radar hebdo.

## Workflow V2 (triage Cibles / Pending)

1. **Radar hebdo** (gratuit, sans clé) → `signals.json` : balaye BODACC + API gouv, score les signaux.
2. **📡 Importer signaux radar** dans l'app → les signaux arrivent dans l'onglet **⏳ Pending**.
3. **Trier** : on sélectionne les bons (case à cocher / ⭐ / mode **☑️ Sélection** + actions groupées) → **🎯 Cibles**. Le reste reste en Pending.
4. **🔍 Enrichir** un signal → pipeline Pappers complet (dirigeants + mandats + LinkedIn + BODACC) → devient une vraie fiche Cible.
5. **📇 Dropcontact** (à la demande) → email/téléphone de la cible.
6. **📤 Pousser** sur Airtable + **🧠 Narratif** patrimonial IA (optionnel).

> Une recherche manuelle (sidebar) arrive directement en **Cibles**. Les signaux radar arrivent en **Pending** à trier.

## Cibles supportées (recherche manuelle)

- **Holdings (NAF 6420Z)** — filtrables dépt / CP / capital / forme / date.
- **Cessions d'entreprise (BODACC)** — annonces "Ventes et cessions", filtre capital côté client.

## Pipeline (cap dur 20 prospects/clic)

1. **Source** : Pappers `/recherche` OU BODACC `annonces-commerciales`.
2. **Détails** Pappers `/entreprise` → dirigeants (représentants, BE, ou via PM holding mère).
3. **Mandats** Pappers + **LinkedIn via Serper** (matching strict prénom+nom, anti-homonymes).
4. **BODACC events** (créations / modifications / radiations).

## Radar automatique (GitHub Action)

`.github/workflows/radar.yml` lance `scripts/radar.mjs` **chaque lundi ~06h30 Paris**, commit `signals.json` + `radar_email.html`, et envoie l'email récap des leads chauds.

**Secrets à configurer** (Settings → Secrets and variables → Actions) : `MAIL_SERVER`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` (mot de passe d'application Gmail), `MAIL_TO`. Variable optionnelle : `RADAR_DEPTS` (défaut : Île-de-France).

Lancer à la main : `node scripts/radar.mjs` (env : `RADAR_DEPTS`, `RADAR_DAYS`, `RADAR_GOVCAP`).

## Démarrage

1. Ouvrir `index.html` (Chrome/Edge/Firefox) — pas de build, pas de serveur.
2. Renseigner les clés API via ⚙️ (stockées **uniquement dans le navigateur**).
3. Rechercher, ou **📡 Importer signaux radar**, puis trier en Cibles.

## Sauvegarde / Sync

- **localStorage** : auto-save permanent (prospects + historique).
- **🔗 Sync (File System Access)** : lie un fichier `.json` une fois → chaque modif s'y écrit automatiquement. Range-le dans Google Drive / OneDrive pour une vraie sauvegarde cloud + multi-PC. **ON** = lié/actif · **🔓 Activer** = ré-autoriser après redémarrage navigateur.
- **Export/Import JSON** manuel pour partager une base.

## Clés API

⚠️ Repo **privé**. Clés stockées en localStorage (jamais dans le code, jamais transmises ailleurs).

- **Pappers** v2 (facturé au request_cost) · **Serper** (LinkedIn, 2500 crédits/mois) · **BODACC** + **API gouv** (gratuits) · **Dropcontact** (email/tél, à la demande) · **Anthropic** (narratif, optionnel) · **Airtable** (push CRM, optionnel).

## Données

`prospectflow_data.json` est **gitignored** (PII). `signals.json` est versionné (données publiques BODACC, régénéré chaque semaine).

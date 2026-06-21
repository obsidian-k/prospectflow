# ProspectFlow — Pappers Hunting

App single-file (HTML/JS vanilla) pour **identifier, trier et qualifier des dirigeants** en situation patrimoniale (création de holding, cession d'entreprise, dirigeant à fort capital) à partir de Pappers, BODACC et LinkedIn.

## Workflow (triage Pending → Cibles, enrichissement paresseux)

1. **Recherche manuelle** (sidebar) → les résultats arrivent dans **⏳ Pending** (sourcés mais PAS encore enrichis — zéro crédit LinkedIn gaspillé).
2. **Trier** : on valide les prospects intéressants via ⭐ ou le mode **☑️ Sélection** (cases à cocher + actions groupées). Ils passent en **🎯 Cibles**.
3. **Enrichissement automatique à la promotion** : devenir une Cible déclenche mandats + LinkedIn + BODACC **uniquement sur cette fiche**. (Bouton 🔍 dispo aussi pour enrichir sans changer le statut.)
4. **📇 Dropcontact** (à la demande) → email/téléphone de la cible.
5. **📤 Pousser** sur Airtable + **🧠 Narratif** patrimonial IA (optionnels).

> 🎯 **Cibles** = ton hunt de la semaine (prospects validés). **À pousser** = les cibles pas encore envoyées au CRM = ta worklist live. ⏳ **Pending** = le reste, à travailler plus tard.

## Cibles supportées (recherche)

- **Holdings (NAF 6420Z)** — filtrables dépt / CP / capital / forme / date.
- **Cessions d'entreprise (BODACC)** — annonces "Ventes et cessions", filtre capital côté client.

## Pipeline

**Recherche (immédiat, léger) :**
1. **Source** : Pappers `/recherche` OU BODACC `annonces-commerciales` → SIRENs.
2. **Détails** Pappers `/entreprise` → dirigeants (représentants, BE, ou via PM holding mère) → **Pending**.

**Enrichissement (paresseux, à la promotion en Cible) :**
3. **Mandats** Pappers + **LinkedIn via Serper** (matching strict prénom+nom, anti-homonymes).
4. **BODACC events** (créations / modifications / radiations).

## Démarrage

1. Ouvrir `index.html` (Chrome/Edge/Firefox) — pas de build, pas de serveur.
2. Renseigner les clés API via ⚙️ (stockées **uniquement dans le navigateur**).
3. Rechercher → trier le Pending en Cibles → enrichir/pousser.

## Sauvegarde / Sync

- **localStorage** : auto-save permanent (prospects + historique des recherches).
- **🔗 Sync (File System Access)** : lie un fichier `.json` une fois → chaque modif s'y écrit automatiquement. Range-le dans Google Drive / OneDrive pour une sauvegarde cloud + multi-PC. **ON** = lié/actif · **🔓 Activer** = ré-autoriser après redémarrage du navigateur.
- **Export/Import JSON** manuel pour partager une base.

## Clés API

⚠️ Repo **privé**. Clés stockées en localStorage (jamais dans le code, jamais transmises ailleurs).

- **Pappers** v2 (facturé au request_cost) · **Serper** (LinkedIn, 2500 crédits/mois) · **BODACC** (gratuit) · **Dropcontact** (email/tél, à la demande) · **Anthropic** (narratif, optionnel) · **Airtable** (push CRM, optionnel).

## Données

`prospectflow_data.json` est **gitignored** (PII : nom, naissance, adresse). Chaque collab a sa base locale + export/import pour partager.

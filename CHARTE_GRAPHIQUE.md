# Charte graphique — Obsidian Capital Design System

Design system extrait de **ProspectFlow**. Réutilisable tel quel : copie le bloc `:root`, charge les 3 polices, applique les recettes de composants. Vanilla CSS, zéro dépendance, **light + dark** via `[data-theme]`.

- **Personnalité** : sobre, dense, "fintech privée" — slate profond + un seul accent orange chaud. Beaucoup de mono pour les chiffres/IDs, sans-serif net pour le texte, display géométrique pour la marque.
- **Règle d'or** : un seul accent (orange `#FA4B00`). Le reste est gris (slate). Les couleurs sémantiques (vert/rouge/ambre/bleu) servent uniquement au statut, jamais à la déco.

---

## 1. Polices

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

| Rôle | Police | Usage |
|------|--------|-------|
| **Display** | `Outfit` | Marque, wordmark, mono-mark (uppercase, letter-spacing large) |
| **Sans** | `IBM Plex Sans` | Texte courant, titres, labels, boutons |
| **Mono** | `IBM Plex Mono` | Chiffres, SIREN/IDs, KPIs, badges, métadonnées (`tabular-nums`) |

---

## 2. Tokens (variables CSS) — bloc à copier

```css
:root{
  /* Accent unique */
  --obsidian-orange:#FA4B00; --obsidian-orange-hover:#FF6A2A;
  --obsidian-orange-dim:rgba(250,75,0,.12); --obsidian-orange-glow:rgba(250,75,0,.4);
  --obsidian-slate:#3C414B;

  /* Échelle slate (gris froid) */
  --slate-900:#0A0A0A; --slate-800:#141416; --slate-700:#1C1C20; --slate-600:#2A2A30;
  --slate-500:#3C414B; --slate-400:#54606D; --slate-300:#828F9D;
  --slate-200:#C5CAD1; --slate-150:#DFE2E6; --slate-100:#EEF0F2; --slate-50:#F5F6F7; --slate-0:#FFFFFF;

  /* Sémantique (statut uniquement) */
  --positive:#10B981; --negative:#EF4444; --warning:#F59E0B; --info:#3B82F6;

  /* Rayons */
  --radius-sm:4px; --radius-md:6px; --radius-lg:8px; --radius-xl:12px; --radius-2xl:16px; --radius-full:9999px;

  /* Espacements (base 4px) */
  --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px; --space-5:20px; --space-6:24px; --space-8:32px;

  /* Typo */
  --font-display:'Outfit','IBM Plex Sans',system-ui,sans-serif;
  --font-sans:'IBM Plex Sans',system-ui,-apple-system,sans-serif;
  --font-mono:'IBM Plex Mono','JetBrains Mono',Menlo,monospace;

  /* Divers */
  --t:150ms ease;
  --shadow-modal:0 20px 40px -12px rgba(10,10,10,.15);
}

/* Thème clair (défaut) */
:root,[data-theme="light"]{
  --bg:var(--slate-50); --surface:var(--slate-0); --surface-hover:var(--slate-100);
  --text:var(--slate-900); --text-body:var(--slate-500); --text-muted:var(--slate-300);
  --border:var(--slate-150); --border-strong:var(--slate-200);
}

/* Thème sombre */
[data-theme="dark"]{
  --bg:var(--slate-900); --surface:var(--slate-800); --surface-hover:var(--slate-700);
  --text:#E5E5E7; --text-body:#94A3B8; --text-muted:var(--slate-400);
  --border:#1F1F23; --border-strong:var(--slate-600);
}
```

> **Bascule de thème** : `document.documentElement.setAttribute('data-theme', 'dark' | 'light')`. Tous les composants suivent automatiquement (ils n'utilisent que `--surface / --text / --border…`, jamais une couleur en dur).

### Sémantique des couleurs
| Token | Hex | Sens |
|-------|-----|------|
| `--obsidian-orange` | `#FA4B00` | Accent unique, CTA, actif, focus |
| `--positive` | `#10B981` | Succès, validé, poussé |
| `--negative` | `#EF4444` | Erreur, supprimé |
| `--warning` | `#F59E0B` | Alerte, attention |
| `--info` | `#3B82F6` | Lien externe, LinkedIn |
| `--text` / `--text-body` / `--text-muted` | slate | Titre / corps / secondaire |

---

## 3. Base / reset

```css
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{font-family:var(--font-sans);background:var(--bg);color:var(--text);font-size:14px;line-height:1.5;-webkit-font-smoothing:antialiased;font-feature-settings:"ss01","ss02"}
::selection{background:var(--obsidian-orange);color:#fff}
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-thumb{background:var(--border-strong);border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:var(--text-muted)}
.mono{font-family:var(--font-mono);font-variant-numeric:tabular-nums}
button{font:inherit;color:inherit;background:none;border:0;cursor:pointer;padding:0}
a{color:inherit;text-decoration:none}
```

---

## 4. Composants (recettes)

### Boutons
```css
.btn{display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:var(--radius-md);font-family:var(--font-sans);font-size:13px;font-weight:500;border:1px solid var(--border-strong);color:var(--text);background:var(--surface);transition:all var(--t);min-height:32px;cursor:pointer}
.btn:hover{background:var(--surface-hover)}
.btn-primary{background:var(--obsidian-orange);border-color:var(--obsidian-orange);color:#fff}
.btn-primary:hover{background:var(--obsidian-orange-hover);border-color:var(--obsidian-orange-hover)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed}
.btn-ghost{background:transparent;border-color:transparent;color:var(--text-muted)}
.btn-ghost:hover{background:var(--surface-hover);color:var(--text)}
.btn-icon{padding:7px 9px;min-width:32px;justify-content:center}
.btn-sm{padding:4px 8px;font-size:11px;min-height:26px;border-radius:var(--radius-sm)}
.btn:focus-visible{outline:2px solid var(--obsidian-orange-glow);outline-offset:2px}
```

### Champs (input / select)
```css
.f label{display:block;font-size:10px;font-weight:600;color:var(--text-muted);margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px}
.f input,.f select{width:100%;padding:8px 10px;background:var(--bg);border:1px solid var(--border-strong);border-radius:var(--radius-md);color:var(--text);font:inherit;font-size:13px;outline:none;transition:border-color var(--t),box-shadow var(--t)}
.f input:focus,.f select:focus{border-color:var(--obsidian-orange);box-shadow:0 0 0 3px var(--obsidian-orange-dim)}
```
> **Pattern focus signature** : bordure orange + halo `box-shadow:0 0 0 3px var(--obsidian-orange-dim)`. À réutiliser sur tous les champs.

### Pills / Chips (filtres, toggles)
```css
.pill,.chip{padding:6px 12px;border-radius:var(--radius-full);font-size:12px;font-weight:500;border:1px solid var(--border-strong);background:var(--surface);color:var(--text-body);cursor:pointer;transition:all var(--t);user-select:none}
.pill:hover,.chip:hover{border-color:var(--text-muted);color:var(--text)}
.pill.on,.chip.on{background:var(--obsidian-orange-dim);border-color:var(--obsidian-orange);color:var(--obsidian-orange);font-weight:600}
```

### Badges de statut (connecteurs/API)
```css
.badge-api{display:inline-flex;align-items:center;gap:5px;font-family:var(--font-mono);font-size:10px;font-weight:500;color:var(--positive);padding:4px 8px;border:1px solid rgba(16,185,129,.25);border-radius:var(--radius-full);background:rgba(16,185,129,.06)}
.badge-api i{width:6px;height:6px;border-radius:50%;background:var(--positive);box-shadow:0 0 4px rgba(16,185,129,.4)}
.badge-api.warn{color:var(--warning);border-color:rgba(245,158,11,.3);background:rgba(245,158,11,.06)}
.badge-api.dead{color:var(--negative);border-color:rgba(239,68,68,.3);background:rgba(239,68,68,.06)}
.badge-api.idle{color:var(--obsidian-orange);border-color:var(--obsidian-orange);border-style:dashed;background:var(--obsidian-orange-dim)} /* branché non configuré */
.badge-api.off{color:var(--text-muted);border-color:var(--border);background:transparent} /* inactif */
```
> Convention pastille : **vert** = OK · **ambre** = attention · **rouge** = KO · **orange pointillé** = branché-non-configuré · **gris** = inactif.

### Cartes
```css
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-xl);overflow:hidden;transition:border-color var(--t),box-shadow var(--t);position:relative}
.card:hover{border-color:var(--border-strong)}
/* Accent d'état = liseré gauche 3px */
.card.state-cible{border-left:3px solid var(--obsidian-orange)}
.card.state-pushed{border-left:3px solid var(--positive)}
.card.state-pending{border-left:3px solid var(--border-strong)}
.card.state-skip{opacity:.55}
```
> **Pattern état** : un liseré gauche de 3px coloré encode l'état (orange=actif, vert=validé, gris=neutre), + opacité réduite pour le rangé.

### KPIs
```css
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:var(--space-3)}
.kpi{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-xl);padding:var(--space-5) var(--space-6);display:flex;flex-direction:column;gap:6px;position:relative;overflow:hidden}
.kpi.k-ac::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--obsidian-orange)}
.kpi-l{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:var(--text-muted)}
.kpi-v{font-family:var(--font-mono);font-size:28px;font-weight:500;letter-spacing:-.3px;font-variant-numeric:tabular-nums;color:var(--text)}
```

### Modal
```css
.modal-bg{position:fixed;inset:0;background:rgba(10,10,10,.55);z-index:200;display:none;place-items:center;backdrop-filter:blur(4px)}
.modal-bg.on{display:grid}
.modal{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-2xl);padding:var(--space-6);width:min(540px,92vw);max-height:85vh;overflow-y:auto;box-shadow:var(--shadow-modal)}
```

### Toast
```css
.toast{position:fixed;bottom:20px;right:20px;background:var(--surface);border:1px solid var(--border-strong);border-radius:var(--radius-lg);padding:12px 18px;font-size:13px;font-weight:500;color:var(--text);box-shadow:var(--shadow-modal);z-index:300;display:flex;align-items:center;gap:8px;animation:su .25s ease}
@keyframes su{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
```

### Topbar (sticky + blur)
```css
.topbar{position:sticky;top:0;z-index:40;display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-6);background:color-mix(in oklab,var(--bg) 85%,transparent);backdrop-filter:blur(8px);border-bottom:1px solid var(--border)}
```

### Marque (mono-mark + wordmark)
```css
.mono-mark{width:32px;height:32px;background:var(--obsidian-orange);color:#fff;display:grid;place-items:center;font-family:var(--font-display);font-weight:600;font-size:16px;border-radius:var(--radius-md)}
.brand-wm .row{font-family:var(--font-display);font-weight:500;letter-spacing:2.4px;font-size:11px;text-transform:uppercase}
.brand-wm .orange{color:var(--obsidian-orange)}
```

---

## 5. Layout type

```css
.app{min-height:100vh;display:grid;grid-template-columns:264px 1fr} /* sidebar + main */
.sidebar{background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto}
.content{padding:var(--space-6);max-width:1480px;width:100%;margin:0 auto}
/* Responsive : sidebar passe au-dessus en colonne sous 900px */
@media(max-width:900px){.app{grid-template-columns:1fr}.sidebar{position:relative;height:auto}}
```

---

## 6. Principes de réutilisation

1. **Un seul accent.** Tout ce qui est cliquable/actif/important = orange. Si tout est orange, plus rien ne l'est.
2. **Tout passe par les tokens.** Aucun hex en dur dans les composants → le thème clair/sombre marche gratuitement.
3. **Mono pour les nombres.** Chiffres, IDs, dates, scores → `--font-mono` + `tabular-nums` (alignement vertical propre).
4. **Hiérarchie par le gris.** 3 niveaux de texte (`--text` / `--text-body` / `--text-muted`) suffisent. Labels en `uppercase` 10-11px `letter-spacing`.
5. **Densité + respiration.** Rayons généreux (`--radius-xl` 12px sur cartes/KPIs), espacements base 4px, bordures fines 1px `--border`.
6. **Focus signature.** Champ focus = bordure orange + halo `0 0 0 3px var(--obsidian-orange-dim)`. Cohérent partout.
7. **État = liseré + couleur sémantique**, jamais un fond plein criard.

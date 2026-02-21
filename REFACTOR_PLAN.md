# NAMEFED Refactoring Plan

## Principles

- **Blocks first**: Each block = one CSS file
- **Responsive CSS**: Mobile-first, nested `@media`, custom properties for breakpoint values, 768px/1024px
- **Owl selector**: `* + * { margin-block-start: var(--flow-space) }` for sibling spacing—avoid vertical margins elsewhere
- **Grid over flexbox**: All layouts use CSS Grid; use `gap` instead of padding/margin where possible
- **Content as data**: JSON structure + JS renderers (CMS-like, no PHP)
- **Clean structure**: Easy-to-parse files, minimal nesting, consistent naming
- **Minimal wrappers**: Avoid divs with only one child—put classes on the content element or flatten structure

---

## Wrapper Audit (minimal markup)

When building markup, prefer:

| Instead of | Use |
|------------|-----|
| `block-strip` > `div` > `p` | `block-strip` > `p` (direct child gets max-width via `> *`) |
| `block-split` > `div.block-split__inner` > content | `block-split` as grid (content = direct children) |
| `block-hero` > `div` > h1, p, ctas | Keep wrapper only if needed to group for centering |

**Keep wrapper when:** full-width background + constrained content (block-content__inner), overflow-x (table), stacking context (hero), or grouping multiple elements for layout.

---

## Phase 1: Block CSS Files

Create `css/blocks/` directory. Each block file follows responsive-css SKILL.md.

### 1.1 `_block-hero.css`
- Full-width hero, bg image, overlay, centered content
- Uses: index hero
- Owl inside `.block-hero__inner` for h1, tagline, cta-group
- Grid for layout; no flexbox

### 1.2 `_block-strip.css`
- Full-width announcement bar
- Modifier: `--alert` (brand color for header)
- Uses: index branch hours, hours-locations reminder, header alert-bar

### 1.3 `_block-pagehead.css`
- Page title with gradient bg
- Uses: about, membership, hours-locations, rates, contact, faq

### 1.4 `_block-content.css`
- Standard content section with container
- Modifiers: `--alt`, `--dark`, `--center`
- Owl for flow; grid gap for internal spacing
- Uses: most sections across all pages

### 1.5 `_block-split.css`
- Two-column grid layout
- Modifiers: `--alt`, `--media` (image in one column)
- Uses: index welcome/who-we-serve, about, hours-locations, contact

### 1.6 `_block-grid.css`
- Responsive card grid: `repeat(auto-fit, minmax(var(--min), 1fr))`
- Uses: index feature cards

### 1.7 `_block-card.css`
- Card with optional image, heading, body
- Modifier: `--compact` (location card)
- Uses: feature cards, location card

### 1.8 `_block-table.css`
- Table wrapper + table styles
- Modifier: `--wide`
- Uses: rates page

### 1.9 `_block-qanda.css`
- Q&A list (question + answer pairs)
- Owl for item spacing
- Uses: FAQ page

### 1.10 `_block-list.css`
- Bullet list block
- Modifier: `--bordered` (holiday schedule)
- Uses: who-we-serve, holiday schedule, membership lists

---

## Phase 2: Utilities CSS

Create `css/_utilities.css`:
- **Owl (flow)**: `.flow * + * { margin-block-start: var(--flow-space) }`
- **Flow-off**: `.flow-off > * { margin-block: 0 }` (for grid children)
- **Cluster**: Grid-based horizontal wrap for CTAs
- **Stack**: Grid single-column with gap
- **Container**: `max-width`, `margin-inline: auto`
- **Lead**: Lead paragraph typography

All use grid; no flexbox.

---

## Phase 3: Block Partials (Templates)

Create `partials/blocks/` — HTML templates with `{{key}}` placeholders. JS fetches template + data, merges, injects.

| Partial | Placeholders | Notes |
|---------|--------------|-------|
| block-hero.html | title, tagline, bgImage, bgAlt, ctasHtml | ctasHtml = pre-rendered from ctas array |
| block-strip.html | contentHtml, modifiers | contentHtml = inner HTML |
| block-pagehead.html | title | |
| block-content.html | innerHtml, modifiers | innerHtml = block-content__inner content |
| block-split.html | contentHtml, mediaHtml, modifiers | |
| block-grid.html | itemsHtml | itemsHtml = pre-rendered cards |
| block-card.html | image, imageAlt, title, bodyHtml, modifiers | Used as sub-template |
| block-table.html | caption, headersHtml, rowsHtml, modifiers | |
| block-qanda.html | itemsHtml | itemsHtml = pre-rendered Q&A items |
| block-list.html | itemsHtml, modifiers | itemsHtml = pre-rendered list items |

**Flow:** content.js fetches content.json → for each block, fetches partial → blocks.js merges template + data → injects into #main.

---

## Phase 4: Content JSON Structure

Create `data/content.json`:

```json
{
  "site": {
    "name": "North Adams Municipal Employees Federal Credit Union",
    "shortName": "NAMEFED"
  },
  "alert": {
    "message": "Branch will close at 1pm on Christmas Eve and New Year's Eve.",
    "link": { "href": "hours-locations.html#holidays", "text": "View holiday schedule" }
  },
  "pages": {
    "index": { "title": "...", "blocks": [...] },
    "about": { ... },
    "membership": { ... },
    "hours-locations": { ... },
    "rates": { ... },
    "contact": { ... },
    "faq": { ... }
  },
  "shared": {
    "whoWeServe": ["City of North Adams", "..."],
    "location": { "name": "...", "address": "...", "phone": "...", "fax": "..." },
    "hours": { ... },
    "holidays": { "2025": [...], "2026": [...] }
  }
}
```

Flat, page-keyed structure. Shared content referenced by key.

---

## Phase 5: JS Content Loader & Block Renderers

Create `js/content.js`:
- `fetch('data/content.json')` on load
- `renderPage(pageKey)` — looks up page blocks
- For each block: fetch partial, merge with data via blocks.js, inject into `#main`

Create `js/blocks.js`:
- `renderBlock(type, data)` — fetches `partials/blocks/block-{type}.html`, merges `{{key}}` with data
- `prepareBlockData(type, data)` — for arrays (ctas, items, rows), pre-renders HTML before merge
- `replacePlaceholders(template, data)` — `{{key}}` → data[key]

---

## Phase 6: HTML Shell Structure

Each page becomes a minimal shell:

```html
<!DOCTYPE html>
<html lang="en">
<head>...</head>
<body>
  <a href="#main" class="skip-link">Skip to main content</a>
  <div id="header-placeholder"></div>
  <script src="js/header.js"></script>

  <main id="main" data-page="index">
    <!-- Blocks injected by content.js -->
  </main>

  <div id="footer-placeholder"></div>
  <script src="js/footer.js"></script>
  <script src="js/content.js"></script>
  <script src="js/main.js"></script>
  <!-- Page-specific: membership.js for membership page only -->
</script>
</body>
</html>
```

`data-page` drives which page content to load.

---

## Phase 7: Page-by-Page Refactor Order

### 6.1 Index (`index.html`)
1. Hero
2. Strip (branch hours)
3. Split (welcome)
4. Split--alt (who we serve)
5. Content + grid + cards (what we offer)
6. Content--dark (newsletter)
7. Content--center (ready to join)

### 6.2 About (`about.html`)
1. Pagehead
2. Split (who we are)
3. Content--alt + list (who we serve)
4. Content (board of directors)

### 6.3 Hours & Locations (`hours-locations.html`)
1. Pagehead
2. Content + list--bordered (branch hours, holidays)
3. Strip (reminder)
4. Split--alt + card (location)

### 6.4 Rates (`rates.html`)
1. Pagehead
2. Content + table (savings)
3. Content--alt + table--wide (loan rates)
4. Content + table--wide (loan specials)

### 6.5 Contact (`contact.html`)
1. Pagehead
2. Content + split (no --media): info column + form column

### 6.6 FAQ (`faq.html`)
1. Pagehead
2. Content + qanda

### 6.7 Membership (`membership.html`)
1. Pagehead
2. Content + list (who can join)
3. **Keep eligibility-flow + wizard as-is** (dynamic, JS-dependent)

---

## Phase 8: Deprecate Old CSS

After refactor complete:
- Remove from `_layout.css`: section--strip, strip, section--alt, section-split, section--dark, section--center, quick-links, serve-list
- Remove from `_pages.css`: section--banner, newsletter-form, feature-grid, section--title, holiday-schedule
- Remove from `_components.css`: feature-card, location-card, rates-table, contact-grid
- Keep: _header.css, _footer.css, form/button styles, eligibility/wizard styles
- Update `style.css` imports

---

## File Structure (Target)

```
namefed-demo/
├── data/
│   └── content.json
├── css/
│   ├── style.css          # imports all
│   ├── _variables.css
│   ├── _reset.css
│   ├── _base.css
│   ├── _typography.css
│   ├── _utilities.css     # flow, cluster, stack, container
│   ├── blocks/
│   │   ├── _block-hero.css
│   │   ├── _block-strip.css
│   │   ├── _block-pagehead.css
│   │   ├── _block-content.css
│   │   ├── _block-split.css
│   │   ├── _block-grid.css
│   │   ├── _block-card.css
│   │   ├── _block-table.css
│   │   ├── _block-qanda.css
│   │   └── _block-list.css
│   ├── _header.css
│   ├── _footer.css
│   ├── _components.css    # buttons, forms, eligibility, wizard
│   └── _legacy.css        # temporary during migration
├── js/
│   ├── header.js
│   ├── footer.js
│   ├── content.js        # loader + page router
│   ├── blocks.js         # block render functions
│   ├── main.js
│   └── membership.js
├── partials/
│   ├── header.html
│   ├── footer.html
│   └── blocks/
│       ├── block-hero.html
│       ├── block-strip.html
│       ├── block-pagehead.html
│       ├── block-content.html
│       ├── block-split.html
│       ├── block-grid.html
│       ├── block-card.html
│       ├── block-table.html
│       ├── block-qanda.html
│       └── block-list.html
└── *.html                 # page shells
```

---

## Execution Order

1. ~~Create `css/blocks/` and all 10 block CSS files~~ ✓
2. Create `css/_utilities.css`
3. Update `style.css` imports (add blocks, utilities)
4. Create `data/content.json` with full content
5. Create `js/blocks.js` with render functions
6. Create `js/content.js` loader
7. Refactor index.html (shell + verify)
8. Refactor about.html
9. Refactor hours-locations.html
10. Refactor rates.html
11. Refactor contact.html
12. Refactor faq.html
13. Refactor membership.html (partial—keep eligibility/wizard)
14. Update header partial (alert-bar → block-strip)
15. Remove deprecated CSS
16. Final cleanup

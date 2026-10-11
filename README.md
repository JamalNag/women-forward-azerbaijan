# Women Forward Azerbaijan

Project website for Women Forward Azerbaijan (2024–2026), a regional women's economic empowerment initiative of the "Innovative Progress and Ecology" Public Union. Static HTML, no build step. Available in English, Azerbaijani and Russian.

## Files

- `index.html` — the page. English text lives here.
- `assets/styles.css` — design tokens (colors, fonts, motion) at the top, then the layout.
- `assets/i18n.js` — Azerbaijani and Russian translations, keyed by each element's `data-i18n` attribute.
- `assets/main.js` — language switcher, before/after chart, pricing example, stage tabs, copy-email button.

## Adding content later

Put images in `assets/img/`. Each spot is marked with an HTML comment in `index.html`:

- **Map:** search for `<!-- MAP:` and replace the contents of the `.slot` figure with an `<img>`.
- **Catalogue photos:** search for `<!-- PHOTOS:` and replace each `.slot.photo` div with an `<img>`.
- **Team photos:** search for `<!-- PHOTO:` and replace the initials inside `.portrait` with an `<img>`.
- **Logo:** replace the small ornament `<svg>` inside `.brand` in the header.

When you change English text, update the matching keys in `assets/i18n.js` too.

## Publishing on GitHub Pages

Push this folder to a GitHub repository, then go to **Settings → Pages**, choose **Deploy from a branch**, and select `main` with the `/ (root)` folder.

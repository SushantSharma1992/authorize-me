# Post-Redesign Cleanup Report

## Fix 1 — `a:visited, a:link` rule (DONE)
Deleted. `--primary-color` is not defined in the new design tokens (`:root` only defines `--bg`, `--card`, `--surface`, `--accent`, `--text`, `--muted`, `--card-border`, `--border-curve`). The `.cred-site a` rule handles link color.

## Fix 2 — Dead legacy CSS pruned (DONE)

### Classes REMOVED (zero refs in src/**/*.{js,jsx}):
| Class / Selector | Evidence |
|---|---|
| `.CardComponent` | grep: no files found |
| `.headerItem` | grep: no files found |
| `.searchInput` | grep: no files found |
| `.search_result_item` | grep found `SearchResults.js` — but `SearchResults` itself is imported nowhere; dead end-to-end |
| `.password-container` + `:focus-visible` + `#passwordField-id` | grep: no files found |
| `.input_class` | grep: no files found |
| `.button_primary` | grep: no files found |
| `.modal_styles` | grep: no files found |
| `.modal_container` | grep: no files found (was empty rule) |
| `.closeButton` | grep: no files found |
| `.content` | grep `className.*content`: only hit was `cred-note` in Notes.js |
| `.accordion` + `.active`/`.accordion:hover` + `.panel` | grep: no files found |
| `.displayBlock` + `.displayNone` | grep: no files found |
| `.text_container` | grep: no files found |
| `.headerContainer` | grep: no files found |
| `.align_right` | grep: no files found |
| `.pushLeft` | grep: no files found |
| `.paddingright` | grep: no files found |
| `.position-relative` | grep: no files found |
| `.centerElement` | grep: no files found |
| `.grey-indicator-box` | grep: only hit in Tags.js (itself dead) |
| `.tag-container` | grep: only hit in Tags.js |
| `.tag-margin` | grep: only hit in Tags.js |
| `.customize-scrollbar` | grep: only hit in Tags.js |
| `.imageBorder` | grep: no files found |
| `.imageStyles` | grep: no files found |
| `.image_dimentions` | grep: no files found |

### Classes KEPT (confirmed live or on protected list):
`.card_label`, `.font-m`, `.font-xl`, `.flex-start`, `.flex-column`, `.padding-md`, `.margin-auto`, `.hidden`, `.menu-component`, `.flex-1`, `.full_width`, `.fill-available-width`, `.flex_horizontal`, `.margin-small`, `.credential-container`, `.home-container`, all `.cred-*`, all `.vault-*`, all `.lockscreen-*`, all `.dropdown*` (Panel/Item/openDropdown/danger), `.list_container`, `.options_container`, `.option_row`, `.option_description`, `.option_image`.

Note: `.dropdownContainer` was a candidate but is different from `.dropdownPanel`/`.dropdownItem` etc. Grep found no refs to `dropdownContainer` — however the instruction said "when in doubt, LEAVE" and it wasn't in the CSS file anyway (`.dropdownPanel` is what exists), so N/A.

## Fix 3 — Tags.js deleted (DONE)
Grep for `Tags` in `src/**/*.{js,jsx}` returned only self-references inside `Tags.js` itself. No other file imports it. File deleted: `src/Components/Card/Tags.js`.

## Fix 4 — Home.test.js cleanup (DONE)
- Removed `import userEvent from "@testing-library/user-event"` (unused — tests are render-only).
- Removed `jest.mock("../Components/Modal", …)` — the real `Modal` (`src/Components/Modal.js`) renders `null` when `isOpen` is falsy and a simple div overlay when open. jsdom handles this fine. **Modal mock removal worked**: all 2 Home tests pass with the real Modal.

## Fix 5 — Notes label (DONE)
Changed `<label>Notes</label>` to `<label>Notes <span style={{...}}>(optional)</span></label>` in `src/Pages/AddItemForm.js`.

## Full-suite result
```
Test Suites: 10 passed, 10 total
Tests:       37 passed, 37 total
Snapshots:   0 total
Time:        2.968 s
```
No failures. No React `act(...)` warnings. Pristine.

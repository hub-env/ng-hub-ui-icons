# Changelog

All notable changes to `ng-hub-ui-icons` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [22.4.0] - 2026-09-23

### Changed

- **BREAKING — the Angular floor rises from `17.1.0` to `17.3.0`.** The old range was
  measured from the source alone, and its published `.d.ts` names `InputSignalWithTransform` or `OutputEmitterRef`, which Angular did not ship until 17.3. An application below the new floor could install this
  package and then fail to build, with an error that pointed at Angular rather than here; it now
  gets the peer warning it should always have had. Nothing that worked stops working. See
  `BREAKING_CHANGES.md`.
- **The floor is proved by running it now, not only derived.** `npm run floors:matrix` builds a real
  project pinned to the oldest Angular this package claims, installs it there, typechecks the
  published types against that version's `@angular/*` and runs that version's linker over the
  compiled output. It is what found this.

## [22.3.4] - 2026-09-23

### Changed

- **The Angular peer range now says what the code needs, not a number somebody picked.** It asked
  for `>=21.0.0`, which nothing in this package justified. The newest Angular API the source uses is
  input(), which shipped in 17.1, and the partial-Ivy output the Angular linker checks carries no
  marker above it. The range is `>=17.1.0`, so applications on those versions can install this
  library instead of being turned away by a range that was never measured.
- **The floor is derived and checked from now on.** `npm run peers:floors` works it out from three
  things that can be verified — the Angular APIs the source calls, the `minVersion` markers in the
  compiled output, and the Angular types that reach the published `.d.ts` — and CI fails when a
  declaration drifts away from it again.

## [22.3.3] - 2026-09-21

### Fixed

- **`[hubIcon]` builds its sprite and image nodes instead of interpolating markup.** The `use` and
  `img` render kinds were assembled as an HTML string, so a quote inside the resolved `href`, `src`
  or `alt` closed the attribute and the rest landed in the host as markup. Packs usually compose
  those values from the icon name, and an icon name can come from the application's own data, so
  the values are now set as attributes on nodes created for the purpose.

## [22.3.2] - 2026-09-16

### Changed

- The repository moved to the `hub-env` organization. Issues for every Hub UI package are now
  gathered in [hub-env/hub-ui](https://github.com/hub-env/hub-ui/issues), and the `repository`, `bugs`
  and README links point at the new addresses. GitHub redirects the old ones.

## [22.3.1] - 2026-09-08

### Added

- **`ng-hub-ui-ds` is declared as an optional peer dependency** (`>=22.0.0`). The whole
  `--hub-icon-*` block resolves through the family's `--hub-sys-*` / `--hub-ref-*` ladder — that is
  how an icon follows the theme's ink and its dark mode without being told to — and the manifest
  said nothing about it, so a consumer reading the package on npm had no way to learn which package
  supplies those values. It is genuinely optional: every token ends in a literal fallback and the
  renderer works without it.

## [22.3.0] - 2026-09-07

### Fixed

- **A colour utility on an icon does something again.** `<hub-icon class="text-danger">` came out in
  the default ink, and so did `text-warning`, `text-success` and every other utility: the class was
  on the element, visible in the attribute, and changed nothing. The library declared its own
  `color` in a rule named `.hub-icon` — one class, exactly what a utility is — and this stylesheet
  is injected at runtime, so it always lands after the sheet the application shipped. Tied on
  specificity, decided by source order, the primitive won. It cost a confirm dialog in a real
  product the one thing that said "this destroys": the icon meant to be red and the icon meant to
  be amber computed to the same `rgb(33, 37, 41)`.

    It was never only about colour, either — `display: inline-flex` beat `.d-none` the same way, and
    would have beaten whatever utility anyone wrote next.

    Every rule the library lands on the icon element is now written through `:where()`, which matches
    the same element and contributes **zero** specificity: any declaration a consumer writes — a
    design-system utility, a class of their own, a plain `hub-icon { … }` rule — outranks the
    primitive whatever the order, and the fix holds for classes this library will never hear of. It
    is the same move, for the same reason, that `ng-hub-ui-modal` made in its 22.10.0.

    **Two consequences worth reading before upgrading** — see
    [`BREAKING_CHANGES.md`](./BREAKING_CHANGES.md).

### Changed

- **The `color` input is now also written as an inline `color`**, beside the `--hub-icon-color` it
  has always set. With the token read from a zero-specificity rule, the token alone would have lost
  to a utility class sitting on the same element — and an input written on one icon and no other is
  the more deliberate of the two. An inline style outranks any class, which puts them in that
  order. Nothing changes for an icon that carries no such class.

- **An SVG icon now takes its `fill` from `currentColor` instead of `var(--hub-icon-color)`.** The
  element's own `color` is where the token, a utility and the `color` input have already been
  resolved against each other, so reading it back is what keeps a drawn glyph and a filled path the
  same colour. Reading the token directly left an SVG on the themed value while a utility recoloured
  everything around it. Same result wherever only one of the three is in play, which is every case
  that worked before.

## [22.2.0] - 2026-09-07

### Added

- **`label` on the `[hubIcon]` directive**, the same accessible-name input `<hub-icon>` already
  had: it exposes the host as `role="img"` with that `aria-label`. Without it the icon is
  decorative, which is what the component has always done and what the directive now does too.

### Fixed

- **A screen reader no longer reads the icon's name out loud.** The directive declared nothing
  but `class="hub-icon"` on its host — no `aria-hidden`, no role, no name — so every icon drawn
  with `[hubIcon]` was an unlabelled element in the accessibility tree; and with a ligature font
  such as Material Symbols the mechanism that draws the glyph is the icon's name written as text
  inside the element, so what got announced was the word "home" sitting next to the link that
  already said Home. The text has to stay for the glyph to be drawn, so it is hidden rather than
  removed: a label-less icon is now `aria-hidden="true"`, and a labelled one is `role="img"` with
  its `aria-label`, where the ligature is ignored because the name comes from the label. This is
  what `<hub-icon>` has done since the first release; the directive had simply been left behind,
  and the two forms disagreeing was half the bug.

    **Breaking for a host carrying its own `role` / `aria-label` / `aria-hidden`** — see
    [`BREAKING_CHANGES.md`](./BREAKING_CHANGES.md).

## [22.1.3] - 2026-09-06

### Added

- **`FUNCTIONALITIES.md`** — the per-feature coverage table the rest of the ecosystem ships, so a
  reader can see what the library does and which parts a live example actually demonstrates, instead
  of inferring both from the list of examples.

### Changed

- **A name the registry cannot resolve is handed to the application's `ErrorHandler` instead of
  written straight into its console.** Both `<hub-icon>` and `[hubIcon]` caught the failure and
  called `console.error` on it, which was never the library's decision to make: an application that
  routes its errors to a reporter never received it, one that keeps a quiet console could not
  silence it, and it was printed in production builds too, where the person reading it can act on
  nothing. Angular already ships the seam, and its default `ErrorHandler` prints to the console —
  so a consumer who has configured nothing sees what they saw before, and everyone else finally
  gets a say. The icon still fails soft to an empty glyph.

### Fixed

- **The pack's `cssVars` bridge follows the pack that actually draws the icon.** `resolve()` expands
  the `pack:variant:name` shorthand, but the bridge lookup did not: it read `pack` alone, so
  `<hub-icon name="ms:home" />` was dressed with the default pack's custom properties — or with none
  — while `pack="ms"` got the right ones. Two entry points reading a different pack out of the same
  reference is the bug; both now expand it the same way. `HubIconRegistry.cssVars()` takes the icon
  name as an optional second argument to do it, so existing calls keep working. Latent for consumers
  of the shipped presets, none of which declares a bridge, and breaking for anyone who wrote a pack
  with one and used the documented shorthand.
- **The input table describes the directive too, instead of only the component.** `name` was listed
  as required for both forms, but on `[hubIcon]` it is optional and falls back to the value bound to
  the directive; and `hubIcon` — the input the usage section teaches two screens earlier — appeared
  in no table at all, so the only way to learn it existed was to read the source. The documentation
  links pointed at the site root as well, leaving the reader to hunt for the icons page; they now
  open it directly.
- **The stylesheets are reachable by the subpath the README documents.** The manifest declared no
  `exports`, so ng-packagr generated the minimal map (`.` and `./package.json`) and every sheet
  shipped in `styles/` stayed outside the package's public surface. Resolvers that fall back to the
  filesystem — the Angular CLI's Sass plugin, dart-sass's own `pkg:` importer — found them anyway,
  which is why nobody noticed; anything resolving strictly through `exports` answered
  `ERR_PACKAGE_PATH_NOT_EXPORTED` on the very line the docs tell you to write, leaving a relative
  walk into `node_modules` as the only way in. `./styles` now resolves, along with the `icon`,
  `icon-base` and `icon-theme` sheets.

## [22.1.2] - 2026-09-01

### Changed

- **The `homepage` in the manifest points at this library's own documentation page** rather than at
  the site root. It is the link a registry shows beside the package and the one a reader clicks from
  it, and landing on a front page they then have to search is a worse answer than landing on the
  reference for the package they were already looking at. Metadata only — no code, no types, no
  styles change, and nothing a consumer imports is affected.

## [22.1.1] - 2026-08-08

### Fixed

- Documentation links now point at the canonical localized URLs. The README linked to `https://hubui.dev/<path>` with no locale prefix and no trailing slash, and both forms are 301-redirected, so every reader arriving from npm or GitHub landed on a redirect instead of the canonical page.

## [22.1.0] - 2026-07-07

### Added

- **`hub-icon-theme(...)` mixin** — one-call token theming for `<hub-icon>` / `[hubIcon]`: `color`, `size`, and the variable-font axes `weight` / `fill` / `grade` / `optical-size`. Null-defaulted and additive; `@use 'ng-hub-ui-icons/styles' as *;`.

## [22.0.0] - 2026-07-01

### Added

- Initial release: an **icon-set-agnostic** icon renderer for Angular.
- `<hub-icon>` component and `[hubIcon]` directive — render an icon by `name` (+ optional `pack` / `variant`), or with the `pack:variant:name` shorthand.
- `provideHubIcons({ defaultPack, packs })` central pack registry.
- Pack factories `classPack` / `ligaturePack` / `svgPack` and built-in presets `faPack` (Font Awesome), `bootstrapPack` (Bootstrap Icons), `materialSymbolsPack` (Material Symbols) and `solarPack` (Solar). No icon set is bundled — the host app loads the set's CSS/font/SVG; the library only knows each set's naming convention.
- Abstract CSS-variable theming: `--hub-icon-size`, `--hub-icon-color` and the variable-font axes `--hub-icon-fill` / `--hub-icon-weight` / `--hub-icon-grade` / `--hub-icon-optical-size`, so one token set themes any pack uniformly.

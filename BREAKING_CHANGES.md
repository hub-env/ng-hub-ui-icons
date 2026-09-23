# Breaking Changes

This file documents breaking changes and migration steps for `ng-hub-ui-icons`.

The major version tracks the targeted Angular major, so it cannot be raised to signal a
breaking change. This file is the notice the version number cannot give.

## [22.4.0] - 2026-09-23

### Angular below 17.3.0 is no longer supported

- **Change**: the `@angular/*` peer ranges move from `>=17.1.0` to `>=17.3.0`.

- **Why**: Its published `.d.ts` names `InputSignalWithTransform` or `OutputEmitterRef`, which Angular did not ship until 17.3.

- **Impact — an application below 17.3.0 gets a peer warning where it used to get a build error.**
  Nothing that worked stops working: those versions never compiled against this package. Upgrade
  Angular to 17.3.0 or stay on the previous release.

## [22.3.0] - 2026-09-07

### The library's own rules on the icon element now carry zero specificity

**What changed.** Everything this library declares on the icon element — the `--hub-icon-*`
defaults, the box, the `color`, the spin animation — is written through `:where(.hub-icon)`
instead of `.hub-icon`. `:where()` matches the same element and contributes no specificity at
all, so the primitive no longer competes with a consumer's rule: yours wins, whatever the
source order. That is the point, and it is what makes `<hub-icon class="text-danger">` paint.

**Who is affected.** Anyone whose own styling of icons relied, knowingly or not, on the
library winning:

- **A type selector now beats the library.** `[hubIcon]` is usually applied to an `<i>` or a
  `<span>`, and a global `i { color: … }` or `span { font-size: … }` is `(0,0,1)` — more than
  zero. Sheets that carried such a rule harmlessly for years may now recolour or resize every
  icon on the page.
- **`!important` in a consumer sheet is no longer needed and no longer harmless.** Rules
  written to out-shout the primitive still win, but they now also out-shout everything the
  consumer writes later, including a variant class of their own.

**How to migrate.** Nothing to do in the normal case: an application that never styled
`.hub-icon` sees only the fix. Where an icon now takes a colour or a size it should not, the
cause is a rule of your own that was previously being ignored — narrow it to the elements it
was meant for, or drop the `!important` that is no longer buying anything:

```css
/* before — written to beat the primitive, now over-ranked and over-reaching */
.toolbar hub-icon {
	color: var(--brand) !important;
}

/* after — a plain rule is enough */
.toolbar hub-icon {
	color: var(--brand);
}
```

### An SVG icon reads its `fill` from `currentColor`

**What changed.** `.hub-icon svg` was filled with `var(--hub-icon-color)`; it is now filled
with `currentColor`, which is the element's own `color` — the value the token, a utility class
and the `color` input have already been resolved against each other to produce.

**Who is affected.** Anyone who set `--hub-icon-color` on the icon and then overrode `color`
on the same element by another route, expecting the two to disagree: the glyph followed one
and the SVG the other. They now agree, and the winner is `color`.

**How to migrate.** Set the colour once, through whichever of the three routes you prefer —
the token, a class, or the `color` input. A theme that only ever set `--hub-icon-color`
behaves exactly as before.

## [22.2.0] - 2026-09-07

### `[hubIcon]` now owns `role`, `aria-label` and `aria-hidden` on its host

**What changed.** The directive used to declare nothing but `class="hub-icon"`, leaving the
host's accessibility to whoever applied it. It now binds the three attributes `<hub-icon>` has
always bound: a label-less icon is `aria-hidden="true"`, and one with `label` is `role="img"`
carrying that `aria-label`. Because they are bindings, they replace whatever the element was
written with — a `role="button"` or an `aria-label` authored by hand is removed.

**Who is affected.** Anyone who gave the `[hubIcon]` host its accessible name — or any other
role — through attributes on the element:

```html
<!-- before: the accessible name came from the element -->
<i hubIcon name="trash" role="img" aria-label="Delete"></i>
```

That icon now ends up `aria-hidden="true"` with no role and no name, so it disappears from the
accessibility tree instead of being announced.

**How to migrate.** Move the name to the `label` input:

```html
<!-- after -->
<i hubIcon name="trash" label="Delete"></i>
```

If the element needed a role of its own — an icon that is itself the button — put the directive
on a child element instead and leave the role on the parent, where it belongs:

```html
<button type="button" aria-label="Delete"><i hubIcon name="trash"></i></button>
```

**If you do nothing.** Nothing breaks visually and nothing fails to compile; the icon is drawn
exactly as before. Only the accessibility tree changes, so the loss is silent — which is why it
is written here.

## [22.1.3] - 2026-09-06

No breaking changes for consumers of the shipped presets. `HubIconRegistry.cssVars()` gained an
optional second argument (the icon name) so the pack bridge follows the `pack:variant:name`
shorthand; existing calls keep working, but a hand-written pack declaring `cssVars` that was
used through the shorthand now receives the custom properties of the pack that actually draws
the icon rather than those of the default pack.

## [22.0.0] - 2026-07-01

Initial release. No breaking changes.

The major version starts at `22` to match the rest of the `ng-hub-ui` family, whose major always
tracks the targeted Angular major — it does not imply twenty-one earlier releases of this
library.

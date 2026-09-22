# ng-hub-ui-icons

[![npm](https://img.shields.io/npm/v/ng-hub-ui-icons.svg)](https://www.npmjs.com/package/ng-hub-ui-icons)
[![license](https://img.shields.io/npm/l/ng-hub-ui-icons.svg)](LICENSE)

> Read this in other languages: [Español](README.es.md)

Icon-set-**agnostic** icon rendering for Angular. Render **Font Awesome**, **Bootstrap Icons**, **Material Symbols**, **Solar** or your **own SVGs** through a single API — with **no hard dependency** on any icon pack. You load the set's CSS/font/SVG in your app; `ng-hub-ui-icons` only knows each set's naming convention and themes them uniformly through `--hub-icon-*` CSS variables.

Part of the [ng-hub-ui](https://hubui.dev/en/) ecosystem.

## Documentation and Live Examples

Full documentation: **[hubui.dev/en/icons/overview/](https://hubui.dev/en/icons/overview/)** · Interactive examples: **[hubui.dev/en/icons/examples/](https://hubui.dev/en/icons/examples/)**

Issues, roadmap and contributing guide: **[github.com/hub-env/hub-ui](https://github.com/hub-env/hub-ui)**

## 🚀 Quick Start

### 1. Install

```bash
npm install ng-hub-ui-icons
```

Then load the icon set(s) you want in your app as usual — see [Supported icon sets](#-supported-icon-sets) for each set's link and stylesheet. This library does **not** ship any icon assets.

### 2. Register your packs

```ts
import { ApplicationConfig } from '@angular/core';
import { provideHubIcons, faPack, bootstrapPack, materialSymbolsPack, solarPack } from 'ng-hub-ui-icons';

export const appConfig: ApplicationConfig = {
	providers: [
		provideHubIcons({
			defaultPack: 'fa',
			packs: {
				fa: faPack({ defaultVariant: 'solid' }),
				bi: bootstrapPack(),
				ms: materialSymbolsPack({ variant: 'outlined' }),
				solar: solarPack({ variant: 'linear' })
			}
		})
	]
};
```

### 3. Use it

```html
<!-- default pack (fa) -->
<hub-icon name="house" />

<!-- explicit pack / variant -->
<hub-icon name="house" pack="bi" />
<hub-icon name="home" pack="ms" variant="rounded" />

<!-- pack:variant:name shorthand -->
<hub-icon name="fa:brands:github" label="GitHub" />

<!-- size & color, accessible label -->
<hub-icon name="trash" color="var(--hub-sys-color-danger)" size="1.5rem" label="Delete" />
```

## 🎨 Supported icon sets

The library bundles **no** icon assets — it ships a thin preset per popular set and you load that set's stylesheet once in your app (`index.html` or global styles). Browse the set, pick names from it, and register its preset in `provideHubIcons`.

| Set | Preset | Browse icons | Add to your app (load once) |
| --- | --- | --- | --- |
| **Font Awesome** 6 | `faPack()` | [fontawesome.com/icons](https://fontawesome.com/icons) | `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.1/css/all.min.css">` |
| **Bootstrap Icons** | `bootstrapPack()` | [icons.getbootstrap.com](https://icons.getbootstrap.com/) | `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">` |
| **Material Symbols** | `materialSymbolsPack()` | [fonts.google.com/icons](https://fonts.google.com/icons) | `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200">` |
| **Solar** | `solarPack()` | [icon-sets.iconify.design/solar](https://icon-sets.iconify.design/solar/) | No webfont — load via [Iconify CSS](https://iconify.design/docs/usage/css/): `<link rel="stylesheet" href="https://api.iconify.design/solar.css?icons=home-bold,star-bold">` and point the pack `template` at the `.icon--solar--<name>-<variant>` classes (or use `svgPack`). |

### Bring your own set

Any other source works without a preset:

- **Class-based** webfont → [`classPack`](#custom-packs) with a `template` that builds its class names.
- **Ligature-based** font → `ligaturePack`.
- **Inline SVG** → `svgPack({ map })` (your own artwork, no third-party set).
- **SVG sprite** → a pack returning `{ kind: 'use', href: '#id' }` (or `assets/sprite.svg#id`).
- **Images** (flags, logos, emoji) → a pack returning `{ kind: 'img', src, alt }`.

> `size` themes every mode; `color` themes glyphs and `currentColor`/mask SVGs, but not raster images.

## 📦 Description

`ng-hub-ui-icons` decouples *how you reference an icon* from *which icon set draws it*. A **pack** is a pure resolver `(name, variant?) → render spec`; the library ships factories and presets for the popular sets but bundles none of them, so your bundle stays lean and you can mix sets freely. One `--hub-icon-*` token set themes every pack the same way.

## 🎯 Features

- **Agnostic** — Font Awesome, Bootstrap Icons, Material Symbols (ligature + variable-font axes), Solar, sprites, inline SVG and `<img>` — all behind one API.
- **Zero icon dependencies** — no fonts/SVGs bundled; you load the set, the library formats it.
- **Component & directive** — `<hub-icon>` for standalone icons, `[hubIcon]` to decorate your own element.
- **Central registry** — `provideHubIcons({ defaultPack, packs })`; per-call `pack` / `variant` overrides, plus the `pack:variant:name` shorthand.
- **Uniform theming** — `--hub-icon-size` / `--hub-icon-color` (+ variable-font axes) work across every set.
- **Accessible** — `label` exposes `role="img"` + `aria-label`; label-less icons are `aria-hidden`.
- **Composable packs** — `classPack` / `ligaturePack` / `svgPack` factories for any custom set, plus sprite (`use`) and image (`img`) render modes.

## ⚙️ Usage

### Component

```html
<hub-icon name="house" />
<hub-icon name="house" pack="bi" />
<hub-icon name="home" pack="ms" variant="sharp" />
<hub-icon name="spinner" spin label="Loading" />
```

### Directive

Decorate an element you own — the directive keeps your classes and only manages the pack-resolved ones:

```html
<i class="me-2" hubIcon name="house"></i>
<span [hubIcon]="'home'" pack="ms" variant="rounded"></span>

<!-- an icon that carries meaning on its own -->
<i hubIcon name="trash" label="Delete"></i>
```

> For directive-only usage (no `<hub-icon>` rendered anywhere), include the base styles once: `@use 'ng-hub-ui-icons/styles' as *;`.

### Custom packs

```ts
import { provideHubIcons, classPack, svgPack } from 'ng-hub-ui-icons';

provideHubIcons({
	defaultPack: 'app',
	packs: {
		// any class-based set
		myset: classPack({ template: (name, variant) => `ms ms-${variant ?? 'line'}-${name}`, defaultVariant: 'line' }),
		// your own inline SVGs
		app: svgPack({ map: { logo: '<svg viewBox="0 0 24 24">…</svg>' } })
	}
});
```

### Theming

Every pack reads the same tokens, so you theme once:

```css
.toolbar hub-icon {
	--hub-icon-size: 1.25rem;
	--hub-icon-color: var(--hub-sys-text-muted);
}

/* Material Symbols variable-font axes */
.filled hub-icon {
	--hub-icon-fill: 1;
	--hub-icon-weight: 600;
}
```

A plain colour utility works too — the design system's `.text-danger`, or a class of your own — because
every rule this library writes on the icon element is zero-specificity, so yours wins whatever the order:

```html
<hub-icon name="triangle-exclamation" class="text-danger" />
```

### Icons in other components

No adapter needed — just project a `<hub-icon>` as content. For example, inside an `ng-hub-ui` button the icon's side follows the markup order:

```html
<button hubButton><hub-icon name="floppy-disk" /> Save</button>
<button hubButton>Next <hub-icon name="arrow-right" /></button>
```

## 🔧 API

### `<hub-icon>` / `[hubIcon]` inputs

| Input | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `name` | `string` | — | Icon name. Accepts the `pack:variant:name` / `pack:name` shorthand. Required on `<hub-icon>`; on `[hubIcon]` it is optional and falls back to the value bound to the directive. |
| `hubIcon` | `string` | `''` | Icon name bound through the directive attribute itself (`[hubIcon]="'house'"`); `name` wins when both are set. _(directive only)_ |
| `pack` | `string` | `defaultPack` | Pack key; overrides a shorthand pack. |
| `variant` | `string` | pack default | Variant; overrides a shorthand variant. |
| `size` | `string` | `1em` | Per-instance size (`--hub-icon-size`). _(component only)_ |
| `color` | `string` | `currentColor` | Per-instance color, written to the host as both `--hub-icon-color` and an inline `color`, so it outranks a colour utility on the same element. _(component only)_ |
| `label` | `string` | — | Accessible label (`role="img"` + `aria-label`); without it the icon is `aria-hidden="true"`. |
| `spin` | `boolean` | `false` | Continuously rotate. _(component only)_ |

### Packs

`faPack(options?)` · `bootstrapPack()` · `materialSymbolsPack(options?)` · `solarPack(options?)` — built-in presets.
`classPack(options)` · `ligaturePack(options)` · `svgPack(options)` — generic factories for any set.

## 🎨 Styling tokens

| Token | Default | Description |
| ----- | ------- | ----------- |
| `--hub-icon-size` | `1em` | Glyph font-size / SVG width & height |
| `--hub-icon-color` | `currentColor` | Glyph color, and the SVG fill through it. Applied from a zero-specificity rule, so a colour utility or any rule of your own on the same element wins over it. |
| `--hub-icon-fill` | `0` | Material Symbols `FILL` axis |
| `--hub-icon-weight` | `400` | Material Symbols `wght` axis |
| `--hub-icon-grade` | `0` | Material Symbols `GRAD` axis |
| `--hub-icon-optical-size` | `24` | Material Symbols `opsz` axis |

## ♿ Accessibility

Pass `label` for meaningful icons (rendered as `role="img"` with `aria-label`). Omit it for decorative icons, which are automatically `aria-hidden="true"`. Both forms behave the same way: `<hub-icon>` and `[hubIcon]`.

Hiding the decorative case matters more than it looks with ligature fonts such as Material Symbols, where the glyph is drawn from the icon's name written as text inside the element — hidden, it is a drawing; exposed, a screen reader reads "home" beside the link that already says Home.

Because the directive owns `role`, `aria-label` and `aria-hidden` on its host, write the accessible name through `label` rather than as an attribute on the element. An icon that is itself the control belongs inside the control, which keeps its own role and name:

```html
<button type="button" aria-label="Delete"><i hubIcon name="trash"></i></button>
```

## 📊 Changelog

See [CHANGELOG.md](CHANGELOG.md).

## 💼 Commercial support

These libraries are maintained by [Carlos Morcillo Fernández](https://www.carlosmorcillo.com), a freelance frontend architect working with teams that build and maintain Angular applications.

If your team depends on Hub-UI and needs more than an issue thread can solve, that is my day job: architecture audits, design systems, Angular migrations and team mentoring. For projects that also need design and a full team, I run them through [Frog Hub](https://froghub.es), my development studio.

Have a look at [the services](https://www.carlosmorcillo.com/en/services/) or [tell me about your project](https://www.carlosmorcillo.com/en/contact/).

## 📄 License

MIT © [Carlos Morcillo Fernández](https://www.carlosmorcillo.com)

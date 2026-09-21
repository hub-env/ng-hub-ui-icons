import { Directive, effect, ElementRef, ErrorHandler, inject, input } from '@angular/core';
import { HubIconClassesSpec } from '../models/icon-render-spec';
import { HubIconRegistry } from '../services/icon-registry.service';

/** Namespace every SVG node has to be created in to render at all. */
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

/**
 * Decorates a host element (`<i>`, `<span>`…) so it renders an icon from any
 * registered pack — the directive form of {@link HubIconComponent}. Use it when
 * you want to own the host element (and its other classes / attributes) while
 * delegating the icon rendering.
 *
 * The icon name comes from `[hubIcon]` or the `name` input (which wins). The
 * directive keeps the host's own classes intact, only adding/removing the
 * pack-resolved ones across changes.
 *
 * Accessibility follows {@link HubIconComponent}: decorative unless `label` is
 * set. The host therefore owns `role`, `aria-label` and `aria-hidden` — write
 * the accessible name through `label`, not as an attribute on the element.
 *
 * @example
 * ```html
 * <i hubIcon name="house"></i>
 * <span [hubIcon]="'home'" pack="ms" variant="rounded"></span>
 * <button type="button"><i hubIcon name="trash" label="Delete"></i></button>
 * ```
 */
@Directive({
	selector: '[hubIcon]',
	host: {
		class: 'hub-icon',
		'[attr.role]': 'label() ? "img" : null',
		'[attr.aria-label]': 'label() || null',
		'[attr.aria-hidden]': 'label() ? null : "true"'
	}
})
export class HubIconDirective {
	readonly #registry = inject(HubIconRegistry);
	readonly #host = inject(ElementRef<HTMLElement>);
	readonly #errorHandler = inject(ErrorHandler);

	/** Icon name via the directive attribute: `[hubIcon]="'house'"`. */
	readonly hubIcon = input<string>('');

	/** Icon name via an explicit input: `name="house"`. Takes precedence. */
	readonly name = input<string>('');

	/** Pack key. Overrides a shorthand pack and the configured `defaultPack`. */
	readonly pack = input<string>();

	/** Variant. Overrides a shorthand variant and the pack default. */
	readonly variant = input<string>();

	/**
	 * Accessible label. When set, the host is exposed as `role="img"` with this
	 * `aria-label`; when omitted the icon is decorative (`aria-hidden="true"`).
	 *
	 * Hiding the decorative case is what keeps the ligature text out of the
	 * accessibility tree: a font that draws its glyph from a ligature needs that
	 * text in the DOM, so it cannot be removed — only hidden.
	 */
	readonly label = input<string>();

	/** Pack-resolved classes applied on the previous render, removed before the next. */
	#applied: string[] = [];

	constructor() {
		effect(() => {
			const reference = this.name() || this.hubIcon();
			const el = this.#host.nativeElement;

			// Remove classes we added last time, leaving the host's own intact.
			if (this.#applied.length) {
				el.classList.remove(...this.#applied);
				this.#applied = [];
			}

			if (!reference) {
				el.textContent = '';
				return;
			}

			let spec;

			// The failure goes to the application's `ErrorHandler`, not to the console: an
			// unresolvable icon is the consuming application's bug and belongs wherever that
			// application already routes its errors, which a library cannot decide for it.
			try {
				spec = this.#registry.resolve(reference, this.pack(), this.variant());
			} catch (error) {
				this.#errorHandler.handleError(error);
				el.textContent = '';
				return;
			}

			this.#applyCssVars(el, reference);

			switch (spec.kind) {
				case 'classes': {
					const classes = (spec as HubIconClassesSpec).classes.split(/\s+/).filter(Boolean);
					if (classes.length) {
						el.classList.add(...classes);
						this.#applied = classes;
					}
					el.textContent = (spec as HubIconClassesSpec).text ?? '';
					break;
				}
				case 'svg':
					el.innerHTML = spec.svg;
					break;
				case 'use': {
					// Built as nodes rather than interpolated into markup: `href` is
					// composed from the icon name, which a consumer may well take from
					// its own data, and a quote in that string would otherwise escape
					// the attribute and land arbitrary markup in the host.
					const doc = el.ownerDocument;
					const svg = doc.createElementNS(SVG_NAMESPACE, 'svg');
					svg.setAttribute('class', 'hub-icon__svg');
					svg.setAttribute('focusable', 'false');
					svg.setAttribute('aria-hidden', 'true');
					const use = doc.createElementNS(SVG_NAMESPACE, 'use');
					use.setAttribute('href', spec.href);
					svg.appendChild(use);
					el.textContent = '';
					el.appendChild(svg);
					break;
				}
				case 'img': {
					const img = el.ownerDocument.createElement('img');
					img.setAttribute('class', 'hub-icon__img');
					img.setAttribute('src', spec.src);
					img.setAttribute('alt', spec.alt ?? '');
					el.textContent = '';
					el.appendChild(img);
					break;
				}
			}
		});
	}

	/** Applies the active pack's optional CSS-variable bridge to the host. */
	#applyCssVars(el: HTMLElement, reference: string): void {
		const vars = this.#registry.cssVars(this.pack(), reference);

		if (!vars) {
			return;
		}

		for (const [key, value] of Object.entries(vars)) {
			el.style.setProperty(key, value);
		}
	}
}

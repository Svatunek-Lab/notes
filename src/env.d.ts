/// <reference types="astro/client" />

// Starlight provides `Astro.locals.starlightRoute` at runtime.
// Declare it here so TypeScript tooling understands the shape.
declare global {
	namespace App {
		interface Locals {
			starlightRoute: {
				head: Array<{ tag: string; attrs?: Record<string, any>; content?: string }>;
				entry?: any;
			};
		}
	}
}

export {};

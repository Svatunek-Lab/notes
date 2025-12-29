import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import starlight from "@astrojs/starlight";

const SITE = "https://notes.svatunek-lab.com";
const BASE = "";

export default defineConfig({
  // Used by integrations like `@astrojs/sitemap` to generate absolute URLs.
  site: SITE,
  base: BASE,



  integrations: [
    starlight({
      title: "Notes - Svatunek // Lab",
      // Work around head-merging crashes by ensuring `head` is always an array.
      head: [],
      // Hide the right-side “On this page” panel.
      tableOfContents: false,
      // Remove footer previous/next navigation.
      pagination: false,
      customCss: ['./src/starlight-overrides.css', './src/styles.css'],
      components: {
        Head: './src/components/starlight/Head.astro',
        SiteTitle: './src/components/starlight/SiteTitle.astro',
        Sidebar: './src/components/starlight/Sidebar.astro',
        PageTitle: './src/components/starlight/PageTitle.astro',
      },
      // Starlight uses `src/content/docs/` by default.
      // Keep defaults for now;
    }),
    // Must come after Starlight so its Expressive Code integration runs before MDX.
    mdx(),
  ],
  markdown: {
    syntaxHighlight: "shiki",
  },
});

import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import starlight from "@astrojs/starlight";

const SITE = "https://<user>.github.io";
const BASE = "/<repo>";

export default defineConfig({
  // Used by integrations like `@astrojs/sitemap` to generate absolute URLs.
  // Set `SITE` in your environment for production
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
      sidebar: [
        { label: 'Latest', link: '/latest/' },
        { label: 'Notes', link: '/notes/' },
        { label: 'Whitepapers', link: '/whitepapers/' },
        { label: 'Tutorials', link: '/tutorials/' },
        { label: 'Posts', link: '/posts/' },
      ],
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

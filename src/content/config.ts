import { z, defineCollection } from 'astro:content';
import { docsSchema } from '@astrojs/starlight/schema';

const base = {
  title: z.string(),
  // YAML like `date: 2025-12-01` is parsed as a Date object.
  date: z.union([z.string(), z.date()]).optional(),
  author: z.string().optional(),
  abstract: z.string().optional(),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
};

export const notes = defineCollection({
  schema: z.object({
    ...base,
  }),
});

export const posts = defineCollection({
  schema: z.object({
    ...base,
  }),
});

export const tutorials = defineCollection({
  schema: z.object({
    ...base,
  }),
});

export const whitepapers = defineCollection({
  schema: z.object({
    ...base,
    version: z.string().optional(),
  }),
});

export const docs = defineCollection({
  schema: docsSchema({
    extend: z.object({
      // Add our custom fields to Starlight's schema
      date: z.union([z.string(), z.date()]).optional(),
      author: z.string().optional(),
      abstract: z.string().optional(),
      tags: z.union([z.array(z.string()), z.string()]).optional(),
      version: z.string().optional(),
    }),
  }),
});

export const collections = {
  docs,
};

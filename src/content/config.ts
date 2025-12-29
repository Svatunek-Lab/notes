import { z, defineCollection } from 'astro:content';

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
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    // Support non-doc content migrated into Starlight.
    // YAML like `date: 2025-12-01` is parsed as a Date object.
    date: z.union([z.string(), z.date()]).optional(),
    author: z.string().optional(),
    abstract: z.string().optional(),
    tags: z.union([z.array(z.string()), z.string()]).optional(),
    version: z.string().optional(),
    // Starlight merges `data.head` into the final <head> config.
    // Ensure it's always an array to avoid runtime crashes.
    head: z.array(z.unknown()).default([]),
    // Starlight's nav builder expects `sidebar` to exist.
    sidebar: z
      .object({
        hidden: z.boolean().optional(),
      })
      .default({}),
  }),
});

export const collections = {
  docs,
};

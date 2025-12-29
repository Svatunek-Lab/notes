export function parseWhitepaperId(id: string): { slug: string; version: string } {
  // Expected: <slug>--<version>.md (or .mdx)
  const [slug = '', versionPart = ''] = id.split('--');
  const version = versionPart.replace(/\.(md|mdx)$/i, '');
  return { slug, version };
}

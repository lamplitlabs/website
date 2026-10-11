/**
 * Free-text filter for the product grid. Case-insensitive, diacritic-folded
 * substring match on name, title (the tagline shown under the name on each
 * card), description, tags (the chips shown on each card) and longDescription
 * (the fuller body copy on each product's detail page), so a user can type
 * "ai", "AI Agents", part of a tool's name or a word that only appears on the
 * detail page (e.g. "doctors") instead of hunting through category tabs.
 * Several products use German/accented vocabulary (e.g. "Kenntnisprüfung",
 * "Einbürgerungstest"); folding diacritics lets a visitor who types the
 * plain-ASCII spelling ("prufung") still find the product. Blank queries
 * match everything.
 */
export type SearchableProduct = {
  name: string;
  title?: string;
  description: string;
  tags?: string[];
  longDescription?: string;
};

function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function matchesProductQuery(
  product: SearchableProduct,
  query: string
): boolean {
  const q = fold(query.trim());
  if (!q) return true;
  return (
    fold(product.name).includes(q) ||
    fold(product.title ?? "").includes(q) ||
    fold(product.description).includes(q) ||
    (product.tags ?? []).some((tag) => fold(tag).includes(q)) ||
    fold(product.longDescription ?? "").includes(q)
  );
}

export function filterProductsByQuery<T extends SearchableProduct>(
  products: T[],
  query: string
): T[] {
  return products.filter((product) => matchesProductQuery(product, query));
}
/** URL query parameter that mirrors the search box (`/?q=ai`). */
export const SEARCH_QUERY_PARAM = "q";

/**
 * Write the search query into a URL's `?q=` so a searched view can be
 * reloaded or shared. A blank query removes the param. Pure so it is testable
 * without a DOM; the grid passes `new URL(window.location.href)`.
 */
export function withSearchQueryParam(url: URL, query: string): URL {
  const next = new URL(url.href);
  const q = query.trim();
  if (q) next.searchParams.set(SEARCH_QUERY_PARAM, q);
  else next.searchParams.delete(SEARCH_QUERY_PARAM);
  return next;
}

/**
 * Free-text filter for the product grid. Case-insensitive substring match on
 * name, title (the tagline shown under the name on each card), description and
 * tags (the chips shown on each card), so a user can
 * type "ai", "AI Agents" or part of a tool's name instead of hunting through
 * category tabs. Blank queries match everything.
 */
export type SearchableProduct = {
  name: string;
  title?: string;
  description: string;
  tags?: string[];
};

export function matchesProductQuery(
  product: SearchableProduct,
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    product.name.toLowerCase().includes(q) ||
    (product.title ?? "").toLowerCase().includes(q) ||
    product.description.toLowerCase().includes(q) ||
    (product.tags ?? []).some((tag) => tag.toLowerCase().includes(q))
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

/**
 * Free-text filter for the product grid. Case-insensitive, diacritic-folded
 * substring match on name, title (the tagline shown under the name on each
 * card), description, tags (the chips shown on each card) and longDescription
 * (the fuller body copy on each product's detail page) and highlights (the
 * "Key Features" titles and descriptions on the detail page), so a user can type
 * "ai", "AI Agents", part of a tool's name or a word that only appears on the
 * detail page (e.g. "doctors") instead of hunting through category tabs.
 * Several products use German/accented vocabulary (e.g. "Kenntnisprüfung",
 * "Einbürgerungstest"); folding diacritics lets a visitor who types the
 * plain-ASCII spelling ("prufung") still find the product. Blank queries
 * match everything.
 *
 * Multi-word queries are matched word by word: the folded query is split on
 * whitespace and a product matches when EVERY word is a substring of at least
 * one of those fields (AND, not OR). So "Security Azure" finds Azure
 * Compliance Matrix even though the words come from different chips and in a
 * different order, while "Azure zzqxnosuch" finds nothing. A single-word query
 * behaves exactly like a plain substring match.
 *
 * Results are ranked: products whose NAME contains more of the query words
 * come first, so typing "azure" or a tool's name puts that tool at the top
 * instead of below products that only mention the word in their description
 * or Key Features. Among products with the same number of name matches, those
 * whose tags (the chips on each card) exactly match more of the query words
 * come next, so "security" lists Security-tagged products before products
 * that only mention security in their description. The sort is stable, so
 * products that rank equally (and every product for a blank query) keep their
 * catalogue order.
 *
 * Keep this module free of npm imports: an evolve fixture imports it directly
 * with Node type stripping.
 */
export type SearchableProduct = {
  name: string;
  title?: string;
  description: string;
  tags?: string[];
  longDescription?: string;
  highlights?: { title: string; description: string }[];
};

function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function searchableText(product: SearchableProduct): string[] {
  return [
    product.name,
    product.title ?? "",
    product.description,
    ...(product.tags ?? []),
    product.longDescription ?? "",
    ...(product.highlights ?? []).flatMap((h) => [h.title, h.description]),
  ].map(fold);
}

export function matchesProductQuery(
  product: SearchableProduct,
  query: string
): boolean {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const fields = searchableText(product);
  return words.every((word) => fields.some((field) => field.includes(word)));
}

export function filterProductsByQuery<T extends SearchableProduct>(
  products: T[],
  query: string
): T[] {
  const words = fold(query).split(/\s+/).filter(Boolean);
  const matches = products.filter((product) => matchesProductQuery(product, query));
  if (words.length === 0) return matches;
  const nameHits = (product: SearchableProduct) => {
    const name = fold(product.name);
    return words.filter((word) => name.includes(word)).length;
  };
  // A tag "matches" a query word when the word is the whole tag or one whole
  // word of it ("ai" hits "AI" and "Sovereign AI", not "Training"), so short
  // words do not rank every chip that merely contains them.
  const tagHits = (product: SearchableProduct) => {
    const tagWords = new Set(
      (product.tags ?? []).flatMap((tag) => {
        const folded = fold(tag).trim();
        return [folded, ...folded.split(/\s+/)];
      })
    );
    return words.filter((word) => tagWords.has(word)).length;
  };
  return matches
    .map((product, index) => ({
      product,
      index,
      hits: nameHits(product),
      tags: tagHits(product),
    }))
    .sort((a, b) => b.hits - a.hits || b.tags - a.tags || a.index - b.index)
    .map(({ product }) => product);
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

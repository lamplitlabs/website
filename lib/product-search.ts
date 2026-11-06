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
 * plain-ASCII spelling ("prufung") still find the product. Letters that NFD
 * does not split into base + accent are spelled out too (ß→ss, æ→ae, ø→o,
 * đ→d, ł→l), so "strasse" finds copy that says "Straße". Blank queries
 * match everything.
 *
 * Punctuation inside the copy is optional for the visitor: each field is also
 * matched with every character that is not a letter, digit or whitespace
 * removed, so "drawio" finds "Draw.io", "ondevice" finds "On-device" and
 * "selfhosted" finds "self-hosted". The punctuated spelling still matches the
 * original field. Each field is matched a third time with spaces removed as
 * well, so a product name typed joined, the way it appears in a hashtag
 * ("edmxtools", "lamplitlight", "azurecompliancematrix"), still finds it.
 *
 * Multi-word queries are matched word by word: the folded query is split on
 * whitespace and hyphens (so a product's URL slug such as
 * "leben-in-deutschland" or "azure-compliance-matrix" is searched as its
 * words) and a product matches when EVERY word is a substring of at least
 * one of those fields (AND, not OR). So "Security Azure" finds Azure
 * Compliance Matrix even though the words come from different chips and in a
 * different order, while "Azure zzqxnosuch" finds nothing. A single-word query
 * behaves exactly like a plain substring match.
 *
 * Results are ranked: products whose NAME contains more of the query words
 * come first (a name typed joined, "edmxtools", counts as a name match), so
 * typing "azure" or a tool's name puts that tool at the top
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

// Letters NFD does not decompose into base + combining mark, spelled the way
// a visitor without the key types them ("strasse" for "Straße").
const LETTER_FOLDS: Record<string, string> = {
  ß: "ss",
  æ: "ae",
  ø: "o",
  đ: "d",
  ł: "l",
  œ: "oe",
  ð: "d",
  þ: "th",
};

function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[ßæøđłœðþ]/g, (letter) => LETTER_FOLDS[letter]);
}

// Punctuation that joins compound words in the copy ("Draw.io", "On-device",
// "self-hosted", "Encoder/Decoder", "A1–C2"). Each field is also matched with
// it removed, so a visitor who types "drawio" or "selfhosted" still finds it.
const JOINING_PUNCTUATION = /[^\p{L}\p{N}\s]+/gu;

// Everything that is not a letter or digit, spaces included: a field matched
// with these removed lets "edmxtools" find "EDMX Tools".
const NON_ALPHANUMERIC = /[^\p{L}\p{N}]+/gu;

// The folded query split into the words that must all match. Hyphens split
// like spaces, so a slug ("azure-compliance-matrix") is searched as its words.
function queryWords(query: string): string[] {
  return fold(query).split(/[\s-]+/).filter(Boolean);
}

function searchableText(product: SearchableProduct): string[] {
  const fields = [
    product.name,
    product.title ?? "",
    product.description,
    ...(product.tags ?? []),
    product.longDescription ?? "",
    ...(product.highlights ?? []).flatMap((h) => [h.title, h.description]),
  ].map(fold);
  return [
    ...fields,
    ...fields.map((field) => field.replace(JOINING_PUNCTUATION, "")),
    ...fields.map((field) => field.replace(NON_ALPHANUMERIC, "")),
  ];
}

export function matchesProductQuery(
  product: SearchableProduct,
  query: string
): boolean {
  const words = queryWords(query);
  if (words.length === 0) return true;
  const fields = searchableText(product);
  return words.every((word) => fields.some((field) => field.includes(word)));
}

export function filterProductsByQuery<T extends SearchableProduct>(
  products: T[],
  query: string
): T[] {
  const words = queryWords(query);
  const matches = products.filter((product) => matchesProductQuery(product, query));
  if (words.length === 0) return matches;
  // The name is also tested with every non-alphanumeric removed (the same
  // fold the joined-name match uses), so "edmxtools" is a name hit for
  // "EDMX Tools" and puts it above products that only mention the words.
  const nameHits = (product: SearchableProduct) => {
    const name = fold(product.name);
    const joined = name.replace(NON_ALPHANUMERIC, "");
    return words.filter((word) => name.includes(word) || joined.includes(word))
      .length;
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

export type ProductQuerySuggestion<T> = {
  /**
   * The visitor's query with one word dropped, as they spelled it, or with
   * each misspelled word replaced by the catalogue word one edit away.
   */
  query: string;
  /**
   * The word that was dropped, or the misspelled word(s) that were replaced
   * (space-separated, as typed).
   */
  dropped: string;
  /** filterProductsByQuery(products, query): never empty. */
  products: T[];
};

/**
 * "Did you mean" fallback for a query that matches nothing. A visitor who adds
 * one stray or misspelled word to a good query ("drawio zzz", "azure
 * complianse") gets "No products match" from the strict AND match above. This
 * retries the query with each whitespace-separated word dropped in turn and
 * returns the narrowest retry that still matches something (ties drop the
 * later word, since a typo is usually the last thing typed). It returns null
 * when the query already matches or no single drop helps.
 *
 * A single word of 5+ letters that matches nothing ("complance",
 * "secruity") is treated as a typo instead: it is compared with every word in
 * the catalogue copy, and a word within one edit (one letter
 * missing, extra or changed, or two neighbouring letters swapped) is
 * suggested, with `dropped` holding the misspelled word. Among several such
 * words the one that lists the most products wins (ties keep the first word
 * found in catalogue order). Shorter words are not corrected, and nothing is
 * suggested when no catalogue word is one edit away.
 *
 * In a multi-word query the same correction is tried first on every word of
 * 5+ letters that matches nothing on its own ("azure complianse" suggests
 * "azure compliance", "secruity complance" suggests "security compliance"),
 * keeping the other words as typed. When the corrected query still matches
 * nothing because of a junk word as well ("azure complianse zzqx"), the
 * corrections are kept and one uncorrected word is dropped ("azure
 * compliance"; `dropped` lists the misspelled words, then the dropped one).
 * Only when no correction helps does it fall back to dropping a word.
 *
 * filterProductsByQuery itself stays strict ("Azure zzqxnosuch" finds
 * nothing): the grid shows these products under an explicit hint instead.
 */
export function suggestProductQuery<T extends SearchableProduct>(
  products: T[],
  query: string
): ProductQuerySuggestion<T> | null {
  const terms = query.trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return null;
  if (filterProductsByQuery(products, query).length > 0) return null;
  if (terms.length === 1) return suggestSpelling(products, terms[0], []);
  // Correct misspelled words before dropping any: "azure complianse" should
  // become "azure compliance", not "azure". A word is corrected only when it
  // matches nothing on its own, and only to a catalogue word that still
  // matches together with the words already known to be good.
  const corrected = [...terms];
  const replaced: string[] = [];
  const matchesAlone = (word: string) =>
    filterProductsByQuery(products, word).length > 0;
  terms.forEach((term, index) => {
    if (matchesAlone(term)) return;
    const context = corrected.filter(
      (word, i) => i !== index && matchesAlone(word)
    );
    const fix = suggestSpelling(products, term, context);
    if (!fix) return;
    corrected[index] = fix.query;
    replaced.push(term);
  });
  if (replaced.length > 0) {
    const retry = corrected.join(" ");
    const matches = filterProductsByQuery(products, retry);
    if (matches.length > 0) {
      return { query: retry, dropped: replaced.join(" "), products: matches };
    }
    // A typo and a junk word together ("azure complianse zzqx"): keep the
    // corrections and drop one word that was not corrected, so the hint reads
    // "azure compliance" instead of nothing.
    const fixedThenDropped = narrowestDrop(
      products,
      corrected,
      (index) => corrected[index] !== terms[index]
    );
    if (fixedThenDropped) {
      return {
        ...fixedThenDropped,
        dropped: [...replaced, fixedThenDropped.dropped].join(" "),
      };
    }
  }
  return narrowestDrop(products, terms, () => false);
}

// The query with one word of `terms` dropped (skipping indexes `keep` says to
// keep) that matches the fewest products, ties dropping the later word; null
// when no single drop matches anything.
function narrowestDrop<T extends SearchableProduct>(
  products: T[],
  terms: string[],
  keep: (index: number) => boolean
): ProductQuerySuggestion<T> | null {
  let best: ProductQuerySuggestion<T> | null = null;
  terms.forEach((dropped, index) => {
    if (keep(index)) return;
    const retry = terms.filter((_, i) => i !== index).join(" ");
    const matches = filterProductsByQuery(products, retry);
    if (matches.length === 0) return;
    if (!best || matches.length <= best.products.length) {
      best = { query: retry, dropped, products: matches };
    }
  });
  return best;
}

// Shortest misspelled word suggestProductQuery tries to correct.
const MIN_TYPO_LENGTH = 5;

// True when a and b differ by exactly one insertion, deletion, substitution
// or swap of two neighbouring letters (Damerau-Levenshtein distance 1).
function isOneEditApart(a: string, b: string): boolean {
  if (a === b || Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  if (a.length === b.length) {
    if (a.slice(i + 1) === b.slice(i + 1)) return true;
    return a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2);
  }
  const [shorter, longer] = a.length < b.length ? [a, b] : [b, a];
  return shorter.slice(i) === longer.slice(i + 1);
}

// The catalogue word one edit away from `term` that, searched together with
// the `context` words, lists the most products (null when none does).
function suggestSpelling<T extends SearchableProduct>(
  products: T[],
  term: string,
  context: string[]
): ProductQuerySuggestion<T> | null {
  const word = fold(term);
  if (word.length < MIN_TYPO_LENGTH) return null;
  const vocabulary = new Set(
    products.flatMap((product) =>
      searchableText(product).flatMap((field) => field.split(/[^\p{L}\p{N}]+/u))
    )
  );
  let best: ProductQuerySuggestion<T> | null = null;
  for (const candidate of vocabulary) {
    if (!isOneEditApart(word, candidate)) continue;
    const matches = filterProductsByQuery(
      products,
      [...context, candidate].join(" ")
    );
    if (matches.length === 0) continue;
    if (!best || matches.length > best.products.length) {
      best = { query: candidate, dropped: term, products: matches };
    }
  }
  return best;
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

/**
 * Free-text filter for the product grid. Case-insensitive, diacritic-folded
 * substring match on name, title (the tagline shown under the name on each
 * card), description, tags (the chips shown on each card) and longDescription
 * (the fuller body copy on each product's detail page) and highlights (the
 * "Key Features" titles and descriptions on the detail page), category (the
 * tab a product sits under, e.g. "Education") and status (the badge on each
 * card, "Live" or "In development"), so a user can type "ai", "AI Agents",
 * part of a tool's name, a word that only appears on the detail page (e.g.
 * "doctors") or a label they see on the page ("education", "in development")
 * instead of hunting through category tabs.
 * Several products use German/accented vocabulary (e.g. "Kenntnisprüfung",
 * "Einbürgerungstest"); folding diacritics lets a visitor who types the
 * plain-ASCII spelling ("prufung") still find the product. Letters that NFD
 * does not split into base + accent are spelled out too (ß→ss, æ→ae, ø→o,
 * đ→d, ł→l), so "strasse" finds copy that says "Straße". A field with ä, ö
 * or ü is also matched with them spelled out the German way (ae, oe, ue), so
 * "kenntnispruefung", "einbuergerungstest" and "buergeramt" find their
 * products too. Blank queries match everything, and so does a query that is
 * only punctuation.
 *
 * Quotes, brackets and sentence punctuation around a query word are ignored:
 * '"Eszett"', "(AI)", "azure?" and "edmx tools." find what the bare words
 * find. Marks inside a word ("draw.io") are kept.
 *
 * A query word of 5+ letters ending in -ing or -ed also matches its base verb
 * (see wordForms), so "learning", "tested" and "developing" find what
 * "learn", "test" and "develop" find.
 *
 * Punctuation inside the copy is optional for the visitor: each field is also
 * matched with every character that is not a letter, digit or whitespace
 * removed, so "drawio" finds "Draw.io", "ondevice" finds "On-device" and
 * "selfhosted" finds "self-hosted". The punctuated spelling still matches the
 * original field. Each field is matched a third time with spaces removed as
 * well, so a product name typed joined, the way it appears in a hashtag
 * ("edmxtools", "lamplitlight", "azurecompliancematrix"), still finds it.
 * A match that runs across a word gap counts only when it starts at the
 * start of a word: "agets" is not found inside "langu|age t|utor" and
 * "assts" not inside "schem|as st|raightforward", so those typos get the
 * did-you-mean correction ("agents", "assets") instead of an unrelated hit.
 *
 * Multi-word queries are matched word by word: the folded query is split on
 * whitespace and hyphens (so a product's URL slug such as
 * "leben-in-deutschland" or "azure-compliance-matrix" is searched as its
 * words) and a product matches when EVERY word is a substring of at least
 * one of those fields (AND, not OR). So "Security Azure" finds Azure
 * Compliance Matrix even though the words come from different chips and in a
 * different order, while "Azure zzqxnosuch" finds nothing. A single-word query
 * behaves exactly like a plain substring match. A word that ends in an
 * English plural ending also matches without it ("languages" finds the
 * "Language" chip, "germanies" finds "Germany"), and ranks the same way, so a
 * plural lists the products its singular lists in the same order.
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
  category?: string;
  status?: string;
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
// Marks at the start or end of a word are dropped, so a word typed in quotes,
// in brackets or with sentence punctuation ("\"Eszett\"", "(AI)", "azure?",
// "tools.") matches like the bare word. Inner marks stay, so "draw.io" is
// still matched as typed. A word that is only punctuation is dropped.
function queryWords(query: string): string[] {
  return fold(query)
    .split(/[\s-]+/)
    .map((word) => word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""))
    .filter(Boolean);
}

// German spells an umlaut out when the key is missing: "ü" as "ue", "ä" as
// "ae", "ö" as "oe". A field with an umlaut is also matched spelled that way,
// so "kenntnispruefung" finds "Kenntnisprüfung". Only the copy side changes:
// folding the query ("ue" -> "u") would break "true", "queue" and "question".
const UMLAUT_SPELLINGS: Record<string, string> = { ä: "ae", ö: "oe", ü: "ue" };

function spellUmlauts(value: string): string {
  return fold(
    value
      .normalize("NFC")
      .toLowerCase()
      .replace(/[äöü]/g, (letter) => UMLAUT_SPELLINGS[letter])
  );
}

function searchableText(product: SearchableProduct): string[] {
  const raw = [
    product.name,
    product.title ?? "",
    product.description,
    ...(product.tags ?? []),
    product.longDescription ?? "",
    ...(product.highlights ?? []).flatMap((h) => [h.title, h.description]),
    product.category ?? "",
    product.status ?? "",
  ];
  const fields = [
    ...raw.map(fold),
    ...raw
      .filter((field) => /[äöü]/i.test(field.normalize("NFC")))
      .map(spellUmlauts),
  ];
  return [
    ...fields,
    ...fields.map((field) => field.replace(JOINING_PUNCTUATION, "")),
  ];
}

// A field with every non-alphanumeric character removed, spaces included
// ("edmxtools" for "EDMX Tools"), and the offsets in it where a word of the
// field begins.
type JoinedField = { text: string; wordStarts: Set<number> };

function joinedField(field: string): JoinedField {
  const words = field.split(NON_ALPHANUMERIC).filter(Boolean);
  const wordStarts = new Set<number>();
  let offset = 0;
  for (const word of words) {
    wordStarts.add(offset);
    offset += word.length;
  }
  return { text: words.join(""), wordStarts };
}

function joinedFields(product: SearchableProduct): JoinedField[] {
  return searchableText(product).map(joinedField);
}

// A query word typed joined ("edmxtools") matches a joined field only where
// the match starts at the start of a word of the field. A match inside one
// word is already found by the plain fields, so this only decides matches
// that run across a word gap: without the rule, "agets" would hit
// "languagetutor" and "assts" would hit "schemasstraightforward", hiding the
// spelling suggestion for "agents" and "assets" behind an unrelated product.
function matchesJoined(joined: JoinedField, form: string): boolean {
  for (
    let at = joined.text.indexOf(form);
    at !== -1;
    at = joined.text.indexOf(form, at + 1)
  ) {
    if (joined.wordStarts.has(at)) return true;
  }
  return false;
}

// A query word without its English plural ending, so "languages" also
// matches the "Language" chip: "ies" becomes "y" ("germanies" -> "germany"),
// "ches", "shes", "xes" and "zes" lose "es", and any other final "s" is
// dropped unless the word ends in "ss" ("access" stays). Words of three
// letters or fewer ("ais", "ms") are kept as typed. Returns the word as typed
// when it has no plural ending.
function singularForm(word: string): string {
  if (word.length <= 3) return word;
  if (word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (/(?:ch|sh|x|z)es$/.test(word)) return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

// The verb spellings of a query word: the word itself and, for a word of 5+
// letters ending in -ing or -ed, its base verb, so a visitor who types
// "learning", "tested" or "developing" finds what "learn", "test" and
// "develop" find. "-ied" gives back the "y" ("studied" -> "study"; "studying"
// keeps it anyway), and a doubled final b/d/g/m/n/p/r/t is also tried single
// ("planning" -> "plan", "running" -> "run"; "passing" stays "pass"). A verb
// that drops its "e" ("coding", "practiced") leaves a stem that is still a prefix of the base verb
// ("cod", "practic"). The stem must keep 3+ letters with a vowel, and
// "-eed" words keep their ending, so "thing", "string", "using" and
// "speed" are matched only as typed. Every form is a fallback: a product
// that matches the word as typed still matches.
function verbForms(word: string): string[] {
  if (word.length < 5) return [word];
  let stem = "";
  if (word.endsWith("ing")) stem = word.slice(0, -3);
  else if (word.endsWith("ied")) stem = `${word.slice(0, -3)}y`;
  else if (word.endsWith("ed") && !word.endsWith("eed")) stem = word.slice(0, -2);
  if (stem.length < 3 || !/[aeiouy]/.test(stem)) return [word];
  const forms = [word, stem];
  const last = stem[stem.length - 1];
  if (/[bdgmnprt]/.test(last) && stem[stem.length - 2] === last && stem.length > 3) {
    forms.push(stem.slice(0, -1));
  }
  return forms;
}

// Every spelling a query word may match: as typed, without its plural ending,
// and the base verb of either ("trainings" -> "training" -> "train").
// Matching and ranking both use these, so a plural lists exactly the products
// its singular lists, in the same order, and "learning" finds what "learn"
// finds.
function wordForms(word: string): string[] {
  const singular = singularForm(word);
  const forms = verbForms(word);
  if (singular === word) return forms;
  for (const form of verbForms(singular)) {
    if (!forms.includes(form)) forms.push(form);
  }
  return forms;
}

export function matchesProductQuery(
  product: SearchableProduct,
  query: string
): boolean {
  const words = queryWords(query);
  if (words.length === 0) return true;
  const fields = searchableText(product);
  let joined: JoinedField[] | null = null;
  return words.every((word) =>
    wordForms(word).some(
      (form) =>
        fields.some((field) => field.includes(form)) ||
        (joined ??= joinedFields(product)).some((field) =>
          matchesJoined(field, form)
        )
    )
  );
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
    const joined = joinedField(name);
    return words.filter((word) =>
      wordForms(word).some(
        (form) => name.includes(form) || matchesJoined(joined, form)
      )
    ).length;
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
    return words.filter((word) =>
      wordForms(word).some((form) => tagWords.has(form))
    ).length;
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
      [
        ...searchableText(product).flatMap((field) =>
          field.split(/[^\p{L}\p{N}]+/u)
        ),
        ...joinedFields(product).map((field) => field.text),
      ]
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

/**
 * Free-text filter for the product grid. Case-insensitive substring match on
 * name and description, so a user can type "ai" or part of a tool's name
 * instead of hunting through category tabs. Blank queries match everything.
 */
export function matchesProductQuery(
  product: { name: string; description: string },
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    product.name.toLowerCase().includes(q) ||
    product.description.toLowerCase().includes(q)
  );
}

export function filterProductsByQuery<
  T extends { name: string; description: string },
>(products: T[], query: string): T[] {
  return products.filter((product) => matchesProductQuery(product, query));
}

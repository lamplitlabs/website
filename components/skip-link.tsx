/**
 * "Skip to content" link for keyboard and screen-reader users. Visually hidden
 * until focused, so it is the first focusable element on every page and lets
 * users bypass the repeated header/nav links. Targets the page <main id="main-content">.
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
    >
      Skip to content
    </a>
  );
}

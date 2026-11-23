import Link from "next/link";
import { Logo } from "@/components/logo";

export function ProductFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-5xl px-4 py-8 text-center text-sm text-muted-foreground">
        <Link
          href="/"
          className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
        >
          <Logo className="h-5 w-5" />
          Lamplit Labs
        </Link>
        <p className="mt-2">
          &copy; {new Date().getFullYear()} Lamplit Labs. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

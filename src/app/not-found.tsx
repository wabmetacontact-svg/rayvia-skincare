import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-cream px-4 text-center">
      <p className="font-heading text-7xl font-bold gold-text">404</p>
      <h1 className="mt-4 font-heading text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-gold px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-dark"
        >
          Back Home
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-cream"
        >
          Browse Products
        </Link>
      </div>
    </div>
  );
}

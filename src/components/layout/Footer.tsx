import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck } from "lucide-react";
import { SITE, FOOTER_LINKS } from "@/lib/constants";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-ink text-cream">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-1.5">
              <span className="font-heading text-2xl font-bold text-white">
                Rayvia<span className="text-gold">Beauty</span>
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/60">
              {SITE.description}
            </p>
            <div className="mt-6 flex gap-3">
              {[
                { icon: InstagramIcon, href: SITE.instagram, label: "Instagram" },
                { icon: TwitterIcon, href: SITE.twitter, label: "Twitter" },
                { icon: FacebookIcon, href: "#", label: "Facebook" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/15 text-cream/70 transition-colors hover:border-gold hover:text-gold"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-cream/80">
                {title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-cream/60 transition-colors hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust + contact */}
        <div className="mt-12 grid gap-6 border-t border-cream/10 pt-8 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-5 w-5 text-gold" />
            <div>
              <p className="text-sm font-semibold">Call us</p>
              <p className="text-sm text-cream/60">{SITE.phone}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 text-gold" />
            <div>
              <p className="text-sm font-semibold">Email us</p>
              <p className="text-sm text-cream/60">{SITE.email}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 text-gold" />
            <div>
              <p className="text-sm font-semibold">Visit us</p>
              <p className="text-sm text-cream/60">{SITE.address}</p>
            </div>
          </div>
        </div>

        {/* Payment + badges */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-cream/10 pt-8 sm:flex-row">
          <div className="flex items-center gap-2 text-cream/50">
            <ShieldCheck className="h-4 w-4 text-success" />
            <span className="text-xs">Secure payments • 100% authentic</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {["UPI", "VISA", "MC", "AMEX", "COD"].map((p) => (
              <span
                key={p}
                className="rounded-md border border-cream/15 px-2.5 py-1 text-[10px] font-semibold text-cream/60"
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-cream/40">
            © {new Date().getFullYear()} Rayvia Beauty Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="text-xs text-cream/40 hover:text-gold">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-cream/40 hover:text-gold">
              Terms
            </Link>
            <Link href="/refund-policy" className="text-xs text-cream/40 hover:text-gold">
              Refunds
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

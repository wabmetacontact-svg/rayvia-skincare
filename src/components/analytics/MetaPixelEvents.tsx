"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function MetaPixelEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).fbq) {
      try {
        (window as any).fbq("track", "PageView");
      } catch {
        // ignore
      }
    }
  }, [pathname, searchParams]);

  return null;
}

"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { trackOutboundClick } from "@/lib/analytics";

interface OutboundLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  trackingTarget: string;
  trackingContext: string;
  trackingUrl: string;
  children: ReactNode;
}

export function OutboundLink({
  trackingTarget,
  trackingContext,
  trackingUrl,
  onClick,
  children,
  ...props
}: OutboundLinkProps) {
  return (
    <a
      {...props}
      onClick={(event) => {
        trackOutboundClick(trackingTarget, trackingContext, trackingUrl);
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}

"use client";

import { useRef } from "react";
import MapPinIcon from "@/components/ui/map-pin-icon";
import MailIcon from "@/components/ui/mail-icon";
import WhatsAppIcon from "@/components/ui/whatsapp-icon";
import type { AnimatedIconHandle } from "@/components/ui/types";

interface Props {
  locationLabel: string;
  location: string;
  emailLabel: string;
  /** Address shown to the user, e.g. "eu@kaua.dev.br". */
  email: string;
  /** Full `mailto:` href. */
  emailHref: string;
  /** WhatsApp label, e.g. "WhatsApp". */
  whatsappLabel: string;
  /** Phone number shown to the user, e.g. "+55 32 99861-9211". */
  whatsapp: string;
  /** Full wa.me href. */
  whatsappHref: string;
}

/**
 * Two stacked label/value pairs (location + email) sitting under the Spotify
 * row. Each animated icon replays on hover of its whole block, not just the
 * tiny glyph, so the affordance is comfortable to hit.
 */
export function HeroContactInfo({
  locationLabel,
  location,
  emailLabel,
  email,
  emailHref,
  whatsappLabel,
  whatsapp,
  whatsappHref,
}: Props) {
  const pinRef = useRef<AnimatedIconHandle>(null);
  const mailRef = useRef<AnimatedIconHandle>(null);
  const whatsappRef = useRef<AnimatedIconHandle>(null);

  return (
    <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-4">
      <div
        onMouseEnter={() => pinRef.current?.startAnimation()}
        onMouseLeave={() => pinRef.current?.stopAnimation()}
      >
        <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {locationLabel}
        </dt>
        <dd className="mt-1.5 flex items-center gap-1.5 text-sm text-foreground">
          <MapPinIcon
            ref={pinRef}
            size={15}
            strokeWidth={1.8}
            className="shrink-0 text-muted-foreground"
          />
          {location}
        </dd>
      </div>

      <div>
        <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {emailLabel}
        </dt>
        <dd className="mt-1.5">
          <a
            href={emailHref}
            onMouseEnter={() => mailRef.current?.startAnimation()}
            onMouseLeave={() => mailRef.current?.stopAnimation()}
            className="group inline-flex items-center gap-1.5 text-sm text-foreground transition-colors hover:text-primary"
          >
            <MailIcon
              ref={mailRef}
              size={15}
              strokeWidth={1.8}
              className="shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
            />
            {email}
          </a>
        </dd>
      </div>
      <div>
        <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {whatsappLabel}
        </dt>
        <dd className="mt-1.5">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => whatsappRef.current?.startAnimation()}
            onMouseLeave={() => whatsappRef.current?.stopAnimation()}
            className="group inline-flex items-center gap-1.5 text-sm text-foreground transition-colors hover:text-primary"
          >
            <WhatsAppIcon
              ref={whatsappRef}
              size={15}
              strokeWidth={1.8}
              className="shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
            />
            {whatsapp}
          </a>
        </dd>
      </div>
    </dl>
  );
}

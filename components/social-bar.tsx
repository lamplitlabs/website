import { socialPlatforms } from "@/components/social-platforms";
import { Button } from "@/components/ui/button";
import { OutboundLink } from "@/components/outbound-link";
import type { SocialLinks } from "@/lib/site-data";

interface SocialBarProps {
  links: SocialLinks;
  context?: string;
}

export function SocialBar({ links, context = "social_bar" }: SocialBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1">
      {socialPlatforms.map(({ key, label, icon: Icon }) => (
        <Button key={key} variant="ghost" size="icon" asChild>
          <OutboundLink
            href={links[key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="transition-transform hover:scale-110"
            trackingTarget={key}
            trackingContext={context}
            trackingUrl={links[key]}
          >
            <Icon className="h-5 w-5" />
          </OutboundLink>
        </Button>
      ))}
    </div>
  );
}

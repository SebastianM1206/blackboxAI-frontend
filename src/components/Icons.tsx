import type { SVGProps } from 'react';

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'stroke'> {
  size?: number;
  sw?: number;
}

function Icon({ size = 16, sw = 1.6, children, ...rest }: IconProps) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const Icons = {
  Dashboard: (p: IconProps) => <Icon {...p}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></Icon>,
  Bot:       (p: IconProps) => <Icon {...p}><rect x="3" y="8" width="18" height="12" rx="3"/><path d="M12 3v5"/><circle cx="8.5" cy="14" r=".7" fill="currentColor"/><circle cx="15.5" cy="14" r=".7" fill="currentColor"/><path d="M9 18h6"/></Icon>,
  Layers:    (p: IconProps) => <Icon {...p}><path d="M12 3 3 8l9 5 9-5-9-5z"/><path d="m3 13 9 5 9-5"/><path d="m3 18 9 5 9-5"/></Icon>,
  Flask:     (p: IconProps) => <Icon {...p}><path d="M9 3h6"/><path d="M10 3v6L4 19a2 2 0 0 0 1.7 3h12.6A2 2 0 0 0 20 19L14 9V3"/><path d="M7 14h10"/></Icon>,
  Play:      (p: IconProps) => <Icon {...p}><polygon points="6 4 20 12 6 20 6 4" fill="currentColor"/></Icon>,
  PlayOutline:(p: IconProps) => <Icon {...p}><polygon points="6 4 20 12 6 20 6 4"/></Icon>,
  Gauge:     (p: IconProps) => <Icon {...p}><path d="M12 14 16 9"/><path d="M21 13a9 9 0 1 0-16.5 5"/><circle cx="12" cy="14" r="1.3" fill="currentColor"/></Icon>,
  Users:     (p: IconProps) => <Icon {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="3.5"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Icon>,
  Search:    (p: IconProps) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Icon>,
  Bell:      (p: IconProps) => <Icon {...p}><path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 19a2 2 0 0 0 4 0"/></Icon>,
  Plus:      (p: IconProps) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>,
  Chevron:   (p: IconProps) => <Icon {...p}><path d="m9 6 6 6-6 6"/></Icon>,
  ChevDown:  (p: IconProps) => <Icon {...p}><path d="m6 9 6 6 6-6"/></Icon>,
  Dot:       (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="2" fill="currentColor"/></Icon>,
  More:      (p: IconProps) => <Icon {...p}><circle cx="5" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="19" cy="12" r="1.2" fill="currentColor"/></Icon>,
  Filter:    (p: IconProps) => <Icon {...p}><path d="M3 5h18M6 12h12M10 19h4"/></Icon>,
  Check:     (p: IconProps) => <Icon {...p}><path d="m5 12 5 5L20 7"/></Icon>,
  X:         (p: IconProps) => <Icon {...p}><path d="M6 6l12 12M18 6 6 18"/></Icon>,
  Edit:      (p: IconProps) => <Icon {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/></Icon>,
  Trash:     (p: IconProps) => <Icon {...p}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></Icon>,
  Copy:      (p: IconProps) => <Icon {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></Icon>,
  Arrow:     (p: IconProps) => <Icon {...p}><path d="M5 12h14M13 6l6 6-6 6"/></Icon>,
  Github:    (p: IconProps) => <Icon {...p}><path d="M9 19c-4 1.5-4-2-6-2.5"/><path d="M15 22v-4a3.4 3.4 0 0 0-1-2.6c3.3-.4 6.5-1.6 6.5-7A5.4 5.4 0 0 0 19 4.8 5 5 0 0 0 18.9 1S17.8.6 15 2.5a13 13 0 0 0-7 0C5.2.6 4.1 1 4.1 1A5 5 0 0 0 4 4.8a5.4 5.4 0 0 0-1.5 4.1c0 5.4 3.2 6.6 6.5 7a3.4 3.4 0 0 0-1 2.6V22"/></Icon>,
  Google:    (p: IconProps) => <Icon {...p} sw={0}><path fill="#EA4335" d="M12 11v3.2h4.5a4 4 0 0 1-1.7 2.6l2.7 2.1c1.6-1.4 2.5-3.6 2.5-6.2 0-.6 0-1.2-.2-1.7z"/><path fill="#34A853" d="M12 20c2.3 0 4.2-.8 5.5-2.1l-2.7-2.1a4.7 4.7 0 0 1-2.8.8 4.9 4.9 0 0 1-4.6-3.4l-2.8 2.2A8 8 0 0 0 12 20z"/><path fill="#4A90E2" d="M7.4 13.2A4.8 4.8 0 0 1 7.4 10l-2.8-2.2a8 8 0 0 0 0 7.6z"/><path fill="#FBBC05" d="M12 7a4.4 4.4 0 0 1 3.1 1.2l2.3-2.3A8 8 0 0 0 4.6 7.8L7.4 10A4.8 4.8 0 0 1 12 7z"/></Icon>,
  Tag:       (p: IconProps) => <Icon {...p}><path d="M20 12 12 4H4v8l8 8z"/><circle cx="8" cy="8" r="1.2" fill="currentColor"/></Icon>,
  Clock:     (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>,
  Sparkles:  (p: IconProps) => <Icon {...p}><path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M19 16l.7 2 2 .7-2 .7L19 22l-.7-2-2-.7 2-.7z"/></Icon>,
  Code:      (p: IconProps) => <Icon {...p}><path d="m9 18-6-6 6-6M15 6l6 6-6 6"/></Icon>,
  Logout:    (p: IconProps) => <Icon {...p}><path d="M15 17l5-5-5-5M9 12h11M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></Icon>,
  Cog:       (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></Icon>,
};

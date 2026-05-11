import { PROVIDER_GLYPH, PROVIDER_COLOR } from '../data/constants';

export function ProviderBadge({ name }: { name: string }) {
  return (
    <span className="row" style={{ gap: 6, fontSize: 13 }}>
      <span style={{
        width: 18, height: 18, borderRadius: 4,
        background: PROVIDER_COLOR[name] ?? 'var(--ink-3)',
        color: 'white', display: 'grid', placeItems: 'center',
        fontSize: 11, fontWeight: 600, flex: 'none',
      }}>
        {PROVIDER_GLYPH[name] ?? name[0]}
      </span>
      <span>{name}</span>
    </span>
  );
}

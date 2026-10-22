// The shape of Export my data (2b, invariant 7): everything we hold about one member, as one JSON
// file. Pure, so tests/auth/export.test.ts can hold its shape. Degrees come from the server (M53).
export const EXPORT_VERSION = 1;

export interface ExportParts {
  account: { email: string | null; createdAt: string; providers: string[] };
  profile: { display_name: string | null; visibility: string; created_at: string } | null;
  birthData: Record<string, unknown> | null;
  placements: Record<string, unknown>[];
}

export const PLACEMENT_EXPORT_COLUMNS =
  'body, sign, house, degree, minute, retrograde, engine_version, computed_at' as const;

export function buildExport(parts: ExportParts, now = new Date()) {
  return {
    format: 'astrotribes-export',
    version: EXPORT_VERSION,
    exportedAt: now.toISOString(),
    account: parts.account,
    profile: parts.profile,
    birthData: parts.birthData,
    placements: parts.placements,
  };
}

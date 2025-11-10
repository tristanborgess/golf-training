/**
 * Hash an English phrase to a safe, flat key without dots.
 * Deterministic across server/client; no dependencies.
 */
export function hashKey(input: string): string {
  // djb2
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    // hash * 33 + char
    hash = ((hash << 5) + hash) ^ input.charCodeAt(i);
  }
  // Convert to unsigned and base36 for compactness; prefix to avoid collisions with legit keys
  return `k_${(hash >>> 0).toString(36)}`;
}

/**
 * Transform a flat messages object from { englishPhrase: translation }
 * to { hashedKey(englishPhrase): translation } for next-intl lookup.
 */
export function transformMessages(
  messages: Record<string, string>,
): Record<string, string> {
  const transformed: Record<string, string> = {};
  for (const [english, translation] of Object.entries(messages)) {
    transformed[hashKey(english)] = translation;
  }
  return transformed;
}

/**
 * Simple mustache-style interpolation for fallback to English.
 */
export function interpolate(
  template: string,
  values?: Record<string, unknown>,
): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    String(values[k] ?? `{${k}}`),
  );
}

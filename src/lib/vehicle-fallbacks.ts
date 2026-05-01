/**
 * Helpers to gracefully handle missing fields from upstream (AutoConf API).
 *
 * Strategy: when a field is null/empty, try to infer it from sibling fields
 * before falling back to omitting it from the UI. We never want to render
 * "Desconhecido", "Não informado" or similar placeholder labels — they make
 * the page look broken and hurt SEO.
 *
 * The inference map covers the most common Attra inventory: premium SUVs,
 * supercars and luxury sedans. It's intentionally conservative — only includes
 * model names that uniquely identify a single brand.
 */

const BRAND_BY_MODEL_KEY: Record<string, string> = {
  // Chevrolet / GM
  'corvette': 'Chevrolet',
  'camaro': 'Chevrolet',
  'silverado': 'Chevrolet',

  // Ford
  'mustang': 'Ford',
  'raptor': 'Ford',
  'bronco': 'Ford',
  'f-150': 'Ford',
  'f150': 'Ford',
  'maverick': 'Ford',
  'ranger': 'Ford',

  // Dodge / RAM
  'challenger': 'Dodge',
  'charger': 'Dodge',
  'durango': 'Dodge',

  // Jaguar
  'f-pace': 'Jaguar',
  'f-type': 'Jaguar',
  'e-pace': 'Jaguar',
  'i-pace': 'Jaguar',
  'xe': 'Jaguar',
  'xf': 'Jaguar',
  'xj': 'Jaguar',

  // Land Rover / Range Rover
  'defender': 'Land Rover',
  'discovery': 'Land Rover',
  'range rover': 'Land Rover',
  'velar': 'Land Rover',
  'evoque': 'Land Rover',

  // Porsche
  'cayenne': 'Porsche',
  'macan': 'Porsche',
  'panamera': 'Porsche',
  'taycan': 'Porsche',
  '911': 'Porsche',
  '718': 'Porsche',
  'cayman': 'Porsche',
  'boxster': 'Porsche',

  // Ferrari
  'sf90': 'Ferrari',
  '296': 'Ferrari',
  '812': 'Ferrari',
  'roma': 'Ferrari',
  'purosangue': 'Ferrari',
  'f8': 'Ferrari',
  'portofino': 'Ferrari',

  // Lamborghini
  'huracan': 'Lamborghini',
  'huracán': 'Lamborghini',
  'urus': 'Lamborghini',
  'aventador': 'Lamborghini',
  'revuelto': 'Lamborghini',

  // McLaren
  '720s': 'McLaren',
  '750s': 'McLaren',
  '765lt': 'McLaren',
  'gt': 'McLaren',
  'artura': 'McLaren',

  // Aston Martin
  'db11': 'Aston Martin',
  'db12': 'Aston Martin',
  'dbs': 'Aston Martin',
  'dbx': 'Aston Martin',
  'vantage': 'Aston Martin',

  // Bentley
  'continental': 'Bentley',
  'bentayga': 'Bentley',
  'flying spur': 'Bentley',

  // Rolls-Royce
  'cullinan': 'Rolls-Royce',
  'ghost': 'Rolls-Royce',
  'phantom': 'Rolls-Royce',
  'wraith': 'Rolls-Royce',
  'dawn': 'Rolls-Royce',
  'spectre': 'Rolls-Royce',

  // Maserati
  'ghibli': 'Maserati',
  'levante': 'Maserati',
  'quattroporte': 'Maserati',
  'mc20': 'Maserati',
  'grecale': 'Maserati',

  // Mercedes / Maybach / AMG
  'maybach': 'Mercedes-Benz',
  'amg gt': 'Mercedes-Benz',

  // BMW
  'm3': 'BMW',
  'm4': 'BMW',
  'm5': 'BMW',
  'm8': 'BMW',
  'x5 m': 'BMW',
  'x6 m': 'BMW',
}

function normalizeKey(s: string): string {
  return s.toLowerCase().trim().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

/**
 * Resolve a vehicle's brand. Tries (in order):
 *   1. The provided marca string if non-empty.
 *   2. Lookup by full normalized model name.
 *   3. Lookup by first word of the model.
 *
 * Returns an empty string when no inference is possible — callers should treat
 * empty as "unknown" and hide the brand label rather than showing a placeholder.
 */
export function resolveBrand(marca: string | null | undefined, modelo: string | null | undefined): string {
  const trimmedMarca = (marca ?? '').trim()
  if (trimmedMarca) return trimmedMarca

  if (!modelo) return ''
  const modelKey = normalizeKey(modelo)
  if (BRAND_BY_MODEL_KEY[modelKey]) return BRAND_BY_MODEL_KEY[modelKey]

  const firstWord = modelKey.split(/\s+/)[0]
  if (firstWord && BRAND_BY_MODEL_KEY[firstWord]) return BRAND_BY_MODEL_KEY[firstWord]

  return ''
}

/** Coalesces a value to '' (empty) when null/undefined/blank, so the UI knows
 *  to hide the label rather than render "Não informado". */
export function nonEmpty(value: string | null | undefined): string {
  const trimmed = (value ?? '').trim()
  return trimmed
}

/** Build a human display name from non-empty parts (strings or numbers).
 *  Numbers like 0 are treated as empty (not a meaningful display value). */
export function joinNonEmpty(parts: Array<string | number | null | undefined>, sep = ' '): string {
  return parts
    .map(p => {
      if (p == null) return ''
      if (typeof p === 'number') return p === 0 ? '' : String(p)
      return p.trim()
    })
    .filter(p => p.length > 0)
    .join(sep)
}

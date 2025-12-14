// Calendar-specific constants and data

export const ZONE_KEYS = {
    ZONE_A: 'Zone A',
    ZONE_B: 'Zone B',
    ZONE_C: 'Zone C',
    CORSE: 'Corse',
    GUADELOUPE: 'Guadeloupe',
    GUYANE: 'Guyane',
    REUNION: 'Réunion',
    MARTINIQUE: 'Martinique',
    MAYOTTE: 'Mayotte'
} as const;

/**
 * Zone labels for display (French names)
 * These should eventually be moved to i18n for internationalization
 */
export const ZONE_LABELS: Record<string, string> = {
    [ZONE_KEYS.ZONE_A]: 'Lyon/Bordeaux',
    [ZONE_KEYS.ZONE_B]: 'Marseille/Lille',
    [ZONE_KEYS.ZONE_C]: 'Paris/IDF',
    [ZONE_KEYS.CORSE]: 'Corse',
    [ZONE_KEYS.GUADELOUPE]: 'Guadeloupe',
    [ZONE_KEYS.GUYANE]: 'Guyane',
    [ZONE_KEYS.REUNION]: 'La Réunion',
    [ZONE_KEYS.MARTINIQUE]: 'Martinique',
    [ZONE_KEYS.MAYOTTE]: 'Mayotte'
};

/**
 * Holiday name mappings for better display
 * API returns abbreviated names, we map to full descriptive names
 */
export const HOLIDAY_NAMES: Record<string, string> = {
    '1er janvier': 'Jour de l\'an',
    'Lundi de Pâques': 'Lundi de Pâques',
    '1er mai': 'Fête du Travail',
    '8 mai': 'Victoire 1945',
    'Ascension': 'Ascension',
    'Lundi de Pentecôte': 'Lundi de Pentecôte',
    '14 juillet': 'Fête Nationale',
    'Assomption': 'Assomption',
    'Toussaint': 'Toussaint',
    '11 novembre': 'Armistice 1918',
    'Jour de Noël': 'Noël'
};

export const DEFAULT_ZONES = [ZONE_KEYS.ZONE_C];

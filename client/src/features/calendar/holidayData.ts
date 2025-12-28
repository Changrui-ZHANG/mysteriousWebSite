import { FaTree, FaGlassCheers, FaDove, FaSun, FaFlag, FaCross, FaEgg } from 'react-icons/fa';
import { GiPartyPopper, GiFlowers } from 'react-icons/gi';
import { IconType } from 'react-icons';

export interface HolidayTheme {
    key: string; // Translation key suffix
    icon: IconType;   // React Icon component
    color: string; // Tailwind color class for text/border/glow
    gradient: string; // Tailwind gradient class
}

// Fallback theme for unknown holidays
export const DEFAULT_THEME: HolidayTheme = {
    key: 'default',
    icon: FaSun,
    color: 'text-blue-400',
    gradient: 'from-blue-500/20 to-purple-500/20'
};

// Mapping specific holidays (based on their French name often returned by API or generic logic)
export const HOLIDAY_THEMES: Record<string, HolidayTheme> = {
    // New Year
    "Jour de l'an": {
        key: 'jour_de_l_an',
        icon: FaGlassCheers,
        color: 'text-yellow-400',
        gradient: 'from-yellow-400/20 to-pink-500/20'
    },
    // Easter (Lundi de Pâques)
    "Lundi de Pâques": {
        key: 'paques',
        icon: FaEgg,
        color: 'text-green-400',
        gradient: 'from-green-400/20 to-yellow-400/20'
    },
    // Labor Day (Fête du travail)
    "Fête du travail": {
        key: 'fete_travail',
        icon: FaFlag,
        color: 'text-red-500',
        gradient: 'from-red-500/20 to-orange-500/20'
    },
    // Victory 1945
    "Victoire 1945": {
        key: 'victoire_1945',
        icon: FaDove,
        color: 'text-blue-300',
        gradient: 'from-blue-400/20 to-white/20'
    },
    // Ascension
    "Ascension": {
        key: 'ascension',
        icon: FaCross,
        color: 'text-purple-400',
        gradient: 'from-purple-500/20 to-blue-500/20'
    },
    // Pentecost (Lundi de Pentecôte)
    "Lundi de Pentecôte": {
        key: 'pentecote',
        icon: FaSun,
        color: 'text-orange-400',
        gradient: 'from-orange-400/20 to-red-400/20'
    },
    // Bastille Day (Fête Nationale)
    "Fête nationale": {
        key: 'fete_nationale',
        icon: GiPartyPopper,
        color: 'text-blue-500',
        gradient: 'from-blue-600/20 via-white/20 to-red-600/20'
    },
    // Assumption
    "Assomption": {
        key: 'assomption',
        icon: FaCross,
        color: 'text-yellow-200',
        gradient: 'from-yellow-200/20 to-blue-300/20'
    },
    // All Saints (Toussaint)
    "Toussaint": {
        key: 'toussaint',
        icon: GiFlowers,
        color: 'text-purple-300',
        gradient: 'from-purple-900/40 to-black/40'
    },
    // Armistice 1918
    "Armistice 1918": {
        key: 'armistice_1918',
        icon: FaDove,
        color: 'text-blue-300',
        gradient: 'from-blue-800/20 to-gray-500/20'
    },
    // Christmas
    "Noël": {
        key: 'noel',
        icon: FaTree,
        color: 'text-green-500',
        gradient: 'from-green-600/20 to-red-600/20'
    },
    // St Etienne (Alsace-Moselle specific, but API might return it)
    "Saint Étienne": {
        key: 'saint_etienne',
        icon: FaCross,
        color: 'text-red-400',
        gradient: 'from-red-500/20 to-yellow-500/20'
    },
    // Good Friday (Alsace)
    "Vendredi saint": {
        key: 'vendredi_saint',
        icon: FaCross,
        color: 'text-purple-500',
        gradient: 'from-purple-500/20 to-gray-500/20'
    }
};

import { HOLIDAY_NAMES } from '../../constants/calendarZones';

export const getHolidayTheme = (name: string): HolidayTheme => {
    // 1. Try to normalize name using our constant mapping (e.g. "1er janvier" -> "Jour de l'an")
    const normalizedName = HOLIDAY_NAMES[name] || name;

    // 2. Lookup theme using normalized name
    // We try exact match first
    return HOLIDAY_THEMES[normalizedName] || DEFAULT_THEME;
};

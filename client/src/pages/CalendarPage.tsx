import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { fetchJson, postJson } from '../utils/api';
import { useAdminCode } from '../hooks/useAdminCode';
import { ZONE_LABELS, HOLIDAY_NAMES, DEFAULT_ZONES } from '../constants/calendar';
import { API_ENDPOINTS } from '../constants/api';

interface Holiday {
    date: string;
    nom_jour_ferie: string;
}

interface SchoolHoliday {
    description: string;
    start_date: string;
    end_date: string;
    zones: string;
    location: string;
}

interface CalendarPageProps {
    isDarkMode: boolean;
    isAdmin: boolean;
}

export function CalendarPage({ isDarkMode, isAdmin }: CalendarPageProps) {
    const { t, i18n } = useTranslation();
    const adminCode = useAdminCode();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [schoolHolidays, setSchoolHolidays] = useState<SchoolHoliday[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedZones, setSelectedZones] = useState<string[]>(DEFAULT_ZONES);

    // Load global zone configuration from backend on mount
    useEffect(() => {
        fetchJson<{ activeZones: string[] }>(API_ENDPOINTS.CALENDAR.CONFIG)
            .then(data => {
                if (data.activeZones) {
                    setSelectedZones(data.activeZones);
                }
            })
            .catch(err => console.error('Failed to load calendar config', err));
    }, []);

    const toggleZone = async (zone: string) => {
        const newZones = selectedZones.includes(zone)
            ? selectedZones.filter(z => z !== zone)
            : [...selectedZones, zone];

        // Optimistically update UI
        setSelectedZones(newZones);

        // If admin, persist to backend for all users
        if (isAdmin && adminCode) {
            try {
                await postJson(API_ENDPOINTS.CALENDAR.CONFIG, {
                    zones: newZones,
                    adminCode
                });
            } catch (err) {
                console.error('Failed to update calendar config', err);
                alert(t('calendar.errors.config_update_failed') || 'Failed to update configuration');
                // Revert on error
                setSelectedZones(selectedZones);
            }
        }
    };

    const year = currentDate.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => i);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Public Holidays
                const feriesData = await fetchJson<Record<string, string>>(
                    API_ENDPOINTS.EXTERNAL.PUBLIC_HOLIDAYS(year)
                );
                const feriesList = Object.entries(feriesData).map(([date, name]) => ({
                    date,
                    nom_jour_ferie: name
                }));
                setHolidays(feriesList);

                // Fetch School Holidays - Split into two requests to safely handle the "OR" logic for school years
                const year1 = `${year - 1}-${year}`;
                const year2 = `${year}-${year + 1}`;

                const [schoolData1, schoolData2] = await Promise.all([
                    fetchJson<any>(API_ENDPOINTS.EXTERNAL.SCHOOL_HOLIDAYS(year1)),
                    fetchJson<any>(API_ENDPOINTS.EXTERNAL.SCHOOL_HOLIDAYS(year2))
                ]);

                const records = [...(schoolData1.records || []), ...(schoolData2.records || [])];

                // Helper to convert API date string (UTC) to Local Date String YYYY-MM-DD
                const toLocalDateISO = (dateStr: string) => {
                    const date = new Date(dateStr);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                };

                const mappedSchool = records
                    .filter((r: any) => r.fields.population !== 'Enseignants')
                    .map((r: any) => ({
                        description: r.fields.description,
                        start_date: toLocalDateISO(r.fields.start_date),
                        end_date: toLocalDateISO(r.fields.end_date),
                        zones: r.fields.zones,
                        location: r.fields.location
                    }));
                setSchoolHolidays(mappedSchool);

            } catch (error) {
                console.error("Failed to fetch calendar data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [year]);

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
        let day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Shift to 0=Monday, 6=Sunday
    };

    const isWeekend = (day: number, month: number, year: number) => {
        const d = new Date(year, month, day);
        const dayOfWeek = d.getDay();
        return dayOfWeek === 0 || dayOfWeek === 6;
    };

    const formatDate = (year: number, month: number, day: number) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const getHoliday = (day: number, month: number, year: number) => {
        const dateStr = formatDate(year, month, day);
        return holidays.find(h => h.date === dateStr);
    };

    const getSchoolHoliday = (day: number, month: number, year: number) => {
        const currentDateStr = formatDate(year, month, day);

        // Use string comparison (YYYY-MM-DD supports lexicographical comparison)
        return schoolHolidays.find(h => {
            // Check if holiday is in one of the selected zones
            const hasSelectedZone = selectedZones.some(z => h.zones.includes(z));
            if (!hasSelectedZone) return false;

            // API dates usually exclude the end date or include it? 
            // Standard education.gouv API: start_date (inclusive), end_date (inclusive but often check data)
            // Usually start <= current < end or <= end.
            // Let's assume inclusive start, inclusive end (standard for school holidays visual).

            // To be safe with strings, we rely on the ISO format 2024-01-01
            return currentDateStr >= h.start_date && currentDateStr < h.end_date;
            // Note: Data often has end_date as the day BACK to school or the last day of holiday?
            // "Vacances scolaires" logic usually: end_date is the day classes resume. 
            // So strictly less than (<) is usually correct for "end_date". 
            // If the user wants to see the "period of holidays", excluding the return day is likely correct.
        });
    };



    // Dynamically generate month names based on current language
    const monthNames = useMemo(() =>
        Array.from({ length: 12 }, (_, i) => {
            return new Date(year, i, 1).toLocaleString(i18n.language, { month: 'long' });
        }), [year, i18n.language]
    );

    // Dynamically generate week days based on current language
    const weekDays = useMemo(() =>
        Array.from({ length: 7 }, (_, i) => {
            // Start from a known Monday (e.g. Jan 1 2024 was Monday)
            return new Date(2024, 0, 1 + i).toLocaleString(i18n.language, { weekday: 'short' });
        }), [i18n.language]
    );

    return (
        <div className={`min-h-screen pt-24 pb-12 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h1 className="text-4xl font-bold font-heading bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent capitalize">
                        {t('nav.calendar')} {year}
                    </h1>

                    {/* Zone Selector - ONLY FOR ADMIN */}
                    {isAdmin && (
                        <div className="flex flex-wrap items-center gap-2 bg-white/5 p-2 rounded-lg justify-center md:justify-start max-w-4xl">
                            <span className="text-sm opacity-70 mr-2 w-full md:w-auto text-center md:text-left">Zones (Admin):</span>
                            {Object.entries(ZONE_LABELS).map(([zoneKey, label]) => (
                                <button
                                    key={zoneKey}
                                    onClick={() => toggleZone(zoneKey)}
                                    className={`px-3 py-1 rounded text-xs font-bold transition-colors whitespace-nowrap ${selectedZones.includes(zoneKey)
                                        ? 'bg-blue-500 text-white shadow-lg'
                                        : 'bg-white/10 hover:bg-white/20 text-gray-400'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button onClick={() => setCurrentDate(new Date(year - 1, 0))} className="px-4 py-2 rounded bg-white/10 hover:bg-white/20">
                            ← {year - 1}
                        </button>
                        <button onClick={() => setCurrentDate(new Date(year + 1, 0))} className="px-4 py-2 rounded bg-white/10 hover:bg-white/20">
                            {year + 1} →
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {months.map(month => (
                            <motion.div
                                key={month}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: month * 0.05 }}
                                className={`rounded-xl p-4 border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-md'}`}
                            >
                                <h3 className="text-xl font-bold mb-4 text-center capitalize">{monthNames[month]}</h3>

                                <div className="grid grid-cols-7 mb-2 text-center text-sm opacity-50">
                                    {weekDays.map(d => <div key={d} className="capitalize">{d}</div>)}
                                </div>

                                <div className="grid grid-cols-7 gap-1 text-sm">
                                    {/* Empty cells for start of month */}
                                    {Array.from({ length: getFirstDayOfMonth(month, year) }).map((_, i) => (
                                        <div key={`empty-${i}`} className="h-8"></div>
                                    ))}

                                    {/* Days */}
                                    {Array.from({ length: getDaysInMonth(month, year) }).map((_, i) => {
                                        const day = i + 1;
                                        const holiday = getHoliday(day, month, year);
                                        const schoolVar = getSchoolHoliday(day, month, year);
                                        const isWknd = isWeekend(day, month, year);
                                        const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

                                        let bgClass = "";
                                        let textClass = "";

                                        if (isToday) {
                                            bgClass = "bg-blue-500 text-white font-bold ring-2 ring-blue-300";
                                        } else if (holiday) {
                                            bgClass = "bg-red-500/20 text-red-500 font-bold border border-red-500/30";
                                        } else if (schoolVar) {
                                            // Check if it is Summer Holidays ("Vacances d'Été")
                                            const isSummer = schoolVar.description.toLowerCase().includes('été') || schoolVar.description.toLowerCase().includes('ete');

                                            if (isSummer) {
                                                // Lighter style for the long summer break to avoid "overwhelming" yellow
                                                bgClass = "bg-orange-100/10 text-orange-300/60";
                                            } else {
                                                // Strong yellow for the standard ~2 week breaks (Noel, Hiver, Toussaint)
                                                bgClass = "bg-yellow-400/30 text-yellow-500";
                                            }
                                        } else if (isWknd) {
                                            textClass = "opacity-50";
                                        }

                                        return (
                                            <div
                                                key={day}
                                                className={`h-8 flex items-center justify-center rounded relative group cursor-default ${bgClass} ${textClass} ${!bgClass && isDarkMode ? 'hover:bg-white/5' : ''}`}
                                            >
                                                {day}
                                                {/* Tooltip */}
                                                {(holiday || schoolVar) && (
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-20 w-max max-w-[150px] p-2 rounded bg-black/90 text-white text-xs text-center pointer-events-none">
                                                        {holiday && (HOLIDAY_NAMES[holiday.nom_jour_ferie] || holiday.nom_jour_ferie)}
                                                        {holiday && schoolVar && <br />}
                                                        {schoolVar?.description && `Vacances (${ZONE_LABELS[schoolVar.zones] || schoolVar.zones})`}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

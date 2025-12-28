import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaQuestionCircle } from 'react-icons/fa';
import { fetchJson, postJson } from '../api/httpClient';
import { useAdminCode } from '../hooks/useAdminCode';
import { useTheme } from '../hooks/useTheme';
import { ZONE_LABELS, HOLIDAY_NAMES, DEFAULT_ZONES } from '../constants/calendarZones';
import { API_ENDPOINTS } from '../constants/endpoints';
import { HolidayModal } from '../features/calendar/HolidayModal';
import { LoadingSpinner, GradientHeading } from '../components';
import { getDaysInMonth, getFirstDayOfMonth, isWeekend, formatDate, toLocalDateISO } from '../utils/dateUtils';
import type { Holiday, SchoolHoliday, SchoolHolidayApiResponse } from '../types/calendar';

interface CalendarPageProps {
    isDarkMode: boolean;
    isAdmin: boolean;
}

export function CalendarPage({ isDarkMode, isAdmin }: CalendarPageProps) {
    const { t, i18n } = useTranslation();
    const adminCode = useAdminCode();
    const theme = useTheme(isDarkMode);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [schoolHolidays, setSchoolHolidays] = useState<SchoolHoliday[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedZones, setSelectedZones] = useState<string[]>(DEFAULT_ZONES);
    const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const year = currentDate.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => i);

    // Load global zone configuration
    useEffect(() => {
        fetchJson<{ activeZones: string[] }>(API_ENDPOINTS.CALENDAR.CONFIG)
            .then(data => { if (data.activeZones) setSelectedZones(data.activeZones); })
            .catch(err => console.error('Failed to load calendar config', err));
    }, []);

    const toggleZone = async (zone: string) => {
        const newZones = selectedZones.includes(zone)
            ? selectedZones.filter(z => z !== zone)
            : [...selectedZones, zone];

        setSelectedZones(newZones);

        if (isAdmin && adminCode) {
            try {
                await postJson(API_ENDPOINTS.CALENDAR.CONFIG, { zones: newZones, adminCode });
            } catch (err) {
                console.error('Failed to update calendar config', err);
                alert(t('calendar.errors.config_update_failed') || 'Failed to update configuration');
                setSelectedZones(selectedZones);
            }
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const feriesData = await fetchJson<Record<string, string>>(API_ENDPOINTS.EXTERNAL.PUBLIC_HOLIDAYS(year));
                setHolidays(Object.entries(feriesData).map(([date, name]) => ({ date, nom_jour_ferie: name })));

                const year1 = `${year - 1}-${year}`;
                const year2 = `${year}-${year + 1}`;
                const [schoolData1, schoolData2] = await Promise.all([
                    fetchJson<SchoolHolidayApiResponse>(API_ENDPOINTS.EXTERNAL.SCHOOL_HOLIDAYS(year1)),
                    fetchJson<SchoolHolidayApiResponse>(API_ENDPOINTS.EXTERNAL.SCHOOL_HOLIDAYS(year2))
                ]);

                const records = [...(schoolData1.records || []), ...(schoolData2.records || [])];
                setSchoolHolidays(records
                    .filter((r) => r.fields.population !== 'Enseignants')
                    .map((r) => ({
                        description: r.fields.description,
                        start_date: toLocalDateISO(r.fields.start_date),
                        end_date: toLocalDateISO(r.fields.end_date),
                        zones: r.fields.zones,
                        location: r.fields.location
                    })));
            } catch (error) {
                console.error("Failed to fetch calendar data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [year]);

    const getHoliday = (day: number, month: number) => {
        const dateStr = formatDate(year, month, day);
        return holidays.find(h => h.date === dateStr);
    };

    const getSchoolHoliday = (day: number, month: number) => {
        const currentDateStr = formatDate(year, month, day);
        return schoolHolidays.find(h => {
            const hasSelectedZone = selectedZones.some(z => h.zones.includes(z));
            if (!hasSelectedZone) return false;
            return currentDateStr >= h.start_date && currentDateStr < h.end_date;
        });
    };

    const monthNames = useMemo(() =>
        Array.from({ length: 12 }, (_, i) => new Date(year, i, 1).toLocaleString(i18n.language, { month: 'long' })),
        [year, i18n.language]);

    const weekDays = useMemo(() =>
        Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 1 + i).toLocaleString(i18n.language, { weekday: 'short' })),
        [i18n.language]);

    return (
        <div className={`min-h-screen pt-24 pb-12 px-4 ${theme.textPrimary}`}>
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <GradientHeading gradient="cyan-purple" level={1}>{t('nav.calendar')} {year}</GradientHeading>

                    {isAdmin && (
                        <div className="flex flex-wrap items-center gap-2 bg-white/5 p-2 rounded-lg justify-center md:justify-start max-w-4xl">
                            <span className="text-sm opacity-70 mr-2 w-full md:w-auto text-center md:text-left">{t('calendar.zones_admin_label')}</span>
                            {Object.entries(ZONE_LABELS).map(([zoneKey, label]) => (
                                <button key={zoneKey} onClick={() => toggleZone(zoneKey)}
                                    className={`px-3 py-1 rounded text-xs font-bold transition-colors whitespace-nowrap ${selectedZones.includes(zoneKey) ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/10 hover:bg-white/20 text-gray-400'}`}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button onClick={() => setCurrentDate(new Date(year - 1, 0))} className="px-4 py-2 rounded bg-white/10 hover:bg-white/20">← {year - 1}</button>
                        <button onClick={() => setCurrentDate(new Date(year + 1, 0))} className="px-4 py-2 rounded bg-white/10 hover:bg-white/20">{year + 1} →</button>
                    </div>
                </header>

                {loading ? (
                    <LoadingSpinner size="lg" color="blue" className="py-20" />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {months.map(month => (
                            <motion.div key={month} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: month * 0.05 }}
                                className={`rounded-xl p-4 border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-md'}`}>
                                <h3 className="text-xl font-bold mb-4 text-center capitalize">{monthNames[month]}</h3>
                                <div className="grid grid-cols-7 mb-2 text-center text-sm opacity-50">
                                    {weekDays.map(d => <div key={d} className="capitalize">{d}</div>)}
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-sm">
                                    {Array.from({ length: getFirstDayOfMonth(month, year) }).map((_, i) => <div key={`empty-${i}`} className="h-8"></div>)}
                                    {Array.from({ length: getDaysInMonth(month, year) }).map((_, i) => {
                                        const day = i + 1;
                                        const holiday = getHoliday(day, month);
                                        const schoolVar = getSchoolHoliday(day, month);
                                        const isWknd = isWeekend(day, month, year);
                                        const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

                                        let bgClass = "";
                                        let textClass = "";

                                        if (isToday) bgClass = "bg-blue-500 text-white font-bold ring-2 ring-blue-300";
                                        else if (holiday) bgClass = "bg-red-500/20 text-red-500 font-bold border border-red-500/30";
                                        else if (schoolVar) {
                                            const isSummer = schoolVar.description.toLowerCase().includes('été') || schoolVar.description.toLowerCase().includes('ete');
                                            bgClass = isSummer ? "bg-orange-100/10 text-orange-300/60" : "bg-yellow-400/30 text-yellow-500";
                                        } else if (isWknd) textClass = "opacity-50";

                                        return (
                                            <div key={day}
                                                onClick={() => { if (holiday) { setSelectedHoliday(holiday); setIsModalOpen(true); } }}
                                                className={`h-8 flex items-center justify-center rounded relative group ${bgClass} ${textClass} ${!bgClass && isDarkMode ? 'hover:bg-white/5' : ''} ${holiday ? 'cursor-pointer hover:scale-110 active:scale-95 transition-transform' : 'cursor-default'}`}>
                                                {day}
                                                {holiday && <div className="absolute top-0.5 right-0.5 z-10 opacity-40 hover:opacity-100 transition-opacity"><FaQuestionCircle className="text-[10px] text-blue-400 bg-white/50 dark:bg-gray-800/50 rounded-full" /></div>}
                                                {(holiday || schoolVar) && (
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-20 w-max max-w-[150px] p-2 rounded bg-black/90 text-white text-xs text-center pointer-events-none">
                                                        {holiday && (HOLIDAY_NAMES[holiday.nom_jour_ferie] || holiday.nom_jour_ferie)}
                                                        {holiday && schoolVar && <br />}
                                                        {schoolVar?.description && t('calendar.tooltip.vacation', { zone: ZONE_LABELS[schoolVar.zones] || schoolVar.zones, defaultValue: `Vacances (${ZONE_LABELS[schoolVar.zones] || schoolVar.zones})` })}
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

            <div className={isDarkMode ? 'dark' : ''}>
                <HolidayModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} holiday={selectedHoliday} />
            </div>
        </div>
    );
}

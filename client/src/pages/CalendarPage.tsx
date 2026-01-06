import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaQuestionCircle } from 'react-icons/fa';
import { fetchJson, postJson } from '../api/httpClient';
import { useAdminCode } from '../hooks/useAdminCode';
import { ZONE_LABELS, HOLIDAY_NAMES, DEFAULT_ZONES } from '../constants/calendarZones';
import { API_ENDPOINTS } from '../constants/endpoints';
import { HolidayModal } from '../features/calendar/HolidayModal';
import { LoadingSpinner, GradientHeading } from '../components';
import { getDaysInMonth, getFirstDayOfMonth, isWeekend, formatDate, toLocalDateISO } from '../utils/dateUtils';
import type { Holiday, SchoolHoliday, SchoolHolidayApiResponse } from '../types/calendar';

interface CalendarPageProps {
    isAdmin: boolean;
}

export function CalendarPage({ isAdmin }: CalendarPageProps) {
    const { t, i18n } = useTranslation();
    const adminCode = useAdminCode();
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
                alert(t('calendar.errors.config_update_failed'));
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
        <div className="page-container pt-24 pb-12 px-4">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <GradientHeading gradient="cyan-purple" level={1}>{t('nav.calendar')} {year}</GradientHeading>

                    {isAdmin && (
                        <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl justify-center md:justify-start max-w-4xl border border-default bg-surface/30 backdrop-blur-md">
                            <span className="text-sm text-secondary mr-2 w-full md:w-auto text-center md:text-left px-2">{t('calendar.zones_admin_label')}</span>
                            {Object.entries(ZONE_LABELS).map(([zoneKey, label]) => (
                                <button key={zoneKey} onClick={() => toggleZone(zoneKey)}
                                    className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 ${selectedZones.includes(zoneKey) ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/25' : 'hover:bg-surface-alt text-secondary border border-transparent hover:border-default'}`}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button onClick={() => setCurrentDate(new Date(year - 1, 0))} className="btn-secondary">← {year - 1}</button>
                        <button onClick={() => setCurrentDate(new Date(year + 1, 0))} className="btn-secondary">{year + 1} →</button>
                    </div>
                </header>

                {loading ? (
                    <div className="flex justify-center items-center py-40">
                        <LoadingSpinner size="lg" color="blue" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {months.map(month => (
                            <motion.div
                                key={month}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: month * 0.05 }}
                                className={`
                                    relative p-6 transition-all duration-700
                                    bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-xl rounded-3xl hover:bg-white/[0.08] hover:border-white/20 after:absolute after:inset-0 after:rounded-3xl after:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15)] after:pointer-events-none
                                `}
                            >
                                <h3 className="text-xl font-bold mb-4 text-center capitalize">{monthNames[month]}</h3>
                                <div className="grid grid-cols-7 mb-2 text-center text-sm text-muted">
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

                                        if (isToday) {
                                            bgClass = "bg-accent-primary text-white font-bold shadow-lg shadow-accent-primary/40 scale-105 z-10 ring-1 ring-white/30";
                                        } else if (holiday) {
                                            bgClass = "bg-accent-danger/10 text-accent-danger border border-accent-danger/20";
                                        } else if (schoolVar) {
                                            const isSummer = schoolVar.description.toLowerCase().includes('été') || schoolVar.description.toLowerCase().includes('ete');
                                            bgClass = isSummer
                                                ? "bg-accent-warning/10 text-accent-warning/80"
                                                : "bg-accent-info/20 text-accent-info";
                                        } else if (isWknd) {
                                            textClass = "text-muted";
                                        }

                                        return (
                                            <div key={day}
                                                onClick={() => { if (holiday) { setSelectedHoliday(holiday); setIsModalOpen(true); } }}
                                                className={`h-8 flex items-center justify-center rounded-lg relative group transition-all duration-200 hover:z-50 ${bgClass} ${textClass} ${!bgClass ? 'hover:bg-muted/10' : ''} ${holiday ? 'cursor-pointer hover:scale-110 active:scale-95 shadow-sm' : 'cursor-default'}`}>
                                                {day}
                                                {holiday && (
                                                    <div className="absolute top-0.5 right-0.5 z-10 opacity-40 group-hover:opacity-100 transition-opacity">
                                                        <FaQuestionCircle className="text-[10px] text-accent-info" />
                                                    </div>
                                                )}
                                                {(holiday || schoolVar) && (
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 w-max max-w-[200px] p-2.5 rounded-xl bg-surface border border-default shadow-xl text-primary text-xs text-center pointer-events-none backdrop-blur-md">
                                                        <div className="font-bold mb-1">
                                                            {holiday && (HOLIDAY_NAMES[holiday.nom_jour_ferie] || holiday.nom_jour_ferie)}
                                                        </div>
                                                        <div className="opacity-80">
                                                            {schoolVar?.description && t('calendar.tooltip.vacation', {
                                                                zone: ZONE_LABELS[schoolVar.zones] || schoolVar.zones,
                                                                defaultValue: `Vacances (${ZONE_LABELS[schoolVar.zones] || schoolVar.zones})`
                                                            })}
                                                        </div>
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-default" />
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

            <HolidayModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} holiday={selectedHoliday} />
        </div>
    );
}

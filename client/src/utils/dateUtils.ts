export function getDaysInMonth(month: number, year: number): number {
    return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(month: number, year: number): number {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Shift to 0=Monday, 6=Sunday
}

export function isWeekend(day: number, month: number, year: number): boolean {
    const d = new Date(year, month, day);
    const dayOfWeek = d.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
}

export function formatDate(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function toLocalDateISO(dateStr: string): string {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

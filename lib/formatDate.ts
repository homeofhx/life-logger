export function formatDateKey(key: string, options: Intl.DateTimeFormatOptions): string {
    const [year, month, day] = key.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", options);
}

export function formatCalendarDate(key: string): string {
    return formatDateKey(key, {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

export function formatDiaryDate(key: string): string {
    return formatDateKey(key, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}
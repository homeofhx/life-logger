export interface DayCell {
    date: Date;
    key: string;   // "YYYY-MM-DD"
    inYear: boolean;   // false for the leading/trailing padding days
}

export interface MonthLabel {
    colIndex: number;
    label: string;
}

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function pad2(n: number): string {
    return n.toString().padStart(2, "0");
}

function toKey(d: Date): string {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function buildYearGrid(year: number): { weeks: (DayCell | null)[][]; monthLabels: MonthLabel[]; } {
    const jan1 = new Date(year, 0, 1);
    const dec31 = new Date(year, 11, 31);

    const start = new Date(jan1);
    start.setDate(start.getDate() - start.getDay());   // back up to Sunday

    const end = new Date(dec31);
    end.setDate(end.getDate() + (6 - end.getDay()));   // forward to Saturday

    const weeks: (DayCell | null)[][] = [];
    const monthLabels: MonthLabel[] = [];

    let cursor = new Date(start);
    let colIndex = 0;

    while (cursor <= end) {
        const week: (DayCell | null)[] = [];
        let labelForThisWeek: string | null = null;

        for (let row = 0; row < 7; row++) {
            const inYear = cursor.getFullYear() === year;
            if (inYear) {
                if (cursor.getDate() === 1) labelForThisWeek = MONTH_ABBR[cursor.getMonth()];
                week.push({date: new Date(cursor), key: toKey(cursor), inYear: true});
            } else {
                week.push(null);
            }

            cursor.setDate(cursor.getDate() + 1);
        }

        if (labelForThisWeek) monthLabels.push({colIndex, label: labelForThisWeek});
        weeks.push(week);
        colIndex++;
    }

    return {weeks, monthLabels};
}
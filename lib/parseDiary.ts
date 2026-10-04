export interface DiaryEntry {
    content: string;
    line: number;
}

export type DiaryMap = Record<string, DiaryEntry[]>;

export interface DiaryParseError {
    line: number;
    text: string;
}

export interface ParseSuccess {
    ok: true;
    entries: DiaryMap;
    total: number;
    years: number[];
}

export interface ParseFailure {
    ok: false;
    errors: DiaryParseError[];
}

const LINE_PATTERN = /^(\d{1,2})-(\d{1,2})-(\d{4}):(.*)$/;

function pad2(n: number): string {
    return n.toString().padStart(2, "0");
}

function daysInMonth(month: number, year: number): number {
    return new Date(year, month, 0).getDate();
}

function isValidDate(month: number, day: number, year: number): boolean {
    if (month < 1 || month > 12) return false;
    if (year < 1000 || year > 9999) return false;
    return !(day < 1 || day > daysInMonth(month, year));
}

export function dateKey(year: number, month: number, day: number): string {
    return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function parseDiaryText(raw: string): ParseSuccess | ParseFailure {
    const lines = raw.split(/\r\n|\r|\n/);
    const entries: DiaryMap = {};
    const errors: DiaryParseError[] = [];
    const yearSet = new Set<number>();
    let total = 0;

    lines.forEach((rawLine, idx) => {
        const line = rawLine.trim();
        if (line.length === 0) return;   // Ignore blank lines

        const match = LINE_PATTERN.exec(line);
        if (!match) {
            errors.push({line: idx + 1, text: rawLine});
            return;
        }

        // Swap index of month/day if you want date format to be d-m-yyyy
        const month = parseInt(match[1], 10);
        const day = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);
        const content = match[4].trim();

        if (!isValidDate(month, day, year)) {
            errors.push({line: idx + 1, text: rawLine});
            return;
        }

        const key = dateKey(year, month, day);
        if (!entries[key]) entries[key] = [];
        entries[key].push({content, line: idx + 1});
        yearSet.add(year);
        total += 1;
    });

    if (errors.length > 0) return {ok: false, errors};

    return {
        ok: true,
        entries,
        total,
        years: Array.from(yearSet).sort((a, b) => b - a),
    };
}
"use client";

import React, {useMemo, useState, useCallback} from "react";
import styles from "./DiaryVisualizer.module.css";
import CalendarGrid from "./CalendarGrid";
import DiaryPanel from "./DiaryPanel";
import ErrorDialog from "./ErrorDialog";
import {parseDiaryText, dateKey, type ParseSuccess, type DiaryParseError} from "@/lib/parseDiary";

function isDiaryTextFile(file: File): boolean {
    const fileName = file.name.toLowerCase();
    return fileName.endsWith(".txt") || file.type === "text/plain" || file.type === "";
}

interface UiError {
    title: string;
    message: string;
    lineErrors?: DiaryParseError[];
}

export default function DiaryVisualizer() {
    const [today] = useState(() => new Date());
    const [year, setYear] = useState(() => new Date().getFullYear());
    const [parseResult, setParseResult] = useState<ParseSuccess | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const [error, setError] = useState<UiError | null>(null);

    const todayKey = useMemo(
        () => dateKey(today.getFullYear(), today.getMonth() + 1, today.getDate()),
        [today]
    );

    const yearOptions = useMemo(() => {
        const set = new Set<number>([today.getFullYear(), year]);
        parseResult?.years.forEach((y) => set.add(y));
        return Array.from(set).sort((a, b) => b - a);
    }, [parseResult, today, year]);

    const handleFile = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;

            if (!isDiaryTextFile(file)) {
                setError({
                    title: "Can't read this file!",
                    message: `Daybook only reads plain text (.txt) diaries.`,
                });
                return;
            }

            try {
                const text = await file.text();
                const result = parseDiaryText(text);

                if (!result.ok) {
                    setError({
                        title: "Couldn't read this diary!",
                        message: `${result.errors.length} line${
                            result.errors.length === 1 ? "" : "s"
                        } don't match the expected format. Fix the line${
                            result.errors.length === 1 ? "" : "s"
                        } below and upload again.`,
                        lineErrors: result.errors,
                    });
                    return;
                }

                setParseResult(result);
                setFileName(file.name);
                setSelectedKey(null);
                if (result.years.length > 0 && !result.years.includes(year)) setYear(result.years[0]);
            } catch {
                setError({
                    title: "Couldn't read this diary!",
                    message: "Something went wrong while reading the uploaded diary. Please try again.",
                });
            }
        },
        [year]
    );

    const handleClear = useCallback(() => {
        setParseResult(null);
        setFileName(null);
        setSelectedKey(null);
    }, []);

    const total = parseResult?.total ?? 0;
    const dayEntries = selectedKey ? parseResult?.entries[selectedKey] : undefined;

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <div className={styles.masthead}>
                    <h1 className={styles.main_title}>Life Logger</h1>
                    <p className={styles.tagline}>Take a moment to reflect on your activities.</p>
                </div>

                <div className={styles.controls}>
                    <label className={styles.uploadButton}>
                        Upload diary
                        <input type="file" accept=".txt,text/plain" onChange={handleFile} className={styles.hiddenInput}/>
                    </label>

                    <select
                        className={styles.yearSelect}
                        value={year}
                        onChange={(e) => {
                            setYear(Number(e.target.value));
                            setSelectedKey(null);
                        }}
                        aria-label="Select year"
                    >
                        {yearOptions.map((y) => (<option key={y} value={y}>{y}</option>))}
                    </select>

                    <div className={styles.countBadge}>
                        {parseResult ? `Loaded ${total} diaries` : "No diary loaded"}
                    </div>
                </div>
            </header>

            {fileName && (
                <div className={styles.fileRow}>
                    <span>Loaded: <strong>{fileName}</strong></span>
                    <button className={styles.clearFileButton} onClick={handleClear}>Clear</button>
                </div>
            )}

            <section className={styles.gridSection}>
                <CalendarGrid
                    year={year}
                    entries={parseResult?.entries ?? {}}
                    todayKey={todayKey}
                    selectedKey={selectedKey}
                    onSelect={setSelectedKey}
                />
            </section>

            <section className={styles.panelSection}>
                <DiaryPanel selectedKey={selectedKey} dayEntries={dayEntries} onClear={() => setSelectedKey(null)}/>
            </section>

            {!parseResult && (
                <div>
                    <h1 className={styles.other_title}>Write a diary is simple!</h1>
                    <div className={styles.formatNote}>
                        <p>Just write a few words about what you do in the day. It can be in a few words or a few
                            sentences.</p>
                        <p>Write down the date before activities. Separate each day with a new line.</p>
                        <p>The format of the diary should follow this convention:<code>m-d-yyyy: activities</code>. For
                            example: <code>1-19-2023: Hang out with my buddies</code>.</p>
                    </div>
                </div>
            )}

            {error && (
                <ErrorDialog
                    title={error.title}
                    message={error.message}
                    lineErrors={error.lineErrors}
                    onClose={() => setError(null)}
                />
            )}

            <footer className={styles.footer}>
                "If today were the last day of my life, would I wanna do what I am about to do today?” And whenever the
                answer has been no for too many days in a row, I know I need to change something. -
                <a href={"https://news.stanford.edu/stories/2005/06/youve-got-find-love-jobs-says"}>Steve Jobs</a>
            </footer>
        </main>
    );
}
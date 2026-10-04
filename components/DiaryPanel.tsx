"use client";

import styles from "./DiaryPanel.module.css";
import {formatDiaryDate} from "@/lib/formatDate";
import type {DiaryEntry} from "@/lib/parseDiary";

interface DiaryPanelProps {
    selectedKey: string | null;
    dayEntries: DiaryEntry[] | undefined;
    onClear: () => void;
}

export default function DiaryPanel({selectedKey, dayEntries, onClear}: DiaryPanelProps) {
    if (!selectedKey || !dayEntries || dayEntries.length === 0) {
        return (<div className={styles.empty}>Click a day that's green to read what you wrote for that day.</div>);
    }

    return (
        <section className={styles.panel} aria-live="polite">
            <div className={styles.panelHeader}>
                <p className={styles.eyebrow}>{dayEntries.length} {dayEntries.length === 1 ? "entry" : "entries"}</p>
                <h2 className={styles.dateHeading}>{formatDiaryDate(selectedKey)}</h2>
                <button className={styles.clearButton} onClick={onClear} aria-label="Close entry">&times;</button>
            </div>

            <div className={styles.pages}>
                {dayEntries.map((entry, i) => (
                    <article key={i} className={styles.page}>
                        <p className={styles.pageContent}>{entry.content.length > 0 ? entry.content : "(No content)"}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}
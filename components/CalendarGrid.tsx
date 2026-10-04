"use client";

import React, {useMemo, useState, useCallback} from "react";
import styles from "./CalendarGrid.module.css";
import {buildYearGrid} from "@/lib/buildYearGrid";
import {formatCalendarDate} from "@/lib/formatDate";
import type {DiaryMap} from "@/lib/parseDiary";

interface CalendarGridProps {
    year: number;
    entries: DiaryMap;
    todayKey: string | null;
    selectedKey: string | null;
    onSelect: (key: string) => void;
}

interface TooltipState {
    x: number;
    y: number;
    label: string;
}

const WEEKDAY_ROWS: { row: number; label: string }[] = [
    {row: 1, label: "Mon"},
    {row: 3, label: "Wed"},
    {row: 5, label: "Fri"},
];

const CELL = 12;
const GAP = 3;
const STEP = CELL + GAP;

export default function CalendarGrid({year, entries, todayKey, selectedKey, onSelect,}: CalendarGridProps) {
    const {weeks, monthLabels} = useMemo(() => buildYearGrid(year), [year]);
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);

    const handleEnter = useCallback(
        (key: string, count: number, e: React.MouseEvent) => {
            const label = `${formatCalendarDate(key)} \u00b7 ${count} ${count === 1 ? "entry" : "entries"}`;
            setTooltip({x: e.clientX, y: e.clientY, label});
        }, []
    );

    const handleMove = useCallback((e: React.MouseEvent) => {
        setTooltip((prev) => (prev ? {...prev, x: e.clientX, y: e.clientY} : prev));
    }, []);

    const handleLeave = useCallback(() => setTooltip(null), []);

    const totalWidth = weeks.length * STEP - GAP;

    return (
        <div className={styles.wrap}>
            <div className={`${styles.scroller} scrollbar-thin`}>
                <div className={styles.inner} style={{width: totalWidth + 34}}>
                    <div className={styles.monthRow} style={{width: totalWidth, marginLeft: 34}}>
                        {monthLabels.map((m) => (
                            <span key={m.colIndex} className={styles.monthLabel} style={{left: m.colIndex * STEP}}>
                                {m.label}
                            </span>
                        ))}
                    </div>

                    <div className={styles.body}>
                        <div className={styles.weekdayCol}>
                            {WEEKDAY_ROWS.map((w) => (
                                <span key={w.label} className={styles.weekdayLabel} style={{top: w.row * STEP}}>
                                    {w.label}
                                </span>
                            ))}
                        </div>

                        <div className={styles.weeks} style={{width: totalWidth}} onMouseMove={handleMove}>
                            {weeks.map((week, wi) => (
                                <div key={wi} className={styles.week}>
                                    {week.map((cell, di) => {
                                        if (!cell) return (
                                            <div key={di} className={styles.cellSpacer} aria-hidden="true"/>);

                                        const dayEntries = entries[cell.key];
                                        const hasDiary = !!dayEntries && dayEntries.length > 0;
                                        const isToday = cell.key === todayKey;
                                        const isSelected = cell.key === selectedKey;

                                        const classNames = [styles.cell];
                                        if (hasDiary) classNames.push(styles.hasDiary);
                                        if (isToday) classNames.push(styles.today);
                                        if (isSelected) classNames.push(styles.selected);

                                        if (!hasDiary) {
                                            return (
                                                <div
                                                    key={di}
                                                    className={classNames.join(" ")}
                                                    title={isToday ? `${formatCalendarDate(cell.key)} \u00b7 today` : undefined}
                                                    aria-hidden="true"
                                                />
                                            );
                                        }

                                        return (
                                            <button
                                                key={di}
                                                type="button"
                                                className={classNames.join(" ")}
                                                onMouseEnter={(e) => handleEnter(cell.key, dayEntries.length, e)}
                                                onMouseLeave={handleLeave}
                                                onClick={() => onSelect(cell.key)}
                                                aria-label={`${formatCalendarDate(cell.key)}, ${dayEntries.length} ${
                                                    dayEntries.length === 1 ? "entry" : "entries"
                                                }${isToday ? ", today" : ""}`}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.legend}>
                <span className={styles.legendSwatch} data-kind="empty"/>
                <span>No activities</span>
                <span className={styles.legendSwatch} data-kind="diary"/>
                <span>Has activities</span>
                <span className={styles.legendSwatch} data-kind="today"/>
                <span>Today</span>
            </div>

            {tooltip && (
                <div className={styles.tooltip} style={{left: tooltip.x + 14, top: tooltip.y + 16}}>
                    {tooltip.label}
                </div>
            )}
        </div>
    );
}
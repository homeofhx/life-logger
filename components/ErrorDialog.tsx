"use client";

import {useEffect, useRef} from "react";
import styles from "./ErrorDialog.module.css";
import type {DiaryParseError} from "@/lib/parseDiary";

interface ErrorDialogProps {
    title: string;
    message: string;
    lineErrors?: DiaryParseError[];
    onClose: () => void;
}

const MAX_SHOWN = 5;

export default function ErrorDialog({title, message, lineErrors, onClose}: ErrorDialogProps) {
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        closeRef.current?.focus();

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    const shown = lineErrors?.slice(0, MAX_SHOWN) ?? [];
    const remaining = (lineErrors?.length ?? 0) - shown.length;

    return (
        <div className={styles.backdrop} onMouseDown={(e) => {if (e.target === e.currentTarget) onClose();}}>
            <div className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby="error-dialog-title">
                <p className={styles.eyebrow}>Oops...</p>
                <h2 id="error-dialog-title" className={styles.title}>{title}</h2>
                <p className={styles.message}>{message}</p>

                {shown.length > 0 && (
                    <ul className={styles.lineList}>
                        {shown.map((err) => (
                            <li key={err.line}>
                                <span className={styles.lineNo}>Line {err.line}</span>
                                <span className={styles.lineText}>{err.text.length > 0 ? err.text : "(empty)"}</span>
                            </li>
                        ))}
                        {remaining > 0 && (<li className={styles.more}>...and {remaining} more line(s)</li>)}
                    </ul>
                )}

                <div className={styles.formatHint}>
                    <span>The expected format of the diary should be like this, with one entry per line:</span>
                    <code>2-10-2025: activities of the day</code>
                </div>

                <button ref={closeRef} className={styles.closeButton} onClick={onClose}>OK</button>
            </div>
        </div>
    );
}
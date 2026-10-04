"use client";

import dynamic from "next/dynamic";

const DiaryVisualizer = dynamic(() => import("@/components/DiaryVisualizer"), {ssr: false});

export default function Page() {
    return <DiaryVisualizer/>;
}
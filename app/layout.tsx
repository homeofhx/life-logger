import type {Metadata} from "next";
import "./globals.css";
import React from "react";

export const metadata: Metadata = {
    title: "Life Logger"
};

export default function RootLayout({children,}: { children: React.ReactNode; }) {
    return (
        <html lang="en">
        <head>
            <meta name="color-scheme" content="light dark"/>
            <link rel="preconnect" href="https://fonts.googleapis.com"/>
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
            <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,500;0,600;1,400;1,500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>
            <title>Life Logger</title>
        </head>
        <body>{children}</body>
        </html>
    );
}
import React from "react";

export const metadata = {
    title: "Bridge SDK Demo",
    description: "Minimal demo app",
}

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body style={{fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", padding: 24}}>
        {children}
        </body>
        </html>
    )
}

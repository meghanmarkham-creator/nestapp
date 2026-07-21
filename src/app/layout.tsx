import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Nest — Readiness",
  description:
    "Carvana Learning & Enablement — advocate readiness, coaching, and report cards.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Carvana.DS — single global stylesheet entry (fonts, reference
            primitives, semantic light/dark themes, typography, atomic classes). */}
        <link rel="stylesheet" href="/_ds/carvana-ds/styles.css" />
      </head>
      {/* data-theme required for the DS semantic theme layer to apply. */}
      <body data-theme="carvana">
        <div id="root">{children}</div>
      </body>
    </html>
  );
}

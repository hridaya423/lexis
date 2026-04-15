import type { Metadata } from "next";
import { IBM_Plex_Mono, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Lexis",
    template: "%s | Lexis",
  },
  description: "Natural Language Terminal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${ibmPlexMono.variable} min-h-[100dvh] antialiased`}
    >
      <body className="min-h-[100dvh] flex flex-col bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--text)] selection:text-[var(--bg)]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-[var(--text)] focus:text-[var(--bg)] focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-widest focus:outline-none"
        >
          Skip to content
        </a>
        <div className="relative z-10 flex flex-col min-h-[100dvh]">
          {children}
        </div>
      </body>
    </html>
  );
}

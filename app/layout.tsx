import localFont from "next/font/local";
import type { Metadata } from "next";
import { IBM_Plex_Mono, Sora } from "next/font/google";
import "./globals.css";

const departure = localFont({ src: "./fonts/DepartureMono-1.500.woff2", display: "swap", variable: "--font-departure", weight: "400" });

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

const SITE_URL = "https://lexis.hridya.tech";
const GITHUB_URL = "https://github.com/hridaya423/lexis";
const CASE_STUDY_URL = "https://www.hridya.tech/projects/lexis";
const TITLE = "Lexis: plain English to shell commands, run on-device";
const DESCRIPTION =
  "Lexis turns plain English into one shell command with a local model, scores its risk, and runs only what you approve. macOS, Linux, Windows.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | Lexis",
  },
  description: DESCRIPTION,
  applicationName: "Lexis",
  authors: [{ name: "Hridya Agrawal", url: "https://www.hridya.tech" }],
  creator: "Hridya Agrawal",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Lexis",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "Lexis",
      url: SITE_URL,
      description: DESCRIPTION,
      inLanguage: "en",
      publisher: { "@id": "https://www.hridya.tech/#person" },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: "Lexis",
      description: DESCRIPTION,
      url: SITE_URL,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "macOS, Linux, Windows",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      license: "https://www.apache.org/licenses/LICENSE-2.0",
      codeRepository: GITHUB_URL,
      downloadUrl: "https://www.npmjs.com/package/@hridyacodes/lexis",
      sameAs: [GITHUB_URL, CASE_STUDY_URL],
      subjectOf: { "@type": "WebPage", url: CASE_STUDY_URL },
      isPartOf: { "@id": `${SITE_URL}/#website` },
      author: {
        "@type": "Person",
        "@id": "https://www.hridya.tech/#person",
        name: "Hridya Agrawal",
        url: "https://www.hridya.tech",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${ibmPlexMono.variable} ${departure.variable} min-h-[100dvh] antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-[100dvh] flex flex-col bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--text)] selection:text-[var(--bg)]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />

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

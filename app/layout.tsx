import type { Metadata } from "next";
import { Syne } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import { LanguageProvider } from "@/lib/hooks/useLanguage";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://klub.app'),
  title: {
    default: 'KLUB - Plateforme Collaborative BDE & Orgas',
    template: '%s | KLUB'
  },
  description: 'Location de matériel événementiel entre BDE et organisateurs. Son, lumière, vidéo, logistique - tout le nécessaire pour vos événements étudiants.',
  keywords: ['BDE', 'événements étudiants', 'location matériel', 'orga', 'gala', 'soirée étudiante', 'son', 'lumière', 'matériel événementiel'],
  authors: [{ name: 'KLUB Team' }],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://klub.app',
    title: 'KLUB - Plateforme Collaborative BDE & Orgas',
    description: 'Location de matériel événementiel entre communautés étudiantes',
    siteName: 'KLUB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KLUB - Plateforme Collaborative BDE & Orgas',
    description: 'Location de matériel événementiel entre communautés étudiantes',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className={`${syne.variable} antialiased min-h-screen`}>
        <LanguageProvider>
          <Header />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}

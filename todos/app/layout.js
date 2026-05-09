import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { GamesProvider } from "./_contexts/GamesContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Gry planszowe",
  description: "Przeglądanie i edycja ogłoszeń (PIWO)",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <GamesProvider>
          <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-8">
              <Link
                href="/"
                className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
              >
                Gry planszowe
              </Link>
              <nav className="flex flex-wrap gap-4 text-sm font-medium">
                <Link
                  href="/"
                  className="text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
                >
                  Lista
                </Link>
                <Link
                  href="/new"
                  className="text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
                >
                  Dodaj ogłoszenie
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex flex-1 flex-col">{children}</main>
        </GamesProvider>
      </body>
    </html>
  );
}

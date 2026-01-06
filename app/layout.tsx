import type { Metadata } from "next";
import { Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Notion uses Inter for UI and sans-serif content
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Notion offers serif option - Source Serif is similar
const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

// Notion offers monospace option
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stacknotes",
  description: "A modern, feature-rich, open-source note-taking application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${sourceSerif.variable} ${jetbrainsMono.variable}`}
        suppressHydrationWarning
      >
        {children}
        {/* Force remove Next.js dev tools portal */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const observer = new MutationObserver((mutations) => {
                  const portal = document.querySelector('nextjs-portal');
                  if (portal) {
                    portal.remove();
                    // observer.disconnect(); // Keep observing in case it comes back
                  }
                });
                observer.observe(document.body, { childList: true, subtree: true });
                // Also try immediate removal
                window.addEventListener('load', () => {
                   const portal = document.querySelector('nextjs-portal');
                   if (portal) portal.remove();
                });
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}

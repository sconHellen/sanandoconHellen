import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Nunito_Sans } from "next/font/google";
import { cookies } from "next/headers";
import { SITE_URL } from "@/lib/site";
import { THEME_COOKIE, parseTheme } from "@/lib/theme";
import "./styles/globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});

const nunito = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Sanando con Hellen", template: "%s · Sanando con Hellen" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f3ea" },
    { media: "(prefers-color-scheme: dark)", color: "#1b1526" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <html lang="es" data-theme={theme ?? undefined} className={`${cormorant.variable} ${nunito.variable}`}>
      <body>
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}

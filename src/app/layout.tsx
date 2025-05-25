import type { Metadata, Viewport } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  minimumScale: 1,
};

export const metadata: Metadata = {
  title: "Undangan Pernikahan Adelita & Ansyah",
  description: "Undangan pernikahan Adelita & Ansyah - Sabtu, 15 Juni 2024",
  keywords: "undangan pernikahan, wedding invitation, Adelita, Ansyah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="overflow-x-hidden">
      <body
        className={`${playfair.variable} ${montserrat.variable} antialiased w-full overflow-x-hidden`}
      >
        <div className="max-w-[100vw] overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}

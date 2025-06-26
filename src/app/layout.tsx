import type { Metadata, Viewport } from "next";
import { Playfair_Display, Montserrat, Tangerine } from "next/font/google";
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

const tangerine = Tangerine({
  variable: "--font-tangerine",
  subsets: ["latin"],
  weight: ["400", "700"],
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
  description: "Undangan Pernikahan Adelita & Ansyah",
  keywords: "undangan pernikahan, wedding invitation, Adelita, Ansyah",
  openGraph: {
    title: "Undangan Pernikahan",
    description: "Adelita & Ansyah",
    images: [
      {
        url: "/images/swahaxadel-508.jpg",
        width: 1200,
        height: 630,
        alt: "Undangan Pernikahan Adelita & Ansyah",
      }
    ],
    url: "https://ngundang-psi.vercel.app",
    siteName: "Undangan Pernikahan Adelita & Ansyah",
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "Undangan Pernikahan",
    description: "Adelita & Ansyah",
    images: ["/images/swahaxadel-508.jpg"],
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
    <html lang="id" className="overflow-x-hidden">
      <body
        className={`${playfair.variable} ${montserrat.variable} ${tangerine.variable} antialiased w-full overflow-x-hidden`}
      >
        <div className="max-w-[100vw] overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}

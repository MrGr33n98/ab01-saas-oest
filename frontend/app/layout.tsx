import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "OEST — Reality Data & Drone as a Service",
    template: "%s · OEST",
  },
  description:
    "Infraestrutura para solicitar, operar e integrar dados do mundo físico com missões de drones sob demanda.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  alternates: {
    languages: {
      "pt-BR": "/",
      en: "/en",
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    alternateLocale: ["en_US"],
    siteName: "OEST",
  },
  twitter: { card: "summary_large_image" },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DroneHub",
  },
};

export const viewport: Viewport = {
  themeColor: "#111820",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "OEST",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://oest.com.br",
    logo: `${process.env.NEXT_PUBLIC_APP_URL || "https://oest.com.br"}/icon.png`,
    description: "Infraestrutura para solicitar, operar e integrar dados do mundo físico",
    address: {
      "@type": "PostalAddress",
      addressCountry: "BR",
    },
    sameAs: [
      "https://www.linkedin.com",
      "https://www.instagram.com",
    ],
  };

  return (
    <html lang="pt-BR">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={`min-h-dvh ${inter.className} ${inter.variable}`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

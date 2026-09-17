"use client";

import React from "react";
import { usePathname } from "next/navigation";

interface TopographicBackgroundProps {
  variant?: "subtle" | "hero" | "heatmap";
  className?: string;
}

/**
 * TopographicBackground — High-End Geospatial Elevation & Heatmap Mesh
 *
 * Implements visible topographic contour isolines (curvas de nível)
 * merged with an ambient multispectral heatmap glow (NDVI / Thermal IR).
 *
 * Rules:
 * - Rendered strictly on public landing & marketing pages (/platform, /categories, etc.)
 * - Automatically DISABLED on internal dashboards (/app, /operator, /admin) to keep workspace UI clean.
 * - Hardware-accelerated ambient drift animation
 * - Pointer-events strictly disabled
 */
export function TopographicBackground({ className = "" }: TopographicBackgroundProps) {
  const pathname = usePathname();

  // Disable topographic lines on internal dashboards (Operator, Enterprise / App, Admin)
  const isDashboard =
    pathname?.startsWith("/app") ||
    pathname?.startsWith("/operator") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/en/app") ||
    pathname?.startsWith("/en/operator") ||
    pathname?.startsWith("/en/admin");

  if (isDashboard) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden select-none ${className}`}
    >
      {/* 1. Ambient Thermal Radiance Layer (Multispectral NDVI & Thermal IR Glows) */}
      <div className="absolute inset-0 opacity-80">
        {/* Top-Right: OEST Aero Blue Heat Core */}
        <div
          className="absolute -top-[10%] -right-[10%] h-[750px] w-[750px] rounded-full blur-[130px]"
          style={{
            background: "radial-gradient(circle, rgba(42, 87, 184, 0.14) 0%, rgba(42, 87, 184, 0.04) 60%, transparent 80%)",
          }}
        />

        {/* Center-Left: Emerald NDVI Biomass Heat Core */}
        <div
          className="absolute top-[35%] -left-[10%] h-[650px] w-[650px] rounded-full blur-[140px]"
          style={{
            background: "radial-gradient(circle, rgba(26, 158, 96, 0.12) 0%, rgba(26, 158, 96, 0.03) 60%, transparent 80%)",
          }}
        />

        {/* Bottom-Right: Solar & Thermal Radiation Accent */}
        <div
          className="absolute -bottom-[10%] right-[10%] h-[600px] w-[600px] rounded-full blur-[140px]"
          style={{
            background: "radial-gradient(circle, rgba(248, 198, 35, 0.08) 0%, rgba(42, 87, 184, 0.04) 50%, transparent 75%)",
          }}
        />
      </div>

      {/* 2. Topographic Contour Isolines (Curvas de Nível Vetoriais em SVG em Alta Resolução) */}
      <div className="absolute inset-0 opacity-100 oest-topo-drift">
        <svg
          className="h-full w-full object-cover"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <defs>
            {/* Subtle Gradient Stroke for Standard Isolines */}
            <linearGradient id="topoStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2A57B8" stopOpacity="0.32" />
              <stop offset="50%" stopColor="#1A9E60" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#2A57B8" stopOpacity="0.32" />
            </linearGradient>

            {/* Prominent Gradient Stroke for Major Index Contours */}
            <linearGradient id="indexStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2A57B8" stopOpacity="0.55" />
              <stop offset="50%" stopColor="#1A9E60" stopOpacity="0.50" />
              <stop offset="100%" stopColor="#2A57B8" stopOpacity="0.55" />
            </linearGradient>

            {/* Pattern for auxiliary survey grid dots */}
            <pattern id="surveyGrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="0.8" fill="#2A57B8" fillOpacity="0.18" />
            </pattern>
          </defs>

          {/* Survey Grid Background */}
          <rect width="100%" height="100%" fill="url(#surveyGrid)" />

          {/* Group: Top-Right High Ridge Mountain Isolines */}
          <g strokeWidth="1">
            <path
              d="M1150,-60 C1300,70 1420,200 1580,210 C1720,220 1820,130 1960,100"
              stroke="url(#topoStroke)"
            />
            <path
              d="M1090,-35 C1250,95 1380,235 1540,245 C1680,255 1780,165 1940,135"
              stroke="url(#topoStroke)"
            />
            <path
              d="M1030,-10 C1200,120 1340,270 1500,280 C1640,290 1740,200 1920,170"
              stroke="url(#indexStroke)"
              strokeWidth="1.5"
            />
            <text x="1350" y="288" fill="#2A57B8" fillOpacity="0.75" fontSize="10" fontWeight="600" fontFamily="monospace" letterSpacing="1">220m</text>

            <path
              d="M970,15 C1150,150 1300,310 1460,320 C1600,330 1710,240 1900,205"
              stroke="url(#topoStroke)"
            />
            <path
              d="M910,40 C1100,180 1260,350 1420,360 C1560,370 1680,275 1880,240"
              stroke="url(#topoStroke)"
            />
            <path
              d="M850,65 C1050,210 1220,390 1380,400 C1520,410 1650,310 1860,275"
              stroke="url(#indexStroke)"
              strokeWidth="1.5"
            />
            <text x="1230" y="408" fill="#2A57B8" fillOpacity="0.75" fontSize="10" fontWeight="600" fontFamily="monospace" letterSpacing="1">200m</text>

            <path
              d="M790,90 C1000,240 1180,430 1340,440 C1480,450 1620,345 1840,310"
              stroke="url(#topoStroke)"
            />
            <path
              d="M730,115 C950,270 1140,470 1300,480 C1440,490 1590,380 1820,345"
              stroke="url(#topoStroke)"
            />
            <path
              d="M670,140 C900,300 1100,510 1260,520 C1400,530 1560,415 1800,380"
              stroke="url(#indexStroke)"
              strokeWidth="1.5"
            />
            <text x="1110" y="528" fill="#2A57B8" fillOpacity="0.75" fontSize="10" fontWeight="600" fontFamily="monospace" letterSpacing="1">180m</text>
          </g>

          {/* Group: Central Valley & Plateau Isolines */}
          <g strokeWidth="1">
            <path
              d="M610,165 C850,335 1060,555 1220,565 C1360,575 1530,455 1780,415"
              stroke="url(#topoStroke)"
            />
            <path
              d="M550,190 C800,370 1020,600 1180,610 C1320,620 1500,495 1760,450"
              stroke="url(#topoStroke)"
            />
            <path
              d="M490,215 C750,405 980,645 1140,655 C1280,665 1470,535 1740,485"
              stroke="url(#indexStroke)"
              strokeWidth="1.5"
            />
            <text x="990" y="663" fill="#1A9E60" fillOpacity="0.75" fontSize="10" fontWeight="600" fontFamily="monospace" letterSpacing="1">160m</text>

            <path
              d="M430,240 C700,440 940,690 1100,700 C1240,710 1440,575 1720,520"
              stroke="url(#topoStroke)"
            />
            <path
              d="M370,265 C650,475 900,735 1060,745 C1200,755 1410,615 1700,555"
              stroke="url(#topoStroke)"
            />
            <path
              d="M310,290 C600,510 860,780 1020,790 C1160,800 1380,655 1680,590"
              stroke="url(#indexStroke)"
              strokeWidth="1.5"
            />
            <text x="870" y="798" fill="#1A9E60" fillOpacity="0.75" fontSize="10" fontWeight="600" fontFamily="monospace" letterSpacing="1">140m</text>
          </g>

          {/* Group: Southwest Coastal & Lowland Contour Group */}
          <g strokeWidth="1">
            <path
              d="M-80,480 C180,450 380,620 560,720 C730,810 960,850 1240,860 C1500,870 1690,790 1900,750"
              stroke="url(#topoStroke)"
            />
            <path
              d="M-80,550 C160,510 350,670 530,770 C700,860 930,900 1210,910 C1470,920 1670,840 1880,795"
              stroke="url(#indexStroke)"
              strokeWidth="1.5"
            />
            <text x="540" y="776" fill="#1A9E60" fillOpacity="0.75" fontSize="10" fontWeight="600" fontFamily="monospace" letterSpacing="1">120m</text>

            <path
              d="M-80,620 C140,570 320,720 500,820 C670,910 900,950 1180,960 C1440,970 1650,890 1860,840"
              stroke="url(#topoStroke)"
            />
            <path
              d="M-80,690 C120,630 290,770 470,870 C640,960 870,1000 1150,1010 C1410,1020 1630,940 1840,885"
              stroke="url(#indexStroke)"
              strokeWidth="1.5"
            />
            <text x="480" y="876" fill="#2A57B8" fillOpacity="0.75" fontSize="10" fontWeight="600" fontFamily="monospace" letterSpacing="1">100m</text>

            <path
              d="M-80,760 C100,690 260,820 440,920 C610,1010 840,1050 1120,1060 C1380,1070 1610,990 1820,930"
              stroke="url(#topoStroke)"
            />
            <path
              d="M-80,830 C80,750 230,870 410,970 C580,1060 810,1100 1090,1110 C1350,1120 1590,1040 1800,975"
              stroke="url(#indexStroke)"
              strokeWidth="1.5"
            />
            <text x="420" y="976" fill="#2A57B8" fillOpacity="0.75" fontSize="10" fontWeight="600" fontFamily="monospace" letterSpacing="1">80m</text>
          </g>

          {/* Spot Elevation Benchmarks (Pontos Cotados / Geodésicos) */}
          <g>
            <circle cx="1500" cy="220" r="3" fill="#2A57B8" fillOpacity="0.6" />
            <text x="1510" y="224" fill="#2A57B8" fillOpacity="0.65" fontSize="9" fontFamily="monospace">▲ PT-01 234.8m</text>

            <circle cx="1180" cy="460" r="3" fill="#1A9E60" fillOpacity="0.6" />
            <text x="1190" y="464" fill="#1A9E60" fillOpacity="0.65" fontSize="9" fontFamily="monospace">▲ PT-02 186.2m</text>

            <circle cx="700" cy="850" r="3" fill="#2A57B8" fillOpacity="0.6" />
            <text x="710" y="854" fill="#2A57B8" fillOpacity="0.65" fontSize="9" fontFamily="monospace">▲ RN-09 112.5m</text>
          </g>
        </svg>
      </div>

      {/* 3. High-Precision Technical CSS Keyframes */}
      <style jsx>{`
        @keyframes oestTopoDrift {
          0% {
            transform: scale(1) translate3d(0, 0, 0);
          }
          50% {
            transform: scale(1.015) translate3d(-10px, -6px, 0);
          }
          100% {
            transform: scale(1) translate3d(0, 0, 0);
          }
        }

        .oest-topo-drift {
          animation: oestTopoDrift 30s ease-in-out infinite;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .oest-topo-drift {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}


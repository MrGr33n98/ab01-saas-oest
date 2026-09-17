"use client";

interface IllustrationProps {
  color?: string; // hex or currentColor
  className?: string;
}

export function DroneNetworkIllustration({
  color = "currentColor",
  className = "",
}: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 540 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full max-w-[460px] select-none ${className}`}
      aria-hidden="true"
    >
      {/* Outer Dashed Orbit Ring (Tilted 3D Eclipse) */}
      <ellipse
        cx="280"
        cy="220"
        rx="230"
        ry="75"
        transform="rotate(-20 280 220)"
        stroke={color}
        strokeWidth="2.5"
        strokeDasharray="8 8"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Main Globe Mesh Sphere */}
      <circle
        cx="310"
        cy="220"
        r="120"
        stroke={color}
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Globe Latitudes & Longitudes */}
      <ellipse
        cx="310"
        cy="220"
        rx="60"
        ry="120"
        stroke={color}
        strokeWidth="2"
        opacity="0.6"
      />
      <ellipse
        cx="310"
        cy="220"
        rx="120"
        ry="45"
        stroke={color}
        strokeWidth="2"
        opacity="0.6"
      />
      <ellipse
        cx="310"
        cy="220"
        rx="120"
        ry="85"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="4 6"
        opacity="0.4"
      />

      {/* Connection Constellation Network Lines between Drones */}
      <g stroke={color} strokeWidth="2" opacity="0.85">
        <path d="M220 160 L310 120 L400 160" />
        <path d="M220 160 L260 250 L380 240 L400 160" />
        <path d="M310 120 L330 200 L380 240" />
        <path d="M260 250 L310 310 L410 290" />
        <path d="M380 240 L410 290" />
        <path d="M190 240 L260 250" />
        <path d="M310 310 L300 390" />
      </g>

      {/* Network Drone Nodes (Circular badges with Quadcopter icon) */}
      {/* Node 1: Top Center */}
      <g transform="translate(310, 120)">
        <circle r="15" fill="none" stroke={color} strokeWidth="2.5" />
        {/* Drone Icon */}
        <line x1="-7" y1="0" x2="7" y2="0" stroke={color} strokeWidth="1.8" />
        <circle cx="-6" cy="-4" r="2.5" stroke={color} strokeWidth="1.2" />
        <circle cx="6" cy="-4" r="2.5" stroke={color} strokeWidth="1.2" />
        <circle cx="-6" cy="4" r="2.5" stroke={color} strokeWidth="1.2" />
        <circle cx="6" cy="4" r="2.5" stroke={color} strokeWidth="1.2" />
      </g>

      {/* Node 2: Top Left */}
      <g transform="translate(220, 160)">
        <circle r="14" fill="none" stroke={color} strokeWidth="2.5" />
        <line x1="-6" y1="0" x2="6" y2="0" stroke={color} strokeWidth="1.8" />
        <circle cx="-5" cy="-3.5" r="2.2" stroke={color} strokeWidth="1.2" />
        <circle cx="5" cy="-3.5" r="2.2" stroke={color} strokeWidth="1.2" />
      </g>

      {/* Node 3: Top Right */}
      <g transform="translate(400, 160)">
        <circle r="14" fill="none" stroke={color} strokeWidth="2.5" />
        <line x1="-6" y1="0" x2="6" y2="0" stroke={color} strokeWidth="1.8" />
        <circle cx="-5" cy="-3.5" r="2.2" stroke={color} strokeWidth="1.2" />
        <circle cx="5" cy="-3.5" r="2.2" stroke={color} strokeWidth="1.2" />
      </g>

      {/* Node 4: Left Orbit */}
      <g transform="translate(190, 240)">
        <circle r="14" fill="none" stroke={color} strokeWidth="2.5" />
        <line x1="-6" y1="0" x2="6" y2="0" stroke={color} strokeWidth="1.8" />
        <circle cx="-5" cy="-3.5" r="2.2" stroke={color} strokeWidth="1.2" />
        <circle cx="5" cy="-3.5" r="2.2" stroke={color} strokeWidth="1.2" />
      </g>

      {/* Node 5: Center Surface */}
      <g transform="translate(330, 200)">
        <circle r="12" fill="none" stroke={color} strokeWidth="2" />
        <circle cx="0" cy="0" r="4" fill={color} />
      </g>

      {/* Node 6: Right Center */}
      <g transform="translate(380, 240)">
        <circle r="14" fill="none" stroke={color} strokeWidth="2.5" />
        <line x1="-6" y1="0" x2="6" y2="0" stroke={color} strokeWidth="1.8" />
        <circle cx="-5" cy="-3.5" r="2.2" stroke={color} strokeWidth="1.2" />
        <circle cx="5" cy="-3.5" r="2.2" stroke={color} strokeWidth="1.2" />
      </g>

      {/* Node 7: Bottom Center */}
      <g transform="translate(310, 310)">
        <circle r="14" fill="none" stroke={color} strokeWidth="2.5" />
        <line x1="-6" y1="0" x2="6" y2="0" stroke={color} strokeWidth="1.8" />
        <circle cx="-5" cy="-3.5" r="2.2" stroke={color} strokeWidth="1.2" />
        <circle cx="5" cy="-3.5" r="2.2" stroke={color} strokeWidth="1.2" />
      </g>

      {/* Node 8: Bottom Right */}
      <g transform="translate(410, 290)">
        <circle r="14" fill="none" stroke={color} strokeWidth="2.5" />
        <line x1="-6" y1="0" x2="6" y2="0" stroke={color} strokeWidth="1.8" />
        <circle cx="-5" cy="-3.5" r="2.2" stroke={color} strokeWidth="1.2" />
        <circle cx="5" cy="-3.5" r="2.2" stroke={color} strokeWidth="1.2" />
      </g>

      {/* Node 9: Outer Orbit Right */}
      <g transform="translate(470, 280)">
        <circle r="13" fill="none" stroke={color} strokeWidth="2" />
        <circle cx="0" cy="0" r="4" fill={color} />
      </g>

      {/* Stylized Hand Holding Smartphone at Bottom Left */}
      <g id="hand-and-phone">
        {/* Hand Silhouette / Contours */}
        <path
          d="M170 480 C160 440, 160 380, 165 320 C168 280, 178 260, 185 240 C190 225, 198 225, 202 240 C205 255, 205 300, 205 320"
          stroke={color}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Thumb Grip */}
        <path
          d="M165 320 C155 330, 145 350, 145 380 C145 420, 155 450, 170 480"
          stroke={color}
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Right Fingers gripping side of phone */}
        <path
          d="M265 330 C275 330, 280 338, 275 348 C270 355, 265 355, 265 355"
          stroke={color}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M265 365 C275 365, 280 373, 275 383 C270 390, 265 390, 265 390"
          stroke={color}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M265 400 C275 400, 280 408, 275 418 C270 425, 265 425, 265 425"
          stroke={color}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M260 435 C270 435, 275 443, 270 453 C265 460, 255 460, 250 460"
          stroke={color}
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Smartphone Body */}
        <rect
          x="195"
          y="290"
          width="70"
          height="145"
          rx="12"
          stroke={color}
          strokeWidth="3.5"
          fill="none"
        />

        {/* Top Speaker / Notch */}
        <line
          x1="222"
          y1="300"
          x2="238"
          y2="300"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Smartphone Screen Content */}
        <g id="screen-content">
          {/* Central Drone on Screen */}
          <g transform="translate(230, 328)">
            <line x1="-10" y1="0" x2="10" y2="0" stroke={color} strokeWidth="2" />
            <line x1="0" y1="-4" x2="0" y2="4" stroke={color} strokeWidth="2" />
            <circle cx="-8" cy="-5" r="3" stroke={color} strokeWidth="1.5" />
            <circle cx="8" cy="-5" r="3" stroke={color} strokeWidth="1.5" />
            <circle cx="-8" cy="5" r="3" stroke={color} strokeWidth="1.5" />
            <circle cx="8" cy="5" r="3" stroke={color} strokeWidth="1.5" />
          </g>

          {/* User Tree Connection under Drone */}
          <g transform="translate(230, 360)" stroke={color} strokeWidth="1.8">
            {/* Top User */}
            <circle cx="0" cy="-8" r="3.5" fill="none" />
            <path d="M-4 -2 C-4 -5, 4 -5, 4 -2" />

            {/* Tree Branch Line */}
            <line x1="0" y1="2" x2="0" y2="10" />
            <line x1="-12" y1="10" x2="12" y2="10" />

            {/* Left User */}
            <circle cx="-12" cy="16" r="3" fill="none" />
            {/* Right User */}
            <circle cx="12" cy="16" r="3" fill="none" />
          </g>

          {/* Text: ONE PLATFORM */}
          <text
            x="230"
            y="405"
            textAnchor="middle"
            fill={color}
            fontSize="7"
            fontFamily="monospace, sans-serif"
            fontWeight="bold"
            letterSpacing="0.8"
          >
            ONE PLATFORM
          </text>
        </g>
      </g>

      {/* Signal Beaming Curves connecting Phone to Network */}
      <path
        d="M230 280 C230 240, 240 210, 260 190"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="4 4"
        opacity="0.6"
      />
      <path
        d="M245 285 C245 250, 280 230, 300 220"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="4 4"
        opacity="0.6"
      />
    </svg>
  );
}

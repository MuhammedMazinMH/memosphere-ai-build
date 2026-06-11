"use client"

import { FlickeringGrid } from "@/components/ui/flickering-grid"

/**
 * MemoSphere brand mark (central node connected to four satellite nodes),
 * rendered in solid white so it can be used as an alpha mask for the grid.
 */
const LOGO_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='3' fill='white'/><circle cx='5' cy='6' r='1.6' fill='white'/><circle cx='19' cy='6' r='1.6' fill='white'/><circle cx='5' cy='18' r='1.6' fill='white'/><circle cx='19' cy='18' r='1.6' fill='white'/><path d='M9.6 10.4 6.2 7M14.4 10.4 17.8 7M9.6 13.6 6.2 17M14.4 13.6 17.8 17'/></svg>`

const LOGO_URI = `url("data:image/svg+xml,${encodeURIComponent(LOGO_SVG)}")`

const logoMaskStyle: React.CSSProperties = {
  WebkitMaskImage: LOGO_URI,
  WebkitMaskRepeat: "no-repeat",
  WebkitMaskPosition: "center 38%",
  WebkitMaskSize: "min(560px, 88vw)",
  maskImage: LOGO_URI,
  maskRepeat: "no-repeat",
  maskPosition: "center 38%",
  maskSize: "min(560px, 88vw)",
}

export function HeroBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[860px] overflow-hidden [mask-image:linear-gradient(to_bottom,white_70%,transparent)]"
    >
      {/* Faint ambient grid across the whole upper section */}
      <FlickeringGrid
        className="absolute inset-0 [mask-image:radial-gradient(900px_circle_at_center_top,white,transparent)]"
        color="#6366f1"
        maxOpacity={0.12}
        flickerChance={0.1}
        squareSize={4}
        gridGap={6}
      />

      {/* Brighter grid revealed only inside the MemoSphere logo shape */}
      <div className="absolute inset-0" style={logoMaskStyle}>
        <FlickeringGrid
          color="#818cf8"
          maxOpacity={0.7}
          flickerChance={0.16}
          squareSize={3}
          gridGap={5}
        />
      </div>
    </div>
  )
}

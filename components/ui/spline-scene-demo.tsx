'use client'

import { SplineScene } from "@/components/ui/splite";
import { HackingTerminal } from "@/components/ui/hacking-terminal";
import { Card } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";
 
export function SplineSceneBasic() {
  return (
    <Card className="w-full h-[500px] bg-black/[0.96] relative overflow-hidden border-2 border-[#00ff00]/20 hover:border-[#00ff00]/40 transition-all duration-300">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="#00ff00"
      />
      
      <div className="flex h-full">
        {/* Left content - Hacking Terminal */}
        <div className="flex-1 relative">
          <HackingTerminal />
        </div>

        {/* Right content - Robot */}
        <div className="flex-1 relative">
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  )
}

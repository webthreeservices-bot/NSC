import React, { useRef, useEffect, useState } from 'react';

// Types for component props
interface HeroProps {
  trustBadge?: {
    text: string;
    icons?: string[];
  };
  headline: {
    line1: string;
    line2: string;
  };
  subtitle: string;
  buttons?: {
    primary?: {
      text: string;
      onClick?: () => void;
    };
    secondary?: {
      text: string;
      onClick?: () => void;
    };
  };
  className?: string;
}

// Reusable Shader Background Hook
const useShaderBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const pointersRef = useRef<PointerHandler | null>(null);

  // WebGL Renderer class
  class WebGLRenderer {
    private canvas: HTMLCanvasElement;
    private gl: WebGL2RenderingContext;
    private program: WebGLProgram | null = null;
    private vs: WebGLShader | null = null;
    private fs: WebGLShader | null = null;
    private buffer: WebGLBuffer | null = null;
    private scale: number;
    private shaderSource: string;
    private mouseMove = [0, 0];
    private mouseCoords = [0, 0];
    private pointerCoords = [0, 0];
    private nbrOfPointers = 0;

    private vertexSrc = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`;

    private vertices = [-1, 1, -1, -1, 1, 1, 1, -1];

    constructor(canvas: HTMLCanvasElement, scale: number) {
      this.canvas = canvas;
      this.scale = scale;
      this.gl = canvas.getContext('webgl2')!;
      this.gl.viewport(0, 0, canvas.width * scale, canvas.height * scale);
      this.shaderSource = defaultShaderSource;
    }

    updateShader(source: string) {
      this.reset();
      this.shaderSource = source;
      this.setup();
      this.init();
    }

    updateMove(deltas: number[]) {
      this.mouseMove = deltas;
    }

    updateMouse(coords: number[]) {
      this.mouseCoords = coords;
    }

    updatePointerCoords(coords: number[]) {
      this.pointerCoords = coords;
    }

    updatePointerCount(nbr: number) {
      this.nbrOfPointers = nbr;
    }

    updateScale(scale: number) {
      this.scale = scale;
      this.gl.viewport(0, 0, this.canvas.width * scale, this.canvas.height * scale);
    }

    compile(shader: WebGLShader, source: string) {
      const gl = this.gl;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(shader);
        console.error('Shader compilation error:', error);
      }
    }

    test(source: string) {
      let result = null;
      const gl = this.gl;
      const shader = gl.createShader(gl.FRAGMENT_SHADER)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        result = gl.getShaderInfoLog(shader);
      }
      gl.deleteShader(shader);
      return result;
    }

    reset() {
      const gl = this.gl;
      if (this.program && !gl.getProgramParameter(this.program, gl.DELETE_STATUS)) {
        if (this.vs) {
          gl.detachShader(this.program, this.vs);
          gl.deleteShader(this.vs);
        }
        if (this.fs) {
          gl.detachShader(this.program, this.fs);
          gl.deleteShader(this.fs);
        }
        gl.deleteProgram(this.program);
      }
    }

    setup() {
      const gl = this.gl;
      this.vs = gl.createShader(gl.VERTEX_SHADER)!;
      this.fs = gl.createShader(gl.FRAGMENT_SHADER)!;
      this.compile(this.vs, this.vertexSrc);
      this.compile(this.fs, this.shaderSource);
      this.program = gl.createProgram()!;
      gl.attachShader(this.program, this.vs);
      gl.attachShader(this.program, this.fs);
      gl.linkProgram(this.program);

      if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(this.program));
      }
    }

    init() {
      const gl = this.gl;
      const program = this.program!;
      
      this.buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

      const position = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

      (program as any).resolution = gl.getUniformLocation(program, 'resolution');
      (program as any).time = gl.getUniformLocation(program, 'time');
      (program as any).move = gl.getUniformLocation(program, 'move');
      (program as any).touch = gl.getUniformLocation(program, 'touch');
      (program as any).pointerCount = gl.getUniformLocation(program, 'pointerCount');
      (program as any).pointers = gl.getUniformLocation(program, 'pointers');
    }

    render(now = 0) {
      const gl = this.gl;
      const program = this.program;
      
      if (!program || gl.getProgramParameter(program, gl.DELETE_STATUS)) return;

      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      
      gl.uniform2f((program as any).resolution, this.canvas.width, this.canvas.height);
      gl.uniform1f((program as any).time, now * 1e-3);
      gl.uniform2f((program as any).move, this.mouseMove[0], this.mouseMove[1]);
      gl.uniform2f((program as any).touch, this.mouseCoords[0], this.mouseCoords[1]);
      gl.uniform1i((program as any).pointerCount, this.nbrOfPointers);
      gl.uniform2fv((program as any).pointers, this.pointerCoords);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }

  // Pointer Handler class
  class PointerHandler {
    private scale: number;
    private active = false;
    private pointers = new Map<number, number[]>();
    private lastCoords = [0, 0];
    private moves = [0, 0];

    constructor(element: HTMLCanvasElement, scale: number) {
      this.scale = scale;
      
      const map = (element: HTMLCanvasElement, scale: number, x: number, y: number) => 
        [x * scale, element.height - y * scale];

      element.addEventListener('pointerdown', (e) => {
        this.active = true;
        this.pointers.set(e.pointerId, map(element, this.getScale(), e.clientX, e.clientY));
      });

      element.addEventListener('pointerup', (e) => {
        if (this.count === 1) {
          this.lastCoords = this.first;
        }
        this.pointers.delete(e.pointerId);
        this.active = this.pointers.size > 0;
      });

      element.addEventListener('pointerleave', (e) => {
        if (this.count === 1) {
          this.lastCoords = this.first;
        }
        this.pointers.delete(e.pointerId);
        this.active = this.pointers.size > 0;
      });

      element.addEventListener('pointermove', (e) => {
        if (!this.active) return;
        this.lastCoords = [e.clientX, e.clientY];
        this.pointers.set(e.pointerId, map(element, this.getScale(), e.clientX, e.clientY));
        this.moves = [this.moves[0] + e.movementX, this.moves[1] + e.movementY];
      });
    }

    getScale() {
      return this.scale;
    }

    updateScale(scale: number) {
      this.scale = scale;
    }

    get count() {
      return this.pointers.size;
    }

    get move() {
      return this.moves;
    }

    get coords() {
      return this.pointers.size > 0 
        ? Array.from(this.pointers.values()).flat() 
        : [0, 0];
    }

    get first() {
      return this.pointers.values().next().value || this.lastCoords;
    }
  }

  const resize = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const dpr = Math.max(1, 0.5 * window.devicePixelRatio);
    
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    
    if (rendererRef.current) {
      rendererRef.current.updateScale(dpr);
    }
  };

  const loop = (now: number) => {
    if (!rendererRef.current || !pointersRef.current) return;
    
    rendererRef.current.updateMouse(pointersRef.current.first);
    rendererRef.current.updatePointerCount(pointersRef.current.count);
    rendererRef.current.updatePointerCoords(pointersRef.current.coords);
    rendererRef.current.updateMove(pointersRef.current.move);
    rendererRef.current.render(now);
    animationFrameRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    
    // Check for WebGL2 support
    const gl = canvas.getContext('webgl2');
    if (!gl) {
      console.warn('WebGL2 not supported, shader background disabled');
      return;
    }

    const dpr = Math.max(1, 0.5 * window.devicePixelRatio);
    
    try {
      rendererRef.current = new WebGLRenderer(canvas, dpr);
      pointersRef.current = new PointerHandler(canvas, dpr);
      
      rendererRef.current.setup();
      rendererRef.current.init();
      
      resize();
      
      if (rendererRef.current.test(defaultShaderSource) === null) {
        rendererRef.current.updateShader(defaultShaderSource);
      }
      
      loop(0);
    } catch (error) {
      console.error('Failed to initialize shader background:', error);
      return;
    }
    
    window.addEventListener('resize', resize);
    
    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.reset();
      }
    };
  }, []);

  return canvasRef;
};

// Reusable Hero Component
const ShaderHero: React.FC<HeroProps> = ({
  trustBadge,
  headline,
  subtitle,
  buttons,
  className = ""
}) => {
  const canvasRef = useShaderBackground();

  return (
    <div className={`relative w-full h-screen overflow-hidden bg-black ${className}`}>
      <style jsx>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        
        .animation-delay-800 {
          animation-delay: 0.8s;
        }
        
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
      `}</style>
      
      {/* Fallback gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-90" />
      
      {/* Animated particles fallback */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-2 h-2 bg-[#00ff00]/20 rounded-full animate-pulse" style={{ top: '20%', left: '10%', animationDelay: '0s' }} />
        <div className="absolute w-1 h-1 bg-[#00ff00]/30 rounded-full animate-pulse" style={{ top: '60%', left: '80%', animationDelay: '1s' }} />
        <div className="absolute w-3 h-3 bg-[#00ff00]/10 rounded-full animate-pulse" style={{ top: '80%', left: '20%', animationDelay: '2s' }} />
        <div className="absolute w-1 h-1 bg-[#00ff00]/40 rounded-full animate-pulse" style={{ top: '30%', left: '70%', animationDelay: '1.5s' }} />
        <div className="absolute w-2 h-2 bg-[#00ff00]/15 rounded-full animate-pulse" style={{ top: '70%', left: '60%', animationDelay: '0.5s' }} />
      </div>
      
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-contain touch-none z-10"
        style={{ background: 'transparent' }}
      />
      
      {/* Hero Content Overlay */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white">
        {/* Trust Badge */}
        {trustBadge && (
          <div className="mb-8 animate-fade-in-down">
            <div className="flex items-center gap-2 px-6 py-3 bg-[#00ff00]/10 backdrop-blur-md border border-[#00ff00]/30 rounded-full text-sm">
              {trustBadge.icons && (
                <div className="flex">
                  {trustBadge.icons.map((icon, index) => (
                    <span key={index} className="text-[#00ff00]">
                      {icon}
                    </span>
                  ))}
                </div>
              )}
              <span className="text-[#00ff00]">{trustBadge.text}</span>
            </div>
          </div>
        )}

        <div className="text-center space-y-6 max-w-5xl mx-auto px-4">
          {/* Main Heading with Animation */}
          <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-[#00ff00] via-[#00cc00] to-[#00aa00] bg-clip-text text-transparent animate-fade-in-up animation-delay-200">
              {headline.line1}
            </h1>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-[#00cc00] via-[#00ff00] to-[#00dd00] bg-clip-text text-transparent animate-fade-in-up animation-delay-400">
              {headline.line2}
            </h1>
          </div>
          
          {/* Subtitle with Animation */}
          <div className="max-w-3xl mx-auto animate-fade-in-up animation-delay-600">
            <p className="text-lg md:text-xl lg:text-2xl text-gray-300 font-light leading-relaxed">
              {subtitle}
            </p>
          </div>
          
          {/* CTA Buttons with Animation */}
          {buttons && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 animate-fade-in-up animation-delay-800">
              {buttons.primary && (
                <button 
                  onClick={buttons.primary.onClick}
                  className="px-8 py-4 bg-gradient-to-r from-[#00ff00] to-[#00cc00] hover:from-[#00cc00] hover:to-[#00aa00] text-black rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#00ff00]/25"
                >
                  {buttons.primary.text}
                </button>
              )}
              {buttons.secondary && (
                <button 
                  onClick={buttons.secondary.onClick}
                  className="px-8 py-4 bg-[#00ff00]/10 hover:bg-[#00ff00]/20 border border-[#00ff00]/30 hover:border-[#00ff00]/50 text-[#00ff00] rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                >
                  {buttons.secondary.text}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const defaultShaderSource = `#version 300 es
/*********
* NSC Bot Platform - Galaxy Shader
* Green and Purple Galaxy Effect
*/
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)

// Returns a pseudo random number for a given point (white noise)
float rnd(vec2 p) {
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y);
}

// Returns a pseudo random number for a given point (value noise)
float noise(in vec2 p) {
  vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
  float
  a=rnd(i),
  b=rnd(i+vec2(1,0)),
  c=rnd(i+vec2(0,1)),
  d=rnd(i+1.);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}

// Returns a pseudo random number for a given point (fractal noise)
float fbm(vec2 p) {
  float t=.0, a=1.; 
  mat2 m=mat2(1.,-.5,.2,1.2);
  for (int i=0; i<6; i++) {
    t+=a*noise(p);
    p*=2.2*m;
    a*=.45;
  }
  return t;
}

// Galaxy cloud function with more complexity
float galaxy(vec2 p) {
	float d=1., t=.0;
	for (float i=.0; i<4.; i++) {
		float a=d*fbm(i*8.+p.x*.3+.15*(1.+i)*p.y+d+i*i+p*0.8);
		t=mix(t,d,a);
		d=a;
		p*=1.8/(i+1.);
	}
	return t;
}

// Spiral galaxy pattern
float spiral(vec2 p) {
    float r = length(p);
    float a = atan(p.y, p.x);
    return sin(a * 3.0 + r * 8.0 - T * 2.0) * 0.5 + 0.5;
}

void main(void) {
	vec2 uv=(FC-.5*R)/MN;
	vec2 st=uv*vec2(2.0,1.2);
	
	// Base galaxy pattern - much subtler
	float bg=galaxy(vec2(st.x+T*.2,-st.y+T*.05));
	float bg2=galaxy(vec2(st.x*1.2-T*.1,st.y*1.1+T*.08));
	
	// Spiral arms - more subtle
	float spiralPattern = spiral(uv * 1.5) * 0.3;
	
	// Dynamic UV transformation - gentler
	uv*=1.-.1*(sin(T*.1)*.5+.5);
	
	// Start with deep space black
	vec3 col=vec3(0.02, 0.01, 0.03); // Very dark space background
	
	// Subtle cloud layers
	for (float i=1.; i<8.; i++) {
		uv+=.04*cos(i*vec2(.08+.005*i, .6)+i*i+T*.2+.05*uv.x);
		vec2 p=uv;
		float d=length(p);
		
		// Much darker, subtle colors
		vec3 greenTint = vec3(0.0, 0.15, 0.05); // Dark green
		vec3 purpleTint = vec3(0.12, 0.03, 0.15); // Dark purple
		vec3 cyanTint = vec3(0.02, 0.08, 0.12); // Dark cyan
		
		// Create subtle color variation
		float colorMix = sin(i * 0.3 + T * 0.15 + d * 2.0) * 0.5 + 0.5;
		float colorMix2 = cos(i * 0.2 + T * 0.1 + length(p * 1.5)) * 0.5 + 0.5;
		
		vec3 baseColor = mix(greenTint, purpleTint, colorMix);
		baseColor = mix(baseColor, cyanTint, colorMix2 * 0.2);
		
		// Very subtle energy effects
		if(d > 0.1) {
			col+=.0003/d*baseColor*(cos(sin(i)*vec3(1.1,1.4,1.7))+1.);
		}
		
		// Subtle noise-based cloud details
		float b=noise(i+p+bg*1.2+bg2*0.8);
		if(b > 0.4) {
			col+=.0008*b*baseColor/max(0.1, length(max(p,vec2(b*p.x*.01,p.y))));
		}
		
		// Very subtle galaxy background clouds
		vec3 galaxyColor = mix(
			vec3(bg*0.08, bg*0.12, bg*0.06), // Subtle green tinted clouds
			vec3(bg2*0.1, bg2*0.04, bg2*0.15), // Subtle purple tinted clouds
			spiralPattern
		);
		
		col=mix(col, galaxyColor, d*0.3);
	}
	
	// Add subtle stars
	float stars = noise(uv * 80.0 + T * 0.05);
	if(stars > 0.98) {
		float starBrightness = (stars - 0.98) * 50.0;
		col += vec3(0.8, 0.9, 1.0) * starBrightness * 0.3;
	}
	
	// Add tiny green/purple star twinkles
	float coloredStars = noise(uv * 120.0 - T * 0.03);
	if(coloredStars > 0.985) {
		float twinkle = sin(T * 3.0 + coloredStars * 100.0) * 0.5 + 0.5;
		col += vec3(0.0, 0.3, 0.1) * twinkle * 0.2;
	}
	
	float purpleStars = noise(uv * 100.0 + T * 0.02);
	if(purpleStars > 0.99) {
		float twinkle = cos(T * 2.5 + purpleStars * 80.0) * 0.5 + 0.5;
		col += vec3(0.2, 0.05, 0.25) * twinkle * 0.15;
	}
	
	// Keep it dark - no brightness boost
	col = pow(col, vec3(1.1)); // Slight gamma adjustment
	col = clamp(col, 0.0, 1.0);
	
	O=vec4(col,1);
}`;

export default ShaderHero;

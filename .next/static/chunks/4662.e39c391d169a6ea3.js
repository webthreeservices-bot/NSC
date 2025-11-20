"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[4662],{34662:(e,n,r)=>{r.r(n),r.d(n,{WebGLShader:()=>l});var i=r(95155),o=r(12115),a=r(97650),t=r(29625);function l(){let e=(0,o.useRef)(null),n=(0,o.useRef)({scene:null,camera:null,renderer:null,mesh:null,uniforms:null,animationId:null});return(0,o.useEffect)(()=>{let r,i,o;if(!e.current)return;let l=e.current,{current:s}=n,m=`
      attribute vec3 position;
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `,u=`
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform float xScale;
      uniform float yScale;
      uniform float distortion;

      void main() {
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
        
        float d = length(p) * distortion;
        
        float rx = p.x * (1.0 + d);
        float gx = p.x;
        float bx = p.x * (1.0 - d);

        // Enhanced NSC Bot lime green theme - more vibrant greens
        float r = 0.03 / abs(p.y + sin((rx + time) * xScale) * yScale);
        float g = 0.08 / abs(p.y + sin((gx + time) * xScale) * yScale); // Brighter green
        float b = 0.02 / abs(p.y + sin((bx + time) * xScale) * yScale);
        
        // Add lime green glow effect
        vec3 limeGreen = vec3(0.0, 1.0, 0.0);
        vec3 darkGreen = vec3(0.0, 0.8, 0.0);
        
        // Create wave-based color mixing
        float wave = sin(time * 2.0 + p.x * 3.0) * 0.5 + 0.5;
        vec3 baseColor = mix(darkGreen, limeGreen, wave);
        
        gl_FragColor = vec4(r * baseColor.r, g * baseColor.g, b * baseColor.b, 1.0);
      }
    `,d=()=>{s.uniforms&&(s.uniforms.time.value+=.015),s.renderer&&s.scene&&s.camera&&s.renderer.render(s.scene,s.camera),s.animationId=requestAnimationFrame(d)},c=()=>{if(!s.renderer||!s.uniforms)return;let e=window.innerWidth,n=window.innerHeight;s.renderer.setSize(e,n,!1),s.uniforms.resolution.value=[e,n]};return s.scene=new a.Z58,s.renderer=new t.JeP({canvas:l}),s.renderer.setPixelRatio(window.devicePixelRatio),s.renderer.setClearColor(new a.Q1f(0)),s.camera=new a.qUd(-1,1,1,-1,0,-1),s.uniforms={resolution:{value:[window.innerWidth,window.innerHeight]},time:{value:0},xScale:{value:1.2},yScale:{value:.3},distortion:{value:.08}},r=new a.THS(new Float32Array([-1,-1,0,1,-1,0,-1,1,0,1,-1,0,-1,1,0,1,1,0]),3),(i=new a.LoY).setAttribute("position",r),o=new a.D$Q({vertexShader:m,fragmentShader:u,uniforms:s.uniforms,side:a.$EB}),s.mesh=new a.eaF(i,o),s.scene.add(s.mesh),c(),d(),window.addEventListener("resize",c),()=>{s.animationId&&cancelAnimationFrame(s.animationId),window.removeEventListener("resize",c),s.mesh&&(s.scene?.remove(s.mesh),s.mesh.geometry.dispose(),s.mesh.material instanceof a.imn&&s.mesh.material.dispose()),s.renderer?.dispose()}},[]),(0,i.jsx)("canvas",{ref:e,className:"fixed top-0 left-0 w-full h-full block"})}}}]);
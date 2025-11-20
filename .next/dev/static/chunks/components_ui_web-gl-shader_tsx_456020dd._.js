(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/ui/web-gl-shader.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WebGLShader",
    ()=>WebGLShader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.module.js [app-client] (ecmascript) <locals>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function WebGLShader() {
    _s();
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const sceneRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        scene: null,
        camera: null,
        renderer: null,
        mesh: null,
        uniforms: null,
        animationId: null
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WebGLShader.useEffect": ()=>{
            if (!canvasRef.current) return;
            const canvas = canvasRef.current;
            const { current: refs } = sceneRef;
            const vertexShader = `
      attribute vec3 position;
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;
            const fragmentShader = `
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
    `;
            const initScene = {
                "WebGLShader.useEffect.initScene": ()=>{
                    refs.scene = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Scene"]();
                    refs.renderer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$module$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["WebGLRenderer"]({
                        canvas
                    });
                    refs.renderer.setPixelRatio(window.devicePixelRatio);
                    refs.renderer.setClearColor(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"](0x000000));
                    refs.camera = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OrthographicCamera"](-1, 1, 1, -1, 0, -1);
                    refs.uniforms = {
                        resolution: {
                            value: [
                                window.innerWidth,
                                window.innerHeight
                            ]
                        },
                        time: {
                            value: 0.0
                        },
                        xScale: {
                            value: 1.2
                        },
                        yScale: {
                            value: 0.3
                        },
                        distortion: {
                            value: 0.08
                        }
                    };
                    const position = [
                        -1.0,
                        -1.0,
                        0.0,
                        1.0,
                        -1.0,
                        0.0,
                        -1.0,
                        1.0,
                        0.0,
                        1.0,
                        -1.0,
                        0.0,
                        -1.0,
                        1.0,
                        0.0,
                        1.0,
                        1.0,
                        0.0
                    ];
                    const positions = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferAttribute"](new Float32Array(position), 3);
                    const geometry = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferGeometry"]();
                    geometry.setAttribute("position", positions);
                    const material = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RawShaderMaterial"]({
                        vertexShader,
                        fragmentShader,
                        uniforms: refs.uniforms,
                        side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DoubleSide"]
                    });
                    refs.mesh = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Mesh"](geometry, material);
                    refs.scene.add(refs.mesh);
                    handleResize();
                }
            }["WebGLShader.useEffect.initScene"];
            const animate = {
                "WebGLShader.useEffect.animate": ()=>{
                    if (refs.uniforms) refs.uniforms.time.value += 0.015; // Slightly faster animation
                    if (refs.renderer && refs.scene && refs.camera) {
                        refs.renderer.render(refs.scene, refs.camera);
                    }
                    refs.animationId = requestAnimationFrame(animate);
                }
            }["WebGLShader.useEffect.animate"];
            const handleResize = {
                "WebGLShader.useEffect.handleResize": ()=>{
                    if (!refs.renderer || !refs.uniforms) return;
                    const width = window.innerWidth;
                    const height = window.innerHeight;
                    refs.renderer.setSize(width, height, false);
                    refs.uniforms.resolution.value = [
                        width,
                        height
                    ];
                }
            }["WebGLShader.useEffect.handleResize"];
            initScene();
            animate();
            window.addEventListener("resize", handleResize);
            return ({
                "WebGLShader.useEffect": ()=>{
                    if (refs.animationId) cancelAnimationFrame(refs.animationId);
                    window.removeEventListener("resize", handleResize);
                    if (refs.mesh) {
                        refs.scene?.remove(refs.mesh);
                        refs.mesh.geometry.dispose();
                        if (refs.mesh.material instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Material"]) {
                            refs.mesh.material.dispose();
                        }
                    }
                    refs.renderer?.dispose();
                }
            })["WebGLShader.useEffect"];
        }
    }["WebGLShader.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
        ref: canvasRef,
        className: "fixed top-0 left-0 w-full h-full block"
    }, void 0, false, {
        fileName: "[project]/components/ui/web-gl-shader.tsx",
        lineNumber: 148,
        columnNumber: 5
    }, this);
}
_s(WebGLShader, "UvmYBBCMxwAsWFVss74SPYsPfz0=");
_c = WebGLShader;
var _c;
__turbopack_context__.k.register(_c, "WebGLShader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/web-gl-shader.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/components/ui/web-gl-shader.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=components_ui_web-gl-shader_tsx_456020dd._.js.map
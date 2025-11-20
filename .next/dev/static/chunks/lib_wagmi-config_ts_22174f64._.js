(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/wagmi-config.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "wagmiConfig",
    ()=>wagmiConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use client';
const WEB3_DISABLED = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_WEB3_DISABLED === 'true' || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.WEB3_DISABLED === 'true';
let wagmiConfig = null;
if (!WEB3_DISABLED) {
    // Require wagmi packages only when web3 is enabled
    const { createConfig } = __turbopack_context__.r("[project]/node_modules/wagmi/dist/index.js [app-client] (ecmascript)");
    const { bsc } = __turbopack_context__.r("[project]/node_modules/wagmi/dist/chains.js [app-client] (ecmascript)");
    const { injected, walletConnect } = __turbopack_context__.r("[project]/node_modules/wagmi/dist/connectors/index.js [app-client] (ecmascript)");
    wagmiConfig = createConfig({
        chains: [
            bsc
        ],
        connectors: [
            walletConnect({
                projectId: '5205185a02961ead5f11a0af7b1489bd',
                showQrModal: true
            }),
            injected()
        ]
    });
}
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=lib_wagmi-config_ts_22174f64._.js.map
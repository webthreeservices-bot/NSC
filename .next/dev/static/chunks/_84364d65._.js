(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/CookieConsent.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Cookie Consent Banner Component
 * GDPR-compliant cookie consent notification
 */ __turbopack_context__.s([
    "default",
    ()=>CookieConsent,
    "useCookieConsent",
    ()=>useCookieConsent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
function CookieConsent() {
    _s();
    const [showBanner, setShowBanner] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showSettings, setShowSettings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [preferences, setPreferences] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        necessary: true,
        analytics: false,
        marketing: false
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CookieConsent.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            let timeoutId = null;
            // Check if user has already consented
            const consent = localStorage.getItem('cookieConsent');
            if (!consent) {
                // Delay showing banner slightly for better UX
                timeoutId = setTimeout({
                    "CookieConsent.useEffect": ()=>setShowBanner(true)
                }["CookieConsent.useEffect"], 1000);
            } else {
                // Load saved preferences
                try {
                    const savedPreferences = JSON.parse(consent);
                    setPreferences(savedPreferences);
                } catch (error) {
                    console.error('Error parsing cookie preferences:', error);
                }
            }
            // Cleanup function
            return ({
                "CookieConsent.useEffect": ()=>{
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                    }
                }
            })["CookieConsent.useEffect"];
        }
    }["CookieConsent.useEffect"], []);
    const acceptAll = ()=>{
        const allAccepted = {
            necessary: true,
            analytics: true,
            marketing: true
        };
        savePreferences(allAccepted);
    };
    const acceptNecessary = ()=>{
        const necessaryOnly = {
            necessary: true,
            analytics: false,
            marketing: false
        };
        savePreferences(necessaryOnly);
    };
    const saveCustomPreferences = ()=>{
        savePreferences(preferences);
    };
    const savePreferences = (prefs)=>{
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        // Save to localStorage
        localStorage.setItem('cookieConsent', JSON.stringify(prefs));
        localStorage.setItem('cookieConsentDate', new Date().toISOString());
        // Initialize analytics if accepted
        if (prefs.analytics) {
            // Initialize Google Analytics or other analytics here
            console.log('[Cookie Consent] Analytics cookies enabled');
        }
        // Initialize marketing if accepted
        if (prefs.marketing) {
            // Initialize marketing cookies here
            console.log('[Cookie Consent] Marketing cookies enabled');
        }
        // Hide banner
        setShowBanner(false);
        setShowSettings(false);
    };
    if (!showBanner) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black bg-opacity-50 z-40"
            }, void 0, false, {
                fileName: "[project]/components/CookieConsent.tsx",
                lineNumber: 105,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-6xl mx-auto bg-white rounded-lg shadow-2xl border border-gray-200",
                    children: !showSettings ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-6",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-shrink-0 text-4xl",
                                    children: "🍪"
                                }, void 0, false, {
                                    fileName: "[project]/components/CookieConsent.tsx",
                                    lineNumber: 115,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-xl font-bold text-gray-900 mb-2",
                                            children: "We Value Your Privacy"
                                        }, void 0, false, {
                                            fileName: "[project]/components/CookieConsent.tsx",
                                            lineNumber: 119,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-gray-600 text-sm mb-4",
                                            children: 'We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. You can customize your preferences or accept only necessary cookies.'
                                        }, void 0, false, {
                                            fileName: "[project]/components/CookieConsent.tsx",
                                            lineNumber: 122,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-gray-600 text-sm mb-4",
                                            children: [
                                                "Read our",
                                                ' ',
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    href: "/privacy",
                                                    className: "text-blue-600 hover:underline font-semibold",
                                                    children: "Privacy Policy"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CookieConsent.tsx",
                                                    lineNumber: 129,
                                                    columnNumber: 21
                                                }, this),
                                                ' ',
                                                "and",
                                                ' ',
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    href: "/terms",
                                                    className: "text-blue-600 hover:underline font-semibold",
                                                    children: "Terms of Service"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CookieConsent.tsx",
                                                    lineNumber: 133,
                                                    columnNumber: 21
                                                }, this),
                                                ' ',
                                                "for more information."
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/CookieConsent.tsx",
                                            lineNumber: 127,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: acceptAll,
                                                    className: "bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors",
                                                    children: "Accept All"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CookieConsent.tsx",
                                                    lineNumber: 141,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: acceptNecessary,
                                                    className: "bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold transition-colors",
                                                    children: "Necessary Only"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CookieConsent.tsx",
                                                    lineNumber: 147,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>setShowSettings(true),
                                                    className: "bg-white hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg border border-gray-300 font-semibold transition-colors",
                                                    children: "Customize"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CookieConsent.tsx",
                                                    lineNumber: 153,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/CookieConsent.tsx",
                                            lineNumber: 140,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/CookieConsent.tsx",
                                    lineNumber: 118,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/CookieConsent.tsx",
                            lineNumber: 113,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/CookieConsent.tsx",
                        lineNumber: 112,
                        columnNumber: 13
                    }, this) : /* Settings Panel */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-start gap-4 mb-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-shrink-0 text-4xl",
                                        children: "⚙️"
                                    }, void 0, false, {
                                        fileName: "[project]/components/CookieConsent.tsx",
                                        lineNumber: 167,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-xl font-bold text-gray-900 mb-2",
                                                children: "Cookie Preferences"
                                            }, void 0, false, {
                                                fileName: "[project]/components/CookieConsent.tsx",
                                                lineNumber: 169,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-gray-600 text-sm",
                                                children: "Choose which cookies you want to accept. Necessary cookies cannot be disabled as they are required for the website to function."
                                            }, void 0, false, {
                                                fileName: "[project]/components/CookieConsent.tsx",
                                                lineNumber: 170,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/CookieConsent.tsx",
                                        lineNumber: 168,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CookieConsent.tsx",
                                lineNumber: 166,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-4 mb-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "border border-gray-200 rounded-lg p-4",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between mb-2",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "checkbox",
                                                        checked: true,
                                                        disabled: true,
                                                        className: "w-5 h-5 rounded border-gray-300"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CookieConsent.tsx",
                                                        lineNumber: 183,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                className: "font-semibold text-gray-900",
                                                                children: [
                                                                    "Necessary Cookies",
                                                                    ' ',
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-xs text-gray-500 font-normal",
                                                                        children: "(Required)"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/CookieConsent.tsx",
                                                                        lineNumber: 192,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/CookieConsent.tsx",
                                                                lineNumber: 190,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-sm text-gray-600",
                                                                children: "Essential for the website to function. These cookies enable core functionality such as security, authentication, and session management."
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/CookieConsent.tsx",
                                                                lineNumber: 194,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/CookieConsent.tsx",
                                                        lineNumber: 189,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/CookieConsent.tsx",
                                                lineNumber: 182,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/CookieConsent.tsx",
                                            lineNumber: 181,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/CookieConsent.tsx",
                                        lineNumber: 180,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "border border-gray-200 rounded-lg p-4",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between mb-2",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "checkbox",
                                                        checked: preferences.analytics,
                                                        onChange: (e)=>setPreferences({
                                                                ...preferences,
                                                                analytics: e.target.checked
                                                            }),
                                                        className: "w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CookieConsent.tsx",
                                                        lineNumber: 207,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                className: "font-semibold text-gray-900",
                                                                children: "Analytics Cookies"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/CookieConsent.tsx",
                                                                lineNumber: 216,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-sm text-gray-600",
                                                                children: "Help us understand how visitors interact with our website. We use this data to improve user experience and site performance."
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/CookieConsent.tsx",
                                                                lineNumber: 217,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/CookieConsent.tsx",
                                                        lineNumber: 215,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/CookieConsent.tsx",
                                                lineNumber: 206,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/CookieConsent.tsx",
                                            lineNumber: 205,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/CookieConsent.tsx",
                                        lineNumber: 204,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "border border-gray-200 rounded-lg p-4",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between mb-2",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "checkbox",
                                                        checked: preferences.marketing,
                                                        onChange: (e)=>setPreferences({
                                                                ...preferences,
                                                                marketing: e.target.checked
                                                            }),
                                                        className: "w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CookieConsent.tsx",
                                                        lineNumber: 230,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                className: "font-semibold text-gray-900",
                                                                children: "Marketing Cookies"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/CookieConsent.tsx",
                                                                lineNumber: 239,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-sm text-gray-600",
                                                                children: "Used to track visitors across websites to display relevant advertisements and measure campaign effectiveness."
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/CookieConsent.tsx",
                                                                lineNumber: 240,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/CookieConsent.tsx",
                                                        lineNumber: 238,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/CookieConsent.tsx",
                                                lineNumber: 229,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/CookieConsent.tsx",
                                            lineNumber: 228,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/CookieConsent.tsx",
                                        lineNumber: 227,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CookieConsent.tsx",
                                lineNumber: 178,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: saveCustomPreferences,
                                        className: "bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors",
                                        children: "Save Preferences"
                                    }, void 0, false, {
                                        fileName: "[project]/components/CookieConsent.tsx",
                                        lineNumber: 252,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: acceptAll,
                                        className: "bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold transition-colors",
                                        children: "Accept All"
                                    }, void 0, false, {
                                        fileName: "[project]/components/CookieConsent.tsx",
                                        lineNumber: 258,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setShowSettings(false),
                                        className: "bg-white hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg border border-gray-300 font-semibold transition-colors",
                                        children: "Back"
                                    }, void 0, false, {
                                        fileName: "[project]/components/CookieConsent.tsx",
                                        lineNumber: 264,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CookieConsent.tsx",
                                lineNumber: 251,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CookieConsent.tsx",
                        lineNumber: 165,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/CookieConsent.tsx",
                    lineNumber: 109,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/CookieConsent.tsx",
                lineNumber: 108,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(CookieConsent, "m4kKtAYOM7KUEx+U6yvMI5YnxAU=");
_c = CookieConsent;
function useCookieConsent(type) {
    _s1();
    const [hasConsent, setHasConsent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useCookieConsent.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            const consent = localStorage.getItem('cookieConsent');
            if (consent) {
                try {
                    const preferences = JSON.parse(consent);
                    setHasConsent(preferences[type] || false);
                } catch (error) {
                    setHasConsent(false);
                }
            }
        }
    }["useCookieConsent.useEffect"], [
        type
    ]);
    return hasConsent;
}
_s1(useCookieConsent, "UgUV7ZelXuDFm37j3bg4vYGpqXY=");
var _c;
__turbopack_context__.k.register(_c, "CookieConsent");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/error-suppressor.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ErrorSuppressor",
    ()=>ErrorSuppressor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
function ErrorSuppressor() {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ErrorSuppressor.useEffect": ()=>{
            // Disable Next.js error overlay for wallet errors
            if ("TURBOPACK compile-time truthy", 1) {
                // @ts-ignore - Next.js internal API
                window.__NEXT_DATA__ = window.__NEXT_DATA__ || {};
                // @ts-ignore
                window.next = window.next || {};
                // @ts-ignore
                window.next.router = window.next.router || {};
            }
            // Suppress wallet extension errors that don't affect functionality
            const originalError = console.error;
            const originalWarn = console.warn;
            console.error = ({
                "ErrorSuppressor.useEffect": (...args)=>{
                    const errorString = args.join(' ');
                    // Suppress specific React state update errors
                    if (errorString.includes('Cannot update a component') || errorString.includes('while rendering a different component') || errorString.includes('AdminLayout') || errorString.includes('Router') || errorString.includes('setState() call inside')) {
                        return; // Suppress React state update warnings
                    }
                    // Suppress specific wallet extension errors and development errors
                    if (errorString.includes('chrome-extension://') || errorString.includes('pelagus') || errorString.includes('quiknode.pro') || errorString.includes('401') || errorString.includes('Unauthorized') || errorString.includes('injectScript.js') || errorString.includes('inpage.js') || errorString.includes('Object.connect') || errorString.includes('async s') || errorString.includes('__nextjs_original-stack-frame') || errorString.includes('stack-frame.js') || errorString.includes('provider-bridge.js') || errorString.includes('content.js') || errorString.includes('Cannot read properties of undefined') || errorString.includes('Cannot read property') || errorString.includes('is not defined') || errorString.includes('Error setting cookie') || errorString.includes('Error deleting cookie') || errorString.includes('Error decoding token')) {
                        return; // Suppress these errors completely
                    }
                    // Suppress empty API error objects
                    if (errorString.includes('API Error:') && (errorString.includes('{}') || errorString.includes('[object Object]'))) {
                        return;
                    }
                    // Log all other errors normally
                    originalError.apply(console, args);
                }
            })["ErrorSuppressor.useEffect"];
            console.warn = ({
                "ErrorSuppressor.useEffect": (...args)=>{
                    const warnString = args.join(' ');
                    // Suppress wallet extension warnings and React warnings we've handled
                    if (warnString.includes('chrome-extension://') || warnString.includes('pelagus') || warnString.includes('quiknode.pro') || warnString.includes('Cannot update a component') || warnString.includes('setState()') || warnString.includes('while rendering a different component') || warnString.includes('AdminLayout') || warnString.includes('Router') || warnString.includes('provider-bridge.js') || warnString.includes('MetaMask') || warnString.includes('Failed to connect') || warnString.includes('wallet') || warnString.includes('ethereum')) {
                        return; // Suppress these warnings completely
                    }
                    // Log all other warnings normally
                    originalWarn.apply(console, args);
                }
            })["ErrorSuppressor.useEffect"];
            // Suppress unhandled promise rejections from wallet extensions
            const handleUnhandledRejection = {
                "ErrorSuppressor.useEffect.handleUnhandledRejection": (event)=>{
                    const reason = event.reason?.message || event.reason?.toString() || '';
                    if (reason.includes('Failed to connect to MetaMask') || reason.includes('MetaMask extension not found') || reason.includes('chrome-extension://') || reason.includes('inpage.js') || reason.includes('injectScript.js') || reason.includes('Cannot read properties of undefined') || reason.includes('Cannot read property')) {
                        event.preventDefault(); // Suppress the error
                        return;
                    }
                }
            }["ErrorSuppressor.useEffect.handleUnhandledRejection"];
            // Global error handler for runtime errors
            const handleError = {
                "ErrorSuppressor.useEffect.handleError": (event)=>{
                    const errorMessage = event.message || '';
                    const filename = event.filename || '';
                    // More comprehensive MetaMask/wallet error detection
                    const isWalletError = errorMessage.includes('Cannot read properties of undefined') || errorMessage.includes('Cannot read property') || errorMessage.includes('is not defined') || errorMessage.includes('chrome-extension://') || errorMessage.includes('MetaMask') || errorMessage.includes('Failed to connect') || errorMessage.includes('wallet') || errorMessage.toLowerCase().includes('ethereum') || filename.includes('chrome-extension://') || filename.includes('inpage.js') || filename.includes('nkbihfbeogaeaoehlefnkodbefgpgknn');
                    if (isWalletError) {
                        // Completely suppress the error - don't even log to console
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return false;
                    }
                }
            }["ErrorSuppressor.useEffect.handleError"];
            // Intercept fetch requests to prevent Next.js from fetching stack frames
            const originalFetch = window.fetch;
            window.fetch = ({
                "ErrorSuppressor.useEffect": function(...args) {
                    const url = args[0]?.toString() || '';
                    // Block Next.js stack frame requests for wallet errors
                    if (url.includes('__nextjs_original-stack-frame') && (url.includes('chrome-extension') || url.includes('MetaMask') || url.includes('inpage.js'))) {
                        // Return empty promise to prevent the request
                        return Promise.reject(new Error('Blocked stack frame request for wallet error'));
                    }
                    return originalFetch.apply(window, args);
                }
            })["ErrorSuppressor.useEffect"];
            // Use capture phase to catch errors early
            window.addEventListener('unhandledrejection', handleUnhandledRejection, true);
            window.addEventListener('error', handleError, true);
            return ({
                "ErrorSuppressor.useEffect": ()=>{
                    console.error = originalError;
                    console.warn = originalWarn;
                    window.fetch = originalFetch;
                    window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
                    window.removeEventListener('error', handleError, true);
                }
            })["ErrorSuppressor.useEffect"];
        }
    }["ErrorSuppressor.useEffect"], []);
    return null;
}
_s(ErrorSuppressor, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = ErrorSuppressor;
var _c;
__turbopack_context__.k.register(_c, "ErrorSuppressor");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/auth.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Improved token management with better error handling and debugging
 */ __turbopack_context__.s([
    "getRefreshTokenFromStorage",
    ()=>getRefreshTokenFromStorage,
    "getTokenFromStorage",
    ()=>getTokenFromStorage,
    "getUserFromToken",
    ()=>getUserFromToken,
    "isAdmin",
    ()=>isAdmin,
    "isAuthenticated",
    ()=>isAuthenticated,
    "removeTokenFromStorage",
    ()=>removeTokenFromStorage,
    "setRefreshTokenToStorage",
    ()=>setRefreshTokenToStorage,
    "setTokenToStorage",
    ()=>setTokenToStorage,
    "validateToken",
    ()=>validateToken
]);
function getTokenFromStorage() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        // Try to get from localStorage first
        let token = localStorage.getItem('token');
        // If not in localStorage, try to get from cookie
        if (!token) {
            token = getCookie('token');
            if (token) {
                // Sync to localStorage for faster access
                try {
                    localStorage.setItem('token', token);
                    console.log('🔄 Token synced from cookie to localStorage');
                } catch (e) {
                    console.warn('⚠️ Could not sync token to localStorage:', e);
                }
            }
        }
        if (token) {
            console.log('✅ Token found in storage');
        } else {
            console.log('❌ No token found in storage or cookies');
        }
        return token;
    } catch (error) {
        console.error('❌ Error getting token from storage:', error);
        // Fallback to cookie only
        return getCookie('token');
    }
}
function setTokenToStorage(token) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        // Store in localStorage
        localStorage.setItem('token', token);
        // Also set in cookie with longer expiration for middleware
        setCookie('token', token, 7); // 7 days
        console.log('✅ Token stored in localStorage and cookie');
    } catch (error) {
        console.error('❌ Error storing token:', error);
        // Try to at least set the cookie
        try {
            setCookie('token', token, 7);
            console.log('✅ Token stored in cookie only');
        } catch (cookieError) {
            console.error('❌ Failed to store token anywhere:', cookieError);
        }
    }
}
function removeTokenFromStorage() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        // Clear cookies
        deleteCookie('token');
        deleteCookie('refreshToken');
        console.log('✅ All tokens cleared from storage and cookies');
    } catch (error) {
        console.error('❌ Error clearing tokens:', error);
    }
}
function getRefreshTokenFromStorage() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        let refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            refreshToken = getCookie('refreshToken');
            if (refreshToken) {
                try {
                    localStorage.setItem('refreshToken', refreshToken);
                } catch (e) {
                // localStorage might be full or disabled
                }
            }
        }
        return refreshToken;
    } catch (error) {
        // localStorage might be disabled or unavailable
        return getCookie('refreshToken');
    }
}
function setRefreshTokenToStorage(token) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        localStorage.setItem('refreshToken', token);
        setCookie('refreshToken', token, 30); // 30 days for refresh token
    } catch (error) {
    // Silent fail - no need to log in production
    }
}
// Cookie helper functions
function getCookie(name) {
    if (typeof document === 'undefined') return null;
    try {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            const part = parts.pop();
            if (part) {
                const cookieValue = part.split(';').shift();
                return cookieValue || null;
            }
        }
        return null;
    } catch (error) {
        // Silently handle cookie parsing errors
        return null;
    }
}
function setCookie(name, value, days) {
    if (typeof document === 'undefined') return;
    try {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    } catch (error) {
        // Silently handle cookie setting errors
        console.error('Error setting cookie:', error);
    }
}
function deleteCookie(name) {
    if (typeof document === 'undefined') return;
    try {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    } catch (error) {
        // Silently handle cookie deletion errors
        console.error('Error deleting cookie:', error);
    }
}
function isAuthenticated() {
    const token = getTokenFromStorage();
    return !!token;
}
function getUserFromToken() {
    // Token verification should be done server-side
    // This is just for client-side checks
    const token = getTokenFromStorage();
    if (!token) return null;
    try {
        // Decode JWT without verification (client-side only)
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const base64Url = parts[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}
function isAdmin() {
    const user = getUserFromToken();
    return user?.isAdmin === true;
}
async function validateToken(token) {
    if (!token) return false;
    try {
        // Make a request to validate the token with the server
        const response = await fetch('/api/auth/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            return data.valid === true;
        }
        return false;
    } catch (error) {
        // Silent fail - token validation failed
        return false;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/hooks/useTokenRefresh.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useTokenRefresh",
    ()=>useTokenRefresh
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jsonwebtoken/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function useTokenRefresh() {
    _s();
    const refreshTimeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])();
    const refreshToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useTokenRefresh.useCallback[refreshToken]": async ()=>{
            try {
                const currentRefreshToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getRefreshTokenFromStorage"])();
                if (!currentRefreshToken) {
                    console.log('No refresh token available');
                    return false;
                }
                console.log('Attempting to refresh token...');
                const response = await fetch('/api/auth/refresh', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        refreshToken: currentRefreshToken
                    })
                });
                if (!response.ok) {
                    console.error('Token refresh failed:', response.status, response.statusText);
                    // Only logout if it's definitely a 401/403, not network errors
                    if (response.status === 401 || response.status === 403) {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["removeTokenFromStorage"])();
                        window.location.href = '/login?session_expired=true';
                    }
                    return false;
                }
                const data = await response.json();
                if (data.token && data.refreshToken) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setTokenToStorage"])(data.token);
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setRefreshTokenToStorage"])(data.refreshToken);
                    console.log('Token refreshed successfully');
                    scheduleNextRefresh(data.token);
                    return true;
                }
                console.error('Token refresh response missing tokens');
                return false;
            } catch (error) {
                console.error('Error refreshing token:', error);
                // Don't auto-logout on network errors, just try again later
                return false;
            }
        }
    }["useTokenRefresh.useCallback[refreshToken]"], []);
    const scheduleNextRefresh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useTokenRefresh.useCallback[scheduleNextRefresh]": (token)=>{
            try {
                const decoded = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].decode(token);
                if (!decoded?.exp) return;
                const now = Math.floor(Date.now() / 1000);
                const expiresIn = decoded.exp - now;
                // Refresh 10 minutes before expiration, but at least 2 minutes
                const refreshIn = Math.max(expiresIn - 600, 120);
                if (refreshTimeoutRef.current) {
                    clearTimeout(refreshTimeoutRef.current);
                }
                console.log(`Scheduling token refresh in ${Math.floor(refreshIn / 60)} minutes`);
                refreshTimeoutRef.current = setTimeout({
                    "useTokenRefresh.useCallback[scheduleNextRefresh]": ()=>{
                        refreshToken();
                    }
                }["useTokenRefresh.useCallback[scheduleNextRefresh]"], refreshIn * 1000);
            } catch (error) {
                console.error('Error scheduling token refresh:', error);
            }
        }
    }["useTokenRefresh.useCallback[scheduleNextRefresh]"], [
        refreshToken
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useTokenRefresh.useEffect": ()=>{
            const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTokenFromStorage"])();
            if (token) {
                scheduleNextRefresh(token);
            }
            return ({
                "useTokenRefresh.useEffect": ()=>{
                    if (refreshTimeoutRef.current) {
                        clearTimeout(refreshTimeoutRef.current);
                    }
                }
            })["useTokenRefresh.useEffect"];
        }
    }["useTokenRefresh.useEffect"], [
        scheduleNextRefresh
    ]);
    return {
        refreshToken
    };
}
_s(useTokenRefresh, "IjTgsBfUTvhuGRvKq+9c0h4hhcc=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/providers.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/query-core/build/modern/queryClient.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTokenRefresh$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useTokenRefresh.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/shared/lib/app-dynamic.js [app-client] (ecmascript)");
;
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
const WEB3_DISABLED = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_WEB3_DISABLED === 'true' || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.WEB3_DISABLED === 'true';
// Dynamically import WagmiConfig to avoid SSR issues (only when web3 enabled)
const WagmiConfig = !WEB3_DISABLED ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$shared$2f$lib$2f$app$2d$dynamic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(()=>__turbopack_context__.A("[project]/node_modules/wagmi/dist/index.js [app-client] (ecmascript, next/dynamic entry, async loader)").then((mod)=>mod.WagmiConfig), {
    loadableGenerated: {
        modules: [
            "[project]/node_modules/wagmi/dist/index.js [app-client] (ecmascript, next/dynamic entry)"
        ]
    },
    ssr: false
}) : null;
function TokenRefreshProvider({ children }) {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTokenRefresh$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTokenRefresh"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
_s(TokenRefreshProvider, "A0rSIBUAnyWf2ZDyY0kfRqHUcSE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useTokenRefresh$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTokenRefresh"]
    ];
});
_c = TokenRefreshProvider;
function Providers({ children }) {
    _s1();
    const [queryClient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "Providers.useState": ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QueryClient"]({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        refetchOnWindowFocus: false,
                        retry: 1
                    }
                }
            })
    }["Providers.useState"]);
    const [wagmiConfig, setWagmiConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Providers.useEffect": ()=>{
            // Only load wagmi config on client side
            if (("TURBOPACK compile-time value", "object") !== 'undefined' && !WEB3_DISABLED) {
                __turbopack_context__.A("[project]/lib/wagmi-config.ts [app-client] (ecmascript, async loader)").then({
                    "Providers.useEffect": ({ wagmiConfig })=>{
                        setWagmiConfig(wagmiConfig);
                    }
                }["Providers.useEffect"]);
            }
        }
    }["Providers.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QueryClientProvider"], {
        client: queryClient,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TokenRefreshProvider, {
            children: wagmiConfig ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(WagmiConfig, {
                config: wagmiConfig,
                children: children
            }, void 0, false, {
                fileName: "[project]/components/providers.tsx",
                lineNumber: 48,
                columnNumber: 11
            }, this) : children
        }, void 0, false, {
            fileName: "[project]/components/providers.tsx",
            lineNumber: 46,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/providers.tsx",
        lineNumber: 45,
        columnNumber: 5
    }, this);
}
_s1(Providers, "xKgawaXzf/AqJ1cpzgerUbGmXVo=");
_c1 = Providers;
var _c, _c1;
__turbopack_context__.k.register(_c, "TokenRefreshProvider");
__turbopack_context__.k.register(_c1, "Providers");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/client-error-handler.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Client-Side Global Error Handler
 * Sets up handlers for unhandled errors and promise rejections on the client
 */ /**
 * Handle unhandled promise rejections
 */ __turbopack_context__.s([
    "cleanupGlobalErrorHandlers",
    ()=>cleanupGlobalErrorHandlers,
    "dispatchGlobalError",
    ()=>dispatchGlobalError,
    "setupGlobalErrorHandlers",
    ()=>setupGlobalErrorHandlers
]);
function setupGlobalErrorHandlers() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event)=>{
        console.error('Unhandled promise rejection:', event.reason);
        // Check if it's a MetaMask error
        if (event.reason?.message?.includes('MetaMask') || event.reason?.message?.includes('connect')) {
            console.warn('MetaMask error caught globally:', event.reason.message);
            // Prevent the error from crashing the app
            event.preventDefault();
            // Show a user-friendly message
            const message = 'A wallet connection error occurred. Please refresh the page or try using QR Code payment.';
            // Try to display a toast if available
            try {
                const customEvent = new CustomEvent('global-error', {
                    detail: {
                        message,
                        type: 'wallet'
                    }
                });
                window.dispatchEvent(customEvent);
            } catch (err) {
                console.error('Failed to dispatch global error event:', err);
            }
            return;
        }
        // Check if it's a network error
        if (event.reason?.message?.includes('fetch') || event.reason?.message?.includes('network') || event.reason?.code === 'ERR_NETWORK') {
            console.warn('Network error caught globally:', event.reason.message);
            event.preventDefault();
            return;
        }
    // For other errors, let them be handled normally but log them
    // Don't prevent default for non-wallet errors to maintain normal error flow
    });
    // Handle global errors (including from extensions)
    window.addEventListener('error', (event)=>{
        // Check if it's from MetaMask extension or contains MetaMask errors
        const isMetaMaskError = event.filename?.includes('chrome-extension') || event.filename?.includes('inpage.js') || event.message?.includes('MetaMask') || event.message?.includes('Failed to connect to MetaMask') || event.message?.toLowerCase().includes('wallet') || event.message?.toLowerCase().includes('ethereum');
        if (isMetaMaskError) {
            console.warn('🛑 MetaMask/Wallet extension error intercepted:', event.message);
            // Prevent the error from showing to user
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            // Log for debugging but don't crash
            console.debug('Error details:', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
            // Don't even show a toast - just silently handle it
            // User can use QR code payment if wallet doesn't work
            return false // Prevent default error handling
            ;
        }
    }, true); // Use capture phase to intercept earlier
    // Additional safeguard: Handle errors from specific extension sources
    const originalConsoleError = console.error;
    console.error = function(...args) {
        // Suppress MetaMask-related console errors
        const errorString = args.join(' ');
        if (errorString.includes('chrome-extension') || errorString.includes('Failed to connect to MetaMask') || errorString.includes('inpage.js')) {
            console.debug('🔕 Suppressed MetaMask extension error:', ...args);
            return;
        }
        // Call original console.error for non-wallet errors
        originalConsoleError.apply(console, args);
    };
    console.log('🛡️ Global error handlers initialized');
}
function cleanupGlobalErrorHandlers() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
// Remove event listeners if needed
// Note: We don't remove them by default as they should persist
// But this function is here if you need to clean up during unmount
}
function dispatchGlobalError(message, type = 'general') {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const event = new CustomEvent('global-error', {
            detail: {
                message,
                type
            }
        });
        window.dispatchEvent(event);
    } catch (err) {
        console.error('Failed to dispatch global error:', err);
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/GlobalErrorHandler.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GlobalErrorHandler",
    ()=>GlobalErrorHandler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$client$2d$error$2d$handler$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/client-error-handler.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function GlobalErrorHandler() {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GlobalErrorHandler.useEffect": ()=>{
            // Set up global error handlers
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$client$2d$error$2d$handler$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setupGlobalErrorHandlers"])();
        }
    }["GlobalErrorHandler.useEffect"], []);
    // This component doesn't render anything
    return null;
}
_s(GlobalErrorHandler, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = GlobalErrorHandler;
var _c;
__turbopack_context__.k.register(_c, "GlobalErrorHandler");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_84364d65._.js.map
(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/store/authStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAuthStore",
    ()=>useAuthStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/index.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-client] (ecmascript)");
;
;
const useAuthStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["persist"])((set)=>({
        user: null,
        setUser: (user)=>set({
                user
            }),
        clearUser: ()=>set({
                user: null
            })
    }), {
    name: 'auth-storage'
}));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Use relative URL to avoid CORS issues - always use same origin
__turbopack_context__.s([
    "adminAPI",
    ()=>adminAPI,
    "authAPI",
    ()=>authAPI,
    "botAPI",
    ()=>botAPI,
    "earningsAPI",
    ()=>earningsAPI,
    "packageAPI",
    ()=>packageAPI,
    "referralAPI",
    ()=>referralAPI,
    "transactionAPI",
    ()=>transactionAPI,
    "userAPI",
    ()=>userAPI,
    "withdrawalAPI",
    ()=>withdrawalAPI
]);
const API_URL = '/api';
async function apiRequest(endpoint, options = {}) {
    const { token, ...fetchOptions } = options;
    const headers = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    // Retry logic for network errors (especially useful for mobile)
    const maxRetries = 2;
    let lastError = null;
    for(let attempt = 0; attempt <= maxRetries; attempt++){
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(()=>controller.abort(), 30000) // 30 second timeout
            ;
            const response = await fetch(`${API_URL}${endpoint}`, {
                ...fetchOptions,
                headers,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            // Parse response body
            let data;
            try {
                const text = await response.text();
                data = text ? JSON.parse(text) : {};
            } catch (parseError) {
                console.error('Failed to parse response:', parseError);
                data = {
                    error: 'Invalid response from server'
                };
            }
            if (!response.ok) {
                const errorDetails = {
                    endpoint,
                    status: response.status,
                    statusText: response.statusText,
                    data,
                    attempt: attempt + 1,
                    url: `${API_URL}${endpoint}`
                };
                // Only log if there's actual error information
                if (errorDetails.status || errorDetails.data) {
                    console.error('API Error:', errorDetails);
                }
                // Extract error message from response
                let errorMessage = 'Request failed';
                if (data && typeof data === 'object') {
                    if (data.error && typeof data.error === 'string') {
                        errorMessage = data.error;
                    } else if (data.message && typeof data.message === 'string') {
                        errorMessage = data.message;
                    } else if (data.error && typeof data.error === 'object') {
                        errorMessage = JSON.stringify(data.error);
                    } else {
                        errorMessage = `Request failed with status ${response.status}`;
                    }
                } else if (typeof data === 'string') {
                    errorMessage = data;
                } else {
                    errorMessage = `Request failed with status ${response.status}`;
                }
                // Create an error with a clear message
                const error = new Error(errorMessage);
                error.status = response.status;
                error.data = data;
                throw error;
            }
            return data;
        } catch (error) {
            lastError = error;
            // Check if it's a network error that we should retry
            const isNetworkError = error.name === 'AbortError' || error.message?.includes('fetch') || error.message?.includes('network') || error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT') || error.message?.includes('ECONNREFUSED');
            // Retry on network errors, but not on client errors (4xx) or application errors
            if (isNetworkError && attempt < maxRetries) {
                console.warn(`Network error, retrying (${attempt + 1}/${maxRetries})...`);
                // Wait before retry with exponential backoff
                await new Promise((resolve)=>setTimeout(resolve, Math.pow(2, attempt) * 1000));
                continue;
            }
            // Don't retry, throw the error
            console.error('API Request Error:', {
                endpoint,
                error: error.message || error,
                stack: error.stack,
                attempt: attempt + 1
            });
            // If it's already an Error object with a message, re-throw it
            if (error instanceof Error && error.message) {
                throw error;
            }
            // Otherwise create a new Error with a proper message
            throw new Error(error?.message || 'Network error. Please check your connection and try again.');
        }
    }
    // If we get here, all retries failed
    throw lastError || new Error('Request failed after retries');
}
const authAPI = {
    register: (data)=>apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    login: (data)=>apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    verifyEmail: (token)=>apiRequest('/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify({
                token
            })
        }),
    forgotPassword: (email)=>apiRequest('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({
                email
            })
        }),
    resetPassword: (token, newPassword)=>apiRequest('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({
                token,
                newPassword
            })
        }),
    enable2FA: (token)=>apiRequest('/auth/enable-2fa', {
            method: 'POST',
            token
        }),
    verify2FA: (code, token)=>apiRequest('/auth/verify-2fa', {
            method: 'POST',
            body: JSON.stringify({
                code
            }),
            token
        })
};
const userAPI = {
    getProfile: (token)=>apiRequest('/user/profile', {
            token
        }),
    updateProfile: (data, token)=>apiRequest('/user/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
            token
        }),
    getReferralCode: (token)=>apiRequest('/user/referral-code', {
            token
        })
};
const packageAPI = {
    create: (data, token)=>apiRequest('/packages/create', {
            method: 'POST',
            body: JSON.stringify(data),
            token
        }),
    getMyPackages: (params, token)=>{
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/packages/my-packages?${query}`, {
            token
        });
    },
    getPackageById: (id, token)=>apiRequest(`/packages/${id}`, {
            token
        }),
    verifyDeposit: (id, txHash, token)=>apiRequest(`/packages/${id}/verify-deposit`, {
            method: 'POST',
            body: JSON.stringify({
                txHash
            }),
            token
        })
};
const botAPI = {
    activate: (data, token)=>apiRequest('/bots/activate', {
            method: 'POST',
            body: JSON.stringify(data),
            token
        }),
    getMyBots: (token)=>apiRequest('/bots/my-bots', {
            token
        }),
    checkEligibility: (botType, token)=>apiRequest(`/bots/check-eligibility?botType=${botType}`, {
            token
        })
};
const earningsAPI = {
    getSummary: (token)=>apiRequest('/earnings/summary', {
            token
        }),
    getHistory: (params, token)=>{
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/earnings/history?${query}`, {
            token
        });
    },
    getRoiSchedule: (token)=>apiRequest('/earnings/roi-schedule', {
            token
        })
};
const referralAPI = {
    getStats: (token)=>apiRequest('/referrals/stats', {
            token
        }),
    getTree: (level, token)=>{
        const query = level ? `?level=${level}` : '';
        return apiRequest(`/referrals/tree${query}`, {
            token
        });
    },
    getDirect: (token)=>apiRequest('/referrals/direct', {
            token
        }),
    getLevelBreakdown: (token)=>apiRequest('/referrals/level-breakdown', {
            token
        })
};
const withdrawalAPI = {
    request: (data, token)=>apiRequest('/withdrawals/request', {
            method: 'POST',
            body: JSON.stringify(data),
            token
        }),
    getHistory: (params, token)=>{
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/withdrawals/history?${query}`, {
            token
        });
    },
    checkEligibility: (token)=>apiRequest('/withdrawals/check-eligibility', {
            token
        })
};
const transactionAPI = {
    getHistory: (params, token)=>{
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/transactions/history?${query}`, {
            token
        });
    },
    getById: (id, token)=>apiRequest(`/transactions/${id}`, {
            token
        })
};
const adminAPI = {
    // User Management
    getUsers: (params, token)=>{
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/admin/users?${query}`, {
            token
        });
    },
    // Withdrawal Management
    getPendingWithdrawals: (token)=>apiRequest('/admin/withdrawals/pending', {
            token
        }),
    approveWithdrawal: (id, token)=>apiRequest(`/admin/withdrawals/${id}/approve`, {
            method: 'POST',
            body: JSON.stringify({}),
            token
        }),
    rejectWithdrawal: (id, reason, token)=>apiRequest(`/admin/withdrawals/${id}/reject`, {
            method: 'POST',
            body: JSON.stringify({
                reason
            }),
            token
        }),
    // Statistics
    getStatistics: (token)=>apiRequest('/admin/statistics', {
            token
        }),
    // Bot Package Management
    getBotPackages: (token)=>apiRequest('/admin/bot-packages', {
            token
        }),
    createBotPackage: (data, token)=>apiRequest('/admin/bot-packages', {
            method: 'POST',
            body: JSON.stringify(data),
            token
        }),
    updateBotPackage: (id, data, token)=>apiRequest('/admin/bot-packages', {
            method: 'PUT',
            body: JSON.stringify({
                id,
                ...data
            }),
            token
        }),
    deleteBotPackage: (id, token)=>apiRequest(`/admin/bot-packages?id=${id}`, {
            method: 'DELETE',
            token
        }),
    // System Settings
    updateSystemSettings: (data, token)=>apiRequest('/admin/system-settings', {
            method: 'POST',
            body: JSON.stringify(data),
            token
        })
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/error-helpers.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Extract a user-friendly error message from various error formats
 */ __turbopack_context__.s([
    "extractErrorMessage",
    ()=>extractErrorMessage,
    "formatErrorForLogging",
    ()=>formatErrorForLogging,
    "isAuthError",
    ()=>isAuthError,
    "isNetworkError",
    ()=>isNetworkError,
    "isValidationError",
    ()=>isValidationError
]);
function extractErrorMessage(err, defaultMessage = 'An error occurred') {
    // Handle null/undefined
    if (!err) {
        return defaultMessage;
    }
    // Handle Error instances
    if (err instanceof Error) {
        return err.message || defaultMessage;
    }
    // Handle response objects from API errors
    if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
            return data;
        }
        if (data.error && typeof data.error === 'string') {
            return data.error;
        }
        if (data.message && typeof data.message === 'string') {
            return data.message;
        }
    }
    // Handle direct error property
    if (err.error) {
        if (typeof err.error === 'string') {
            return err.error;
        }
        if (err.error.message && typeof err.error.message === 'string') {
            return err.error.message;
        }
    }
    // Handle direct message property
    if (err.message && typeof err.message === 'string') {
        return err.message;
    }
    // Handle string errors
    if (typeof err === 'string') {
        return err;
    }
    // Handle objects we couldn't parse
    if (typeof err === 'object') {
        try {
            // Try to extract any string value
            const keys = Object.keys(err);
            for (const key of keys){
                if (typeof err[key] === 'string' && err[key].length > 0) {
                    return err[key];
                }
            }
            // If no string found, stringify the object (last resort)
            const stringified = JSON.stringify(err);
            if (stringified !== '{}' && stringified !== '[object Object]') {
                return stringified;
            }
        } catch (e) {
            console.error('Error while extracting error message:', e);
        }
    }
    // Fallback to default message
    return defaultMessage;
}
function formatErrorForLogging(err) {
    return {
        type: typeof err,
        constructor: err?.constructor?.name,
        message: err?.message,
        error: err?.error,
        response: err?.response?.data,
        status: err?.status || err?.response?.status,
        stack: err?.stack,
        raw: err
    };
}
function isNetworkError(err) {
    const message = extractErrorMessage(err, '').toLowerCase();
    return message.includes('network') || message.includes('fetch') || message.includes('connection') || message.includes('timeout') || err?.name === 'NetworkError' || err?.code === 'NETWORK_ERROR';
}
function isAuthError(err) {
    const status = err?.status || err?.response?.status;
    return status === 401 || status === 403;
}
function isValidationError(err) {
    const status = err?.status || err?.response?.status;
    return status === 400 || status === 422;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/mobile-utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Mobile utility functions for better mobile experience
 */ /**
 * Detect if user is on mobile device
 */ __turbopack_context__.s([
    "fetchWithRetry",
    ()=>fetchWithRetry,
    "getMobileFriendlyErrorMessage",
    ()=>getMobileFriendlyErrorMessage,
    "getRecommendedTimeout",
    ()=>getRecommendedTimeout,
    "isMobileDevice",
    ()=>isMobileDevice,
    "isSlowConnection",
    ()=>isSlowConnection
]);
function isMobileDevice() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
function isSlowConnection() {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) {
        return false;
    }
    const connection = navigator.connection;
    if (!connection) return false;
    // Check effective type (slow-2g, 2g, 3g, 4g)
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        return true;
    }
    // Check if saveData is enabled (user opted for reduced data usage)
    if (connection.saveData) {
        return true;
    }
    return false;
}
function getRecommendedTimeout() {
    if (isSlowConnection()) {
        return 60000 // 60 seconds for slow connections
        ;
    }
    if (isMobileDevice()) {
        return 30000 // 30 seconds for mobile
        ;
    }
    return 15000 // 15 seconds for desktop
    ;
}
async function fetchWithRetry(url, options = {}, maxRetries = 2) {
    let lastError;
    for(let attempt = 0; attempt <= maxRetries; attempt++){
        try {
            const controller = new AbortController();
            const timeout = getRecommendedTimeout();
            const timeoutId = setTimeout(()=>controller.abort(), timeout);
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            lastError = error;
            // Check if it's a network error worth retrying
            const shouldRetry = error.name === 'AbortError' || error.message?.includes('fetch') || error.message?.includes('network') || error.message?.includes('timeout');
            if (shouldRetry && attempt < maxRetries) {
                // Exponential backoff
                const delay = Math.pow(2, attempt) * 1000;
                await new Promise((resolve)=>setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
    throw lastError;
}
function getMobileFriendlyErrorMessage(error) {
    if (!error) return 'An error occurred. Please try again.';
    const message = error.message || error.error || String(error);
    // Network errors
    if (message.includes('timeout') || message.includes('ETIMEDOUT')) {
        return 'Connection timeout. Please check your internet and try again.';
    }
    if (message.includes('network') || message.includes('fetch failed')) {
        return 'Network error. Please check your connection and try again.';
    }
    if (message.includes('ECONNREFUSED') || message.includes('connect')) {
        return 'Cannot connect to server. Please try again later.';
    }
    // Database errors
    if (message.includes('database') || message.includes('Database')) {
        return 'Service temporarily unavailable. Please try again in a moment.';
    }
    // Auth errors
    if (message.includes('Invalid email or password')) {
        return 'Invalid email or password';
    }
    if (message.includes('blocked')) {
        return 'Your account has been blocked. Please contact support.';
    }
    if (message.includes('2FA')) {
        return message // Keep 2FA messages as-is
        ;
    }
    // Rate limiting
    if (message.includes('Too many')) {
        return message // Keep rate limit messages as-is
        ;
    }
    // Default
    return message || 'An error occurred. Please try again.';
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/hooks/useAuth.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$authStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/authStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$error$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/error-helpers.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mobile$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/mobile-utils.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
function useAuth() {
    _s();
    const { user, setUser, clearUser } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$authStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuthStore"])();
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [initializing, setInitializing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // Validate current token on hook initialization
    const validateToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useAuth.useCallback[validateToken]": async ()=>{
            const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTokenFromStorage"])();
            if (!token) {
                console.log('🔍 No token found, user not authenticated');
                clearUser();
                setInitializing(false);
                return false;
            }
            try {
                console.log('🔍 Validating existing token...');
                const response = await fetch('/api/auth/validate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.valid && data.user) {
                        console.log('✅ Token valid, user authenticated:', data.user.email);
                        setUser({
                            id: data.user.id,
                            email: data.user.email,
                            username: data.user.email.split('@')[0],
                            fullName: data.user.fullName || null,
                            referralCode: data.user.referralCode || '',
                            isAdmin: data.user.isAdmin || false,
                            isEmailVerified: data.user.isEmailVerified || false,
                            twoFactorEnabled: data.user.twoFactorEnabled || false
                        });
                        setInitializing(false);
                        return true;
                    }
                }
                console.log('❌ Token invalid, clearing authentication');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["removeTokenFromStorage"])();
                clearUser();
                setInitializing(false);
                return false;
            } catch (error) {
                console.error('❌ Token validation error:', error);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["removeTokenFromStorage"])();
                clearUser();
                setInitializing(false);
                return false;
            }
        }
    }["useAuth.useCallback[validateToken]"], [
        setUser,
        clearUser
    ]);
    // Initialize auth state on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useAuth.useEffect": ()=>{
            validateToken();
        }
    }["useAuth.useEffect"], [
        validateToken
    ]);
    const login = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useAuth.useCallback[login]": async (email, password, twoFactorCode)=>{
            setLoading(true);
            setError(null);
            try {
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authAPI"].login({
                    email,
                    password,
                    twoFactorCode
                });
                if (response?.success) {
                    if (response.token) {
                        // Store token in both localStorage and cookie
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setTokenToStorage"])(response.token);
                        if (response.refreshToken) {
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setRefreshTokenToStorage"])(response.refreshToken);
                        }
                    }
                    if (response.user) {
                        setUser(response.user);
                        // Store admin status
                        if (response.user.isAdmin) {
                            localStorage.setItem('adminToken', response.token);
                        }
                    }
                    return {
                        success: true
                    };
                }
                // Handle 2FA requirement
                if (response?.requires2FA) {
                    setError('Please enter your 2FA code');
                    return {
                        success: false,
                        error: '2FA code required'
                    };
                }
                setError('Login failed. Please try again.');
                return {
                    success: false,
                    error: 'Login failed'
                };
            } catch (err) {
                console.error('Login error in useAuth:', (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$error$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatErrorForLogging"])(err));
                // Use mobile-friendly error messages
                const errorMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mobile$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMobileFriendlyErrorMessage"])(err);
                // Check for 2FA requirement
                if (errorMessage.includes('2FA')) {
                    return {
                        success: false,
                        error: errorMessage
                    };
                }
                setError(errorMessage);
                return {
                    success: false,
                    error: errorMessage
                };
            } finally{
                setLoading(false);
            }
        }
    }["useAuth.useCallback[login]"], [
        setUser
    ]);
    const register = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useAuth.useCallback[register]": async (data)=>{
            setLoading(true);
            setError(null);
            try {
                console.log('Registering with data:', data);
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authAPI"].register(data);
                if (response?.token) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setTokenToStorage"])(response.token);
                    if (response.user) {
                        setUser(response.user);
                    }
                    return {
                        success: true
                    };
                }
                return {
                    success: false,
                    error: response?.message || 'Registration failed'
                };
            } catch (err) {
                console.error('Registration error in useAuth:', (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$error$2d$helpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatErrorForLogging"])(err));
                // Use mobile-friendly error messages
                const errorMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mobile$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMobileFriendlyErrorMessage"])(err);
                setError(errorMessage);
                return {
                    success: false,
                    error: errorMessage
                };
            } finally{
                setLoading(false);
            }
        }
    }["useAuth.useCallback[register]"], [
        setUser
    ]);
    const logout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useAuth.useCallback[logout]": async ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["removeTokenFromStorage"])();
            clearUser();
            // Clear cookies by calling logout API
            try {
                await fetch('/api/auth/logout', {
                    method: 'POST'
                });
            } catch (error) {
                console.error('Logout error:', error);
            }
            // Redirect to home
            window.location.href = '/';
        }
    }["useAuth.useCallback[logout]"], [
        clearUser
    ]);
    return {
        user,
        loading,
        error,
        initializing,
        login,
        register,
        logout,
        validateToken,
        setUser,
        isAuthenticated: !!user
    };
}
_s(useAuth, "EfTb+A9DV0bBIYgrPXZKHoCNQMo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$authStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuthStore"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/sidebar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Sidebar",
    ()=>Sidebar,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useAuth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/house.js [app-client] (ecmascript) <export default as Home>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/package.js [app-client] (ecmascript) <export default as Package>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bot.js [app-client] (ecmascript) <export default as Bot>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-client] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wallet$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wallet$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wallet.js [app-client] (ecmascript) <export default as Wallet>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$help$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-help.js [app-client] (ecmascript) <export default as HelpCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield.js [app-client] (ecmascript) <export default as Shield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-out.js [app-client] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$receipt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Receipt$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/receipt.js [app-client] (ecmascript) <export default as Receipt>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gift$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Gift$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/gift.js [app-client] (ecmascript) <export default as Gift>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chart-column.js [app-client] (ecmascript) <export default as BarChart3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$user$2d$round$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCircle2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-user-round.js [app-client] (ecmascript) <export default as UserCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
const Sidebar = ({ isOpen = true, onClose })=>{
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { logout } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [expandedSection, setExpandedSection] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('main');
    const handleLogout = async ()=>{
        try {
            await logout();
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };
    const menuItems = [
        {
            id: 'main',
            title: 'Main Menu',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__["Home"],
            items: [
                {
                    href: '/dashboard',
                    label: 'Dashboard',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__["Home"],
                    badge: null
                },
                {
                    href: '/packages',
                    label: 'Packages',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"],
                    badge: null
                },
                {
                    href: '/bots',
                    label: 'My Bots',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__["Bot"],
                    badge: 'Active'
                }
            ]
        },
        {
            id: 'finance',
            title: 'Finance',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wallet$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wallet$3e$__["Wallet"],
            items: [
                {
                    href: '/earnings',
                    label: 'Earnings',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"],
                    badge: null
                },
                {
                    href: '/withdrawals',
                    label: 'Withdraw',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wallet$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wallet$3e$__["Wallet"],
                    badge: null
                },
                {
                    href: '/transactions',
                    label: 'Transactions',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$receipt$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Receipt$3e$__["Receipt"],
                    badge: null
                }
            ]
        },
        {
            id: 'network',
            title: 'Network',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"],
            items: [
                {
                    href: '/network',
                    label: 'Referral Tree',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"],
                    badge: null
                },
                {
                    href: '/team-performance',
                    label: 'Performance',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"],
                    badge: null
                }
            ]
        },
        {
            id: 'account',
            title: 'Settings',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"],
            items: [
                {
                    href: '/profile',
                    label: 'My Profile',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$user$2d$round$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCircle2$3e$__["UserCircle2"],
                    badge: null
                },
                {
                    href: '/security',
                    label: 'Security',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"],
                    badge: null
                },
                {
                    href: '/support',
                    label: 'Help & Support',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$help$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__["HelpCircle"],
                    badge: null
                }
            ]
        }
    ];
    const isActive = (href)=>pathname === href;
    const toggleSection = (sectionId)=>{
        setExpandedSection(expandedSection === sectionId ? null : sectionId);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: "jsx-5bfa814f7238b512" + " " + `
      fixed inset-y-0 left-0 z-50
      w-72 bg-gradient-to-b from-gray-950 via-black to-gray-950
      border-r border-gray-800/50
      h-screen flex flex-col
      md:translate-x-0 md:block
      transition-transform duration-300 ease-in-out
      shadow-2xl
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-5bfa814f7238b512" + " " + "relative p-5 border-b border-gray-800/50 bg-gradient-to-br from-gray-900/80 to-black backdrop-blur-sm flex-shrink-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-5bfa814f7238b512" + " " + "absolute inset-0 bg-[#00ff00]/5 blur-xl"
                    }, void 0, false, {
                        fileName: "[project]/components/ui/sidebar.tsx",
                        lineNumber: 109,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/dashboard",
                        className: "relative flex items-center gap-4 active:opacity-70 transition-all duration-200 group",
                        onClick: onClose,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-5bfa814f7238b512" + " " + "relative w-12 h-12 bg-gradient-to-br from-[#00ff00] to-[#00cc00] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#00ff00]/30 group-hover:shadow-[#00ff00]/50 transition-all duration-300 group-hover:scale-105",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                        className: "w-7 h-7 text-black",
                                        strokeWidth: 2.5
                                    }, void 0, false, {
                                        fileName: "[project]/components/ui/sidebar.tsx",
                                        lineNumber: 116,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-5bfa814f7238b512" + " " + "absolute inset-0 bg-[#00ff00]/20 rounded-xl blur-md"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ui/sidebar.tsx",
                                        lineNumber: 117,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ui/sidebar.tsx",
                                lineNumber: 115,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-5bfa814f7238b512",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "jsx-5bfa814f7238b512" + " " + "text-white font-bold text-xl tracking-tight",
                                        children: "NSC Bot"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ui/sidebar.tsx",
                                        lineNumber: 120,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "jsx-5bfa814f7238b512" + " " + "text-gray-400 text-xs font-medium",
                                        children: "AI Trading Platform"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ui/sidebar.tsx",
                                        lineNumber: 121,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ui/sidebar.tsx",
                                lineNumber: 119,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ui/sidebar.tsx",
                        lineNumber: 110,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/sidebar.tsx",
                lineNumber: 108,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "jsx-5bfa814f7238b512" + " " + "flex-1 overflow-y-auto min-h-0 px-3 py-4 space-y-1 custom-scrollbar",
                children: menuItems.map((section)=>{
                    const SectionIcon = section.icon;
                    const isExpanded = expandedSection === section.id;
                    const hasActiveItem = section.items.some((item)=>isActive(item.href));
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-5bfa814f7238b512" + " " + "mb-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>toggleSection(section.id),
                                className: "jsx-5bfa814f7238b512" + " " + `
                  w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold
                  transition-all duration-200 group
                  ${hasActiveItem || isExpanded ? 'text-[#00ff00] bg-[#00ff00]/10' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}
                `,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-5bfa814f7238b512" + " " + "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionIcon, {
                                                className: "jsx-5bfa814f7238b512" + " " + "h-4 w-4"
                                            }, void 0, false, {
                                                fileName: "[project]/components/ui/sidebar.tsx",
                                                lineNumber: 148,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-5bfa814f7238b512" + " " + "text-xs uppercase tracking-wider",
                                                children: section.title
                                            }, void 0, false, {
                                                fileName: "[project]/components/ui/sidebar.tsx",
                                                lineNumber: 149,
                                                columnNumber: 19
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/ui/sidebar.tsx",
                                        lineNumber: 147,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                        className: `h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`
                                    }, void 0, false, {
                                        fileName: "[project]/components/ui/sidebar.tsx",
                                        lineNumber: 151,
                                        columnNumber: 17
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ui/sidebar.tsx",
                                lineNumber: 136,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-5bfa814f7238b512" + " " + `
                overflow-hidden transition-all duration-300 ease-in-out
                ${isExpanded ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}
              `,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                    className: "jsx-5bfa814f7238b512" + " " + "space-y-0.5 pl-1",
                                    children: section.items.map((item)=>{
                                        const Icon = item.icon;
                                        const active = isActive(item.href);
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            className: "jsx-5bfa814f7238b512",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                href: item.href,
                                                onClick: onClose,
                                                className: `
                            relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                            transition-all duration-200 group overflow-hidden
                            ${active ? 'bg-gradient-to-r from-[#00ff00] to-[#00cc00] text-black font-semibold shadow-lg shadow-[#00ff00]/20' : 'hover:bg-gray-800/70 text-gray-300 hover:text-white hover:translate-x-1'}
                          `,
                                                children: [
                                                    active && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-5bfa814f7238b512" + " " + "absolute inset-0 bg-gradient-to-r from-[#00ff00]/20 to-transparent animate-pulse"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ui/sidebar.tsx",
                                                        lineNumber: 180,
                                                        columnNumber: 29
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                        className: "jsx-5bfa814f7238b512" + " " + `h-4 w-4 flex-shrink-0 relative z-10 ${active ? '' : 'group-hover:scale-110 transition-transform'}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ui/sidebar.tsx",
                                                        lineNumber: 182,
                                                        columnNumber: 27
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-5bfa814f7238b512" + " " + "flex-1 font-medium relative z-10",
                                                        children: item.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ui/sidebar.tsx",
                                                        lineNumber: 183,
                                                        columnNumber: 27
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    item.badge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-5bfa814f7238b512" + " " + `
                              px-2 py-0.5 rounded-full text-[10px] font-bold relative z-10
                              ${active ? 'bg-black/20 text-black' : 'bg-[#00ff00]/20 text-[#00ff00]'}
                            `,
                                                        children: item.badge
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ui/sidebar.tsx",
                                                        lineNumber: 185,
                                                        columnNumber: 29
                                                    }, ("TURBOPACK compile-time value", void 0)),
                                                    active && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-5bfa814f7238b512" + " " + "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-black rounded-r-full"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ui/sidebar.tsx",
                                                        lineNumber: 196,
                                                        columnNumber: 29
                                                    }, ("TURBOPACK compile-time value", void 0))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/ui/sidebar.tsx",
                                                lineNumber: 167,
                                                columnNumber: 25
                                            }, ("TURBOPACK compile-time value", void 0))
                                        }, item.href, false, {
                                            fileName: "[project]/components/ui/sidebar.tsx",
                                            lineNumber: 166,
                                            columnNumber: 23
                                        }, ("TURBOPACK compile-time value", void 0));
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/components/ui/sidebar.tsx",
                                    lineNumber: 161,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/components/ui/sidebar.tsx",
                                lineNumber: 157,
                                columnNumber: 15
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, section.id, true, {
                        fileName: "[project]/components/ui/sidebar.tsx",
                        lineNumber: 134,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0));
                })
            }, void 0, false, {
                fileName: "[project]/components/ui/sidebar.tsx",
                lineNumber: 127,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-5bfa814f7238b512" + " " + "mx-3 mb-3 p-4 bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-gray-700/50 rounded-xl backdrop-blur-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-5bfa814f7238b512" + " " + "flex items-center gap-3 mb-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-5bfa814f7238b512" + " " + "w-10 h-10 bg-[#00ff00]/10 rounded-lg flex items-center justify-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gift$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Gift$3e$__["Gift"], {
                                    className: "w-5 h-5 text-[#00ff00]"
                                }, void 0, false, {
                                    fileName: "[project]/components/ui/sidebar.tsx",
                                    lineNumber: 213,
                                    columnNumber: 13
                                }, ("TURBOPACK compile-time value", void 0))
                            }, void 0, false, {
                                fileName: "[project]/components/ui/sidebar.tsx",
                                lineNumber: 212,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-5bfa814f7238b512" + " " + "flex-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "jsx-5bfa814f7238b512" + " " + "text-xs text-gray-400 font-medium",
                                        children: "Quick Action"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ui/sidebar.tsx",
                                        lineNumber: 216,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "jsx-5bfa814f7238b512" + " " + "text-sm text-white font-bold",
                                        children: "Upgrade Now"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ui/sidebar.tsx",
                                        lineNumber: 217,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ui/sidebar.tsx",
                                lineNumber: 215,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ui/sidebar.tsx",
                        lineNumber: 211,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/packages/buy",
                        className: "block w-full bg-gradient-to-r from-[#00ff00] to-[#00cc00] hover:from-[#00cc00] hover:to-[#00ff00] text-black px-4 py-2.5 rounded-lg font-bold text-sm text-center transition-all active:scale-95 shadow-lg shadow-[#00ff00]/20 hover:shadow-[#00ff00]/40",
                        onClick: onClose,
                        children: "Buy Package"
                    }, void 0, false, {
                        fileName: "[project]/components/ui/sidebar.tsx",
                        lineNumber: 220,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/sidebar.tsx",
                lineNumber: 210,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-5bfa814f7238b512" + " " + "p-4 border-t border-gray-800/50 bg-gray-900/50 backdrop-blur-sm flex-shrink-0",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: handleLogout,
                    className: "jsx-5bfa814f7238b512" + " " + "w-full bg-gray-800/80 hover:bg-gradient-to-r hover:from-red-600 hover:to-red-700 active:bg-red-800 text-gray-300 hover:text-white px-4 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-3 transition-all duration-200 active:scale-95 border border-gray-700/50 hover:border-red-500/50",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                            className: "h-4 w-4"
                        }, void 0, false, {
                            fileName: "[project]/components/ui/sidebar.tsx",
                            lineNumber: 235,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "jsx-5bfa814f7238b512",
                            children: "Logout"
                        }, void 0, false, {
                            fileName: "[project]/components/ui/sidebar.tsx",
                            lineNumber: 236,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/ui/sidebar.tsx",
                    lineNumber: 231,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/ui/sidebar.tsx",
                lineNumber: 230,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                id: "5bfa814f7238b512",
                children: ".custom-scrollbar.jsx-5bfa814f7238b512::-webkit-scrollbar{width:4px}.custom-scrollbar.jsx-5bfa814f7238b512::-webkit-scrollbar-track{background:0 0}.custom-scrollbar.jsx-5bfa814f7238b512::-webkit-scrollbar-thumb{background:#0f03;border-radius:2px}.custom-scrollbar.jsx-5bfa814f7238b512.jsx-5bfa814f7238b512::-webkit-scrollbar-thumb:hover{background:#0f06}"
            }, void 0, false, void 0, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/sidebar.tsx",
        lineNumber: 97,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(Sidebar, "D1itz+NbI90vCT2lx6ysVmL23+I=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = Sidebar;
const __TURBOPACK__default__export__ = Sidebar;
var _c;
__turbopack_context__.k.register(_c, "Sidebar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/theme-toggler.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeToggler",
    ()=>ThemeToggler,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const themes = [
    {
        name: 'dark',
        label: 'Dark',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"]
    }
];
const ThemeToggler = ()=>{
    _s();
    const [currentTheme, setCurrentTheme] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('dark');
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ThemeToggler.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            const savedTheme = localStorage.getItem('theme');
            const isValidTheme = themes.some({
                "ThemeToggler.useEffect.isValidTheme": (theme)=>theme.name === savedTheme
            }["ThemeToggler.useEffect.isValidTheme"]);
            const theme = isValidTheme ? savedTheme : 'dark';
            if (!isValidTheme) {
                localStorage.setItem('theme', theme);
            }
            setCurrentTheme(theme);
            document.documentElement.setAttribute('data-theme', theme);
        }
    }["ThemeToggler.useEffect"], []);
    const handleThemeChange = (theme)=>{
        setCurrentTheme(theme);
        document.documentElement.setAttribute('data-theme', theme);
        if ("TURBOPACK compile-time truthy", 1) {
            localStorage.setItem('theme', theme);
        }
        setIsOpen(false);
    };
    const CurrentIcon = themes.find((t)=>t.name === currentTheme)?.icon || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "dropdown dropdown-end",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                tabIndex: 0,
                className: "btn btn-ghost btn-circle",
                onClick: ()=>setIsOpen(!isOpen),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CurrentIcon, {
                    className: "h-5 w-5"
                }, void 0, false, {
                    fileName: "[project]/components/ui/theme-toggler.tsx",
                    lineNumber: 45,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/ui/theme-toggler.tsx",
                lineNumber: 40,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                tabIndex: 0,
                className: "dropdown-content z-[1] menu p-2 shadow-lg bg-base-200 rounded-box w-52 mt-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        className: "menu-title",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: "Choose Theme"
                        }, void 0, false, {
                            fileName: "[project]/components/ui/theme-toggler.tsx",
                            lineNumber: 50,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/components/ui/theme-toggler.tsx",
                        lineNumber: 49,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0)),
                    themes.map((theme)=>{
                        const Icon = theme.icon;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: `flex items-center gap-3 ${currentTheme === theme.name ? 'active' : ''}`,
                                onClick: ()=>handleThemeChange(theme.name),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                        className: "h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ui/theme-toggler.tsx",
                                        lineNumber: 60,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: theme.label
                                    }, void 0, false, {
                                        fileName: "[project]/components/ui/theme-toggler.tsx",
                                        lineNumber: 61,
                                        columnNumber: 19
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    currentTheme === theme.name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "badge badge-primary badge-sm ml-auto",
                                        children: "Active"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ui/theme-toggler.tsx",
                                        lineNumber: 63,
                                        columnNumber: 21
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ui/theme-toggler.tsx",
                                lineNumber: 56,
                                columnNumber: 17
                            }, ("TURBOPACK compile-time value", void 0))
                        }, theme.name, false, {
                            fileName: "[project]/components/ui/theme-toggler.tsx",
                            lineNumber: 55,
                            columnNumber: 15
                        }, ("TURBOPACK compile-time value", void 0));
                    })
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/theme-toggler.tsx",
                lineNumber: 48,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/theme-toggler.tsx",
        lineNumber: 39,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(ThemeToggler, "+5ZPoWedhDwM+cpFVlKH0oTHQoU=");
_c = ThemeToggler;
const __TURBOPACK__default__export__ = ThemeToggler;
var _c;
__turbopack_context__.k.register(_c, "ThemeToggler");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/layouts/dashboard-layout.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DashboardLayout",
    ()=>DashboardLayout,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/sidebar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$theme$2d$toggler$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/theme-toggler.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/menu.js [app-client] (ecmascript) <export default as Menu>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
const DashboardLayout = ({ children, user })=>{
    _s();
    const [isSidebarOpen, setIsSidebarOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-black",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Sidebar"], {
                        isOpen: isSidebarOpen,
                        onClose: ()=>setIsSidebarOpen(false)
                    }, void 0, false, {
                        fileName: "[project]/components/layouts/dashboard-layout.tsx",
                        lineNumber: 24,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "flex-1 md:ml-64 w-full min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "md:hidden sticky top-0 z-40 p-4 bg-black/95 backdrop-blur-sm border-b border-gray-800 flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "text-[#00ff00] hover:bg-[#00ff00]/10 active:bg-[#00ff00]/20 p-2 rounded-lg transition-all active:scale-95",
                                        onClick: ()=>setIsSidebarOpen(!isSidebarOpen),
                                        "aria-label": "Toggle menu",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__["Menu"], {
                                            size: 24
                                        }, void 0, false, {
                                            fileName: "[project]/components/layouts/dashboard-layout.tsx",
                                            lineNumber: 35,
                                            columnNumber: 15
                                        }, ("TURBOPACK compile-time value", void 0))
                                    }, void 0, false, {
                                        fileName: "[project]/components/layouts/dashboard-layout.tsx",
                                        lineNumber: 30,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-8 h-8 bg-[#00ff00] rounded-lg flex items-center justify-center",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-black font-bold text-sm",
                                                    children: "N"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/layouts/dashboard-layout.tsx",
                                                    lineNumber: 39,
                                                    columnNumber: 17
                                                }, ("TURBOPACK compile-time value", void 0))
                                            }, void 0, false, {
                                                fileName: "[project]/components/layouts/dashboard-layout.tsx",
                                                lineNumber: 38,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0)),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-white font-bold",
                                                children: "NSC Bot"
                                            }, void 0, false, {
                                                fileName: "[project]/components/layouts/dashboard-layout.tsx",
                                                lineNumber: 41,
                                                columnNumber: 15
                                            }, ("TURBOPACK compile-time value", void 0))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/layouts/dashboard-layout.tsx",
                                        lineNumber: 37,
                                        columnNumber: 13
                                    }, ("TURBOPACK compile-time value", void 0))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/layouts/dashboard-layout.tsx",
                                lineNumber: 29,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full",
                                children: children
                            }, void 0, false, {
                                fileName: "[project]/components/layouts/dashboard-layout.tsx",
                                lineNumber: 46,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/layouts/dashboard-layout.tsx",
                        lineNumber: 27,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/layouts/dashboard-layout.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed bottom-6 right-6 z-50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$theme$2d$toggler$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ThemeToggler"], {}, void 0, false, {
                    fileName: "[project]/components/layouts/dashboard-layout.tsx",
                    lineNumber: 54,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/components/layouts/dashboard-layout.tsx",
                lineNumber: 53,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            isSidebarOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden animate-fadeIn",
                onClick: ()=>setIsSidebarOpen(false),
                "aria-label": "Close menu"
            }, void 0, false, {
                fileName: "[project]/components/layouts/dashboard-layout.tsx",
                lineNumber: 59,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/layouts/dashboard-layout.tsx",
        lineNumber: 21,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(DashboardLayout, "7pDpjxpt81vLgIcSls7O8aGkvA4=");
_c = DashboardLayout;
const __TURBOPACK__default__export__ = DashboardLayout;
var _c;
__turbopack_context__.k.register(_c, "DashboardLayout");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn,
    "daysBetween",
    ()=>daysBetween,
    "formatCurrency",
    ()=>formatCurrency,
    "formatDate",
    ()=>formatDate,
    "formatDateTime",
    ()=>formatDateTime,
    "getFromLocalStorage",
    ()=>getFromLocalStorage,
    "truncateAddress",
    ()=>truncateAddress
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}
function formatDate(date) {
    if (!date) return 'N/A';
    try {
        let dateObj;
        // Handle various date formats
        if (date instanceof Date) {
            dateObj = date;
        } else if (typeof date === 'string') {
            // Check for empty string
            if (date.trim() === '') return 'N/A';
            dateObj = new Date(date);
        } else if (typeof date === 'number') {
            // Check for 0 or negative numbers (epoch = 1970)
            if (date <= 0) return 'N/A';
            dateObj = new Date(date);
        } else if (typeof date === 'object' && date !== null) {
            // Handle objects that might be serialized dates
            if (typeof date.toISOString === 'function') {
                dateObj = date;
            } else if (date.date || date.value) {
                // Handle wrapped date objects
                dateObj = new Date(date.date || date.value);
            } else {
                // Try to convert object to string or use first property
                const firstValue = Object.values(date)[0];
                if (typeof firstValue === 'string' || typeof firstValue === 'number') {
                    dateObj = new Date(firstValue);
                } else {
                    dateObj = new Date(String(date));
                }
            }
        } else {
            return 'N/A';
        }
        // Check if date is valid
        if (isNaN(dateObj.getTime())) {
            return 'N/A';
        }
        // Check if date is epoch (Jan 1, 1970) or before
        if (dateObj.getTime() < 86400000) {
            return 'N/A';
        }
        // Use proper localization with better formatting
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC' // Use UTC to avoid timezone shifts
        }).format(dateObj);
    } catch (error) {
        console.warn('Date formatting error:', error, 'Date value:', date);
        return 'N/A';
    }
}
function formatDateTime(date) {
    if (!date) return 'N/A';
    try {
        let dateObj;
        if (date instanceof Date) {
            dateObj = date;
        } else if (typeof date === 'string') {
            if (date.trim() === '') return 'N/A';
            dateObj = new Date(date);
        } else if (typeof date === 'number') {
            if (date <= 0) return 'N/A';
            dateObj = new Date(date);
        } else {
            dateObj = new Date(String(date));
        }
        if (isNaN(dateObj.getTime()) || dateObj.getTime() < 86400000) {
            return 'N/A';
        }
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'UTC'
        }).format(dateObj);
    } catch (error) {
        console.warn('DateTime formatting error:', error);
        return 'N/A';
    }
}
function truncateAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}
function daysBetween(date1, date2) {
    const diff = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
function getFromLocalStorage(key) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.error('Error accessing localStorage:', error);
        return null;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff00] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95", {
    variants: {
        variant: {
            default: "bg-[#00ff00] text-black hover:bg-[#00cc00] shadow-md hover:shadow-lg",
            destructive: "bg-red-600 text-white hover:bg-red-700",
            outline: "border-2 border-[#00ff00] bg-transparent text-[#00ff00] hover:bg-[#00ff00] hover:text-black",
            secondary: "bg-gray-800 text-white hover:bg-gray-700",
            ghost: "text-gray-300 hover:bg-gray-800 hover:text-white",
            link: "text-[#00ff00] underline-offset-4 hover:underline hover:text-[#00cc00]"
        },
        size: {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-lg px-3 text-xs",
            lg: "h-12 rounded-lg px-8 text-base",
            icon: "h-10 w-10"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});
const Button = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, variant, size, asChild = false, ...props }, ref)=>{
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"] : "button";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/button.tsx",
        lineNumber: 46,
        columnNumber: 7
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = Button;
Button.displayName = "Button";
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Button$React.forwardRef");
__turbopack_context__.k.register(_c1, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/error-boundary.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ErrorBoundary",
    ()=>ErrorBoundary,
    "withErrorBoundary",
    ()=>withErrorBoundary
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
'use client';
;
;
;
;
class ErrorBoundary extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Component"] {
    constructor(props){
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error
        };
    }
    componentDidCatch(error, errorInfo) {
        // Log error only in development
        if ("TURBOPACK compile-time truthy", 1) {
            console.error('Error Boundary caught:', error, errorInfo);
        }
        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo);
    }
    handleReset = ()=>{
        this.setState({
            hasError: false,
            error: null
        });
    };
    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }
            // Default error UI
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "min-h-[400px] flex items-center justify-center p-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center max-w-md",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                className: "h-8 w-8 text-red-500"
                            }, void 0, false, {
                                fileName: "[project]/components/ui/error-boundary.tsx",
                                lineNumber: 54,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/ui/error-boundary.tsx",
                            lineNumber: 53,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-xl font-semibold mb-2",
                            children: "Something went wrong"
                        }, void 0, false, {
                            fileName: "[project]/components/ui/error-boundary.tsx",
                            lineNumber: 56,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-muted-foreground mb-6",
                            children: "We encountered an unexpected error. Please try refreshing the page."
                        }, void 0, false, {
                            fileName: "[project]/components/ui/error-boundary.tsx",
                            lineNumber: 57,
                            columnNumber: 13
                        }, this),
                        ("TURBOPACK compile-time value", "development") === 'development' && this.state.error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gray-900 text-left p-4 rounded-lg mb-4 text-sm font-mono text-red-400 overflow-auto max-h-32",
                            children: this.state.error.toString()
                        }, void 0, false, {
                            fileName: "[project]/components/ui/error-boundary.tsx",
                            lineNumber: 61,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: this.handleReset,
                            className: "gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/components/ui/error-boundary.tsx",
                                    lineNumber: 66,
                                    columnNumber: 15
                                }, this),
                                "Try Again"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ui/error-boundary.tsx",
                            lineNumber: 65,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/ui/error-boundary.tsx",
                    lineNumber: 52,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/ui/error-boundary.tsx",
                lineNumber: 51,
                columnNumber: 9
            }, this);
        }
        return this.props.children;
    }
}
function withErrorBoundary(Component, fallback) {
    return function WithErrorBoundaryWrapper(props) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ErrorBoundary, {
            fallback: fallback,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Component, {
                ...props
            }, void 0, false, {
                fileName: "[project]/components/ui/error-boundary.tsx",
                lineNumber: 86,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/ui/error-boundary.tsx",
            lineNumber: 85,
            columnNumber: 7
        }, this);
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/(dashboard)/layout.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashboardLayoutWrapper
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layouts$2f$dashboard$2d$layout$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/layouts/dashboard-layout.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$error$2d$boundary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/error-boundary.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useAuth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
function DashboardLayoutWrapper({ children }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { user, setUser, isAuthenticated } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isValidToken, setIsValidToken] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DashboardLayoutWrapper.useEffect": ()=>{
            const validateToken = {
                "DashboardLayoutWrapper.useEffect.validateToken": async ()=>{
                    try {
                        const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTokenFromStorage"])();
                        if (!token) {
                            setIsLoading(false);
                            return;
                        }
                        // First try client-side validation (faster)
                        const userFromToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getUserFromToken"])();
                        if (userFromToken) {
                            // Server-side validation for security
                            try {
                                const response = await fetch('/api/auth/validate', {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json'
                                    }
                                });
                                if (response.ok) {
                                    const data = await response.json();
                                    if (data.valid) {
                                        // Set user in store if not already set
                                        if (!user) {
                                            setUser(userFromToken);
                                        }
                                        setIsValidToken(true);
                                        setIsLoading(false);
                                        return;
                                    }
                                }
                            } catch (serverError) {
                                // Fall back to client-side validation if server is unavailable
                                if (!user) {
                                    setUser(userFromToken);
                                }
                                setIsValidToken(true);
                                setIsLoading(false);
                                return;
                            }
                        }
                        // Token is invalid, clear it
                        if ("TURBOPACK compile-time truthy", 1) {
                            localStorage.removeItem('token');
                            localStorage.removeItem('refreshToken');
                        }
                        setIsLoading(false);
                    } catch (error) {
                        // Clear invalid tokens
                        if ("TURBOPACK compile-time truthy", 1) {
                            localStorage.removeItem('token');
                            localStorage.removeItem('refreshToken');
                        }
                        setIsLoading(false);
                    }
                }
            }["DashboardLayoutWrapper.useEffect.validateToken"];
            validateToken();
        }
    }["DashboardLayoutWrapper.useEffect"], [
        user,
        setUser
    ]);
    // Show loading while validating token
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center min-h-screen bg-black",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "animate-spin rounded-full h-12 w-12 border-4 border-gray-800 border-t-[#00ff00] mx-auto"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/layout.tsx",
                        lineNumber: 92,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-4 text-gray-400",
                        children: "Validating session..."
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/layout.tsx",
                        lineNumber: 93,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/layout.tsx",
                lineNumber: 91,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/(dashboard)/layout.tsx",
            lineNumber: 90,
            columnNumber: 7
        }, this);
    }
    // Redirect if not authenticated
    if (!isValidToken || !isAuthenticated) {
        router.push('/login');
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center min-h-screen bg-black",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "animate-spin rounded-full h-12 w-12 border-4 border-gray-800 border-t-[#00ff00] mx-auto"
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/layout.tsx",
                        lineNumber: 105,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-4 text-gray-400",
                        children: "Redirecting to login..."
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/layout.tsx",
                        lineNumber: 106,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/layout.tsx",
                lineNumber: 104,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/(dashboard)/layout.tsx",
            lineNumber: 103,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$error$2d$boundary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ErrorBoundary"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$layouts$2f$dashboard$2d$layout$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DashboardLayout"], {
            user: user,
            children: children
        }, void 0, false, {
            fileName: "[project]/app/(dashboard)/layout.tsx",
            lineNumber: 114,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/(dashboard)/layout.tsx",
        lineNumber: 113,
        columnNumber: 5
    }, this);
}
_s(DashboardLayoutWrapper, "VFX2tCGG8H0lL94Zu7VooANL14I=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = DashboardLayoutWrapper;
var _c;
__turbopack_context__.k.register(_c, "DashboardLayoutWrapper");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_2b0fa63a._.js.map
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
"[project]/app/admin/layout.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AdminRootLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useAuth.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function AdminRootLayout({ children }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const { user, isAuthenticated } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [isAuthorized, setIsAuthorized] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [hydrated, setHydrated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Wait for Zustand store to hydrate
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AdminRootLayout.useEffect": ()=>{
            setHydrated(true);
        }
    }["AdminRootLayout.useEffect"], []);
    // Pages that don't require authentication
    const publicAdminPages = [
        '/admin/login'
    ];
    const isPublicPage = publicAdminPages.includes(pathname);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AdminRootLayout.useEffect": ()=>{
            // Don't run auth check until store is hydrated
            if (!hydrated) return;
            let isMounted = true;
            const checkAdminAccess = {
                "AdminRootLayout.useEffect.checkAdminAccess": async ()=>{
                    if (!isMounted) return;
                    setIsLoading(true);
                    // If it's a public admin page (like login), don't check authentication
                    if (isPublicPage) {
                        if (isMounted) {
                            setIsAuthorized(true);
                            setIsLoading(false);
                        }
                        return;
                    }
                    // Check for token in localStorage
                    const token = ("TURBOPACK compile-time truthy", 1) ? localStorage.getItem('token') : "TURBOPACK unreachable";
                    if (!token) {
                        console.log('No token found, redirecting to admin login');
                        if ("TURBOPACK compile-time truthy", 1) {
                            sessionStorage.setItem('adminRedirectAfterLogin', pathname);
                        }
                        router.push('/admin/login');
                        return;
                    }
                    // Validate token with API
                    try {
                        const response = await fetch('/api/auth/validate', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            },
                            credentials: 'include'
                        });
                        if (!isMounted) return;
                        if (response.ok) {
                            const data = await response.json();
                            if (data.valid && data.user?.isAdmin) {
                                console.log('Admin access verified for user:', data.user.email);
                                if (isMounted) {
                                    setIsAuthorized(true);
                                    setIsLoading(false);
                                }
                                return;
                            }
                        }
                        // Token invalid or not admin
                        console.log('Token invalid or user not admin, redirecting to admin login');
                        if ("TURBOPACK compile-time truthy", 1) {
                            localStorage.removeItem('token');
                            localStorage.removeItem('refreshToken');
                            sessionStorage.setItem('adminRedirectAfterLogin', pathname);
                        }
                        router.push('/admin/login');
                    } catch (error) {
                        console.error('Admin auth check error:', error);
                        if (isMounted) {
                            router.push('/admin/login');
                        }
                    }
                }
            }["AdminRootLayout.useEffect.checkAdminAccess"];
            checkAdminAccess();
            return ({
                "AdminRootLayout.useEffect": ()=>{
                    isMounted = false;
                }
            })["AdminRootLayout.useEffect"];
        }
    }["AdminRootLayout.useEffect"], [
        hydrated,
        router,
        isPublicPage,
        pathname
    ]);
    // Show loading state with better debugging
    if (isLoading || !isAuthorized) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-black flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "animate-spin rounded-full h-8 w-8 border-2 border-red-500 border-t-transparent mx-auto mb-4"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/layout.tsx",
                        lineNumber: 113,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-400 mb-2",
                        children: "Verifying admin access..."
                    }, void 0, false, {
                        fileName: "[project]/app/admin/layout.tsx",
                        lineNumber: 114,
                        columnNumber: 11
                    }, this),
                    ("TURBOPACK compile-time value", "development") === 'development' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs text-gray-600 space-y-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: [
                                    "Authenticated: ",
                                    isAuthenticated ? 'Yes' : 'No'
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/layout.tsx",
                                lineNumber: 117,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: [
                                    "User: ",
                                    user?.email || 'None'
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/layout.tsx",
                                lineNumber: 118,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: [
                                    "Is Admin: ",
                                    user?.isAdmin ? 'Yes' : 'No'
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/layout.tsx",
                                lineNumber: 119,
                                columnNumber: 15
                            }, this),
                            !isAuthenticated && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>router.push('/admin/login'),
                                className: "mt-2 text-red-400 underline text-xs",
                                children: "Go to Admin Login"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/layout.tsx",
                                lineNumber: 121,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/layout.tsx",
                        lineNumber: 116,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/layout.tsx",
                lineNumber: 112,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/admin/layout.tsx",
            lineNumber: 111,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-black",
        children: children
    }, void 0, false, {
        fileName: "[project]/app/admin/layout.tsx",
        lineNumber: 136,
        columnNumber: 5
    }, this);
}
_s(AdminRootLayout, "mHVgTvt/No9PV+0eWPmy+E6+k8o=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = AdminRootLayout;
var _c;
__turbopack_context__.k.register(_c, "AdminRootLayout");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/next/navigation.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/client/components/navigation.js [app-client] (ecmascript)");
}),
"[project]/node_modules/zustand/esm/vanilla.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createStore",
    ()=>createStore,
    "default",
    ()=>vanilla
]);
const __TURBOPACK__import$2e$meta__ = {
    get url () {
        return `file://${__turbopack_context__.P("node_modules/zustand/esm/vanilla.mjs")}`;
    }
};
const createStoreImpl = (createState)=>{
    let state;
    const listeners = /* @__PURE__ */ new Set();
    const setState = (partial, replace)=>{
        const nextState = typeof partial === "function" ? partial(state) : partial;
        if (!Object.is(nextState, state)) {
            const previousState = state;
            state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
            listeners.forEach((listener)=>listener(state, previousState));
        }
    };
    const getState = ()=>state;
    const getInitialState = ()=>initialState;
    const subscribe = (listener)=>{
        listeners.add(listener);
        return ()=>listeners.delete(listener);
    };
    const destroy = ()=>{
        if ((__TURBOPACK__import$2e$meta__.env ? __TURBOPACK__import$2e$meta__.env.MODE : void 0) !== "production") {
            console.warn("[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected.");
        }
        listeners.clear();
    };
    const api = {
        setState,
        getState,
        getInitialState,
        subscribe,
        destroy
    };
    const initialState = state = createState(setState, getState, api);
    return api;
};
const createStore = (createState)=>createState ? createStoreImpl(createState) : createStoreImpl;
var vanilla = (createState)=>{
    if ((__TURBOPACK__import$2e$meta__.env ? __TURBOPACK__import$2e$meta__.env.MODE : void 0) !== "production") {
        console.warn("[DEPRECATED] Default export is deprecated. Instead use import { createStore } from 'zustand/vanilla'.");
    }
    return createStore(createState);
};
;
}),
"[project]/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * @license React
 * use-sync-external-store-shim.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
"use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    function is(x, y) {
        return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
    }
    function useSyncExternalStore$2(subscribe, getSnapshot) {
        didWarnOld18Alpha || void 0 === React.startTransition || (didWarnOld18Alpha = !0, console.error("You are using an outdated, pre-release alpha of React 18 that does not support useSyncExternalStore. The use-sync-external-store shim will not work correctly. Upgrade to a newer pre-release."));
        var value = getSnapshot();
        if (!didWarnUncachedGetSnapshot) {
            var cachedValue = getSnapshot();
            objectIs(value, cachedValue) || (console.error("The result of getSnapshot should be cached to avoid an infinite loop"), didWarnUncachedGetSnapshot = !0);
        }
        cachedValue = useState({
            inst: {
                value: value,
                getSnapshot: getSnapshot
            }
        });
        var inst = cachedValue[0].inst, forceUpdate = cachedValue[1];
        useLayoutEffect({
            "useSyncExternalStore$2.useLayoutEffect": function() {
                inst.value = value;
                inst.getSnapshot = getSnapshot;
                checkIfSnapshotChanged(inst) && forceUpdate({
                    inst: inst
                });
            }
        }["useSyncExternalStore$2.useLayoutEffect"], [
            subscribe,
            value,
            getSnapshot
        ]);
        useEffect({
            "useSyncExternalStore$2.useEffect": function() {
                checkIfSnapshotChanged(inst) && forceUpdate({
                    inst: inst
                });
                return subscribe({
                    "useSyncExternalStore$2.useEffect": function() {
                        checkIfSnapshotChanged(inst) && forceUpdate({
                            inst: inst
                        });
                    }
                }["useSyncExternalStore$2.useEffect"]);
            }
        }["useSyncExternalStore$2.useEffect"], [
            subscribe
        ]);
        useDebugValue(value);
        return value;
    }
    function checkIfSnapshotChanged(inst) {
        var latestGetSnapshot = inst.getSnapshot;
        inst = inst.value;
        try {
            var nextValue = latestGetSnapshot();
            return !objectIs(inst, nextValue);
        } catch (error) {
            return !0;
        }
    }
    function useSyncExternalStore$1(subscribe, getSnapshot) {
        return getSnapshot();
    }
    "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
    var React = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"), objectIs = "function" === typeof Object.is ? Object.is : is, useState = React.useState, useEffect = React.useEffect, useLayoutEffect = React.useLayoutEffect, useDebugValue = React.useDebugValue, didWarnOld18Alpha = !1, didWarnUncachedGetSnapshot = !1, shim = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? useSyncExternalStore$1 : useSyncExternalStore$2;
    exports.useSyncExternalStore = void 0 !== React.useSyncExternalStore ? React.useSyncExternalStore : shim;
    "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
}();
}),
"[project]/node_modules/use-sync-external-store/shim/index.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use strict';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    module.exports = __turbopack_context__.r("[project]/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js [app-client] (ecmascript)");
}
}),
"[project]/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.development.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * @license React
 * use-sync-external-store-shim/with-selector.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
"use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    function is(x, y) {
        return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
    }
    "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
    var React = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"), shim = __turbopack_context__.r("[project]/node_modules/use-sync-external-store/shim/index.js [app-client] (ecmascript)"), objectIs = "function" === typeof Object.is ? Object.is : is, useSyncExternalStore = shim.useSyncExternalStore, useRef = React.useRef, useEffect = React.useEffect, useMemo = React.useMemo, useDebugValue = React.useDebugValue;
    exports.useSyncExternalStoreWithSelector = function(subscribe, getSnapshot, getServerSnapshot, selector, isEqual) {
        var instRef = useRef(null);
        if (null === instRef.current) {
            var inst = {
                hasValue: !1,
                value: null
            };
            instRef.current = inst;
        } else inst = instRef.current;
        instRef = useMemo(function() {
            function memoizedSelector(nextSnapshot) {
                if (!hasMemo) {
                    hasMemo = !0;
                    memoizedSnapshot = nextSnapshot;
                    nextSnapshot = selector(nextSnapshot);
                    if (void 0 !== isEqual && inst.hasValue) {
                        var currentSelection = inst.value;
                        if (isEqual(currentSelection, nextSnapshot)) return memoizedSelection = currentSelection;
                    }
                    return memoizedSelection = nextSnapshot;
                }
                currentSelection = memoizedSelection;
                if (objectIs(memoizedSnapshot, nextSnapshot)) return currentSelection;
                var nextSelection = selector(nextSnapshot);
                if (void 0 !== isEqual && isEqual(currentSelection, nextSelection)) return memoizedSnapshot = nextSnapshot, currentSelection;
                memoizedSnapshot = nextSnapshot;
                return memoizedSelection = nextSelection;
            }
            var hasMemo = !1, memoizedSnapshot, memoizedSelection, maybeGetServerSnapshot = void 0 === getServerSnapshot ? null : getServerSnapshot;
            return [
                function() {
                    return memoizedSelector(getSnapshot());
                },
                null === maybeGetServerSnapshot ? void 0 : function() {
                    return memoizedSelector(maybeGetServerSnapshot());
                }
            ];
        }, [
            getSnapshot,
            getServerSnapshot,
            selector,
            isEqual
        ]);
        var value = useSyncExternalStore(subscribe, instRef[0], instRef[1]);
        useEffect(function() {
            inst.hasValue = !0;
            inst.value = value;
        }, [
            value
        ]);
        useDebugValue(value);
        return value;
    };
    "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
}();
}),
"[project]/node_modules/use-sync-external-store/shim/with-selector.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use strict';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    module.exports = __turbopack_context__.r("[project]/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.development.js [app-client] (ecmascript)");
}
}),
"[project]/node_modules/zustand/esm/index.mjs [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "create",
    ()=>create,
    "default",
    ()=>react,
    "useStore",
    ()=>useStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$vanilla$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/vanilla.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$sync$2d$external$2d$store$2f$shim$2f$with$2d$selector$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/use-sync-external-store/shim/with-selector.js [app-client] (ecmascript)");
const __TURBOPACK__import$2e$meta__ = {
    get url () {
        return `file://${__turbopack_context__.P("node_modules/zustand/esm/index.mjs")}`;
    }
};
;
;
;
;
const { useDebugValue } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
const { useSyncExternalStoreWithSelector } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$sync$2d$external$2d$store$2f$shim$2f$with$2d$selector$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
let didWarnAboutEqualityFn = false;
const identity = (arg)=>arg;
function useStore(api, selector = identity, equalityFn) {
    if ((__TURBOPACK__import$2e$meta__.env ? __TURBOPACK__import$2e$meta__.env.MODE : void 0) !== "production" && equalityFn && !didWarnAboutEqualityFn) {
        console.warn("[DEPRECATED] Use `createWithEqualityFn` instead of `create` or use `useStoreWithEqualityFn` instead of `useStore`. They can be imported from 'zustand/traditional'. https://github.com/pmndrs/zustand/discussions/1937");
        didWarnAboutEqualityFn = true;
    }
    const slice = useSyncExternalStoreWithSelector(api.subscribe, api.getState, api.getServerState || api.getInitialState, selector, equalityFn);
    useDebugValue(slice);
    return slice;
}
const createImpl = (createState)=>{
    if ((__TURBOPACK__import$2e$meta__.env ? __TURBOPACK__import$2e$meta__.env.MODE : void 0) !== "production" && typeof createState !== "function") {
        console.warn("[DEPRECATED] Passing a vanilla store will be unsupported in a future version. Instead use `import { useStore } from 'zustand'`.");
    }
    const api = typeof createState === "function" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$vanilla$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createStore"])(createState) : createState;
    const useBoundStore = (selector, equalityFn)=>useStore(api, selector, equalityFn);
    Object.assign(useBoundStore, api);
    return useBoundStore;
};
const create = (createState)=>createState ? createImpl(createState) : createImpl;
var react = (createState)=>{
    if ((__TURBOPACK__import$2e$meta__.env ? __TURBOPACK__import$2e$meta__.env.MODE : void 0) !== "production") {
        console.warn("[DEPRECATED] Default export is deprecated. Instead use `import { create } from 'zustand'`.");
    }
    return create(createState);
};
;
}),
"[project]/node_modules/zustand/esm/middleware.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "combine",
    ()=>combine,
    "createJSONStorage",
    ()=>createJSONStorage,
    "devtools",
    ()=>devtools,
    "persist",
    ()=>persist,
    "redux",
    ()=>redux,
    "subscribeWithSelector",
    ()=>subscribeWithSelector
]);
const __TURBOPACK__import$2e$meta__ = {
    get url () {
        return `file://${__turbopack_context__.P("node_modules/zustand/esm/middleware.mjs")}`;
    }
};
const reduxImpl = (reducer, initial)=>(set, _get, api)=>{
        api.dispatch = (action)=>{
            set((state)=>reducer(state, action), false, action);
            return action;
        };
        api.dispatchFromDevtools = true;
        return {
            dispatch: (...a)=>api.dispatch(...a),
            ...initial
        };
    };
const redux = reduxImpl;
const trackedConnections = /* @__PURE__ */ new Map();
const getTrackedConnectionState = (name)=>{
    const api = trackedConnections.get(name);
    if (!api) return {};
    return Object.fromEntries(Object.entries(api.stores).map(([key, api2])=>[
            key,
            api2.getState()
        ]));
};
const extractConnectionInformation = (store, extensionConnector, options)=>{
    if (store === void 0) {
        return {
            type: "untracked",
            connection: extensionConnector.connect(options)
        };
    }
    const existingConnection = trackedConnections.get(options.name);
    if (existingConnection) {
        return {
            type: "tracked",
            store,
            ...existingConnection
        };
    }
    const newConnection = {
        connection: extensionConnector.connect(options),
        stores: {}
    };
    trackedConnections.set(options.name, newConnection);
    return {
        type: "tracked",
        store,
        ...newConnection
    };
};
const devtoolsImpl = (fn, devtoolsOptions = {})=>(set, get, api)=>{
        const { enabled, anonymousActionType, store, ...options } = devtoolsOptions;
        let extensionConnector;
        try {
            extensionConnector = (enabled != null ? enabled : (__TURBOPACK__import$2e$meta__.env ? __TURBOPACK__import$2e$meta__.env.MODE : void 0) !== "production") && window.__REDUX_DEVTOOLS_EXTENSION__;
        } catch (_e) {}
        if (!extensionConnector) {
            if ((__TURBOPACK__import$2e$meta__.env ? __TURBOPACK__import$2e$meta__.env.MODE : void 0) !== "production" && enabled) {
                console.warn("[zustand devtools middleware] Please install/enable Redux devtools extension");
            }
            return fn(set, get, api);
        }
        const { connection, ...connectionInformation } = extractConnectionInformation(store, extensionConnector, options);
        let isRecording = true;
        api.setState = (state, replace, nameOrAction)=>{
            const r = set(state, replace);
            if (!isRecording) return r;
            const action = nameOrAction === void 0 ? {
                type: anonymousActionType || "anonymous"
            } : typeof nameOrAction === "string" ? {
                type: nameOrAction
            } : nameOrAction;
            if (store === void 0) {
                connection == null ? void 0 : connection.send(action, get());
                return r;
            }
            connection == null ? void 0 : connection.send({
                ...action,
                type: `${store}/${action.type}`
            }, {
                ...getTrackedConnectionState(options.name),
                [store]: api.getState()
            });
            return r;
        };
        const setStateFromDevtools = (...a)=>{
            const originalIsRecording = isRecording;
            isRecording = false;
            set(...a);
            isRecording = originalIsRecording;
        };
        const initialState = fn(api.setState, get, api);
        if (connectionInformation.type === "untracked") {
            connection == null ? void 0 : connection.init(initialState);
        } else {
            connectionInformation.stores[connectionInformation.store] = api;
            connection == null ? void 0 : connection.init(Object.fromEntries(Object.entries(connectionInformation.stores).map(([key, store2])=>[
                    key,
                    key === connectionInformation.store ? initialState : store2.getState()
                ])));
        }
        if (api.dispatchFromDevtools && typeof api.dispatch === "function") {
            let didWarnAboutReservedActionType = false;
            const originalDispatch = api.dispatch;
            api.dispatch = (...a)=>{
                if ((__TURBOPACK__import$2e$meta__.env ? __TURBOPACK__import$2e$meta__.env.MODE : void 0) !== "production" && a[0].type === "__setState" && !didWarnAboutReservedActionType) {
                    console.warn('[zustand devtools middleware] "__setState" action type is reserved to set state from the devtools. Avoid using it.');
                    didWarnAboutReservedActionType = true;
                }
                originalDispatch(...a);
            };
        }
        connection.subscribe((message)=>{
            var _a;
            switch(message.type){
                case "ACTION":
                    if (typeof message.payload !== "string") {
                        console.error("[zustand devtools middleware] Unsupported action format");
                        return;
                    }
                    return parseJsonThen(message.payload, (action)=>{
                        if (action.type === "__setState") {
                            if (store === void 0) {
                                setStateFromDevtools(action.state);
                                return;
                            }
                            if (Object.keys(action.state).length !== 1) {
                                console.error(`
                    [zustand devtools middleware] Unsupported __setState action format. 
                    When using 'store' option in devtools(), the 'state' should have only one key, which is a value of 'store' that was passed in devtools(),
                    and value of this only key should be a state object. Example: { "type": "__setState", "state": { "abc123Store": { "foo": "bar" } } }
                    `);
                            }
                            const stateFromDevtools = action.state[store];
                            if (stateFromDevtools === void 0 || stateFromDevtools === null) {
                                return;
                            }
                            if (JSON.stringify(api.getState()) !== JSON.stringify(stateFromDevtools)) {
                                setStateFromDevtools(stateFromDevtools);
                            }
                            return;
                        }
                        if (!api.dispatchFromDevtools) return;
                        if (typeof api.dispatch !== "function") return;
                        api.dispatch(action);
                    });
                case "DISPATCH":
                    switch(message.payload.type){
                        case "RESET":
                            setStateFromDevtools(initialState);
                            if (store === void 0) {
                                return connection == null ? void 0 : connection.init(api.getState());
                            }
                            return connection == null ? void 0 : connection.init(getTrackedConnectionState(options.name));
                        case "COMMIT":
                            if (store === void 0) {
                                connection == null ? void 0 : connection.init(api.getState());
                                return;
                            }
                            return connection == null ? void 0 : connection.init(getTrackedConnectionState(options.name));
                        case "ROLLBACK":
                            return parseJsonThen(message.state, (state)=>{
                                if (store === void 0) {
                                    setStateFromDevtools(state);
                                    connection == null ? void 0 : connection.init(api.getState());
                                    return;
                                }
                                setStateFromDevtools(state[store]);
                                connection == null ? void 0 : connection.init(getTrackedConnectionState(options.name));
                            });
                        case "JUMP_TO_STATE":
                        case "JUMP_TO_ACTION":
                            return parseJsonThen(message.state, (state)=>{
                                if (store === void 0) {
                                    setStateFromDevtools(state);
                                    return;
                                }
                                if (JSON.stringify(api.getState()) !== JSON.stringify(state[store])) {
                                    setStateFromDevtools(state[store]);
                                }
                            });
                        case "IMPORT_STATE":
                            {
                                const { nextLiftedState } = message.payload;
                                const lastComputedState = (_a = nextLiftedState.computedStates.slice(-1)[0]) == null ? void 0 : _a.state;
                                if (!lastComputedState) return;
                                if (store === void 0) {
                                    setStateFromDevtools(lastComputedState);
                                } else {
                                    setStateFromDevtools(lastComputedState[store]);
                                }
                                connection == null ? void 0 : connection.send(null, // FIXME no-any
                                nextLiftedState);
                                return;
                            }
                        case "PAUSE_RECORDING":
                            return isRecording = !isRecording;
                    }
                    return;
            }
        });
        return initialState;
    };
const devtools = devtoolsImpl;
const parseJsonThen = (stringified, f)=>{
    let parsed;
    try {
        parsed = JSON.parse(stringified);
    } catch (e) {
        console.error("[zustand devtools middleware] Could not parse the received json", e);
    }
    if (parsed !== void 0) f(parsed);
};
const subscribeWithSelectorImpl = (fn)=>(set, get, api)=>{
        const origSubscribe = api.subscribe;
        api.subscribe = (selector, optListener, options)=>{
            let listener = selector;
            if (optListener) {
                const equalityFn = (options == null ? void 0 : options.equalityFn) || Object.is;
                let currentSlice = selector(api.getState());
                listener = (state)=>{
                    const nextSlice = selector(state);
                    if (!equalityFn(currentSlice, nextSlice)) {
                        const previousSlice = currentSlice;
                        optListener(currentSlice = nextSlice, previousSlice);
                    }
                };
                if (options == null ? void 0 : options.fireImmediately) {
                    optListener(currentSlice, currentSlice);
                }
            }
            return origSubscribe(listener);
        };
        const initialState = fn(set, get, api);
        return initialState;
    };
const subscribeWithSelector = subscribeWithSelectorImpl;
const combine = (initialState, create)=>(...a)=>Object.assign({}, initialState, create(...a));
function createJSONStorage(getStorage, options) {
    let storage;
    try {
        storage = getStorage();
    } catch (_e) {
        return;
    }
    const persistStorage = {
        getItem: (name)=>{
            var _a;
            const parse = (str2)=>{
                if (str2 === null) {
                    return null;
                }
                return JSON.parse(str2, options == null ? void 0 : options.reviver);
            };
            const str = (_a = storage.getItem(name)) != null ? _a : null;
            if (str instanceof Promise) {
                return str.then(parse);
            }
            return parse(str);
        },
        setItem: (name, newValue)=>storage.setItem(name, JSON.stringify(newValue, options == null ? void 0 : options.replacer)),
        removeItem: (name)=>storage.removeItem(name)
    };
    return persistStorage;
}
const toThenable = (fn)=>(input)=>{
        try {
            const result = fn(input);
            if (result instanceof Promise) {
                return result;
            }
            return {
                then (onFulfilled) {
                    return toThenable(onFulfilled)(result);
                },
                catch (_onRejected) {
                    return this;
                }
            };
        } catch (e) {
            return {
                then (_onFulfilled) {
                    return this;
                },
                catch (onRejected) {
                    return toThenable(onRejected)(e);
                }
            };
        }
    };
const oldImpl = (config, baseOptions)=>(set, get, api)=>{
        let options = {
            getStorage: ()=>localStorage,
            serialize: JSON.stringify,
            deserialize: JSON.parse,
            partialize: (state)=>state,
            version: 0,
            merge: (persistedState, currentState)=>({
                    ...currentState,
                    ...persistedState
                }),
            ...baseOptions
        };
        let hasHydrated = false;
        const hydrationListeners = /* @__PURE__ */ new Set();
        const finishHydrationListeners = /* @__PURE__ */ new Set();
        let storage;
        try {
            storage = options.getStorage();
        } catch (_e) {}
        if (!storage) {
            return config((...args)=>{
                console.warn(`[zustand persist middleware] Unable to update item '${options.name}', the given storage is currently unavailable.`);
                set(...args);
            }, get, api);
        }
        const thenableSerialize = toThenable(options.serialize);
        const setItem = ()=>{
            const state = options.partialize({
                ...get()
            });
            let errorInSync;
            const thenable = thenableSerialize({
                state,
                version: options.version
            }).then((serializedValue)=>storage.setItem(options.name, serializedValue)).catch((e)=>{
                errorInSync = e;
            });
            if (errorInSync) {
                throw errorInSync;
            }
            return thenable;
        };
        const savedSetState = api.setState;
        api.setState = (state, replace)=>{
            savedSetState(state, replace);
            void setItem();
        };
        const configResult = config((...args)=>{
            set(...args);
            void setItem();
        }, get, api);
        let stateFromStorage;
        const hydrate = ()=>{
            var _a;
            if (!storage) return;
            hasHydrated = false;
            hydrationListeners.forEach((cb)=>cb(get()));
            const postRehydrationCallback = ((_a = options.onRehydrateStorage) == null ? void 0 : _a.call(options, get())) || void 0;
            return toThenable(storage.getItem.bind(storage))(options.name).then((storageValue)=>{
                if (storageValue) {
                    return options.deserialize(storageValue);
                }
            }).then((deserializedStorageValue)=>{
                if (deserializedStorageValue) {
                    if (typeof deserializedStorageValue.version === "number" && deserializedStorageValue.version !== options.version) {
                        if (options.migrate) {
                            return options.migrate(deserializedStorageValue.state, deserializedStorageValue.version);
                        }
                        console.error(`State loaded from storage couldn't be migrated since no migrate function was provided`);
                    } else {
                        return deserializedStorageValue.state;
                    }
                }
            }).then((migratedState)=>{
                var _a2;
                stateFromStorage = options.merge(migratedState, (_a2 = get()) != null ? _a2 : configResult);
                set(stateFromStorage, true);
                return setItem();
            }).then(()=>{
                postRehydrationCallback == null ? void 0 : postRehydrationCallback(stateFromStorage, void 0);
                hasHydrated = true;
                finishHydrationListeners.forEach((cb)=>cb(stateFromStorage));
            }).catch((e)=>{
                postRehydrationCallback == null ? void 0 : postRehydrationCallback(void 0, e);
            });
        };
        api.persist = {
            setOptions: (newOptions)=>{
                options = {
                    ...options,
                    ...newOptions
                };
                if (newOptions.getStorage) {
                    storage = newOptions.getStorage();
                }
            },
            clearStorage: ()=>{
                storage == null ? void 0 : storage.removeItem(options.name);
            },
            getOptions: ()=>options,
            rehydrate: ()=>hydrate(),
            hasHydrated: ()=>hasHydrated,
            onHydrate: (cb)=>{
                hydrationListeners.add(cb);
                return ()=>{
                    hydrationListeners.delete(cb);
                };
            },
            onFinishHydration: (cb)=>{
                finishHydrationListeners.add(cb);
                return ()=>{
                    finishHydrationListeners.delete(cb);
                };
            }
        };
        hydrate();
        return stateFromStorage || configResult;
    };
const newImpl = (config, baseOptions)=>(set, get, api)=>{
        let options = {
            storage: createJSONStorage(()=>localStorage),
            partialize: (state)=>state,
            version: 0,
            merge: (persistedState, currentState)=>({
                    ...currentState,
                    ...persistedState
                }),
            ...baseOptions
        };
        let hasHydrated = false;
        const hydrationListeners = /* @__PURE__ */ new Set();
        const finishHydrationListeners = /* @__PURE__ */ new Set();
        let storage = options.storage;
        if (!storage) {
            return config((...args)=>{
                console.warn(`[zustand persist middleware] Unable to update item '${options.name}', the given storage is currently unavailable.`);
                set(...args);
            }, get, api);
        }
        const setItem = ()=>{
            const state = options.partialize({
                ...get()
            });
            return storage.setItem(options.name, {
                state,
                version: options.version
            });
        };
        const savedSetState = api.setState;
        api.setState = (state, replace)=>{
            savedSetState(state, replace);
            void setItem();
        };
        const configResult = config((...args)=>{
            set(...args);
            void setItem();
        }, get, api);
        api.getInitialState = ()=>configResult;
        let stateFromStorage;
        const hydrate = ()=>{
            var _a, _b;
            if (!storage) return;
            hasHydrated = false;
            hydrationListeners.forEach((cb)=>{
                var _a2;
                return cb((_a2 = get()) != null ? _a2 : configResult);
            });
            const postRehydrationCallback = ((_b = options.onRehydrateStorage) == null ? void 0 : _b.call(options, (_a = get()) != null ? _a : configResult)) || void 0;
            return toThenable(storage.getItem.bind(storage))(options.name).then((deserializedStorageValue)=>{
                if (deserializedStorageValue) {
                    if (typeof deserializedStorageValue.version === "number" && deserializedStorageValue.version !== options.version) {
                        if (options.migrate) {
                            return [
                                true,
                                options.migrate(deserializedStorageValue.state, deserializedStorageValue.version)
                            ];
                        }
                        console.error(`State loaded from storage couldn't be migrated since no migrate function was provided`);
                    } else {
                        return [
                            false,
                            deserializedStorageValue.state
                        ];
                    }
                }
                return [
                    false,
                    void 0
                ];
            }).then((migrationResult)=>{
                var _a2;
                const [migrated, migratedState] = migrationResult;
                stateFromStorage = options.merge(migratedState, (_a2 = get()) != null ? _a2 : configResult);
                set(stateFromStorage, true);
                if (migrated) {
                    return setItem();
                }
            }).then(()=>{
                postRehydrationCallback == null ? void 0 : postRehydrationCallback(stateFromStorage, void 0);
                stateFromStorage = get();
                hasHydrated = true;
                finishHydrationListeners.forEach((cb)=>cb(stateFromStorage));
            }).catch((e)=>{
                postRehydrationCallback == null ? void 0 : postRehydrationCallback(void 0, e);
            });
        };
        api.persist = {
            setOptions: (newOptions)=>{
                options = {
                    ...options,
                    ...newOptions
                };
                if (newOptions.storage) {
                    storage = newOptions.storage;
                }
            },
            clearStorage: ()=>{
                storage == null ? void 0 : storage.removeItem(options.name);
            },
            getOptions: ()=>options,
            rehydrate: ()=>hydrate(),
            hasHydrated: ()=>hasHydrated,
            onHydrate: (cb)=>{
                hydrationListeners.add(cb);
                return ()=>{
                    hydrationListeners.delete(cb);
                };
            },
            onFinishHydration: (cb)=>{
                finishHydrationListeners.add(cb);
                return ()=>{
                    finishHydrationListeners.delete(cb);
                };
            }
        };
        if (!options.skipHydration) {
            hydrate();
        }
        return stateFromStorage || configResult;
    };
const persistImpl = (config, baseOptions)=>{
    if ("getStorage" in baseOptions || "serialize" in baseOptions || "deserialize" in baseOptions) {
        if ((__TURBOPACK__import$2e$meta__.env ? __TURBOPACK__import$2e$meta__.env.MODE : void 0) !== "production") {
            console.warn("[DEPRECATED] `getStorage`, `serialize` and `deserialize` options are deprecated. Use `storage` option instead.");
        }
        return oldImpl(config, baseOptions);
    }
    return newImpl(config, baseOptions);
};
const persist = persistImpl;
;
}),
]);

//# sourceMappingURL=_4426119f._.js.map
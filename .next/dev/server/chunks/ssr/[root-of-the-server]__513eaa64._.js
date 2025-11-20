module.exports = [
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[project]/store/authStore.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAuthStore",
    ()=>useAuthStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-ssr] (ecmascript)");
;
;
const useAuthStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["persist"])((set)=>({
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
}),
"[project]/lib/api.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/utils/error-helpers.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/lib/mobile-utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
    if ("TURBOPACK compile-time truthy", 1) return false;
    //TURBOPACK unreachable
    ;
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
}),
"[project]/hooks/useAuth.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$authStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/authStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$error$2d$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/error-helpers.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mobile$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/mobile-utils.ts [app-ssr] (ecmascript)");
;
;
;
;
;
;
function useAuth() {
    const { user, setUser, clearUser } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$authStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuthStore"])();
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [initializing, setInitializing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    // Validate current token on hook initialization
    const validateToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getTokenFromStorage"])();
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
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["removeTokenFromStorage"])();
            clearUser();
            setInitializing(false);
            return false;
        } catch (error) {
            console.error('❌ Token validation error:', error);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["removeTokenFromStorage"])();
            clearUser();
            setInitializing(false);
            return false;
        }
    }, [
        setUser,
        clearUser
    ]);
    // Initialize auth state on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        validateToken();
    }, [
        validateToken
    ]);
    const login = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (email, password, twoFactorCode)=>{
        setLoading(true);
        setError(null);
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["authAPI"].login({
                email,
                password,
                twoFactorCode
            });
            if (response?.success) {
                if (response.token) {
                    // Store token in both localStorage and cookie
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setTokenToStorage"])(response.token);
                    if (response.refreshToken) {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setRefreshTokenToStorage"])(response.refreshToken);
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
            console.error('Login error in useAuth:', (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$error$2d$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatErrorForLogging"])(err));
            // Use mobile-friendly error messages
            const errorMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mobile$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getMobileFriendlyErrorMessage"])(err);
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
    }, [
        setUser
    ]);
    const register = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (data)=>{
        setLoading(true);
        setError(null);
        try {
            console.log('Registering with data:', data);
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["authAPI"].register(data);
            if (response?.token) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setTokenToStorage"])(response.token);
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
            console.error('Registration error in useAuth:', (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$error$2d$helpers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatErrorForLogging"])(err));
            // Use mobile-friendly error messages
            const errorMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mobile$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getMobileFriendlyErrorMessage"])(err);
            setError(errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        } finally{
            setLoading(false);
        }
    }, [
        setUser
    ]);
    const logout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["removeTokenFromStorage"])();
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
    }, [
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
}),
"[project]/app/admin/layout.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AdminRootLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useAuth.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function AdminRootLayout({ children }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const { user, isAuthenticated } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const [isAuthorized, setIsAuthorized] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [hydrated, setHydrated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Wait for Zustand store to hydrate
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setHydrated(true);
    }, []);
    // Pages that don't require authentication
    const publicAdminPages = [
        '/admin/login'
    ];
    const isPublicPage = publicAdminPages.includes(pathname);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Don't run auth check until store is hydrated
        if (!hydrated) return;
        let isMounted = true;
        const checkAdminAccess = async ()=>{
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
            const token = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : null;
            if ("TURBOPACK compile-time truthy", 1) {
                console.log('No token found, redirecting to admin login');
                if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                ;
                router.push('/admin/login');
                return;
            }
            //TURBOPACK unreachable
            ;
        };
        checkAdminAccess();
        return ()=>{
            isMounted = false;
        };
    }, [
        hydrated,
        router,
        isPublicPage,
        pathname
    ]);
    // Show loading state with better debugging
    if (isLoading || !isAuthorized) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-black flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "animate-spin rounded-full h-8 w-8 border-2 border-red-500 border-t-transparent mx-auto mb-4"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/layout.tsx",
                        lineNumber: 113,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-400 mb-2",
                        children: "Verifying admin access..."
                    }, void 0, false, {
                        fileName: "[project]/app/admin/layout.tsx",
                        lineNumber: 114,
                        columnNumber: 11
                    }, this),
                    ("TURBOPACK compile-time value", "development") === 'development' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs text-gray-600 space-y-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: [
                                    "Authenticated: ",
                                    isAuthenticated ? 'Yes' : 'No'
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/layout.tsx",
                                lineNumber: 117,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: [
                                    "User: ",
                                    user?.email || 'None'
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/layout.tsx",
                                lineNumber: 118,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: [
                                    "Is Admin: ",
                                    user?.isAdmin ? 'Yes' : 'No'
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/layout.tsx",
                                lineNumber: 119,
                                columnNumber: 15
                            }, this),
                            !isAuthenticated && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-black",
        children: children
    }, void 0, false, {
        fileName: "[project]/app/admin/layout.tsx",
        lineNumber: 136,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__513eaa64._.js.map
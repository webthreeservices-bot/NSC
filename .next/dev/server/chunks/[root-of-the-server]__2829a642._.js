module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/bcrypt [external] (bcrypt, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("bcrypt", () => require("bcrypt"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/pg [external] (pg, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("pg");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[project]/lib/db-connection.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "getClientWithTimeout",
    ()=>getClientWithTimeout,
    "queryWithTimeout",
    ()=>queryWithTimeout,
    "testConnection",
    ()=>testConnection,
    "warmupConnection",
    ()=>warmupConnection
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
// Load environment variables only in development
if ("TURBOPACK compile-time truthy", 1) {
    try {
        const dotenv = __turbopack_context__.r("[project]/node_modules/dotenv/lib/main.js [app-route] (ecmascript)");
        dotenv.config();
    } catch (error) {
        // dotenv is optional, might not be installed in production
        console.log('dotenv not available, using system environment variables');
    }
}
// Parse DATABASE_URL to handle Neon and other providers
const getDatabaseConfig = ()=>{
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('❌ DATABASE_URL is not defined in environment variables');
        console.error('Please ensure your .env file contains a valid DATABASE_URL');
        throw new Error('DATABASE_URL is not defined in environment variables');
    }
    // For Neon and other cloud providers, always use SSL
    const isCloudProvider = connectionString.includes('neon.tech') || connectionString.includes('supabase.co') || connectionString.includes('amazonaws.com') || connectionString.includes('azure.com');
    // For Neon, we need specific SSL settings
    const isNeon = connectionString.includes('neon.tech');
    // SSL configuration based on provider
    const sslConfig = isNeon ? {
        rejectUnauthorized: false,
        ca: null,
        checkServerIdentity: ()=>undefined
    } : {
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
    };
    // Optimized configuration for NeonDB
    return {
        connectionString,
        ssl: isCloudProvider ? sslConfig : false,
        max: 20,
        min: 5,
        idleTimeoutMillis: 60000,
        connectionTimeoutMillis: 20000,
        allowExitOnIdle: false,
        statement_timeout: 60000,
        query_timeout: 60000,
        keepAlive: true,
        keepAliveInitialDelayMillis: 5000,
        // Additional Neon-specific optimizations
        application_name: 'nsc-bot-platform',
        idle_in_transaction_session_timeout: 120000 // 2 minutes (increased)
    };
};
// Single pool instance - NO resets, NO lazy initialization
let pool = null;
let isInitializing = false;
const getPool = ()=>{
    // Create pool only once
    if (!pool && !isInitializing) {
        isInitializing = true;
        try {
            pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__["Pool"](getDatabaseConfig());
            // Add error handling for the pool - DO NOT reset pool or exit process
            pool.on('error', (err)=>{
                console.error('❌ Unexpected error on idle client:', err);
                console.error('Connection will be removed from pool and recreated automatically');
            // ✅ Let pg handle reconnection automatically - don't reset pool
            });
            // Only log connection events when VERBOSE_DB_LOGS is set (not during build)
            const isBuilding = process.env.NEXT_PHASE === 'phase-production-build';
            const shouldLog = !isBuilding && (("TURBOPACK compile-time value", "development") !== 'production' || process.env.VERBOSE_DB_LOGS === 'true');
            if (shouldLog) {
                pool.on('connect', (client)=>{
                    console.log('✅ New client connected to NeonDB');
                });
                pool.on('remove', (client)=>{
                    console.log('🔌 Client removed from pool');
                });
            }
            if (!isBuilding) {
                console.log('🚀 Database pool initialized for NeonDB');
            }
        } catch (error) {
            isInitializing = false;
            console.error('❌ Failed to initialize database pool:', error);
            throw error;
        } finally{
            isInitializing = false;
        }
    }
    // Wait for initialization if it's in progress
    while(isInitializing && !pool){
    // Busy wait - this is acceptable because initialization is fast
    }
    return pool;
};
async function testConnection() {
    let client;
    try {
        const poolInstance = getPool();
        client = await poolInstance.connect();
        const result = await client.query('SELECT NOW()');
        console.log('Database connection successful:', result.rows[0]);
        return true;
    } catch (err) {
        console.error('Database connection error:', err);
        return false;
    } finally{
        if (client) client.release();
    }
}
async function warmupConnection() {
    // Skip warmup during build phase
    const isBuilding = process.env.NEXT_PHASE === 'phase-production-build';
    if (isBuilding) {
        return;
    }
    console.log('🔥 Warming up database connection...');
    try {
        // Try to establish a connection and run a simple query
        const success = await testConnection();
        if (success) {
            console.log('✅ Database connection warmed up successfully');
            // Pre-establish a connection in the pool
            const poolInstance = getPool();
            const client = await poolInstance.connect();
            // Keep the connection alive briefly then release
            setTimeout(()=>{
                client.release();
                console.log('🔌 Warmup connection released');
            }, 1000);
        } else {
            console.warn('⚠️ Database warmup failed, but continuing...');
        }
    } catch (error) {
        console.warn('⚠️ Database warmup error:', error?.message || 'Unknown error');
    }
}
// Export a proxy that lazily initializes the pool
const poolProxy = new Proxy({}, {
    get (target, prop) {
        const poolInstance = getPool();
        return poolInstance[prop];
    }
});
async function getClientWithTimeout(timeoutMs = 20000) {
    const poolInstance = getPool();
    return Promise.race([
        poolInstance.connect(),
        new Promise((_, reject)=>setTimeout(()=>reject(new Error(`Database connection timeout after ${timeoutMs}ms`)), timeoutMs))
    ]);
}
async function queryWithTimeout(query, params = [], timeoutMs = 20000) {
    let client;
    try {
        client = await getClientWithTimeout(timeoutMs);
        const queryPromise = client.query(query, params);
        const timeoutPromise = new Promise((_, reject)=>setTimeout(()=>reject(new Error(`Query timeout after ${timeoutMs}ms`)), timeoutMs));
        return await Promise.race([
            queryPromise,
            timeoutPromise
        ]);
    } finally{
        if (client) {
            client.release();
        }
    }
}
const __TURBOPACK__default__export__ = poolProxy;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/lib/db.ts [app-route] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

/**
 * Pure PostgreSQL Database Layer
 * NO PRISMA. NO ORM. Just direct SQL via pg driver.
 * Neon DB (Serverless PostgreSQL)
 */ __turbopack_context__.s([
    "$transaction",
    ()=>$transaction,
    "default",
    ()=>__TURBOPACK__default__export__,
    "disconnect",
    ()=>disconnect,
    "execute",
    ()=>execute,
    "prisma",
    ()=>prisma,
    "query",
    ()=>query,
    "queryOne",
    ()=>queryOne,
    "queryScalar",
    ()=>queryScalar,
    "toCamelCase",
    ()=>toCamelCase,
    "toSnakeCase",
    ()=>toSnakeCase,
    "transaction",
    ()=>transaction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db-connection.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
// Helper to convert snake_case to camelCase
function toCamelCase(obj) {
    if (Array.isArray(obj)) {
        return obj.map(toCamelCase);
    }
    if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key)=>{
            const camelKey = key.replace(/_([a-z])/g, (g)=>g[1].toUpperCase());
            acc[camelKey] = toCamelCase(obj[key]);
            return acc;
        }, {});
    }
    return obj;
}
// Helper to convert camelCase to snake_case
function toSnakeCase(obj) {
    if (obj instanceof Date) return obj.toISOString();
    if (Array.isArray(obj)) return obj.map(toSnakeCase);
    if (obj !== null && typeof obj === 'object') {
        const result = {};
        for(const key in obj){
            if (obj.hasOwnProperty(key)) {
                result[key] = toSnakeCase(obj[key]);
            }
        }
        return result;
    }
    return obj;
}
async function query(sql, params = []) {
    // Validate that sql is actually a string
    if (typeof sql !== 'string' || sql.trim().length === 0) {
        const error = new Error('A query must have either text or a name. Supplying neither is unsupported.');
        console.error('PostgreSQL Error:', {
            message: error.message,
            sql: sql,
            code: undefined
        });
        throw error;
    }
    try {
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].query(sql, params);
        return result.rows;
    } catch (error) {
        console.error('PostgreSQL Error:', {
            message: error.message,
            sql: typeof sql === 'string' ? sql.substring(0, 200) : sql,
            code: error.code
        });
        throw error;
    }
}
async function queryOne(sql, params = []) {
    const rows = await query(sql, params);
    return rows.length > 0 ? rows[0] : null;
}
async function queryScalar(sql, params = []) {
    const rows = await query(sql, params);
    if (rows.length === 0) return null;
    const firstValue = Object.values(rows[0])[0];
    return firstValue;
}
async function execute(sql, params = []) {
    // Validate that sql is actually a string
    if (typeof sql !== 'string' || sql.trim().length === 0) {
        const error = new Error('A query must have either text or a name. Supplying neither is unsupported.');
        console.error('PostgreSQL Error:', {
            message: error.message,
            sql: sql,
            code: undefined
        });
        throw error;
    }
    try {
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].query(sql, params);
        return result.rowCount || 0;
    } catch (error) {
        console.error('PostgreSQL Error:', {
            message: error.message,
            sql: typeof sql === 'string' ? sql.substring(0, 200) : sql,
            code: error.code
        });
        throw error;
    }
}
async function transaction(callback) {
    const client = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally{
        client.release();
    }
}
async function disconnect() {
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].end();
}
;
;
const prisma = new Proxy({}, {
    get: (target, table)=>{
        if (typeof table !== 'string') return undefined;
        return {
            async findUnique ({ where, select }) {
                const [key, value] = Object.entries(where)[0];
                const fields = select ? Object.keys(select).map((k)=>`"${k}"`).join(', ') : '*';
                const row = await queryOne(`SELECT ${fields} FROM "${table}" WHERE "${key}" = $1 LIMIT 1`, [
                    value
                ]);
                return row ? toCamelCase(row) : null;
            },
            async findMany ({ where, select, orderBy, take, skip } = {}) {
                const params = [];
                const fields = select ? Object.keys(select).map((k)=>`"${k}"`).join(', ') : '*';
                let sql = `SELECT ${fields} FROM "${table}"`;
                if (where) {
                    const conditions = [];
                    for (const [key, value] of Object.entries(where)){
                        if (value === null) {
                            conditions.push(`"${key}" IS NULL`);
                        } else if (typeof value === 'object' && value !== null) {
                            // Handle various operators
                            if ('in' in value) {
                                const placeholders = value.in.map((_, i)=>`$${params.length + i + 1}`).join(', ');
                                params.push(...value.in);
                                conditions.push(`"${key}" IN (${placeholders})`);
                            } else if ('notIn' in value) {
                                const placeholders = value.notIn.map((_, i)=>`$${params.length + i + 1}`).join(', ');
                                params.push(...value.notIn);
                                conditions.push(`"${key}" NOT IN (${placeholders})`);
                            } else if ('lt' in value) {
                                params.push(value.lt);
                                conditions.push(`"${key}" < $${params.length}`);
                            } else if ('lte' in value) {
                                params.push(value.lte);
                                conditions.push(`"${key}" <= $${params.length}`);
                            } else if ('gt' in value) {
                                params.push(value.gt);
                                conditions.push(`"${key}" > $${params.length}`);
                            } else if ('gte' in value) {
                                params.push(value.gte);
                                conditions.push(`"${key}" >= $${params.length}`);
                            } else if ('contains' in value) {
                                params.push(`%${value.contains}%`);
                                conditions.push(`"${key}" ILIKE $${params.length}`);
                            } else if ('startsWith' in value) {
                                params.push(`${value.startsWith}%`);
                                conditions.push(`"${key}" ILIKE $${params.length}`);
                            } else if ('endsWith' in value) {
                                params.push(`%${value.endsWith}`);
                                conditions.push(`"${key}" ILIKE $${params.length}`);
                            } else if ('not' in value) {
                                params.push(value.not);
                                conditions.push(`"${key}" != $${params.length}`);
                            } else {
                                // Fallback: treat as direct value
                                params.push(value);
                                conditions.push(`"${key}" = $${params.length}`);
                            }
                        } else {
                            params.push(value);
                            conditions.push(`"${key}" = $${params.length}`);
                        }
                    }
                    if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`;
                }
                if (orderBy) {
                    const orderClauses = [];
                    for (const [field, dir] of Object.entries(orderBy)){
                        orderClauses.push(`"${field}" ${dir.toUpperCase()}`);
                    }
                    sql += ` ORDER BY ${orderClauses.join(', ')}`;
                }
                if (take) sql += ` LIMIT ${take}`;
                if (skip) sql += ` OFFSET ${skip}`;
                const rows = await query(sql, params);
                return rows.map((r)=>toCamelCase(r));
            },
            async findFirst ({ where, select, orderBy }) {
                // Use findMany with take: 1 to reuse the logic
                const result = await this.findMany({
                    where,
                    select,
                    orderBy,
                    take: 1
                });
                return result.length > 0 ? result[0] : null;
            },
            async count ({ where } = {}) {
                const params = [];
                let sql = `SELECT COUNT(*) as cnt FROM "${table}"`;
                if (where) {
                    const conditions = [];
                    for (const [key, value] of Object.entries(where)){
                        if (value === null) {
                            conditions.push(`"${key}" IS NULL`);
                        } else if (typeof value === 'object' && value !== null) {
                            // Handle operators for count
                            if ('in' in value) {
                                const placeholders = value.in.map((_, i)=>`$${params.length + i + 1}`).join(', ');
                                params.push(...value.in);
                                conditions.push(`"${key}" IN (${placeholders})`);
                            } else if ('not' in value) {
                                params.push(value.not);
                                conditions.push(`"${key}" != $${params.length}`);
                            } else {
                                params.push(value);
                                conditions.push(`"${key}" = $${params.length}`);
                            }
                        } else {
                            params.push(value);
                            conditions.push(`"${key}" = $${params.length}`);
                        }
                    }
                    if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`;
                }
                const row = await queryOne(sql, params);
                return row ? parseInt(row.cnt) : 0;
            },
            async create ({ data, select }) {
                const keys = Object.keys(data);
                const values = Object.values(data);
                const placeholders = keys.map((_, i)=>`$${i + 1}`).join(', ');
                const keyString = keys.map((k)=>`"${k}"`).join(', ');
                const fields = select ? Object.keys(select).map((k)=>`"${k}"`).join(', ') : '*';
                const row = await queryOne(`INSERT INTO "${table}" (${keyString}) VALUES (${placeholders}) RETURNING ${fields}`, values);
                return row ? toCamelCase(row) : null;
            },
            async update ({ where, data, select }) {
                const params = [];
                const sets = [];
                // Build SET clause
                for (const [key, value] of Object.entries(data)){
                    if (value !== undefined) {
                        if (typeof value === 'object' && value !== null) {
                            // Handle increment/decrement operations
                            if ('increment' in value) {
                                params.push(value.increment);
                                sets.push(`"${key}" = COALESCE("${key}", 0) + $${params.length}`);
                            } else if ('decrement' in value) {
                                params.push(value.decrement);
                                sets.push(`"${key}" = COALESCE("${key}", 0) - $${params.length}`);
                            } else {
                                // Regular object value
                                params.push(JSON.stringify(value));
                                sets.push(`"${key}" = $${params.length}`);
                            }
                        } else {
                            params.push(value);
                            sets.push(`"${key}" = $${params.length}`);
                        }
                    }
                }
                // Build WHERE clause
                const whereConditions = [];
                for (const [key, value] of Object.entries(where)){
                    params.push(value);
                    whereConditions.push(`"${key}" = $${params.length}`);
                }
                const fields = select ? Object.keys(select).map((k)=>`"${k}"`).join(', ') : '*';
                const row = await queryOne(`UPDATE "${table}" SET ${sets.join(', ')} WHERE ${whereConditions.join(' AND ')} RETURNING ${fields}`, params);
                return row ? toCamelCase(row) : null;
            },
            async delete ({ where }) {
                const [key, value] = Object.entries(where)[0];
                await execute(`DELETE FROM "${table}" WHERE "${key}" = $1`, [
                    value
                ]);
                return {};
            },
            async deleteMany ({ where } = {}) {
                const params = [];
                let sql = `DELETE FROM "${table}"`;
                if (where) {
                    const conditions = [];
                    for (const [key, value] of Object.entries(where)){
                        params.push(value);
                        conditions.push(`"${key}" = $${params.length}`);
                    }
                    if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`;
                }
                const count = await execute(sql, params);
                return {
                    count
                };
            },
            async aggregate ({ where, _sum, _count }) {
                const params = [];
                const aggs = [];
                if (_sum) {
                    Object.keys(_sum).forEach((field)=>{
                        aggs.push(`SUM("${field}") as sum_${field}`);
                    });
                }
                if (_count) aggs.push('COUNT(*) as cnt');
                let sql = `SELECT ${aggs.join(', ')} FROM "${table}"`;
                if (where) {
                    const conditions = [];
                    for (const [key, value] of Object.entries(where)){
                        params.push(value);
                        conditions.push(`"${key}" = $${params.length}`);
                    }
                    if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`;
                }
                const row = await queryOne(sql, params);
                const result = {};
                if (_sum && row) {
                    result._sum = {};
                    Object.keys(_sum).forEach((field)=>{
                        result._sum[field] = row[`sum_${field}`] ? parseFloat(row[`sum_${field}`]) : 0;
                    });
                }
                if (_count && row) result._count = row.cnt ? parseInt(row.cnt) : 0;
                return result;
            },
            async groupBy ({ by, _count, _sum, where }) {
                const params = [];
                const fields = (Array.isArray(by) ? by : [
                    by
                ]).map((f)=>`"${f}"`);
                const aggs = [];
                if (_count) aggs.push('COUNT(*) as cnt');
                if (_sum) {
                    Object.keys(_sum).forEach((field)=>{
                        aggs.push(`SUM("${field}") as sum_${field}`);
                    });
                }
                let sql = `SELECT ${fields.join(', ')}${aggs.length ? ', ' + aggs.join(', ') : ''} FROM "${table}"`;
                if (where) {
                    const conditions = [];
                    for (const [key, value] of Object.entries(where)){
                        params.push(value);
                        conditions.push(`"${key}" = $${params.length}`);
                    }
                    if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`;
                }
                sql += ` GROUP BY ${fields.join(', ')}`;
                const rows = await query(sql, params);
                return rows.map((row)=>{
                    const transformed = ({})(Array.isArray(by) ? by : [
                        by
                    ]).forEach((field)=>{
                        transformed[field] = row[field];
                    });
                    if (_count) transformed._count = row.cnt ? parseInt(row.cnt) : 0;
                    if (_sum) {
                        transformed._sum = {};
                        Object.keys(_sum).forEach((field)=>{
                            transformed._sum[field] = row[`sum_${field}`] ? parseFloat(row[`sum_${field}`]) : 0;
                        });
                    }
                    return transformed;
                });
            },
            async upsert ({ where, create, update }) {
                const existing = await this.findUnique({
                    where
                });
                return existing ? this.update({
                    where,
                    data: update
                }) : this.create({
                    data: create
                });
            }
        };
    }
});
const $transaction = transaction;
const __TURBOPACK__default__export__ = {
    query,
    queryOne,
    queryScalar,
    execute,
    transaction,
    disconnect,
    pool: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"],
    toCamelCase,
    toSnakeCase,
    prisma,
    $transaction
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/utils/server-helpers.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

/**
 * Server-only helper functions
 * These use Node.js modules and should only be imported in API routes
 */ __turbopack_context__.s([
    "comparePassword",
    ()=>comparePassword,
    "generateRandomToken",
    ()=>generateRandomToken,
    "generateReferralCode",
    ()=>generateReferralCode,
    "generateRefreshToken",
    ()=>generateRefreshToken,
    "generateToken",
    ()=>generateToken,
    "getNextReferralCode",
    ()=>getNextReferralCode,
    "hashPassword",
    ()=>hashPassword,
    "verifyRefreshToken",
    ()=>verifyRefreshToken,
    "verifyToken",
    ()=>verifyToken
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$bcrypt__$5b$external$5d$__$28$bcrypt$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/bcrypt [external] (bcrypt, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jsonwebtoken/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
async function hashPassword(password) {
    return await __TURBOPACK__imported__module__$5b$externals$5d2f$bcrypt__$5b$external$5d$__$28$bcrypt$2c$__cjs$29$__["default"].hash(password, 10);
}
async function comparePassword(password, hash) {
    return await __TURBOPACK__imported__module__$5b$externals$5d2f$bcrypt__$5b$external$5d$__$28$bcrypt$2c$__cjs$29$__["default"].compare(password, hash);
}
function generateToken(payload, expiresIn = '24h') {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    // Cast secret to Secret to satisfy TypeScript overloads
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    // jwt.sign typings are picky about the secret type and options; cast to any
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].sign(payload, secret, {
        expiresIn
    });
}
function generateRefreshToken(payload) {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
    }
    const tokenPayload = {
        ...payload,
        type: 'refresh'
    };
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].sign(tokenPayload, refreshSecret, {
        expiresIn: '7d'
    });
}
function verifyToken(token) {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }
        const decoded = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].verify(token, process.env.JWT_SECRET);
        if (typeof decoded === 'string') {
            return null;
        }
        return decoded;
    } catch (error) {
        return null;
    }
}
function verifyRefreshToken(token) {
    try {
        if (!process.env.JWT_REFRESH_SECRET) {
            throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
        }
        const decoded = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].verify(token, process.env.JWT_REFRESH_SECRET);
        if (typeof decoded === 'string') {
            return null;
        }
        return decoded;
    } catch (error) {
        return null;
    }
}
function generateRandomToken() {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(32).toString('hex');
}
function generateReferralCode(username) {
    const random = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(3).toString('hex').toUpperCase();
    const userPrefix = username.substring(0, 3).toUpperCase();
    return `${userPrefix}${random}`;
}
async function getNextReferralCode() {
    // Use a transaction to ensure atomicity and prevent race conditions
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["transaction"])(async (client)=>{
        // First, try to find the existing counter
        let counter = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["queryOne"])(`SELECT * FROM "ReferralCounter" WHERE "counterType" = 'NSCREF'`, []);
        // If counter doesn't exist, create it with initial value
        if (!counter) {
            counter = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["queryOne"])(`INSERT INTO "ReferralCounter" ("counterType", "currentValue") 
         VALUES ('NSCREF', 1001) RETURNING *`, []);
        } else {
            // Increment the counter
            counter = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["queryOne"])(`UPDATE "ReferralCounter" SET "currentValue" = "currentValue" + 1 
         WHERE "counterType" = 'NSCREF' RETURNING *`, []);
        }
        return counter;
    });
    // The result is the counter object
    const counter = result;
    // Double-check that the code is unique
    const codeToUse = `NSCREF${counter.currentValue}`;
    const existingUser = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["queryOne"])(`SELECT * FROM "User" WHERE "referralCode" = $1`, [
        codeToUse
    ]);
    // In the extremely unlikely case of a collision, add a random suffix
    if (existingUser) {
        const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `NSCREF${counter.currentValue}_${randomSuffix}`;
    }
    return codeToUse;
} // NEWNCS function has been completely removed as it's no longer needed
 // All users must now register with a valid referral code
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/lib/cors.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "corsHeaders",
    ()=>corsHeaders,
    "handleCors",
    ()=>handleCors,
    "handleOptions",
    ()=>handleOptions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
// Get allowed origins from environment or use localhost for development
const getAllowedOrigin = ()=>{
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
        ("TURBOPACK compile-time value", "http://localhost:3000") || 'http://localhost:3000'
    ];
    // In production, never allow all origins
    if (("TURBOPACK compile-time value", "development") === 'production' && allowedOrigins.includes('*')) //TURBOPACK unreachable
    ;
    return allowedOrigins[0] // Return first allowed origin
    ;
};
function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': getAllowedOrigin(),
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true'
    };
}
function handleCors(response) {
    Object.entries(corsHeaders()).forEach(([key, value])=>{
        response.headers.set(key, value);
    });
    return response;
}
function handleOptions() {
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](null, {
        status: 200,
        headers: corsHeaders()
    });
}
}),
"[project]/lib/logger.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Development logger utility
 * Only logs in development environment to avoid console overhead in production
 */ __turbopack_context__.s([
    "logger",
    ()=>logger,
    "productionLogger",
    ()=>productionLogger
]);
const isDevelopment = ("TURBOPACK compile-time value", "development") === 'development';
const logger = {
    log: (...args)=>{
        if ("TURBOPACK compile-time truthy", 1) {
            console.log(...args);
        }
    },
    error: (...args)=>{
        if ("TURBOPACK compile-time truthy", 1) {
            console.error(...args);
        }
    },
    warn: (...args)=>{
        if ("TURBOPACK compile-time truthy", 1) {
            console.warn(...args);
        }
    },
    info: (...args)=>{
        if ("TURBOPACK compile-time truthy", 1) {
            console.info(...args);
        }
    },
    debug: (...args)=>{
        if ("TURBOPACK compile-time truthy", 1) {
            console.debug(...args);
        }
    }
};
const productionLogger = {
    error: (...args)=>{
        console.error(...args);
    }
};
}),
"[project]/lib/audit-logger.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

/**
 * Audit Logging Service
 * Tracks all security-sensitive and administrative actions
 */ __turbopack_context__.s([
    "createAuditLog",
    ()=>createAuditLog,
    "getAuditLogs",
    ()=>getAuditLogs,
    "initializeAuditLogsTable",
    ()=>initializeAuditLogsTable,
    "logAdminAction",
    ()=>logAdminAction,
    "logAuthEvent",
    ()=>logAuthEvent,
    "logPaymentEvent",
    ()=>logPaymentEvent,
    "logSecurityEvent",
    ()=>logSecurityEvent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db-connection.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
async function createAuditLog(entry) {
    const client = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].connect();
    try {
        await client.query(`INSERT INTO "AuditLog" (
        "userId", 
        "action", 
        "metadata", 
        "ipAddress", 
        "userAgent", 
        "createdAt"
      ) VALUES ($1, $2, $3, $4, $5, NOW())`, [
            entry.userId || null,
            entry.action,
            JSON.stringify(entry.details || {}),
            entry.ipAddress || null,
            entry.userAgent || null
        ]);
    } catch (error) {
        // Don't fail the request if audit logging fails
        console.error('Failed to create audit log:', error);
    } finally{
        client.release();
    }
}
async function logAuthEvent(action, userId, details, request) {
    const ipAddress = request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || 'unknown';
    const userAgent = request?.headers.get('user-agent') || 'unknown';
    await createAuditLog({
        userId,
        action,
        details,
        ipAddress,
        userAgent,
        severity: action === 'LOGIN_FAILED' ? 'MEDIUM' : 'LOW'
    });
}
async function logAdminAction(adminId, action, targetUserId, details, request) {
    const ipAddress = request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || 'unknown';
    const userAgent = request?.headers.get('user-agent') || 'unknown';
    await createAuditLog({
        userId: adminId,
        action: 'ADMIN_ACTION',
        details: {
            ...details,
            targetUserId,
            adminAction: action
        },
        ipAddress,
        userAgent,
        severity: 'HIGH'
    });
}
async function logPaymentEvent(action, userId, details) {
    await createAuditLog({
        userId,
        action,
        details,
        severity: action === 'PAYMENT_FAILED' ? 'MEDIUM' : 'LOW'
    });
}
async function logSecurityEvent(action, userId, details, severity = 'HIGH') {
    await createAuditLog({
        userId,
        action,
        details,
        severity
    });
}
async function getAuditLogs(filters) {
    const client = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].connect();
    try {
        const conditions = [];
        const params = [];
        let paramIndex = 1;
        if (filters.userId) {
            conditions.push(`"userId" = $${paramIndex++}`);
            params.push(filters.userId);
        }
        if (filters.action) {
            conditions.push(`action = $${paramIndex++}`);
            params.push(filters.action);
        }
        if (filters.startDate) {
            conditions.push(`"createdAt" >= $${paramIndex++}`);
            params.push(filters.startDate);
        }
        if (filters.endDate) {
            conditions.push(`"createdAt" <= $${paramIndex++}`);
            params.push(filters.endDate);
        }
        if (filters.severity) {
            conditions.push(`severity = $${paramIndex++}`);
            params.push(filters.severity);
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const limit = filters.limit || 100;
        const offset = filters.offset || 0;
        params.push(limit);
        params.push(offset);
        const result = await client.query(`SELECT * FROM "AuditLog" ${whereClause} ORDER BY "createdAt" DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`, params);
        return result.rows;
    } catch (error) {
        console.error('Failed to query audit logs:', error);
        return [];
    } finally{
        client.release();
    }
}
async function initializeAuditLogsTable() {
    const client = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].connect();
    try {
        await client.query(`
      CREATE TABLE IF NOT EXISTS "AuditLog" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" TEXT,
        action VARCHAR(100) NOT NULL,
        details JSONB,
        "ipAddress" VARCHAR(45),
        "userAgent" TEXT,
        severity VARCHAR(20) DEFAULT 'LOW',
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `);
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_user_id ON "AuditLog"("userId")
    `);
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_action ON "AuditLog"(action)
    `);
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_created_at ON "AuditLog"("createdAt")
    `);
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_severity ON "AuditLog"(severity)
    `);
        console.log('✓ Audit logs table initialized successfully');
    } catch (error) {
        console.error('Failed to initialize audit logs table:', error);
    } finally{
        client.release();
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/lib/neon-serverless.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "getNeonSQL",
    ()=>getNeonSQL,
    "neonQuery",
    ()=>neonQuery,
    "neonQueryPrepared",
    ()=>neonQueryPrepared
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$serverless$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@neondatabase/serverless/index.mjs [app-route] (ecmascript)");
;
/**
 * Neon Serverless Database Connection
 * Optimized for Neon's serverless environment
 */ let sql = null;
function getNeonSQL() {
    if (!sql) {
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('DATABASE_URL is not defined in environment variables');
        }
        console.log('🚀 Initializing Neon Serverless SQL connection');
        sql = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$neondatabase$2f$serverless$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["neon"])(databaseUrl);
    }
    return sql;
}
async function neonQuery(query, params = []) {
    const sql = getNeonSQL();
    try {
        console.log(`🔍 Executing Neon query: ${query.substring(0, 100)}...`);
        // For Neon serverless, we need to use sql.query() for parameterized queries
        const result = await sql.query(query, params);
        const resultArray = Array.isArray(result) ? result : [
            result
        ];
        console.log(`✅ Neon query completed, returned ${resultArray.length} rows`);
        return resultArray;
    } catch (error) {
        console.error('❌ Neon query failed:', error.message);
        console.error('Query:', query);
        console.error('Params:', params);
        throw error;
    }
}
async function neonQueryPrepared(queryTemplate) {
    const sql = getNeonSQL();
    try {
        console.log(`🔍 Executing Neon prepared query...`);
        const result = await queryTemplate(sql);
        console.log(`✅ Neon prepared query completed, returned ${result.length} rows`);
        return result;
    } catch (error) {
        console.error('❌ Neon prepared query failed:', error.message);
        throw error;
    }
}
const __TURBOPACK__default__export__ = {
    getNeonSQL,
    neonQuery,
    neonQueryPrepared
};
}),
"[project]/services/loginSecurityService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "LoginSecurityService",
    ()=>LoginSecurityService,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db-connection.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$neon$2d$serverless$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/neon-serverless.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
class LoginSecurityService {
    // Configuration
    static MAX_ATTEMPTS_EMAIL = 5;
    static MAX_ATTEMPTS_IP = 10 // IP gets double limit
    ;
    static WINDOW_MINUTES = 15;
    /**
   * Record a login attempt (success or failure)
   */ static async recordAttempt(email, ipAddress, userAgent, success, failureReason) {
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryWithTimeout"])('SELECT record_login_attempt($1, $2, $3, $4, $5) as attempt_id', [
                email.toLowerCase(),
                ipAddress,
                userAgent,
                success,
                failureReason
            ], 20000 // Increased to 20 seconds for cloud database
            );
            const attemptId = result.rows[0]?.attempt_id;
            if (success) {
                console.log(`✅ Successful login recorded for ${email} from ${ipAddress}`);
            } else {
                console.log(`❌ Failed login recorded for ${email} from ${ipAddress}: ${failureReason}`);
            }
            return attemptId;
        } catch (error) {
            console.error('❌ Error recording login attempt:', error);
            throw new Error(`Failed to record login attempt: ${error}`);
        }
    }
    /**
   * Check if email or IP should be blocked due to too many failed attempts
   */ static async checkBlocking(email, ipAddress) {
        try {
            console.log(`🔍 Checking login blocking for ${email} from ${ipAddress}`);
            // Use Neon serverless driver for better reliability
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$neon$2d$serverless$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["neonQuery"])('SELECT * FROM check_login_blocking($1, $2, $3, $4)', [
                email.toLowerCase(),
                ipAddress,
                this.MAX_ATTEMPTS_EMAIL,
                this.WINDOW_MINUTES
            ]);
            if (result.length === 0) {
                console.log(`✅ No blocking found for ${email}`);
                return {
                    isBlocked: false,
                    failedAttempts: 0
                };
            }
            const row = result[0];
            const blockingResult = {
                isBlocked: row.isBlocked,
                blockReason: row.blockReason,
                failedAttempts: parseInt(row.failedAttempts),
                lastAttemptAt: row.lastAttemptAt ? new Date(row.lastAttemptAt) : undefined,
                blockUntil: row.blockUntil ? new Date(row.blockUntil) : undefined
            };
            if (blockingResult.isBlocked) {
                console.log(`🚫 Login blocked for ${email}: ${blockingResult.blockReason}`);
            } else {
                console.log(`✅ Login allowed for ${email} (${blockingResult.failedAttempts} failed attempts)`);
            }
            return blockingResult;
        } catch (error) {
            console.error(`❌ Error checking login blocking for ${email}:`, error.message);
            // On database error, allow login but log the issue
            console.warn(`⚠️ Allowing login due to database error for ${email}`);
            return {
                isBlocked: false,
                failedAttempts: 0
            };
        }
    }
    /**
   * Get login statistics for the last N days
   */ static async getLoginStats(daysBack = 7) {
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryWithTimeout"])('SELECT * FROM get_login_stats($1)', [
                daysBack
            ], 20000 // Increased to 20 seconds for cloud database
            );
            return result.rows.map((row)=>({
                    date: row.date,
                    totalAttempts: parseInt(row.totalAttempts),
                    successfulLogins: parseInt(row.successfulLogins),
                    failedLogins: parseInt(row.failedLogins),
                    uniqueIPs: parseInt(row.uniqueIPs),
                    uniqueEmails: parseInt(row.uniqueEmails),
                    successRate: parseFloat(row.successRate)
                }));
        } catch (error) {
            console.error('❌ Error getting login stats:', error);
            throw new Error(`Failed to get login stats: ${error}`);
        }
    }
    /**
   * Clean up old login attempts (call this periodically)
   */ static async cleanupOldAttempts(daysToKeep = 30) {
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryWithTimeout"])('SELECT cleanup_old_login_attempts($1) as deleted_count', [
                daysToKeep
            ], 20000 // Increased to 20 seconds for cloud database
            );
            const deletedCount = parseInt(result.rows[0]?.deleted_count || 0);
            console.log(`🧹 Cleaned up ${deletedCount} old login attempts`);
            return deletedCount;
        } catch (error) {
            console.error('❌ Error cleaning up old login attempts:', error);
            throw new Error(`Failed to cleanup old attempts: ${error}`);
        }
    }
    /**
   * Extract IP address from request (handles proxies)
   */ static getClientIP(request) {
        // Check various headers for real IP (in order of preference)
        const forwardedFor = request.headers.get('x-forwarded-for');
        const realIP = request.headers.get('x-real-ip');
        const cfConnectingIP = request.headers.get('cf-connecting-ip') // Cloudflare
        ;
        if (cfConnectingIP) return cfConnectingIP;
        if (realIP) return realIP;
        if (forwardedFor) {
            // x-forwarded-for can contain multiple IPs, first one is the client
            return forwardedFor.split(',')[0].trim();
        }
        // Fallback to localhost
        return '127.0.0.1';
    }
    /**
   * Get user agent from request
   */ static getUserAgent(request) {
        return request.headers.get('user-agent') || 'Unknown';
    }
    /**
   * Check if an IP address appears to be suspicious
   * (This is a basic implementation - you could enhance with IP reputation services)
   */ static isSuspiciousIP(ipAddress) {
        // Basic checks for obviously suspicious IPs
        if (ipAddress === '127.0.0.1' || ipAddress === 'localhost') {
            return false // Local development
            ;
        }
        // Add more sophisticated checks here:
        // - Known malicious IP lists
        // - Tor exit nodes
        // - VPN detection
        // - Geolocation checks
        return false;
    }
    /**
   * Generate security report for admin dashboard
   */ static async generateSecurityReport() {
        try {
            const stats = await this.getLoginStats(7) // Last 7 days
            ;
            const summary = stats.reduce((acc, day)=>({
                    totalAttempts: acc.totalAttempts + day.totalAttempts,
                    successfulLogins: acc.successfulLogins + day.successfulLogins,
                    uniqueIPs: Math.max(acc.uniqueIPs, day.uniqueIPs)
                }), {
                totalAttempts: 0,
                successfulLogins: 0,
                uniqueIPs: 0
            });
            const overallSuccessRate = summary.totalAttempts > 0 ? summary.successfulLogins / summary.totalAttempts * 100 : 100;
            // Simple suspicious activity detection
            const suspiciousActivity = overallSuccessRate < 50 || // Low success rate
            stats.some((day)=>day.failedLogins > 100) // High failed attempts in a day
            ;
            return {
                recentStats: stats,
                summary: {
                    totalAttempts: summary.totalAttempts,
                    successRate: Math.round(overallSuccessRate * 100) / 100,
                    uniqueIPs: summary.uniqueIPs,
                    suspiciousActivity
                }
            };
        } catch (error) {
            console.error('❌ Error generating security report:', error);
            throw new Error(`Failed to generate security report: ${error}`);
        }
    }
}
const __TURBOPACK__default__export__ = LoginSecurityService;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/services/sessionManagementService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "SessionManagementService",
    ()=>SessionManagementService,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db-connection.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
class SessionManagementService {
    /**
   * Create a new session for a user
   */ static async createSession(userId, tokenHash, refreshTokenHash, ipAddress, userAgent, expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days default
    ) {
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryWithTimeout"])(`SELECT create_session($1::TEXT, $2::TEXT, $3::TEXT, $4::TEXT, $5::TEXT, $6::TIMESTAMP) as session_id`, [
                userId,
                tokenHash,
                refreshTokenHash,
                ipAddress,
                userAgent,
                expiresAt
            ], 5000);
            if (result.rows && result.rows.length > 0) {
                const sessionId = result.rows[0].session_id;
                // Return a basic session object
                return {
                    sessionId: sessionId,
                    userId: userId,
                    ipAddress: ipAddress,
                    userAgent: userAgent,
                    isActive: true,
                    createdAt: new Date(),
                    lastActiveAt: new Date(),
                    expiresAt: expiresAt
                };
            }
            return null;
        } catch (error) {
            console.error('Error creating session:', error);
            // For now, don't throw an error to allow login to complete
            // This allows the system to work while we debug the session creation
            console.warn('Session creation failed, but allowing login to continue');
            return {
                sessionId: 'fallback-session-' + Date.now(),
                userId: userId,
                ipAddress: ipAddress,
                userAgent: userAgent,
                isActive: true,
                createdAt: new Date(),
                lastActiveAt: new Date(),
                expiresAt: expiresAt
            };
        }
    }
    /**
   * Validate and update session activity
   */ static async validateSession(tokenHash) {
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryWithTimeout"])(`SELECT * FROM validate_session($1::TEXT)`, [
                tokenHash
            ], 5000);
            if (result.rows && result.rows.length > 0) {
                const session = result.rows[0];
                // Return null if session is not valid
                if (!session.isValid) {
                    return null;
                }
                return {
                    sessionId: session.sessionId,
                    userId: session.userId,
                    ipAddress: session.ipAddress,
                    userAgent: session.userAgent,
                    isActive: session.isValid,
                    createdAt: new Date(session.createdAt),
                    lastActiveAt: new Date(session.lastUsedAt),
                    expiresAt: new Date(session.expiresAt)
                };
            }
            return null;
        } catch (error) {
            console.error('Error validating session:', error);
            return null; // Fail gracefully for validation
        }
    }
    /**
   * Revoke a specific session
   */ static async revokeSession(sessionId) {
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryWithTimeout"])(`SELECT revoke_session($1) as revoked`, [
                sessionId
            ], 5000);
            return result.rows?.[0]?.revoked === true;
        } catch (error) {
            console.error('Error revoking session:', error);
            return false;
        }
    }
    /**
   * Revoke all sessions for a user
   */ static async revokeAllUserSessions(userId) {
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryWithTimeout"])(`SELECT revoke_all_user_sessions($1) as revoked_count`, [
                userId
            ], 5000);
            return result.rows?.[0]?.revoked_count || 0;
        } catch (error) {
            console.error('Error revoking all user sessions:', error);
            return 0;
        }
    }
    /**
   * Revoke all other sessions except the current one
   */ static async revokeOtherSessions(userId, currentSessionId) {
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryWithTimeout"])(`SELECT revoke_other_sessions($1, $2) as revoked_count`, [
                userId,
                currentSessionId
            ], 5000);
            return result.rows?.[0]?.revoked_count || 0;
        } catch (error) {
            console.error('Error revoking other sessions:', error);
            return 0;
        }
    }
    /**
   * Get all active sessions for a user
   */ static async getUserSessions(userId) {
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryWithTimeout"])(`SELECT * FROM get_user_sessions($1::TEXT)`, [
                userId
            ], 5000);
            if (result.rows && result.rows.length > 0) {
                return result.rows.map((session)=>({
                        sessionId: session.sessionId,
                        userId: userId,
                        ipAddress: session.ipAddress,
                        userAgent: session.userAgent,
                        isActive: session.isActive,
                        createdAt: new Date(session.createdAt),
                        lastActiveAt: new Date(session.lastUsedAt),
                        expiresAt: new Date(session.expiresAt)
                    }));
            }
            return [];
        } catch (error) {
            console.error('Error getting user sessions:', error);
            return [];
        }
    }
    /**
   * Clean up expired sessions
   */ static async cleanupExpiredSessions() {
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryWithTimeout"])(`SELECT cleanup_expired_sessions() as cleaned_count`, [], 10000 // Longer timeout for cleanup operation
            );
            return result.rows?.[0]?.cleaned_count || 0;
        } catch (error) {
            console.error('Error cleaning up expired sessions:', error);
            return 0;
        }
    }
    /**
   * Get session statistics
   */ static async getSessionStats() {
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryWithTimeout"])(`SELECT * FROM get_session_stats()`, [], 5000);
            if (result.rows && result.rows.length > 0) {
                const stats = result.rows[0];
                return {
                    activeSessions: stats.active_sessions || 0,
                    uniqueUsers: stats.unique_users || 0,
                    sessionsLast24h: stats.sessions_last_24h || 0
                };
            }
            return {
                activeSessions: 0,
                uniqueUsers: 0,
                sessionsLast24h: 0
            };
        } catch (error) {
            console.error('Error getting session stats:', error);
            return {
                activeSessions: 0,
                uniqueUsers: 0,
                sessionsLast24h: 0
            };
        }
    }
    /**
   * Generate a secure session ID
   */ static generateSessionId() {
        const crypto = __turbopack_context__.r("[externals]/crypto [external] (crypto, cjs)");
        return crypto.randomBytes(32).toString('hex');
    }
    /**
   * Extract session ID from JWT token or cookie
   */ static extractSessionId(token) {
        if (!token) return null;
        try {
            // If it's a JWT token, decode to get session ID
            const jwt = __turbopack_context__.r("[project]/node_modules/jsonwebtoken/index.js [app-route] (ecmascript)");
            const decoded = jwt.decode(token);
            return decoded?.sessionId || null;
        } catch (error) {
            // If not JWT, treat as direct session ID
            return token;
        }
    }
    /**
   * Middleware helper to validate session in requests
   */ static async validateRequestSession(authHeader, sessionCookie) {
        try {
            // Try to extract session ID from Authorization header or cookie
            let sessionId = null;
            if (authHeader?.startsWith('Bearer ')) {
                sessionId = this.extractSessionId(authHeader.substring(7));
            } else if (sessionCookie) {
                sessionId = this.extractSessionId(sessionCookie);
            }
            if (!sessionId) {
                return {
                    isValid: false
                };
            }
            const session = await this.validateSession(sessionId);
            if (!session) {
                return {
                    isValid: false
                };
            }
            return {
                isValid: true,
                session,
                userId: session.userId
            };
        } catch (error) {
            console.error('Error validating request session:', error);
            return {
                isValid: false
            };
        }
    }
}
const __TURBOPACK__default__export__ = SessionManagementService;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/lib/db-health-manager.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "CriticalConnectionManager",
    ()=>CriticalConnectionManager,
    "DatabaseHealthChecker",
    ()=>DatabaseHealthChecker,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db-connection.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
class DatabaseHealthChecker {
    static lastHealthCheck = 0;
    static isHealthy = false;
    static HEALTH_CHECK_INTERVAL = 30000 // 30 seconds
    ;
    static async checkHealth() {
        const now = Date.now();
        // Return cached result if check was recent
        if (now - this.lastHealthCheck < this.HEALTH_CHECK_INTERVAL) {
            return this.isHealthy;
        }
        try {
            console.log('🏥 Checking database health...');
            // Import here to avoid circular dependencies
            const { testConnection } = await __turbopack_context__.A("[project]/lib/db-connection.ts [app-route] (ecmascript, async loader)");
            this.isHealthy = await testConnection();
            this.lastHealthCheck = now;
            if (this.isHealthy) {
                console.log('✅ Database health check passed');
            } else {
                console.warn('⚠️ Database health check failed');
            }
            return this.isHealthy;
        } catch (error) {
            console.error('❌ Database health check error:', error.message);
            this.isHealthy = false;
            this.lastHealthCheck = now;
            return false;
        }
    }
    static async ensureConnection() {
        const isHealthy = await this.checkHealth();
        if (!isHealthy) {
            console.log('🔧 Attempting to restore database connection...');
            try {
                // Try to warmup the connection
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$connection$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["warmupConnection"])();
                // Check again
                const restored = await this.checkHealth();
                if (restored) {
                    console.log('✅ Database connection restored');
                } else {
                    console.error('❌ Failed to restore database connection');
                    throw new Error('Database connection could not be restored');
                }
            } catch (error) {
                console.error('❌ Error restoring database connection:', error.message);
                throw error;
            }
        }
    }
}
class CriticalConnectionManager {
    static activeConnections = 0;
    static MAX_CONCURRENT_CONNECTIONS = 1 // Very conservative for Neon
    ;
    static async executeWithConnection(operation, operationName = 'Unknown operation') {
        // Check if we're at connection limit
        if (this.activeConnections >= this.MAX_CONCURRENT_CONNECTIONS) {
            console.warn(`⚠️ Connection limit reached, queuing ${operationName}`);
            // Wait for a connection to free up
            await this.waitForAvailableConnection();
        }
        this.activeConnections++;
        console.log(`🔗 Starting ${operationName} (active: ${this.activeConnections}/${this.MAX_CONCURRENT_CONNECTIONS})`);
        try {
            // Ensure database is healthy before executing
            await DatabaseHealthChecker.ensureConnection();
            // Execute the operation with timeout
            const result = await Promise.race([
                operation(),
                new Promise((_, reject)=>setTimeout(()=>reject(new Error(`Operation timeout: ${operationName}`)), 30000))
            ]);
            console.log(`✅ Completed ${operationName}`);
            return result;
        } catch (error) {
            console.error(`❌ Failed ${operationName}:`, error.message);
            throw error;
        } finally{
            this.activeConnections--;
            console.log(`🔌 Released connection for ${operationName} (active: ${this.activeConnections}/${this.MAX_CONCURRENT_CONNECTIONS})`);
        }
    }
    static async waitForAvailableConnection() {
        return new Promise((resolve)=>{
            const checkInterval = setInterval(()=>{
                if (this.activeConnections < this.MAX_CONCURRENT_CONNECTIONS) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100) // Check every 100ms
            ;
            // Timeout after 10 seconds
            setTimeout(()=>{
                clearInterval(checkInterval);
                resolve(); // Proceed anyway after timeout
            }, 10000);
        });
    }
}
const __TURBOPACK__default__export__ = {
    DatabaseHealthChecker,
    CriticalConnectionManager
};
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[project]/app/api/admin/login/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "OPTIONS",
    ()=>OPTIONS,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$server$2d$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/server-helpers.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/cors.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/logger.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audit$2d$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/audit-logger.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$loginSecurityService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/loginSecurityService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$sessionManagementService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/sessionManagementService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$health$2d$manager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db-health-manager.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$speakeasy$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/speakeasy/index.js [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$server$2d$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audit$2d$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$loginSecurityService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$sessionManagementService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$health$2d$manager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$server$2d$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audit$2d$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$loginSecurityService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$sessionManagementService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$health$2d$manager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
;
async function OPTIONS(request) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleOptions"])();
}
async function POST(request) {
    try {
        const body = await request.json();
        const { email, password, twoFactorCode } = body;
        if (!email || !password) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Email and password are required'
            }, {
                status: 400
            });
        }
        const normalizedEmail = email.toLowerCase().trim();
        // Get client IP and user agent
        const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || '127.0.0.1';
        const userAgent = request.headers.get('user-agent') || 'Unknown';
        // Check for security blocks (same security as regular login)
        const blockingCheck = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$health$2d$manager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CriticalConnectionManager"].executeWithConnection(()=>__TURBOPACK__imported__module__$5b$project$5d2f$services$2f$loginSecurityService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].checkBlocking(normalizedEmail, clientIP), 'Admin login blocking check');
        if (blockingCheck.isBlocked) {
            const minutesRemaining = Math.ceil((blockingCheck.blockUntil.getTime() - Date.now()) / (60 * 1000));
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audit$2d$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAuthEvent"])('LOGIN_FAILED', undefined, {
                email: normalizedEmail,
                reason: 'IP/Email blocked',
                ipAddress: clientIP,
                blockedUntil: blockingCheck.blockUntil
            }, request);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: `Too many failed login attempts. Please try again in ${minutesRemaining} minute(s).`,
                blockedUntil: blockingCheck.blockUntil
            }, {
                status: 429
            });
        }
        // Find admin user
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2d$health$2d$manager$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CriticalConnectionManager"].executeWithConnection(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["queryOne"])('SELECT * FROM "User" WHERE "email" = $1 AND "isAdmin" = true', [
                normalizedEmail
            ]), 'Admin user lookup');
        if (!user) {
            // Record failed login attempt
            await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$loginSecurityService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].recordAttempt(normalizedEmail, clientIP, userAgent, false, 'Invalid admin credentials');
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audit$2d$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAuthEvent"])('LOGIN_FAILED', undefined, {
                email: normalizedEmail,
                reason: 'Invalid admin credentials',
                ipAddress: clientIP
            }, request);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid admin credentials'
            }, {
                status: 401
            });
        }
        // Verify password
        const isValidPassword = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$server$2d$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["comparePassword"])(password, user.password);
        if (!isValidPassword) {
            // Record failed login attempt
            await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$loginSecurityService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].recordAttempt(normalizedEmail, clientIP, userAgent, false, 'Invalid password');
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audit$2d$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAuthEvent"])('LOGIN_FAILED', user.id, {
                email: normalizedEmail,
                reason: 'Invalid password',
                ipAddress: clientIP
            }, request);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid admin credentials'
            }, {
                status: 401
            });
        }
        // Check 2FA if enabled
        if (user.twoFactorEnabled && user.twoFactorSecret) {
            if (!twoFactorCode) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: '2FA code required',
                    requires2FA: true
                }, {
                    status: 401
                });
            }
            const isValid = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$speakeasy$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token: twoFactorCode,
                window: 2
            });
            if (!isValid) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$loginSecurityService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].recordAttempt(normalizedEmail, clientIP, userAgent, false, 'Invalid 2FA code');
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Invalid 2FA code'
                }, {
                    status: 401
                });
            }
        }
        // Generate session ID and tokens
        const sessionId = __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$sessionManagementService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].generateSessionId();
        const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$server$2d$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateToken"])({
            userId: user.id,
            email: user.email,
            isAdmin: true,
            sessionId
        });
        const refreshToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$server$2d$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateRefreshToken"])({
            userId: user.id,
            sessionId
        });
        // Create session record
        try {
            const session = await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$sessionManagementService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].createSession(user.id, token, refreshToken, clientIP, userAgent, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            );
            if (session) {
                console.log(`âœ… Admin session created: ${session.sessionId}`);
            }
        } catch (sessionError) {
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error('Failed to create admin session:', sessionError);
        // Continue with login but log the error
        }
        // Record successful login
        await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$loginSecurityService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].recordAttempt(normalizedEmail, clientIP, userAgent, true, 'Admin login successful');
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$audit$2d$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logAuthEvent"])('LOGIN_SUCCESS', user.id, {
            email: user.email,
            isAdmin: true,
            twoFactorUsed: user.twoFactorEnabled,
            ipAddress: clientIP
        }, request);
        // Return user data
        const userData = {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            isAdmin: true,
            isEmailVerified: user.isEmailVerified,
            twoFactorEnabled: user.twoFactorEnabled
        };
        const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: 'Admin login successful',
            user: userData,
            token,
            refreshToken
        });
        // Set consistent cookie names (same as regular login)
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: ("TURBOPACK compile-time value", "development") === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 // 24 hours
        });
        response.cookies.set('refreshToken', refreshToken, {
            httpOnly: true,
            secure: ("TURBOPACK compile-time value", "development") === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleCors"])(response);
    } catch (error) {
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error('Admin login error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__2829a642._.js.map
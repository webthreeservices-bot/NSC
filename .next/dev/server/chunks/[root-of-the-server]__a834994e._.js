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
"[project]/app/api/auth/validate/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "POST",
    ()=>POST,
    "dynamic",
    ()=>dynamic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$server$2d$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/server-helpers.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$server$2d$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$server$2d$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const dynamic = 'force-dynamic';
async function POST(request) {
    try {
        // Try to get token from multiple sources
        let token = null;
        // 1. Try Authorization header
        const authHeader = request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
        // 2. Try from cookies if not in header
        if (!token) {
            token = request.cookies.get('token')?.value;
        }
        // 3. Try from request body (for POST requests)
        if (!token) {
            try {
                const body = await request.json();
                token = body.token;
            } catch  {
            // Ignore JSON parsing errors
            }
        }
        if (!token) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                valid: false,
                error: 'No authentication token provided',
                debug: 'Token not found in headers, cookies, or body'
            }, {
                status: 401
            });
        }
        // Verify the token
        const decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$server$2d$helpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyToken"])(token);
        if (!decoded) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                valid: false,
                error: 'Invalid or expired token',
                debug: 'Token verification failed'
            }, {
                status: 401
            });
        }
        // Token is valid - return user info
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            valid: true,
            user: {
                id: decoded.userId,
                email: decoded.email,
                isAdmin: decoded.isAdmin || false,
                sessionId: decoded.sessionId
            }
        });
    } catch (error) {
        console.error('Token validation error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            valid: false,
            error: 'Token validation failed',
            debug: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__a834994e._.js.map
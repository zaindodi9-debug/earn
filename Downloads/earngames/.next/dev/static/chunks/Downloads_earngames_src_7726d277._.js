(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Downloads/earngames/src/lib/api-client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Thin fetch wrappers around the EarnGames backend API.
// All functions return parsed JSON or throw an Error with the API message.
__turbopack_context__.s([
    "ApiError",
    ()=>ApiError,
    "createGame",
    ()=>createGame,
    "createLevel",
    ()=>createLevel,
    "createUser",
    ()=>createUser,
    "deleteGame",
    ()=>deleteGame,
    "deleteLevel",
    ()=>deleteLevel,
    "deleteUser",
    ()=>deleteUser,
    "getGames",
    ()=>getGames,
    "getLevels",
    ()=>getLevels,
    "getMe",
    ()=>getMe,
    "getProgress",
    ()=>getProgress,
    "getStats",
    ()=>getStats,
    "getUser",
    ()=>getUser,
    "getUsers",
    ()=>getUsers,
    "login",
    ()=>login,
    "logout",
    ()=>logout,
    "register",
    ()=>register,
    "submitProgress",
    ()=>submitProgress,
    "updateGame",
    ()=>updateGame,
    "updateLevel",
    ()=>updateLevel,
    "updateUser",
    ()=>updateUser
]);
class ApiError extends Error {
    status;
    constructor(message, status){
        super(message);
        this.status = status;
    }
}
async function request(url, init) {
    const res = await fetch(url, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...init?.headers || {}
        },
        ...init
    });
    let data = null;
    try {
        data = await res.json();
    } catch  {
    /* ignore non-json */ }
    if (!res.ok) {
        const msg = data && (data.error || data.message) || `Permintaan gagal (${res.status})`;
        throw new ApiError(msg, res.status);
    }
    return data;
}
function getMe() {
    return request('/api/auth');
}
function login(email, password) {
    return request('/api/auth', {
        method: 'PUT',
        body: JSON.stringify({
            email,
            password
        })
    });
}
function register(name, email, password) {
    return request('/api/auth', {
        method: 'POST',
        body: JSON.stringify({
            name,
            email,
            password
        })
    });
}
function logout() {
    return request('/api/auth', {
        method: 'DELETE'
    });
}
function getGames() {
    return request('/api/games');
}
function createGame(body) {
    return request('/api/games', {
        method: 'POST',
        body: JSON.stringify(body)
    });
}
function updateGame(id, body) {
    return request(`/api/games/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body)
    });
}
function deleteGame(id) {
    return request(`/api/games/${id}`, {
        method: 'DELETE'
    });
}
function getLevels(gameId) {
    const qs = gameId ? `?gameId=${encodeURIComponent(gameId)}` : '';
    return request(`/api/levels${qs}`);
}
function createLevel(body) {
    return request('/api/levels', {
        method: 'POST',
        body: JSON.stringify(body)
    });
}
function updateLevel(id, body) {
    return request(`/api/levels/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body)
    });
}
function deleteLevel(id) {
    return request(`/api/levels/${id}`, {
        method: 'DELETE'
    });
}
function getUsers() {
    return request('/api/users');
}
function getUser(id) {
    return request(`/api/users/${id}`);
}
function createUser(body) {
    return request('/api/users', {
        method: 'POST',
        body: JSON.stringify(body)
    });
}
function updateUser(id, body) {
    return request(`/api/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body)
    });
}
function deleteUser(id) {
    return request(`/api/users/${id}`, {
        method: 'DELETE'
    });
}
function getProgress() {
    return request('/api/progress');
}
function submitProgress(gameLevelId, score, timeSec) {
    return request('/api/progress', {
        method: 'POST',
        body: JSON.stringify({
            gameLevelId,
            score,
            timeSec
        })
    });
}
function getStats() {
    return request('/api/stats');
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Downloads/earngames/src/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/earngames/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/earngames/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Downloads/earngames/src/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Page
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/earngames/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/earngames/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/earngames/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/earngames/src/lib/api-client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$src$2f$components$2f$platform$2f$nav$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/earngames/src/components/platform/nav.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$src$2f$components$2f$platform$2f$footer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/earngames/src/components/platform/footer.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$src$2f$components$2f$platform$2f$auth$2d$modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/earngames/src/components/platform/auth-modal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$src$2f$components$2f$platform$2f$user$2d$view$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/earngames/src/components/platform/user-view.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$src$2f$components$2f$platform$2f$user$2d$dashboard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/earngames/src/components/platform/user-dashboard.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$src$2f$components$2f$platform$2f$admin$2d$panel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/earngames/src/components/platform/admin-panel.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
function Page() {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [view, setView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('user');
    const [authOpen, setAuthOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // restore session on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Page.useEffect": ()=>{
            let mounted = true;
            ({
                "Page.useEffect": async ()=>{
                    try {
                        const { user } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMe"])();
                        if (!mounted) return;
                        setUser(user);
                        if (user?.role === 'ADMIN') {
                            // admins land on user view by default; can switch
                            setView('user');
                        } else {
                            setView('user');
                        }
                    } catch  {
                    // ignore — stay logged out
                    } finally{
                        if (mounted) setLoading(false);
                    }
                }
            })["Page.useEffect"]();
            return ({
                "Page.useEffect": ()=>{
                    mounted = false;
                }
            })["Page.useEffect"];
        }
    }["Page.useEffect"], []);
    const handleAuthed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Page.useCallback[handleAuthed]": (u)=>{
            setUser(u);
            setAuthOpen(false);
            setView('user');
        }
    }["Page.useCallback[handleAuthed]"], []);
    const handleLogout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Page.useCallback[handleLogout]": async ()=>{
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logout"])();
            } catch  {
            // ignore network errors
            }
            setUser(null);
            setView('user');
            __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Kamu telah keluar.');
        }
    }["Page.useCallback[handleLogout]"], []);
    const handlePlayed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Page.useCallback[handlePlayed]": (result)=>{
            setUser({
                "Page.useCallback[handlePlayed]": (prev)=>prev ? {
                        ...prev,
                        points: result.points
                    } : prev
            }["Page.useCallback[handlePlayed]"]);
        }
    }["Page.useCallback[handlePlayed]"], []);
    // admin view: hide footer (admin has its own chrome); bottom nav still useful
    const showFooter = view !== 'admin';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen flex flex-col bg-[#0B0F19] text-white",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$src$2f$components$2f$platform$2f$nav$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Nav"], {
                user: user,
                view: view,
                onOpenAuth: ()=>setAuthOpen(true),
                onLogout: handleLogout,
                onSwitchView: setView
            }, void 0, false, {
                fileName: "[project]/Downloads/earngames/src/app/page.tsx",
                lineNumber: 72,
                columnNumber: 7
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 flex items-center justify-center pt-16 pb-24",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-12 h-12 eg-gradient-bg rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "w-7 h-7 text-black",
                                fill: "currentColor",
                                viewBox: "0 0 20 20",
                                "aria-hidden": "true",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    d: "M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z"
                                }, void 0, false, {
                                    fileName: "[project]/Downloads/earngames/src/app/page.tsx",
                                    lineNumber: 90,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Downloads/earngames/src/app/page.tsx",
                                lineNumber: 84,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Downloads/earngames/src/app/page.tsx",
                            lineNumber: 83,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-yellow-300 text-sm font-semibold",
                            children: "Memuat EarnGames..."
                        }, void 0, false, {
                            fileName: "[project]/Downloads/earngames/src/app/page.tsx",
                            lineNumber: 93,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Downloads/earngames/src/app/page.tsx",
                    lineNumber: 82,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/Downloads/earngames/src/app/page.tsx",
                lineNumber: 81,
                columnNumber: 9
            }, this) : view === 'admin' && user?.role === 'ADMIN' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$src$2f$components$2f$platform$2f$admin$2d$panel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AdminPanel"], {}, void 0, false, {
                fileName: "[project]/Downloads/earngames/src/app/page.tsx",
                lineNumber: 97,
                columnNumber: 9
            }, this) : user ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$src$2f$components$2f$platform$2f$user$2d$dashboard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UserDashboard"], {
                user: user,
                onOpenAuth: ()=>setAuthOpen(true),
                onPointsChange: (p)=>setUser((prev)=>prev ? {
                            ...prev,
                            points: p
                        } : prev)
            }, void 0, false, {
                fileName: "[project]/Downloads/earngames/src/app/page.tsx",
                lineNumber: 99,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$src$2f$components$2f$platform$2f$user$2d$view$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UserView"], {
                user: user,
                onOpenAuth: ()=>setAuthOpen(true),
                onPlayed: handlePlayed
            }, void 0, false, {
                fileName: "[project]/Downloads/earngames/src/app/page.tsx",
                lineNumber: 105,
                columnNumber: 9
            }, this),
            showFooter && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$src$2f$components$2f$platform$2f$footer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Footer"], {}, void 0, false, {
                fileName: "[project]/Downloads/earngames/src/app/page.tsx",
                lineNumber: 108,
                columnNumber: 22
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$earngames$2f$src$2f$components$2f$platform$2f$auth$2d$modal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthModal"], {
                open: authOpen,
                onClose: ()=>setAuthOpen(false),
                onAuthed: handleAuthed
            }, void 0, false, {
                fileName: "[project]/Downloads/earngames/src/app/page.tsx",
                lineNumber: 110,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Downloads/earngames/src/app/page.tsx",
        lineNumber: 71,
        columnNumber: 5
    }, this);
}
_s(Page, "gRkvNAHrrpGSY0+jqElGOIVihb8=");
_c = Page;
var _c;
__turbopack_context__.k.register(_c, "Page");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Downloads_earngames_src_7726d277._.js.map
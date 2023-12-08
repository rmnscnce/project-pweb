// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const RE_KeyValue = /^\s*(?:export\s+)?(?<key>[a-zA-Z_]+[a-zA-Z0-9_]*?)\s*=[\ \t]*('\n?(?<notInterpolated>(.|\n)*?)\n?'|"\n?(?<interpolated>(.|\n)*?)\n?"|(?<unquoted>[^\n#]*)) *#*.*$/gm;
const RE_ExpandValue = /(\${(?<inBrackets>.+?)(\:-(?<inBracketsDefault>.+))?}|(?<!\\)\$(?<notInBrackets>\w+)(\:-(?<notInBracketsDefault>.+))?)/g;
function parse(rawDotenv) {
    const env = {};
    let match;
    const keysForExpandCheck = [];
    while((match = RE_KeyValue.exec(rawDotenv)) !== null){
        const { key, interpolated, notInterpolated, unquoted } = match?.groups;
        if (unquoted) {
            keysForExpandCheck.push(key);
        }
        env[key] = typeof notInterpolated === "string" ? notInterpolated : typeof interpolated === "string" ? expandCharacters(interpolated) : unquoted.trim();
    }
    const variablesMap = {
        ...env
    };
    keysForExpandCheck.forEach((key)=>{
        env[key] = expand(env[key], variablesMap);
    });
    return env;
}
async function load({ envPath = ".env", examplePath = ".env.example", defaultsPath = ".env.defaults", export: _export = false, allowEmptyValues = false } = {}) {
    const conf = envPath ? await parseFile(envPath) : {};
    if (defaultsPath) {
        const confDefaults = await parseFile(defaultsPath);
        for(const key in confDefaults){
            if (!(key in conf)) {
                conf[key] = confDefaults[key];
            }
        }
    }
    if (examplePath) {
        const confExample = await parseFile(examplePath);
        assertSafe(conf, confExample, allowEmptyValues);
    }
    if (_export) {
        for(const key in conf){
            if (Deno.env.get(key) !== undefined) continue;
            Deno.env.set(key, conf[key]);
        }
    }
    return conf;
}
async function parseFile(filepath) {
    try {
        return parse(await Deno.readTextFile(filepath));
    } catch (e) {
        if (e instanceof Deno.errors.NotFound) return {};
        throw e;
    }
}
function expandCharacters(str) {
    const charactersMap = {
        "\\n": "\n",
        "\\r": "\r",
        "\\t": "\t"
    };
    return str.replace(/\\([nrt])/g, ($1)=>charactersMap[$1]);
}
function assertSafe(conf, confExample, allowEmptyValues) {
    const missingEnvVars = [];
    for(const key in confExample){
        if (key in conf) {
            if (!allowEmptyValues && conf[key] === "") {
                missingEnvVars.push(key);
            }
        } else if (Deno.env.get(key) !== undefined) {
            if (!allowEmptyValues && Deno.env.get(key) === "") {
                missingEnvVars.push(key);
            }
        } else {
            missingEnvVars.push(key);
        }
    }
    if (missingEnvVars.length > 0) {
        const errorMessages = [
            `The following variables were defined in the example file but are not present in the environment:\n  ${missingEnvVars.join(", ")}`,
            `Make sure to add them to your env file.`,
            !allowEmptyValues && `If you expect any of these variables to be empty, you can set the allowEmptyValues option to true.`
        ];
        throw new MissingEnvVarsError(errorMessages.filter(Boolean).join("\n\n"), missingEnvVars);
    }
}
class MissingEnvVarsError extends Error {
    missing;
    constructor(message, missing){
        super(message);
        this.name = "MissingEnvVarsError";
        this.missing = missing;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
function expand(str, variablesMap) {
    if (RE_ExpandValue.test(str)) {
        return expand(str.replace(RE_ExpandValue, function(...params) {
            const { inBrackets, inBracketsDefault, notInBrackets, notInBracketsDefault } = params[params.length - 1];
            const expandValue = inBrackets || notInBrackets;
            const defaultValue = inBracketsDefault || notInBracketsDefault;
            let value = variablesMap[expandValue];
            if (value === undefined) {
                value = Deno.env.get(expandValue);
            }
            return value === undefined ? expand(defaultValue, variablesMap) : value;
        }), variablesMap);
    } else {
        return str;
    }
}
function re(o) {
    return Math.round(Date.now() / 1e3) + o;
}
function se() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(o) {
        let e = Math.random() * 16 | 0;
        return (o == "x" ? e : e & 3 | 8).toString(16);
    });
}
var w = ()=>typeof document < "u", T = {
    tested: !1,
    writable: !1
}, m = ()=>{
    if (!w()) return !1;
    try {
        if (typeof globalThis.localStorage != "object") return !1;
    } catch  {
        return !1;
    }
    if (T.tested) return T.writable;
    let o = `lswt-${Math.random()}${Math.random()}`;
    try {
        globalThis.localStorage.setItem(o, o), globalThis.localStorage.removeItem(o), T.tested = !0, T.writable = !0;
    } catch  {
        T.tested = !0, T.writable = !1;
    }
    return T.writable;
};
function V(o) {
    let e = {}, t = new URL(o);
    if (t.hash && t.hash[0] === "#") try {
        new URLSearchParams(t.hash.substring(1)).forEach((s, i)=>{
            e[i] = s;
        });
    } catch  {}
    return t.searchParams.forEach((r, s)=>{
        e[s] = r;
    }), e;
}
var z = (o)=>{
    let e;
    return o ? e = o : typeof fetch > "u" ? e = (...t)=>import("/v135/@supabase/node-fetch@2.6.14/denonext/node-fetch.mjs").then(({ default: r })=>r(...t)) : e = fetch, (...t)=>e(...t);
}, ie = (o)=>typeof o == "object" && o !== null && "status" in o && "ok" in o && "json" in o && typeof o.json == "function", k = async (o, e, t)=>{
    await o.setItem(e, JSON.stringify(t));
}, j = async (o, e)=>{
    let t = await o.getItem(e);
    if (!t) return null;
    try {
        return JSON.parse(t);
    } catch  {
        return t;
    }
}, J = async (o, e)=>{
    await o.removeItem(e);
};
function be(o) {
    let e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", t = "", r, s, i, n, a, l, u, d = 0;
    for(o = o.replace("-", "+").replace("_", "/"); d < o.length;)n = e.indexOf(o.charAt(d++)), a = e.indexOf(o.charAt(d++)), l = e.indexOf(o.charAt(d++)), u = e.indexOf(o.charAt(d++)), r = n << 2 | a >> 4, s = (a & 15) << 4 | l >> 2, i = (l & 3) << 6 | u, t = t + String.fromCharCode(r), l != 64 && s != 0 && (t = t + String.fromCharCode(s)), u != 64 && i != 0 && (t = t + String.fromCharCode(i));
    return t;
}
var U = class o {
    constructor(){
        this.promise = new o.promiseConstructor((e, t)=>{
            this.resolve = e, this.reject = t;
        });
    }
};
U.promiseConstructor = Promise;
function H(o) {
    let e = /^([a-z0-9_-]{4})*($|[a-z0-9_-]{3}=?$|[a-z0-9_-]{2}(==)?$)$/i, t = o.split(".");
    if (t.length !== 3) throw new Error("JWT is not valid: not a JWT structure");
    if (!e.test(t[1])) throw new Error("JWT is not valid: payload is not in base64url format");
    let r = t[1];
    return JSON.parse(be(r));
}
async function oe(o) {
    return await new Promise((e)=>{
        setTimeout(()=>e(null), o);
    });
}
function ne(o, e) {
    return new Promise((r, s)=>{
        (async ()=>{
            for(let i = 0; i < 1 / 0; i++)try {
                let n = await o(i);
                if (!e(i, null, n)) {
                    r(n);
                    return;
                }
            } catch (n) {
                if (!e(i, n)) {
                    s(n);
                    return;
                }
            }
        })();
    });
}
function me(o) {
    return ("0" + o.toString(16)).substr(-2);
}
function E() {
    let e = new Uint32Array(56);
    if (typeof crypto > "u") {
        let t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~", r = t.length, s = "";
        for(let i = 0; i < 56; i++)s += t.charAt(Math.floor(Math.random() * r));
        return s;
    }
    return crypto.getRandomValues(e), Array.from(e, me).join("");
}
async function ke(o) {
    let t = new TextEncoder().encode(o), r = await crypto.subtle.digest("SHA-256", t), s = new Uint8Array(r);
    return Array.from(s).map((i)=>String.fromCharCode(i)).join("");
}
function Se(o) {
    return btoa(o).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function I(o) {
    if (!(typeof crypto < "u" && typeof crypto.subtle < "u" && typeof TextEncoder < "u")) return console.warn("WebCrypto API is not supported. Code challenge method will default to use plain instead of sha256."), o;
    let t = await ke(o);
    return Se(t);
}
var N = class extends Error {
    constructor(e, t){
        super(e), this.__isAuthError = !0, this.name = "AuthError", this.status = t;
    }
};
function c(o) {
    return typeof o == "object" && o !== null && "__isAuthError" in o;
}
var W = class extends N {
    constructor(e, t){
        super(e, t), this.name = "AuthApiError", this.status = t;
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status
        };
    }
};
function ae(o) {
    return c(o) && o.name === "AuthApiError";
}
var C = class extends N {
    constructor(e, t){
        super(e), this.name = "AuthUnknownError", this.originalError = t;
    }
}, S = class extends N {
    constructor(e, t, r){
        super(e), this.name = t, this.status = r;
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status
        };
    }
}, v = class extends S {
    constructor(){
        super("Auth session missing!", "AuthSessionMissingError", 400);
    }
}, L = class extends S {
    constructor(){
        super("Auth session or user missing", "AuthInvalidTokenResponseError", 500);
    }
}, A = class extends S {
    constructor(e){
        super(e, "AuthInvalidCredentialsError", 400);
    }
}, R = class extends S {
    constructor(e, t = null){
        super(e, "AuthImplicitGrantRedirectError", 500), this.details = null, this.details = t;
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
            details: this.details
        };
    }
}, D = class extends S {
    constructor(e, t = null){
        super(e, "AuthPKCEGrantCodeExchangeError", 500), this.details = null, this.details = t;
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
            details: this.details
        };
    }
}, P = class extends S {
    constructor(e, t){
        super(e, "AuthRetryableFetchError", t);
    }
};
function X(o) {
    return c(o) && o.name === "AuthRetryableFetchError";
}
var xe = function(o, e) {
    var t = {};
    for(var r in o)Object.prototype.hasOwnProperty.call(o, r) && e.indexOf(r) < 0 && (t[r] = o[r]);
    if (o != null && typeof Object.getOwnPropertySymbols == "function") for(var s = 0, r = Object.getOwnPropertySymbols(o); s < r.length; s++)e.indexOf(r[s]) < 0 && Object.prototype.propertyIsEnumerable.call(o, r[s]) && (t[r[s]] = o[r[s]]);
    return t;
}, q = (o)=>o.msg || o.message || o.error_description || o.error || JSON.stringify(o), Te = [
    502,
    503,
    504
];
async function le(o) {
    if (!ie(o)) throw new P(q(o), 0);
    if (Te.includes(o.status)) throw new P(q(o), o.status);
    let e;
    try {
        e = await o.json();
    } catch (t) {
        throw new C(q(t), t);
    }
    throw new W(q(e), o.status || 500);
}
var Ee = (o, e, t, r)=>{
    let s = {
        method: o,
        headers: e?.headers || {}
    };
    return o === "GET" ? s : (s.headers = Object.assign({
        "Content-Type": "application/json;charset=UTF-8"
    }, e?.headers), s.body = JSON.stringify(r), Object.assign(Object.assign({}, s), t));
};
async function h(o, e, t, r) {
    var s;
    let i = Object.assign({}, r?.headers);
    r?.jwt && (i.Authorization = `Bearer ${r.jwt}`);
    let n = (s = r?.query) !== null && s !== void 0 ? s : {};
    r?.redirectTo && (n.redirect_to = r.redirectTo);
    let a = Object.keys(n).length ? "?" + new URLSearchParams(n).toString() : "", l = await Ie(o, e, t + a, {
        headers: i,
        noResolveJson: r?.noResolveJson
    }, {}, r?.body);
    return r?.xform ? r?.xform(l) : {
        data: Object.assign({}, l),
        error: null
    };
}
async function Ie(o, e, t, r, s, i) {
    let n = Ee(e, r, s, i), a;
    try {
        a = await o(t, n);
    } catch (l) {
        throw console.error(l), new P(q(l), 0);
    }
    if (a.ok || await le(a), r?.noResolveJson) return a;
    try {
        return await a.json();
    } catch (l) {
        await le(l);
    }
}
function b(o) {
    var e;
    let t = null;
    Ae(o) && (t = Object.assign({}, o), o.expires_at || (t.expires_at = re(o.expires_in)));
    let r = (e = o.user) !== null && e !== void 0 ? e : o;
    return {
        data: {
            session: t,
            user: r
        },
        error: null
    };
}
function y(o) {
    var e;
    return {
        data: {
            user: (e = o.user) !== null && e !== void 0 ? e : o
        },
        error: null
    };
}
function ce(o) {
    return {
        data: o,
        error: null
    };
}
function he(o) {
    let { action_link: e, email_otp: t, hashed_token: r, redirect_to: s, verification_type: i } = o, n = xe(o, [
        "action_link",
        "email_otp",
        "hashed_token",
        "redirect_to",
        "verification_type"
    ]), a = {
        action_link: e,
        email_otp: t,
        hashed_token: r,
        redirect_to: s,
        verification_type: i
    }, l = Object.assign({}, n);
    return {
        data: {
            properties: a,
            user: l
        },
        error: null
    };
}
function ue(o) {
    return o;
}
function Ae(o) {
    return o.access_token && o.refresh_token && o.expires_in;
}
var Re = function(o, e) {
    var t = {};
    for(var r in o)Object.prototype.hasOwnProperty.call(o, r) && e.indexOf(r) < 0 && (t[r] = o[r]);
    if (o != null && typeof Object.getOwnPropertySymbols == "function") for(var s = 0, r = Object.getOwnPropertySymbols(o); s < r.length; s++)e.indexOf(r[s]) < 0 && Object.prototype.propertyIsEnumerable.call(o, r[s]) && (t[r[s]] = o[r[s]]);
    return t;
}, $ = class {
    constructor({ url: e = "", headers: t = {}, fetch: r }){
        this.url = e, this.headers = t, this.fetch = z(r), this.mfa = {
            listFactors: this._listFactors.bind(this),
            deleteFactor: this._deleteFactor.bind(this)
        };
    }
    async signOut(e, t = "global") {
        try {
            return await h(this.fetch, "POST", `${this.url}/logout?scope=${t}`, {
                headers: this.headers,
                jwt: e,
                noResolveJson: !0
            }), {
                data: null,
                error: null
            };
        } catch (r) {
            if (c(r)) return {
                data: null,
                error: r
            };
            throw r;
        }
    }
    async inviteUserByEmail(e, t = {}) {
        try {
            return await h(this.fetch, "POST", `${this.url}/invite`, {
                body: {
                    email: e,
                    data: t.data
                },
                headers: this.headers,
                redirectTo: t.redirectTo,
                xform: y
            });
        } catch (r) {
            if (c(r)) return {
                data: {
                    user: null
                },
                error: r
            };
            throw r;
        }
    }
    async generateLink(e) {
        try {
            let { options: t } = e, r = Re(e, [
                "options"
            ]), s = Object.assign(Object.assign({}, r), t);
            return "newEmail" in r && (s.new_email = r?.newEmail, delete s.newEmail), await h(this.fetch, "POST", `${this.url}/admin/generate_link`, {
                body: s,
                headers: this.headers,
                xform: he,
                redirectTo: t?.redirectTo
            });
        } catch (t) {
            if (c(t)) return {
                data: {
                    properties: null,
                    user: null
                },
                error: t
            };
            throw t;
        }
    }
    async createUser(e) {
        try {
            return await h(this.fetch, "POST", `${this.url}/admin/users`, {
                body: e,
                headers: this.headers,
                xform: y
            });
        } catch (t) {
            if (c(t)) return {
                data: {
                    user: null
                },
                error: t
            };
            throw t;
        }
    }
    async listUsers(e) {
        var t, r, s, i, n, a, l;
        try {
            let u = {
                nextPage: null,
                lastPage: 0,
                total: 0
            }, d = await h(this.fetch, "GET", `${this.url}/admin/users`, {
                headers: this.headers,
                noResolveJson: !0,
                query: {
                    page: (r = (t = e?.page) === null || t === void 0 ? void 0 : t.toString()) !== null && r !== void 0 ? r : "",
                    per_page: (i = (s = e?.perPage) === null || s === void 0 ? void 0 : s.toString()) !== null && i !== void 0 ? i : ""
                },
                xform: ue
            });
            if (d.error) throw d.error;
            let _ = await d.json(), f = (n = d.headers.get("x-total-count")) !== null && n !== void 0 ? n : 0, p = (l = (a = d.headers.get("link")) === null || a === void 0 ? void 0 : a.split(",")) !== null && l !== void 0 ? l : [];
            return p.length > 0 && (p.forEach((g)=>{
                let x = parseInt(g.split(";")[0].split("=")[1].substring(0, 1)), G = JSON.parse(g.split(";")[1].split("=")[1]);
                u[`${G}Page`] = x;
            }), u.total = parseInt(f)), {
                data: Object.assign(Object.assign({}, _), u),
                error: null
            };
        } catch (u) {
            if (c(u)) return {
                data: {
                    users: []
                },
                error: u
            };
            throw u;
        }
    }
    async getUserById(e) {
        try {
            return await h(this.fetch, "GET", `${this.url}/admin/users/${e}`, {
                headers: this.headers,
                xform: y
            });
        } catch (t) {
            if (c(t)) return {
                data: {
                    user: null
                },
                error: t
            };
            throw t;
        }
    }
    async updateUserById(e, t) {
        try {
            return await h(this.fetch, "PUT", `${this.url}/admin/users/${e}`, {
                body: t,
                headers: this.headers,
                xform: y
            });
        } catch (r) {
            if (c(r)) return {
                data: {
                    user: null
                },
                error: r
            };
            throw r;
        }
    }
    async deleteUser(e, t = !1) {
        try {
            return await h(this.fetch, "DELETE", `${this.url}/admin/users/${e}`, {
                headers: this.headers,
                body: {
                    should_soft_delete: t
                },
                xform: y
            });
        } catch (r) {
            if (c(r)) return {
                data: {
                    user: null
                },
                error: r
            };
            throw r;
        }
    }
    async _listFactors(e) {
        try {
            let { data: t, error: r } = await h(this.fetch, "GET", `${this.url}/admin/users/${e.userId}/factors`, {
                headers: this.headers,
                xform: (s)=>({
                        data: {
                            factors: s
                        },
                        error: null
                    })
            });
            return {
                data: t,
                error: r
            };
        } catch (t) {
            if (c(t)) return {
                data: null,
                error: t
            };
            throw t;
        }
    }
    async _deleteFactor(e) {
        try {
            return {
                data: await h(this.fetch, "DELETE", `${this.url}/admin/users/${e.userId}/factors/${e.id}`, {
                    headers: this.headers
                }),
                error: null
            };
        } catch (t) {
            if (c(t)) return {
                data: null,
                error: t
            };
            throw t;
        }
    }
};
var B = "2.57.0";
var de = "http://localhost:9999", fe = "supabase.auth.token";
var _e = {
    "X-Client-Info": `gotrue-js/${B}`
}, Q = 10;
var ge = {
    getItem: (o)=>m() ? globalThis.localStorage.getItem(o) : null,
    setItem: (o, e)=>{
        m() && globalThis.localStorage.setItem(o, e);
    },
    removeItem: (o)=>{
        m() && globalThis.localStorage.removeItem(o);
    }
};
function Z(o = {}) {
    return {
        getItem: (e)=>o[e] || null,
        setItem: (e, t)=>{
            o[e] = t;
        },
        removeItem: (e)=>{
            delete o[e];
        }
    };
}
function we() {
    if (typeof globalThis != "object") try {
        Object.defineProperty(Object.prototype, "__magic__", {
            get: function() {
                return this;
            },
            configurable: !0
        }), __magic__.globalThis = __magic__, delete Object.prototype.__magic__;
    } catch  {
        typeof self < "u" && (self.globalThis = self);
    }
}
var O = {
    debug: !!(globalThis && m() && globalThis.localStorage && globalThis.localStorage.getItem("supabase.gotrue-js.locks.debug") === "true")
}, F = class extends Error {
    constructor(e){
        super(e), this.isAcquireTimeout = !0;
    }
};
we();
var Ce = {
    url: de,
    storageKey: fe,
    autoRefreshToken: !0,
    persistSession: !0,
    detectSessionInUrl: !0,
    headers: _e,
    flowType: "implicit",
    debug: !1
}, K = 30 * 1e3, ye = 3;
async function Le(o, e, t) {
    return await t();
}
var M = class o {
    constructor(e){
        var t;
        this.memoryStorage = null, this.stateChangeEmitters = new Map, this.autoRefreshTicker = null, this.visibilityChangedCallback = null, this.refreshingDeferred = null, this.initializePromise = null, this.detectSessionInUrl = !0, this.lockAcquired = !1, this.pendingInLock = [], this.broadcastChannel = null, this.logger = console.log, this.instanceID = o.nextInstanceID, o.nextInstanceID += 1, this.instanceID > 0 && w() && console.warn("Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.");
        let r = Object.assign(Object.assign({}, Ce), e);
        if (this.logDebugMessages = !!r.debug, typeof r.debug == "function" && (this.logger = r.debug), this.persistSession = r.persistSession, this.storageKey = r.storageKey, this.autoRefreshToken = r.autoRefreshToken, this.admin = new $({
            url: r.url,
            headers: r.headers,
            fetch: r.fetch
        }), this.url = r.url, this.headers = r.headers, this.fetch = z(r.fetch), this.lock = r.lock || Le, this.detectSessionInUrl = r.detectSessionInUrl, this.flowType = r.flowType, this.mfa = {
            verify: this._verify.bind(this),
            enroll: this._enroll.bind(this),
            unenroll: this._unenroll.bind(this),
            challenge: this._challenge.bind(this),
            listFactors: this._listFactors.bind(this),
            challengeAndVerify: this._challengeAndVerify.bind(this),
            getAuthenticatorAssuranceLevel: this._getAuthenticatorAssuranceLevel.bind(this)
        }, this.persistSession ? r.storage ? this.storage = r.storage : m() ? this.storage = ge : (this.memoryStorage = {}, this.storage = Z(this.memoryStorage)) : (this.memoryStorage = {}, this.storage = Z(this.memoryStorage)), w() && globalThis.BroadcastChannel && this.persistSession && this.storageKey) {
            try {
                this.broadcastChannel = new globalThis.BroadcastChannel(this.storageKey);
            } catch (s) {
                console.error("Failed to create a new BroadcastChannel, multi-tab state changes will not be available", s);
            }
            (t = this.broadcastChannel) === null || t === void 0 || t.addEventListener("message", async (s)=>{
                this._debug("received broadcast notification from other tab or client", s), await this._notifyAllSubscribers(s.data.event, s.data.session, !1);
            });
        }
        this.initialize();
    }
    _debug(...e) {
        return this.logDebugMessages && this.logger(`GoTrueClient@${this.instanceID} (${B}) ${new Date().toISOString()}`, ...e), this;
    }
    async initialize() {
        return this.initializePromise ? await this.initializePromise : (this.initializePromise = (async ()=>await this._acquireLock(-1, async ()=>await this._initialize()))(), await this.initializePromise);
    }
    async _initialize() {
        try {
            let e = w() ? await this._isPKCEFlow() : !1;
            if (this._debug("#_initialize()", "begin", "is PKCE flow", e), e || this.detectSessionInUrl && this._isImplicitGrantFlow()) {
                let { data: t, error: r } = await this._getSessionFromURL(e);
                if (r) return this._debug("#_initialize()", "error detecting session from URL", r), await this._removeSession(), {
                    error: r
                };
                let { session: s, redirectType: i } = t;
                return this._debug("#_initialize()", "detected session in URL", s, "redirect type", i), await this._saveSession(s), setTimeout(async ()=>{
                    i === "recovery" ? await this._notifyAllSubscribers("PASSWORD_RECOVERY", s) : await this._notifyAllSubscribers("SIGNED_IN", s);
                }, 0), {
                    error: null
                };
            }
            return await this._recoverAndRefresh(), {
                error: null
            };
        } catch (e) {
            return c(e) ? {
                error: e
            } : {
                error: new C("Unexpected error during initialization", e)
            };
        } finally{
            await this._handleVisibilityChange(), this._debug("#_initialize()", "end");
        }
    }
    async signUp(e) {
        var t, r, s;
        try {
            await this._removeSession();
            let i;
            if ("email" in e) {
                let { email: d, password: _, options: f } = e, p = null, g = null;
                if (this.flowType === "pkce") {
                    let x = E();
                    await k(this.storage, `${this.storageKey}-code-verifier`, x), p = await I(x), g = x === p ? "plain" : "s256";
                }
                i = await h(this.fetch, "POST", `${this.url}/signup`, {
                    headers: this.headers,
                    redirectTo: f?.emailRedirectTo,
                    body: {
                        email: d,
                        password: _,
                        data: (t = f?.data) !== null && t !== void 0 ? t : {},
                        gotrue_meta_security: {
                            captcha_token: f?.captchaToken
                        },
                        code_challenge: p,
                        code_challenge_method: g
                    },
                    xform: b
                });
            } else if ("phone" in e) {
                let { phone: d, password: _, options: f } = e;
                i = await h(this.fetch, "POST", `${this.url}/signup`, {
                    headers: this.headers,
                    body: {
                        phone: d,
                        password: _,
                        data: (r = f?.data) !== null && r !== void 0 ? r : {},
                        channel: (s = f?.channel) !== null && s !== void 0 ? s : "sms",
                        gotrue_meta_security: {
                            captcha_token: f?.captchaToken
                        }
                    },
                    xform: b
                });
            } else throw new A("You must provide either an email or phone number and a password");
            let { data: n, error: a } = i;
            if (a || !n) return {
                data: {
                    user: null,
                    session: null
                },
                error: a
            };
            let l = n.session, u = n.user;
            return n.session && (await this._saveSession(n.session), await this._notifyAllSubscribers("SIGNED_IN", l)), {
                data: {
                    user: u,
                    session: l
                },
                error: null
            };
        } catch (i) {
            if (c(i)) return {
                data: {
                    user: null,
                    session: null
                },
                error: i
            };
            throw i;
        }
    }
    async signInWithPassword(e) {
        try {
            await this._removeSession();
            let t;
            if ("email" in e) {
                let { email: i, password: n, options: a } = e;
                t = await h(this.fetch, "POST", `${this.url}/token?grant_type=password`, {
                    headers: this.headers,
                    body: {
                        email: i,
                        password: n,
                        gotrue_meta_security: {
                            captcha_token: a?.captchaToken
                        }
                    },
                    xform: b
                });
            } else if ("phone" in e) {
                let { phone: i, password: n, options: a } = e;
                t = await h(this.fetch, "POST", `${this.url}/token?grant_type=password`, {
                    headers: this.headers,
                    body: {
                        phone: i,
                        password: n,
                        gotrue_meta_security: {
                            captcha_token: a?.captchaToken
                        }
                    },
                    xform: b
                });
            } else throw new A("You must provide either an email or phone number and a password");
            let { data: r, error: s } = t;
            return s ? {
                data: {
                    user: null,
                    session: null
                },
                error: s
            } : !r || !r.session || !r.user ? {
                data: {
                    user: null,
                    session: null
                },
                error: new L
            } : (r.session && (await this._saveSession(r.session), await this._notifyAllSubscribers("SIGNED_IN", r.session)), {
                data: {
                    user: r.user,
                    session: r.session
                },
                error: s
            });
        } catch (t) {
            if (c(t)) return {
                data: {
                    user: null,
                    session: null
                },
                error: t
            };
            throw t;
        }
    }
    async signInWithOAuth(e) {
        var t, r, s, i;
        return await this._removeSession(), await this._handleProviderSignIn(e.provider, {
            redirectTo: (t = e.options) === null || t === void 0 ? void 0 : t.redirectTo,
            scopes: (r = e.options) === null || r === void 0 ? void 0 : r.scopes,
            queryParams: (s = e.options) === null || s === void 0 ? void 0 : s.queryParams,
            skipBrowserRedirect: (i = e.options) === null || i === void 0 ? void 0 : i.skipBrowserRedirect
        });
    }
    async exchangeCodeForSession(e) {
        return await this.initializePromise, this._acquireLock(-1, async ()=>this._exchangeCodeForSession(e));
    }
    async _exchangeCodeForSession(e) {
        let t = await j(this.storage, `${this.storageKey}-code-verifier`), { data: r, error: s } = await h(this.fetch, "POST", `${this.url}/token?grant_type=pkce`, {
            headers: this.headers,
            body: {
                auth_code: e,
                code_verifier: t
            },
            xform: b
        });
        return await J(this.storage, `${this.storageKey}-code-verifier`), s ? {
            data: {
                user: null,
                session: null
            },
            error: s
        } : !r || !r.session || !r.user ? {
            data: {
                user: null,
                session: null
            },
            error: new L
        } : (r.session && (await this._saveSession(r.session), await this._notifyAllSubscribers("SIGNED_IN", r.session)), {
            data: r,
            error: s
        });
    }
    async signInWithIdToken(e) {
        await this._removeSession();
        try {
            let { options: t, provider: r, token: s, access_token: i, nonce: n } = e, a = await h(this.fetch, "POST", `${this.url}/token?grant_type=id_token`, {
                headers: this.headers,
                body: {
                    provider: r,
                    id_token: s,
                    access_token: i,
                    nonce: n,
                    gotrue_meta_security: {
                        captcha_token: t?.captchaToken
                    }
                },
                xform: b
            }), { data: l, error: u } = a;
            return u ? {
                data: {
                    user: null,
                    session: null
                },
                error: u
            } : !l || !l.session || !l.user ? {
                data: {
                    user: null,
                    session: null
                },
                error: new L
            } : (l.session && (await this._saveSession(l.session), await this._notifyAllSubscribers("SIGNED_IN", l.session)), {
                data: l,
                error: u
            });
        } catch (t) {
            if (c(t)) return {
                data: {
                    user: null,
                    session: null
                },
                error: t
            };
            throw t;
        }
    }
    async signInWithOtp(e) {
        var t, r, s, i, n;
        try {
            if (await this._removeSession(), "email" in e) {
                let { email: a, options: l } = e, u = null, d = null;
                if (this.flowType === "pkce") {
                    let f = E();
                    await k(this.storage, `${this.storageKey}-code-verifier`, f), u = await I(f), d = f === u ? "plain" : "s256";
                }
                let { error: _ } = await h(this.fetch, "POST", `${this.url}/otp`, {
                    headers: this.headers,
                    body: {
                        email: a,
                        data: (t = l?.data) !== null && t !== void 0 ? t : {},
                        create_user: (r = l?.shouldCreateUser) !== null && r !== void 0 ? r : !0,
                        gotrue_meta_security: {
                            captcha_token: l?.captchaToken
                        },
                        code_challenge: u,
                        code_challenge_method: d
                    },
                    redirectTo: l?.emailRedirectTo
                });
                return {
                    data: {
                        user: null,
                        session: null
                    },
                    error: _
                };
            }
            if ("phone" in e) {
                let { phone: a, options: l } = e, { data: u, error: d } = await h(this.fetch, "POST", `${this.url}/otp`, {
                    headers: this.headers,
                    body: {
                        phone: a,
                        data: (s = l?.data) !== null && s !== void 0 ? s : {},
                        create_user: (i = l?.shouldCreateUser) !== null && i !== void 0 ? i : !0,
                        gotrue_meta_security: {
                            captcha_token: l?.captchaToken
                        },
                        channel: (n = l?.channel) !== null && n !== void 0 ? n : "sms"
                    }
                });
                return {
                    data: {
                        user: null,
                        session: null,
                        messageId: u?.message_id
                    },
                    error: d
                };
            }
            throw new A("You must provide either an email or phone number.");
        } catch (a) {
            if (c(a)) return {
                data: {
                    user: null,
                    session: null
                },
                error: a
            };
            throw a;
        }
    }
    async verifyOtp(e) {
        var t, r;
        try {
            e.type !== "email_change" && e.type !== "phone_change" && await this._removeSession();
            let s, i;
            "options" in e && (s = (t = e.options) === null || t === void 0 ? void 0 : t.redirectTo, i = (r = e.options) === null || r === void 0 ? void 0 : r.captchaToken);
            let { data: n, error: a } = await h(this.fetch, "POST", `${this.url}/verify`, {
                headers: this.headers,
                body: Object.assign(Object.assign({}, e), {
                    gotrue_meta_security: {
                        captcha_token: i
                    }
                }),
                redirectTo: s,
                xform: b
            });
            if (a) throw a;
            if (!n) throw new Error("An error occurred on token verification.");
            let l = n.session, u = n.user;
            return l?.access_token && (await this._saveSession(l), await this._notifyAllSubscribers("SIGNED_IN", l)), {
                data: {
                    user: u,
                    session: l
                },
                error: null
            };
        } catch (s) {
            if (c(s)) return {
                data: {
                    user: null,
                    session: null
                },
                error: s
            };
            throw s;
        }
    }
    async signInWithSSO(e) {
        var t, r, s;
        try {
            await this._removeSession();
            let i = null, n = null;
            if (this.flowType === "pkce") {
                let a = E();
                await k(this.storage, `${this.storageKey}-code-verifier`, a), i = await I(a), n = a === i ? "plain" : "s256";
            }
            return await h(this.fetch, "POST", `${this.url}/sso`, {
                body: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, "providerId" in e ? {
                    provider_id: e.providerId
                } : null), "domain" in e ? {
                    domain: e.domain
                } : null), {
                    redirect_to: (r = (t = e.options) === null || t === void 0 ? void 0 : t.redirectTo) !== null && r !== void 0 ? r : void 0
                }), !((s = e?.options) === null || s === void 0) && s.captchaToken ? {
                    gotrue_meta_security: {
                        captcha_token: e.options.captchaToken
                    }
                } : null), {
                    skip_http_redirect: !0,
                    code_challenge: i,
                    code_challenge_method: n
                }),
                headers: this.headers,
                xform: ce
            });
        } catch (i) {
            if (c(i)) return {
                data: null,
                error: i
            };
            throw i;
        }
    }
    async reauthenticate() {
        return await this.initializePromise, await this._acquireLock(-1, async ()=>await this._reauthenticate());
    }
    async _reauthenticate() {
        try {
            return await this._useSession(async (e)=>{
                let { data: { session: t }, error: r } = e;
                if (r) throw r;
                if (!t) throw new v;
                let { error: s } = await h(this.fetch, "GET", `${this.url}/reauthenticate`, {
                    headers: this.headers,
                    jwt: t.access_token
                });
                return {
                    data: {
                        user: null,
                        session: null
                    },
                    error: s
                };
            });
        } catch (e) {
            if (c(e)) return {
                data: {
                    user: null,
                    session: null
                },
                error: e
            };
            throw e;
        }
    }
    async resend(e) {
        try {
            e.type != "email_change" && e.type != "phone_change" && await this._removeSession();
            let t = `${this.url}/resend`;
            if ("email" in e) {
                let { email: r, type: s, options: i } = e, { error: n } = await h(this.fetch, "POST", t, {
                    headers: this.headers,
                    body: {
                        email: r,
                        type: s,
                        gotrue_meta_security: {
                            captcha_token: i?.captchaToken
                        }
                    },
                    redirectTo: i?.emailRedirectTo
                });
                return {
                    data: {
                        user: null,
                        session: null
                    },
                    error: n
                };
            } else if ("phone" in e) {
                let { phone: r, type: s, options: i } = e, { data: n, error: a } = await h(this.fetch, "POST", t, {
                    headers: this.headers,
                    body: {
                        phone: r,
                        type: s,
                        gotrue_meta_security: {
                            captcha_token: i?.captchaToken
                        }
                    }
                });
                return {
                    data: {
                        user: null,
                        session: null,
                        messageId: n?.message_id
                    },
                    error: a
                };
            }
            throw new A("You must provide either an email or phone number and a type");
        } catch (t) {
            if (c(t)) return {
                data: {
                    user: null,
                    session: null
                },
                error: t
            };
            throw t;
        }
    }
    async getSession() {
        return await this.initializePromise, this._acquireLock(-1, async ()=>this._useSession(async (e)=>e));
    }
    async _acquireLock(e, t) {
        this._debug("#_acquireLock", "begin", e);
        try {
            if (this.lockAcquired) {
                let r = this.pendingInLock.length ? this.pendingInLock[this.pendingInLock.length - 1] : Promise.resolve(), s = (async ()=>(await r, await t()))();
                return this.pendingInLock.push((async ()=>{
                    try {
                        await s;
                    } catch  {}
                })()), s;
            }
            return await this.lock(`lock:${this.storageKey}`, e, async ()=>{
                this._debug("#_acquireLock", "lock acquired for storage key", this.storageKey);
                try {
                    this.lockAcquired = !0;
                    let r = t();
                    for(this.pendingInLock.push((async ()=>{
                        try {
                            await r;
                        } catch  {}
                    })()), await r; this.pendingInLock.length;){
                        let s = [
                            ...this.pendingInLock
                        ];
                        await Promise.all(s), this.pendingInLock.splice(0, s.length);
                    }
                    return await r;
                } finally{
                    this._debug("#_acquireLock", "lock released for storage key", this.storageKey), this.lockAcquired = !1;
                }
            });
        } finally{
            this._debug("#_acquireLock", "end");
        }
    }
    async _useSession(e) {
        this._debug("#_useSession", "begin");
        try {
            let t = await this.__loadSession();
            return await e(t);
        } finally{
            this._debug("#_useSession", "end");
        }
    }
    async __loadSession() {
        this._debug("#__loadSession()", "begin"), this.lockAcquired || this._debug("#__loadSession()", "used outside of an acquired lock!", new Error().stack);
        try {
            let e = null, t = await j(this.storage, this.storageKey);
            if (this._debug("#getSession()", "session from storage", t), t !== null && (this._isValidSession(t) ? e = t : (this._debug("#getSession()", "session from storage is not valid"), await this._removeSession())), !e) return {
                data: {
                    session: null
                },
                error: null
            };
            let r = e.expires_at ? e.expires_at <= Date.now() / 1e3 : !1;
            if (this._debug("#__loadSession()", `session has${r ? "" : " not"} expired`, "expires_at", e.expires_at), !r) return {
                data: {
                    session: e
                },
                error: null
            };
            let { session: s, error: i } = await this._callRefreshToken(e.refresh_token);
            return i ? {
                data: {
                    session: null
                },
                error: i
            } : {
                data: {
                    session: s
                },
                error: null
            };
        } finally{
            this._debug("#__loadSession()", "end");
        }
    }
    async getUser(e) {
        return e ? await this._getUser(e) : (await this.initializePromise, this._acquireLock(-1, async ()=>await this._getUser()));
    }
    async _getUser(e) {
        try {
            return e ? await h(this.fetch, "GET", `${this.url}/user`, {
                headers: this.headers,
                jwt: e,
                xform: y
            }) : await this._useSession(async (t)=>{
                var r, s;
                let { data: i, error: n } = t;
                if (n) throw n;
                return await h(this.fetch, "GET", `${this.url}/user`, {
                    headers: this.headers,
                    jwt: (s = (r = i.session) === null || r === void 0 ? void 0 : r.access_token) !== null && s !== void 0 ? s : void 0,
                    xform: y
                });
            });
        } catch (t) {
            if (c(t)) return {
                data: {
                    user: null
                },
                error: t
            };
            throw t;
        }
    }
    async updateUser(e, t = {}) {
        return await this.initializePromise, await this._acquireLock(-1, async ()=>await this._updateUser(e, t));
    }
    async _updateUser(e, t = {}) {
        try {
            return await this._useSession(async (r)=>{
                let { data: s, error: i } = r;
                if (i) throw i;
                if (!s.session) throw new v;
                let n = s.session, a = null, l = null;
                if (this.flowType === "pkce" && e.email != null) {
                    let _ = E();
                    await k(this.storage, `${this.storageKey}-code-verifier`, _), a = await I(_), l = _ === a ? "plain" : "s256";
                }
                let { data: u, error: d } = await h(this.fetch, "PUT", `${this.url}/user`, {
                    headers: this.headers,
                    redirectTo: t?.emailRedirectTo,
                    body: Object.assign(Object.assign({}, e), {
                        code_challenge: a,
                        code_challenge_method: l
                    }),
                    jwt: n.access_token,
                    xform: y
                });
                if (d) throw d;
                return n.user = u.user, await this._saveSession(n), await this._notifyAllSubscribers("USER_UPDATED", n), {
                    data: {
                        user: n.user
                    },
                    error: null
                };
            });
        } catch (r) {
            if (c(r)) return {
                data: {
                    user: null
                },
                error: r
            };
            throw r;
        }
    }
    _decodeJWT(e) {
        return H(e);
    }
    async setSession(e) {
        return await this.initializePromise, await this._acquireLock(-1, async ()=>await this._setSession(e));
    }
    async _setSession(e) {
        try {
            if (!e.access_token || !e.refresh_token) throw new v;
            let t = Date.now() / 1e3, r = t, s = !0, i = null, n = H(e.access_token);
            if (n.exp && (r = n.exp, s = r <= t), s) {
                let { session: a, error: l } = await this._callRefreshToken(e.refresh_token);
                if (l) return {
                    data: {
                        user: null,
                        session: null
                    },
                    error: l
                };
                if (!a) return {
                    data: {
                        user: null,
                        session: null
                    },
                    error: null
                };
                i = a;
            } else {
                let { data: a, error: l } = await this._getUser(e.access_token);
                if (l) throw l;
                i = {
                    access_token: e.access_token,
                    refresh_token: e.refresh_token,
                    user: a.user,
                    token_type: "bearer",
                    expires_in: r - t,
                    expires_at: r
                }, await this._saveSession(i), await this._notifyAllSubscribers("SIGNED_IN", i);
            }
            return {
                data: {
                    user: i.user,
                    session: i
                },
                error: null
            };
        } catch (t) {
            if (c(t)) return {
                data: {
                    session: null,
                    user: null
                },
                error: t
            };
            throw t;
        }
    }
    async refreshSession(e) {
        return await this.initializePromise, await this._acquireLock(-1, async ()=>await this._refreshSession(e));
    }
    async _refreshSession(e) {
        try {
            return await this._useSession(async (t)=>{
                var r;
                if (!e) {
                    let { data: n, error: a } = t;
                    if (a) throw a;
                    e = (r = n.session) !== null && r !== void 0 ? r : void 0;
                }
                if (!e?.refresh_token) throw new v;
                let { session: s, error: i } = await this._callRefreshToken(e.refresh_token);
                return i ? {
                    data: {
                        user: null,
                        session: null
                    },
                    error: i
                } : s ? {
                    data: {
                        user: s.user,
                        session: s
                    },
                    error: null
                } : {
                    data: {
                        user: null,
                        session: null
                    },
                    error: null
                };
            });
        } catch (t) {
            if (c(t)) return {
                data: {
                    user: null,
                    session: null
                },
                error: t
            };
            throw t;
        }
    }
    async _getSessionFromURL(e) {
        try {
            if (!w()) throw new R("No browser detected.");
            if (this.flowType === "implicit" && !this._isImplicitGrantFlow()) throw new R("Not a valid implicit grant flow url.");
            if (this.flowType == "pkce" && !e) throw new D("Not a valid PKCE flow url.");
            let t = V(window.location.href);
            if (e) {
                if (!t.code) throw new D("No code detected.");
                let { data: ve, error: ee } = await this._exchangeCodeForSession(t.code);
                if (ee) throw ee;
                let te = new URL(window.location.href);
                return te.searchParams.delete("code"), window.history.replaceState(window.history.state, "", te.toString()), {
                    data: {
                        session: ve.session,
                        redirectType: null
                    },
                    error: null
                };
            }
            if (t.error || t.error_description || t.error_code) throw new R(t.error_description || "Error in URL with unspecified error_description", {
                error: t.error || "unspecified_error",
                code: t.error_code || "unspecified_code"
            });
            let { provider_token: r, provider_refresh_token: s, access_token: i, refresh_token: n, expires_in: a, expires_at: l, token_type: u } = t;
            if (!i || !a || !n || !u) throw new R("No session defined in URL");
            let d = Math.round(Date.now() / 1e3), _ = parseInt(a), f = d + _;
            l && (f = parseInt(l));
            let p = f - d;
            p * 1e3 <= K && console.warn(`@supabase/gotrue-js: Session as retrieved from URL expires in ${p}s, should have been closer to ${_}s`);
            let g = f - _;
            d - g >= 120 ? console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued over 120s ago, URL could be stale", g, f, d) : d - g < 0 && console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued in the future? Check the device clok for skew", g, f, d);
            let { data: x, error: G } = await this._getUser(i);
            if (G) throw G;
            let pe = {
                provider_token: r,
                provider_refresh_token: s,
                access_token: i,
                expires_in: _,
                expires_at: f,
                refresh_token: n,
                token_type: u,
                user: x.user
            };
            return window.location.hash = "", this._debug("#_getSessionFromURL()", "clearing window.location.hash"), {
                data: {
                    session: pe,
                    redirectType: t.type
                },
                error: null
            };
        } catch (t) {
            if (c(t)) return {
                data: {
                    session: null,
                    redirectType: null
                },
                error: t
            };
            throw t;
        }
    }
    _isImplicitGrantFlow() {
        let e = V(window.location.href);
        return !!(w() && (e.access_token || e.error_description));
    }
    async _isPKCEFlow() {
        let e = V(window.location.href), t = await j(this.storage, `${this.storageKey}-code-verifier`);
        return !!(e.code && t);
    }
    async signOut(e = {
        scope: "global"
    }) {
        return await this.initializePromise, await this._acquireLock(-1, async ()=>await this._signOut(e));
    }
    async _signOut({ scope: e } = {
        scope: "global"
    }) {
        return await this._useSession(async (t)=>{
            var r;
            let { data: s, error: i } = t;
            if (i) return {
                error: i
            };
            let n = (r = s.session) === null || r === void 0 ? void 0 : r.access_token;
            if (n) {
                let { error: a } = await this.admin.signOut(n, e);
                if (a && !(ae(a) && (a.status === 404 || a.status === 401))) return {
                    error: a
                };
            }
            return e !== "others" && (await this._removeSession(), await J(this.storage, `${this.storageKey}-code-verifier`), await this._notifyAllSubscribers("SIGNED_OUT", null)), {
                error: null
            };
        });
    }
    onAuthStateChange(e) {
        let t = se(), r = {
            id: t,
            callback: e,
            unsubscribe: ()=>{
                this._debug("#unsubscribe()", "state change callback with id removed", t), this.stateChangeEmitters.delete(t);
            }
        };
        return this._debug("#onAuthStateChange()", "registered callback with id", t), this.stateChangeEmitters.set(t, r), (async ()=>(await this.initializePromise, await this._acquireLock(-1, async ()=>{
                this._emitInitialSession(t);
            })))(), {
            data: {
                subscription: r
            }
        };
    }
    async _emitInitialSession(e) {
        return await this._useSession(async (t)=>{
            var r, s;
            try {
                let { data: { session: i }, error: n } = t;
                if (n) throw n;
                await ((r = this.stateChangeEmitters.get(e)) === null || r === void 0 ? void 0 : r.callback("INITIAL_SESSION", i)), this._debug("INITIAL_SESSION", "callback id", e, "session", i);
            } catch (i) {
                await ((s = this.stateChangeEmitters.get(e)) === null || s === void 0 ? void 0 : s.callback("INITIAL_SESSION", null)), this._debug("INITIAL_SESSION", "callback id", e, "error", i), console.error(i);
            }
        });
    }
    async resetPasswordForEmail(e, t = {}) {
        let r = null, s = null;
        if (this.flowType === "pkce") {
            let i = E();
            await k(this.storage, `${this.storageKey}-code-verifier`, i), r = await I(i), s = i === r ? "plain" : "s256";
        }
        try {
            return await h(this.fetch, "POST", `${this.url}/recover`, {
                body: {
                    email: e,
                    code_challenge: r,
                    code_challenge_method: s,
                    gotrue_meta_security: {
                        captcha_token: t.captchaToken
                    }
                },
                headers: this.headers,
                redirectTo: t.redirectTo
            });
        } catch (i) {
            if (c(i)) return {
                data: null,
                error: i
            };
            throw i;
        }
    }
    async _refreshAccessToken(e) {
        let t = `#_refreshAccessToken(${e.substring(0, 5)}...)`;
        this._debug(t, "begin");
        try {
            let r = Date.now();
            return await ne(async (s)=>(await oe(s * 200), this._debug(t, "refreshing attempt", s), await h(this.fetch, "POST", `${this.url}/token?grant_type=refresh_token`, {
                    body: {
                        refresh_token: e
                    },
                    headers: this.headers,
                    xform: b
                })), (s, i, n)=>n && n.error && X(n.error) && Date.now() + (s + 1) * 200 - r < K);
        } catch (r) {
            if (this._debug(t, "error", r), c(r)) return {
                data: {
                    session: null,
                    user: null
                },
                error: r
            };
            throw r;
        } finally{
            this._debug(t, "end");
        }
    }
    _isValidSession(e) {
        return typeof e == "object" && e !== null && "access_token" in e && "refresh_token" in e && "expires_at" in e;
    }
    async _handleProviderSignIn(e, t) {
        let r = await this._getUrlForProvider(e, {
            redirectTo: t.redirectTo,
            scopes: t.scopes,
            queryParams: t.queryParams
        });
        return this._debug("#_handleProviderSignIn()", "provider", e, "options", t, "url", r), w() && !t.skipBrowserRedirect && window.location.assign(r), {
            data: {
                provider: e,
                url: r
            },
            error: null
        };
    }
    async _recoverAndRefresh() {
        var e;
        let t = "#_recoverAndRefresh()";
        this._debug(t, "begin");
        try {
            let r = await j(this.storage, this.storageKey);
            if (this._debug(t, "session from storage", r), !this._isValidSession(r)) {
                this._debug(t, "session is not valid"), r !== null && await this._removeSession();
                return;
            }
            let s = Math.round(Date.now() / 1e3), i = ((e = r.expires_at) !== null && e !== void 0 ? e : 1 / 0) < s + Q;
            if (this._debug(t, `session has${i ? "" : " not"} expired with margin of ${Q}s`), i) {
                if (this.autoRefreshToken && r.refresh_token) {
                    let { error: n } = await this._callRefreshToken(r.refresh_token);
                    n && (console.error(n), X(n) || (this._debug(t, "refresh failed with a non-retryable error, removing the session", n), await this._removeSession()));
                }
            } else await this._notifyAllSubscribers("SIGNED_IN", r);
        } catch (r) {
            this._debug(t, "error", r), console.error(r);
            return;
        } finally{
            this._debug(t, "end");
        }
    }
    async _callRefreshToken(e) {
        var t, r;
        if (!e) throw new v;
        if (this.refreshingDeferred) return this.refreshingDeferred.promise;
        let s = `#_callRefreshToken(${e.substring(0, 5)}...)`;
        this._debug(s, "begin");
        try {
            this.refreshingDeferred = new U;
            let { data: i, error: n } = await this._refreshAccessToken(e);
            if (n) throw n;
            if (!i.session) throw new v;
            await this._saveSession(i.session), await this._notifyAllSubscribers("TOKEN_REFRESHED", i.session);
            let a = {
                session: i.session,
                error: null
            };
            return this.refreshingDeferred.resolve(a), a;
        } catch (i) {
            if (this._debug(s, "error", i), c(i)) {
                let n = {
                    session: null,
                    error: i
                };
                return (t = this.refreshingDeferred) === null || t === void 0 || t.resolve(n), n;
            }
            throw (r = this.refreshingDeferred) === null || r === void 0 || r.reject(i), i;
        } finally{
            this.refreshingDeferred = null, this._debug(s, "end");
        }
    }
    async _notifyAllSubscribers(e, t, r = !0) {
        let s = `#_notifyAllSubscribers(${e})`;
        this._debug(s, "begin", t, `broadcast = ${r}`);
        try {
            this.broadcastChannel && r && this.broadcastChannel.postMessage({
                event: e,
                session: t
            });
            let i = [], n = Array.from(this.stateChangeEmitters.values()).map(async (a)=>{
                try {
                    await a.callback(e, t);
                } catch (l) {
                    i.push(l);
                }
            });
            if (await Promise.all(n), i.length > 0) {
                for(let a = 0; a < i.length; a += 1)console.error(i[a]);
                throw i[0];
            }
        } finally{
            this._debug(s, "end");
        }
    }
    async _saveSession(e) {
        this._debug("#_saveSession()", e), await this._persistSession(e);
    }
    _persistSession(e) {
        return this._debug("#_persistSession()", e), k(this.storage, this.storageKey, e);
    }
    async _removeSession() {
        this._debug("#_removeSession()"), await J(this.storage, this.storageKey);
    }
    _removeVisibilityChangedCallback() {
        this._debug("#_removeVisibilityChangedCallback()");
        let e = this.visibilityChangedCallback;
        this.visibilityChangedCallback = null;
        try {
            e && w() && window?.removeEventListener && window.removeEventListener("visibilitychange", e);
        } catch (t) {
            console.error("removing visibilitychange callback failed", t);
        }
    }
    async _startAutoRefresh() {
        await this._stopAutoRefresh(), this._debug("#_startAutoRefresh()");
        let e = setInterval(()=>this._autoRefreshTokenTick(), K);
        this.autoRefreshTicker = e, e && typeof e == "object" && typeof e.unref == "function" ? e.unref() : typeof Deno < "u" && typeof Deno.unrefTimer == "function" && Deno.unrefTimer(e), setTimeout(async ()=>{
            await this.initializePromise, await this._autoRefreshTokenTick();
        }, 0);
    }
    async _stopAutoRefresh() {
        this._debug("#_stopAutoRefresh()");
        let e = this.autoRefreshTicker;
        this.autoRefreshTicker = null, e && clearInterval(e);
    }
    async startAutoRefresh() {
        this._removeVisibilityChangedCallback(), await this._startAutoRefresh();
    }
    async stopAutoRefresh() {
        this._removeVisibilityChangedCallback(), await this._stopAutoRefresh();
    }
    async _autoRefreshTokenTick() {
        this._debug("#_autoRefreshTokenTick()", "begin");
        try {
            await this._acquireLock(0, async ()=>{
                try {
                    let e = Date.now();
                    try {
                        return await this._useSession(async (t)=>{
                            let { data: { session: r } } = t;
                            if (!r || !r.refresh_token || !r.expires_at) {
                                this._debug("#_autoRefreshTokenTick()", "no session");
                                return;
                            }
                            let s = Math.floor((r.expires_at * 1e3 - e) / K);
                            this._debug("#_autoRefreshTokenTick()", `access token expires in ${s} ticks, a tick lasts ${K}ms, refresh threshold is ${ye} ticks`), s <= ye && await this._callRefreshToken(r.refresh_token);
                        });
                    } catch (t) {
                        console.error("Auto refresh tick failed with error. This is likely a transient error.", t);
                    }
                } finally{
                    this._debug("#_autoRefreshTokenTick()", "end");
                }
            });
        } catch (e) {
            if (e.isAcquireTimeout || e instanceof F) this._debug("auto refresh token tick lock not available");
            else throw e;
        }
    }
    async _handleVisibilityChange() {
        if (this._debug("#_handleVisibilityChange()"), !w() || !window?.addEventListener) return this.autoRefreshToken && this.startAutoRefresh(), !1;
        try {
            this.visibilityChangedCallback = async ()=>await this._onVisibilityChanged(!1), window?.addEventListener("visibilitychange", this.visibilityChangedCallback), await this._onVisibilityChanged(!0);
        } catch (e) {
            console.error("_handleVisibilityChange", e);
        }
    }
    async _onVisibilityChanged(e) {
        let t = `#_onVisibilityChanged(${e})`;
        this._debug(t, "visibilityState", document.visibilityState), document.visibilityState === "visible" ? (this.autoRefreshToken && this._startAutoRefresh(), e || (await this.initializePromise, await this._acquireLock(-1, async ()=>{
            if (document.visibilityState !== "visible") {
                this._debug(t, "acquired the lock to recover the session, but the browser visibilityState is no longer visible, aborting");
                return;
            }
            await this._recoverAndRefresh();
        }))) : document.visibilityState === "hidden" && this.autoRefreshToken && this._stopAutoRefresh();
    }
    async _getUrlForProvider(e, t) {
        let r = [
            `provider=${encodeURIComponent(e)}`
        ];
        if (t?.redirectTo && r.push(`redirect_to=${encodeURIComponent(t.redirectTo)}`), t?.scopes && r.push(`scopes=${encodeURIComponent(t.scopes)}`), this.flowType === "pkce") {
            let s = E();
            await k(this.storage, `${this.storageKey}-code-verifier`, s);
            let i = await I(s), n = s === i ? "plain" : "s256";
            this._debug("PKCE", "code verifier", `${s.substring(0, 5)}...`, "code challenge", i, "method", n);
            let a = new URLSearchParams({
                code_challenge: `${encodeURIComponent(i)}`,
                code_challenge_method: `${encodeURIComponent(n)}`
            });
            r.push(a.toString());
        }
        if (t?.queryParams) {
            let s = new URLSearchParams(t.queryParams);
            r.push(s.toString());
        }
        return `${this.url}/authorize?${r.join("&")}`;
    }
    async _unenroll(e) {
        try {
            return await this._useSession(async (t)=>{
                var r;
                let { data: s, error: i } = t;
                return i ? {
                    data: null,
                    error: i
                } : await h(this.fetch, "DELETE", `${this.url}/factors/${e.factorId}`, {
                    headers: this.headers,
                    jwt: (r = s?.session) === null || r === void 0 ? void 0 : r.access_token
                });
            });
        } catch (t) {
            if (c(t)) return {
                data: null,
                error: t
            };
            throw t;
        }
    }
    async _enroll(e) {
        try {
            return await this._useSession(async (t)=>{
                var r, s;
                let { data: i, error: n } = t;
                if (n) return {
                    data: null,
                    error: n
                };
                let { data: a, error: l } = await h(this.fetch, "POST", `${this.url}/factors`, {
                    body: {
                        friendly_name: e.friendlyName,
                        factor_type: e.factorType,
                        issuer: e.issuer
                    },
                    headers: this.headers,
                    jwt: (r = i?.session) === null || r === void 0 ? void 0 : r.access_token
                });
                return l ? {
                    data: null,
                    error: l
                } : (!((s = a?.totp) === null || s === void 0) && s.qr_code && (a.totp.qr_code = `data:image/svg+xml;utf-8,${a.totp.qr_code}`), {
                    data: a,
                    error: null
                });
            });
        } catch (t) {
            if (c(t)) return {
                data: null,
                error: t
            };
            throw t;
        }
    }
    async _verify(e) {
        return this._acquireLock(-1, async ()=>{
            try {
                return await this._useSession(async (t)=>{
                    var r;
                    let { data: s, error: i } = t;
                    if (i) return {
                        data: null,
                        error: i
                    };
                    let { data: n, error: a } = await h(this.fetch, "POST", `${this.url}/factors/${e.factorId}/verify`, {
                        body: {
                            code: e.code,
                            challenge_id: e.challengeId
                        },
                        headers: this.headers,
                        jwt: (r = s?.session) === null || r === void 0 ? void 0 : r.access_token
                    });
                    return a ? {
                        data: null,
                        error: a
                    } : (await this._saveSession(Object.assign({
                        expires_at: Math.round(Date.now() / 1e3) + n.expires_in
                    }, n)), await this._notifyAllSubscribers("MFA_CHALLENGE_VERIFIED", n), {
                        data: n,
                        error: a
                    });
                });
            } catch (t) {
                if (c(t)) return {
                    data: null,
                    error: t
                };
                throw t;
            }
        });
    }
    async _challenge(e) {
        return this._acquireLock(-1, async ()=>{
            try {
                return await this._useSession(async (t)=>{
                    var r;
                    let { data: s, error: i } = t;
                    return i ? {
                        data: null,
                        error: i
                    } : await h(this.fetch, "POST", `${this.url}/factors/${e.factorId}/challenge`, {
                        headers: this.headers,
                        jwt: (r = s?.session) === null || r === void 0 ? void 0 : r.access_token
                    });
                });
            } catch (t) {
                if (c(t)) return {
                    data: null,
                    error: t
                };
                throw t;
            }
        });
    }
    async _challengeAndVerify(e) {
        let { data: t, error: r } = await this._challenge({
            factorId: e.factorId
        });
        return r ? {
            data: null,
            error: r
        } : await this._verify({
            factorId: e.factorId,
            challengeId: t.id,
            code: e.code
        });
    }
    async _listFactors() {
        let { data: { user: e }, error: t } = await this.getUser();
        if (t) return {
            data: null,
            error: t
        };
        let r = e?.factors || [], s = r.filter((i)=>i.factor_type === "totp" && i.status === "verified");
        return {
            data: {
                all: r,
                totp: s
            },
            error: null
        };
    }
    async _getAuthenticatorAssuranceLevel() {
        return this._acquireLock(-1, async ()=>await this._useSession(async (e)=>{
                var t, r;
                let { data: { session: s }, error: i } = e;
                if (i) return {
                    data: null,
                    error: i
                };
                if (!s) return {
                    data: {
                        currentLevel: null,
                        nextLevel: null,
                        currentAuthenticationMethods: []
                    },
                    error: null
                };
                let n = this._decodeJWT(s.access_token), a = null;
                n.aal && (a = n.aal);
                let l = a;
                ((r = (t = s.user.factors) === null || t === void 0 ? void 0 : t.filter((_)=>_.status === "verified")) !== null && r !== void 0 ? r : []).length > 0 && (l = "aal2");
                let d = n.amr || [];
                return {
                    data: {
                        currentLevel: a,
                        nextLevel: l,
                        currentAuthenticationMethods: d
                    },
                    error: null
                };
            }));
    }
};
M.nextInstanceID = 0;
var F1 = (i)=>{
    let t;
    return i ? t = i : typeof fetch > "u" ? t = (...e)=>import("/v135/@supabase/node-fetch@2.6.14/denonext/node-fetch.mjs").then(({ default: r })=>r(...e)) : t = fetch, (...e)=>t(...e);
};
var p = class extends Error {
    constructor(t, e = "FunctionsError", r){
        super(t), this.name = e, this.context = r;
    }
}, h1 = class extends p {
    constructor(t){
        super("Failed to send a request to the Edge Function", "FunctionsFetchError", t);
    }
}, y1 = class extends p {
    constructor(t){
        super("Relay Error invoking the Edge Function", "FunctionsRelayError", t);
    }
}, x = class extends p {
    constructor(t){
        super("Edge Function returned a non-2xx status code", "FunctionsHttpError", t);
    }
};
var w1 = function(i, t, e, r) {
    function a(c) {
        return c instanceof e ? c : new e(function(n) {
            n(c);
        });
    }
    return new (e || (e = Promise))(function(c, n) {
        function f(s) {
            try {
                o(r.next(s));
            } catch (u) {
                n(u);
            }
        }
        function l(s) {
            try {
                o(r.throw(s));
            } catch (u) {
                n(u);
            }
        }
        function o(s) {
            s.done ? c(s.value) : a(s.value).then(f, l);
        }
        o((r = r.apply(i, t || [])).next());
    });
}, m1 = class {
    constructor(t, { headers: e = {}, customFetch: r } = {}){
        this.url = t, this.headers = e, this.fetch = F1(r);
    }
    setAuth(t) {
        this.headers.Authorization = `Bearer ${t}`;
    }
    invoke(t, e = {}) {
        var r;
        return w1(this, void 0, void 0, function*() {
            try {
                let { headers: a, method: c, body: n } = e, f = {}, l;
                n && (a && !Object.prototype.hasOwnProperty.call(a, "Content-Type") || !a) && (typeof Blob < "u" && n instanceof Blob || n instanceof ArrayBuffer ? (f["Content-Type"] = "application/octet-stream", l = n) : typeof n == "string" ? (f["Content-Type"] = "text/plain", l = n) : typeof FormData < "u" && n instanceof FormData ? l = n : (f["Content-Type"] = "application/json", l = JSON.stringify(n)));
                let o = yield this.fetch(`${this.url}/${t}`, {
                    method: c || "POST",
                    headers: Object.assign(Object.assign(Object.assign({}, f), this.headers), a),
                    body: l
                }).catch((E)=>{
                    throw new h1(E);
                }), s = o.headers.get("x-relay-error");
                if (s && s === "true") throw new y1(o);
                if (!o.ok) throw new x(o);
                let u = ((r = o.headers.get("Content-Type")) !== null && r !== void 0 ? r : "text/plain").split(";")[0].trim(), d;
                return u === "application/json" ? d = yield o.json() : u === "application/octet-stream" ? d = yield o.blob() : u === "multipart/form-data" ? d = yield o.formData() : d = yield o.text(), {
                    data: d,
                    error: null
                };
            } catch (a) {
                return {
                    data: null,
                    error: a
                };
            }
        });
    }
};
var p1 = Object.create;
var f = Object.defineProperty;
var d = Object.getOwnPropertyDescriptor;
var g = Object.getOwnPropertyNames;
var h2 = Object.getPrototypeOf, y2 = Object.prototype.hasOwnProperty;
var w2 = (t, e)=>()=>(e || t((e = {
            exports: {}
        }).exports, e), e.exports), j1 = (t, e)=>{
    for(var r in e)f(t, r, {
        get: e[r],
        enumerable: !0
    });
}, i = (t, e, r, a)=>{
    if (e && typeof e == "object" || typeof e == "function") for (let n of g(e))!y2.call(t, n) && n !== r && f(t, n, {
        get: ()=>e[n],
        enumerable: !(a = d(e, n)) || a.enumerable
    });
    return t;
}, l = (t, e, r)=>(i(t, e, "default"), r && i(r, e, "default")), u = (t, e, r)=>(r = t != null ? p1(h2(t)) : {}, i(e || !t || !t.__esModule ? f(r, "default", {
        value: t,
        enumerable: !0
    }) : r, t));
var _ = w2((T, s)=>{
    var b = function() {
        if (typeof self == "object" && self) return self;
        if (typeof window == "object" && window) return window;
        throw new Error("Unable to resolve global `this`");
    };
    s.exports = function() {
        if (this) return this;
        if (typeof globalThis == "object" && globalThis) return globalThis;
        try {
            Object.defineProperty(Object.prototype, "__global__", {
                get: function() {
                    return this;
                },
                configurable: !0
            });
        } catch  {
            return b();
        }
        try {
            return __global__ || b();
        } finally{
            delete Object.prototype.__global__;
        }
    }();
});
var o = {};
j1(o, {
    default: ()=>x1
});
var m2 = u(_());
l(o, u(_()));
var { default: c1, ...v1 } = m2, x1 = c1 !== void 0 ? c1 : v1;
const mod = {
    default: x1
};
var require = (n)=>{
    const e = (m)=>typeof m.default < "u" ? m.default : m;
    switch(n){
        case "es5-ext/global":
            return e(mod);
        default:
            throw new Error("module \"" + n + "\" not found");
    }
};
var y3 = Object.create;
var a = Object.defineProperty;
var C1 = Object.getOwnPropertyDescriptor;
var S1 = Object.getOwnPropertyNames;
var W1 = Object.getPrototypeOf, _1 = Object.prototype.hasOwnProperty;
var x2 = ((e)=>typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(e, {
        get: (t, i)=>(typeof require < "u" ? require : t)[i]
    }) : e)(function(e) {
    if (typeof require < "u") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + e + '" is not supported');
});
var u1 = (e, t)=>()=>(t || e((t = {
            exports: {}
        }).exports, t), t.exports), N1 = (e, t)=>{
    for(var i in t)a(e, i, {
        get: t[i],
        enumerable: !0
    });
}, l1 = (e, t, i, d)=>{
    if (t && typeof t == "object" || typeof t == "function") for (let s of S1(t))!_1.call(e, s) && s !== i && a(e, s, {
        get: ()=>t[s],
        enumerable: !(d = C1(t, s)) || d.enumerable
    });
    return e;
}, r = (e, t, i)=>(l1(e, t, "default"), i && l1(i, t, "default")), f1 = (e, t, i)=>(i = e != null ? y3(W1(e)) : {}, l1(t || !e || !e.__esModule ? a(i, "default", {
        value: e,
        enumerable: !0
    }) : i, e));
var p2 = u1((R, j)=>{
    j.exports = {
        name: "websocket",
        description: "Websocket Client & Server Library implementing the WebSocket protocol as specified in RFC 6455.",
        keywords: [
            "websocket",
            "websockets",
            "socket",
            "networking",
            "comet",
            "push",
            "RFC-6455",
            "realtime",
            "server",
            "client"
        ],
        author: "Brian McKelvey <theturtle32@gmail.com> (https://github.com/theturtle32)",
        contributors: [
            "I\xF1aki Baz Castillo <ibc@aliax.net> (http://dev.sipdoc.net)"
        ],
        version: "1.0.34",
        repository: {
            type: "git",
            url: "https://github.com/theturtle32/WebSocket-Node.git"
        },
        homepage: "https://github.com/theturtle32/WebSocket-Node",
        engines: {
            node: ">=4.0.0"
        },
        dependencies: {
            bufferutil: "^4.0.1",
            debug: "^2.2.0",
            "es5-ext": "^0.10.50",
            "typedarray-to-buffer": "^3.1.5",
            "utf-8-validate": "^5.0.2",
            yaeti: "^0.0.6"
        },
        devDependencies: {
            "buffer-equal": "^1.0.0",
            gulp: "^4.0.2",
            "gulp-jshint": "^2.0.4",
            "jshint-stylish": "^2.2.1",
            jshint: "^2.0.0",
            tape: "^4.9.1"
        },
        config: {
            verbose: !1
        },
        scripts: {
            test: "tape test/unit/*.js",
            gulp: "gulp"
        },
        main: "index",
        directories: {
            lib: "./lib"
        },
        browser: "lib/browser.js",
        license: "Apache-2.0"
    };
});
var g1 = u1((A, h)=>{
    h.exports = p2().version;
});
var b1 = u1((K, v)=>{
    var n;
    if (typeof globalThis == "object") n = globalThis;
    else try {
        n = x2("es5-ext/global");
    } catch  {} finally{
        if (!n && typeof window < "u" && (n = window), !n) throw new Error("Could not determine global this");
    }
    var c = n.WebSocket || n.MozWebSocket, q = g1();
    function w(e, t) {
        var i;
        return t ? i = new c(e, t) : i = new c(e), i;
    }
    c && [
        "CONNECTING",
        "OPEN",
        "CLOSING",
        "CLOSED"
    ].forEach(function(e) {
        Object.defineProperty(w, e, {
            get: function() {
                return c[e];
            }
        });
    });
    v.exports = {
        w3cwebsocket: c ? w : null,
        version: q
    };
});
var o1 = {};
N1(o1, {
    client: ()=>O1,
    connection: ()=>z1,
    default: ()=>M1,
    deprecation: ()=>D1,
    frame: ()=>I1,
    request: ()=>L1,
    router: ()=>T1,
    server: ()=>E1,
    version: ()=>F2,
    w3cwebsocket: ()=>B1
});
var m3 = f1(b1());
r(o1, f1(b1()));
var { server: E1, client: O1, router: T1, frame: I1, request: L1, connection: z1, w3cwebsocket: B1, deprecation: D1, version: F2 } = m3, { default: k1, ...G } = m3, M1 = k1 !== void 0 ? k1 : G;
var I2 = "2.8.4";
var H1 = {
    "X-Client-Info": `realtime-js/${I2}`
}, z2 = "1.0.0", P1 = 1e4, F3 = 1e3, L2;
(function(i) {
    i[i.connecting = 0] = "connecting", i[i.open = 1] = "open", i[i.closing = 2] = "closing", i[i.closed = 3] = "closed";
})(L2 || (L2 = {}));
var g2;
(function(i) {
    i.closed = "closed", i.errored = "errored", i.joined = "joined", i.joining = "joining", i.leaving = "leaving";
})(g2 || (g2 = {}));
var R1;
(function(i) {
    i.close = "phx_close", i.error = "phx_error", i.join = "phx_join", i.reply = "phx_reply", i.leave = "phx_leave", i.access_token = "access_token";
})(R1 || (R1 = {}));
var S2;
(function(i) {
    i.websocket = "websocket";
})(S2 || (S2 = {}));
var j2;
(function(i) {
    i.Connecting = "connecting", i.Open = "open", i.Closing = "closing", i.Closed = "closed";
})(j2 || (j2 = {}));
var T2 = class {
    constructor(e, t){
        this.callback = e, this.timerCalc = t, this.timer = void 0, this.tries = 0, this.callback = e, this.timerCalc = t;
    }
    reset() {
        this.tries = 0, clearTimeout(this.timer);
    }
    scheduleTimeout() {
        clearTimeout(this.timer), this.timer = setTimeout(()=>{
            this.tries = this.tries + 1, this.callback();
        }, this.timerCalc(this.tries + 1));
    }
};
var x3 = class {
    constructor(){
        this.HEADER_LENGTH = 1;
    }
    decode(e, t) {
        return e.constructor === ArrayBuffer ? t(this._binaryDecode(e)) : t(typeof e == "string" ? JSON.parse(e) : {});
    }
    _binaryDecode(e) {
        let t = new DataView(e), n = new TextDecoder;
        return this._decodeBroadcast(e, t, n);
    }
    _decodeBroadcast(e, t, n) {
        let s = t.getUint8(1), r = t.getUint8(2), o = this.HEADER_LENGTH + 2, c = n.decode(e.slice(o, o + s));
        o = o + s;
        let h = n.decode(e.slice(o, o + r));
        o = o + r;
        let a = JSON.parse(n.decode(e.slice(o, e.byteLength)));
        return {
            ref: null,
            topic: c,
            event: h,
            payload: a
        };
    }
};
var y4 = class {
    constructor(e, t, n = {}, s = P1){
        this.channel = e, this.event = t, this.payload = n, this.timeout = s, this.sent = !1, this.timeoutTimer = void 0, this.ref = "", this.receivedResp = null, this.recHooks = [], this.refEvent = null;
    }
    resend(e) {
        this.timeout = e, this._cancelRefEvent(), this.ref = "", this.refEvent = null, this.receivedResp = null, this.sent = !1, this.send();
    }
    send() {
        this._hasReceived("timeout") || (this.startTimeout(), this.sent = !0, this.channel.socket.push({
            topic: this.channel.topic,
            event: this.event,
            payload: this.payload,
            ref: this.ref,
            join_ref: this.channel._joinRef()
        }));
    }
    updatePayload(e) {
        this.payload = Object.assign(Object.assign({}, this.payload), e);
    }
    receive(e, t) {
        var n;
        return this._hasReceived(e) && t((n = this.receivedResp) === null || n === void 0 ? void 0 : n.response), this.recHooks.push({
            status: e,
            callback: t
        }), this;
    }
    startTimeout() {
        if (this.timeoutTimer) return;
        this.ref = this.channel.socket._makeRef(), this.refEvent = this.channel._replyEventName(this.ref);
        let e = (t)=>{
            this._cancelRefEvent(), this._cancelTimeout(), this.receivedResp = t, this._matchReceive(t);
        };
        this.channel._on(this.refEvent, {}, e), this.timeoutTimer = setTimeout(()=>{
            this.trigger("timeout", {});
        }, this.timeout);
    }
    trigger(e, t) {
        this.refEvent && this.channel._trigger(this.refEvent, {
            status: e,
            response: t
        });
    }
    destroy() {
        this._cancelRefEvent(), this._cancelTimeout();
    }
    _cancelRefEvent() {
        this.refEvent && this.channel._off(this.refEvent, {});
    }
    _cancelTimeout() {
        clearTimeout(this.timeoutTimer), this.timeoutTimer = void 0;
    }
    _matchReceive({ status: e, response: t }) {
        this.recHooks.filter((n)=>n.status === e).forEach((n)=>n.callback(t));
    }
    _hasReceived(e) {
        return this.receivedResp && this.receivedResp.status === e;
    }
};
var N2;
(function(i) {
    i.SYNC = "sync", i.JOIN = "join", i.LEAVE = "leave";
})(N2 || (N2 = {}));
var k2 = class i {
    constructor(e, t){
        this.channel = e, this.state = {}, this.pendingDiffs = [], this.joinRef = null, this.caller = {
            onJoin: ()=>{},
            onLeave: ()=>{},
            onSync: ()=>{}
        };
        let n = t?.events || {
            state: "presence_state",
            diff: "presence_diff"
        };
        this.channel._on(n.state, {}, (s)=>{
            let { onJoin: r, onLeave: o, onSync: c } = this.caller;
            this.joinRef = this.channel._joinRef(), this.state = i.syncState(this.state, s, r, o), this.pendingDiffs.forEach((h)=>{
                this.state = i.syncDiff(this.state, h, r, o);
            }), this.pendingDiffs = [], c();
        }), this.channel._on(n.diff, {}, (s)=>{
            let { onJoin: r, onLeave: o, onSync: c } = this.caller;
            this.inPendingSyncState() ? this.pendingDiffs.push(s) : (this.state = i.syncDiff(this.state, s, r, o), c());
        }), this.onJoin((s, r, o)=>{
            this.channel._trigger("presence", {
                event: "join",
                key: s,
                currentPresences: r,
                newPresences: o
            });
        }), this.onLeave((s, r, o)=>{
            this.channel._trigger("presence", {
                event: "leave",
                key: s,
                currentPresences: r,
                leftPresences: o
            });
        }), this.onSync(()=>{
            this.channel._trigger("presence", {
                event: "sync"
            });
        });
    }
    static syncState(e, t, n, s) {
        let r = this.cloneDeep(e), o = this.transformState(t), c = {}, h = {};
        return this.map(r, (a, m)=>{
            o[a] || (h[a] = m);
        }), this.map(o, (a, m)=>{
            let p = r[a];
            if (p) {
                let _ = m.map((u)=>u.presence_ref), d = p.map((u)=>u.presence_ref), f = m.filter((u)=>d.indexOf(u.presence_ref) < 0), v = p.filter((u)=>_.indexOf(u.presence_ref) < 0);
                f.length > 0 && (c[a] = f), v.length > 0 && (h[a] = v);
            } else c[a] = m;
        }), this.syncDiff(r, {
            joins: c,
            leaves: h
        }, n, s);
    }
    static syncDiff(e, t, n, s) {
        let { joins: r, leaves: o } = {
            joins: this.transformState(t.joins),
            leaves: this.transformState(t.leaves)
        };
        return n || (n = ()=>{}), s || (s = ()=>{}), this.map(r, (c, h)=>{
            var a;
            let m = (a = e[c]) !== null && a !== void 0 ? a : [];
            if (e[c] = this.cloneDeep(h), m.length > 0) {
                let p = e[c].map((d)=>d.presence_ref), _ = m.filter((d)=>p.indexOf(d.presence_ref) < 0);
                e[c].unshift(..._);
            }
            n(c, m, h);
        }), this.map(o, (c, h)=>{
            let a = e[c];
            if (!a) return;
            let m = h.map((p)=>p.presence_ref);
            a = a.filter((p)=>m.indexOf(p.presence_ref) < 0), e[c] = a, s(c, a, h), a.length === 0 && delete e[c];
        }), e;
    }
    static map(e, t) {
        return Object.getOwnPropertyNames(e).map((n)=>t(n, e[n]));
    }
    static transformState(e) {
        return e = this.cloneDeep(e), Object.getOwnPropertyNames(e).reduce((t, n)=>{
            let s = e[n];
            return "metas" in s ? t[n] = s.metas.map((r)=>(r.presence_ref = r.phx_ref, delete r.phx_ref, delete r.phx_ref_prev, r)) : t[n] = s, t;
        }, {});
    }
    static cloneDeep(e) {
        return JSON.parse(JSON.stringify(e));
    }
    onJoin(e) {
        this.caller.onJoin = e;
    }
    onLeave(e) {
        this.caller.onLeave = e;
    }
    onSync(e) {
        this.caller.onSync = e;
    }
    inPendingSyncState() {
        return !this.joinRef || this.joinRef !== this.channel._joinRef();
    }
};
var l2;
(function(i) {
    i.abstime = "abstime", i.bool = "bool", i.date = "date", i.daterange = "daterange", i.float4 = "float4", i.float8 = "float8", i.int2 = "int2", i.int4 = "int4", i.int4range = "int4range", i.int8 = "int8", i.int8range = "int8range", i.json = "json", i.jsonb = "jsonb", i.money = "money", i.numeric = "numeric", i.oid = "oid", i.reltime = "reltime", i.text = "text", i.time = "time", i.timestamp = "timestamp", i.timestamptz = "timestamptz", i.timetz = "timetz", i.tsrange = "tsrange", i.tstzrange = "tstzrange";
})(l2 || (l2 = {}));
var B2 = (i, e, t = {})=>{
    var n;
    let s = (n = t.skipTypes) !== null && n !== void 0 ? n : [];
    return Object.keys(e).reduce((r, o)=>(r[o] = q1(o, i, e, s), r), {});
}, q1 = (i, e, t, n)=>{
    let s = e.find((c)=>c.name === i), r = s?.type, o = t[i];
    return r && !n.includes(r) ? W2(r, o) : U1(o);
}, W2 = (i, e)=>{
    if (i.charAt(0) === "_") {
        let t = i.slice(1, i.length);
        return Y(e, t);
    }
    switch(i){
        case l2.bool:
            return G1(e);
        case l2.float4:
        case l2.float8:
        case l2.int2:
        case l2.int4:
        case l2.int8:
        case l2.numeric:
        case l2.oid:
            return V1(e);
        case l2.json:
        case l2.jsonb:
            return X1(e);
        case l2.timestamp:
            return Q1(e);
        case l2.abstime:
        case l2.date:
        case l2.daterange:
        case l2.int4range:
        case l2.int8range:
        case l2.money:
        case l2.reltime:
        case l2.text:
        case l2.time:
        case l2.timestamptz:
        case l2.timetz:
        case l2.tsrange:
        case l2.tstzrange:
            return U1(e);
        default:
            return U1(e);
    }
}, U1 = (i)=>i, G1 = (i)=>{
    switch(i){
        case "t":
            return !0;
        case "f":
            return !1;
        default:
            return i;
    }
}, V1 = (i)=>{
    if (typeof i == "string") {
        let e = parseFloat(i);
        if (!Number.isNaN(e)) return e;
    }
    return i;
}, X1 = (i)=>{
    if (typeof i == "string") try {
        return JSON.parse(i);
    } catch (e) {
        return console.log(`JSON parse error: ${e}`), i;
    }
    return i;
}, Y = (i, e)=>{
    if (typeof i != "string") return i;
    let t = i.length - 1, n = i[t];
    if (i[0] === "{" && n === "}") {
        let r, o = i.slice(1, t);
        try {
            r = JSON.parse("[" + o + "]");
        } catch  {
            r = o ? o.split(",") : [];
        }
        return r.map((c)=>W2(e, c));
    }
    return i;
}, Q1 = (i)=>typeof i == "string" ? i.replace(" ", "T") : i;
var $1;
(function(i) {
    i.ALL = "*", i.INSERT = "INSERT", i.UPDATE = "UPDATE", i.DELETE = "DELETE";
})($1 || ($1 = {}));
var J1;
(function(i) {
    i.BROADCAST = "broadcast", i.PRESENCE = "presence", i.POSTGRES_CHANGES = "postgres_changes";
})(J1 || (J1 = {}));
var M2;
(function(i) {
    i.SUBSCRIBED = "SUBSCRIBED", i.TIMED_OUT = "TIMED_OUT", i.CLOSED = "CLOSED", i.CHANNEL_ERROR = "CHANNEL_ERROR";
})(M2 || (M2 = {}));
var w3 = class i {
    constructor(e, t = {
        config: {}
    }, n){
        this.topic = e, this.params = t, this.socket = n, this.bindings = {}, this.state = g2.closed, this.joinedOnce = !1, this.pushBuffer = [], this.subTopic = e.replace(/^realtime:/i, ""), this.params.config = Object.assign({
            broadcast: {
                ack: !1,
                self: !1
            },
            presence: {
                key: ""
            }
        }, t.config), this.timeout = this.socket.timeout, this.joinPush = new y4(this, R1.join, this.params, this.timeout), this.rejoinTimer = new T2(()=>this._rejoinUntilConnected(), this.socket.reconnectAfterMs), this.joinPush.receive("ok", ()=>{
            this.state = g2.joined, this.rejoinTimer.reset(), this.pushBuffer.forEach((s)=>s.send()), this.pushBuffer = [];
        }), this._onClose(()=>{
            this.rejoinTimer.reset(), this.socket.log("channel", `close ${this.topic} ${this._joinRef()}`), this.state = g2.closed, this.socket._remove(this);
        }), this._onError((s)=>{
            this._isLeaving() || this._isClosed() || (this.socket.log("channel", `error ${this.topic}`, s), this.state = g2.errored, this.rejoinTimer.scheduleTimeout());
        }), this.joinPush.receive("timeout", ()=>{
            this._isJoining() && (this.socket.log("channel", `timeout ${this.topic}`, this.joinPush.timeout), this.state = g2.errored, this.rejoinTimer.scheduleTimeout());
        }), this._on(R1.reply, {}, (s, r)=>{
            this._trigger(this._replyEventName(r), s);
        }), this.presence = new k2(this), this.broadcastEndpointURL = this._broadcastEndpointURL();
    }
    subscribe(e, t = this.timeout) {
        var n, s;
        if (this.socket.isConnected() || this.socket.connect(), this.joinedOnce) throw "tried to subscribe multiple times. 'subscribe' can only be called a single time per channel instance";
        {
            let { config: { broadcast: r, presence: o } } = this.params;
            this._onError((a)=>e && e("CHANNEL_ERROR", a)), this._onClose(()=>e && e("CLOSED"));
            let c = {}, h = {
                broadcast: r,
                presence: o,
                postgres_changes: (s = (n = this.bindings.postgres_changes) === null || n === void 0 ? void 0 : n.map((a)=>a.filter)) !== null && s !== void 0 ? s : []
            };
            this.socket.accessToken && (c.access_token = this.socket.accessToken), this.updateJoinPayload(Object.assign({
                config: h
            }, c)), this.joinedOnce = !0, this._rejoin(t), this.joinPush.receive("ok", ({ postgres_changes: a })=>{
                var m;
                if (this.socket.accessToken && this.socket.setAuth(this.socket.accessToken), a === void 0) {
                    e && e("SUBSCRIBED");
                    return;
                } else {
                    let p = this.bindings.postgres_changes, _ = (m = p?.length) !== null && m !== void 0 ? m : 0, d = [];
                    for(let f = 0; f < _; f++){
                        let v = p[f], { filter: { event: u, schema: E, table: C, filter: O } } = v, b = a && a[f];
                        if (b && b.event === u && b.schema === E && b.table === C && b.filter === O) d.push(Object.assign(Object.assign({}, v), {
                            id: b.id
                        }));
                        else {
                            this.unsubscribe(), e && e("CHANNEL_ERROR", new Error("mismatch between server and client bindings for postgres changes"));
                            return;
                        }
                    }
                    this.bindings.postgres_changes = d, e && e("SUBSCRIBED");
                    return;
                }
            }).receive("error", (a)=>{
                e && e("CHANNEL_ERROR", new Error(JSON.stringify(Object.values(a).join(", ") || "error")));
            }).receive("timeout", ()=>{
                e && e("TIMED_OUT");
            });
        }
        return this;
    }
    presenceState() {
        return this.presence.state;
    }
    async track(e, t = {}) {
        return await this.send({
            type: "presence",
            event: "track",
            payload: e
        }, t.timeout || this.timeout);
    }
    async untrack(e = {}) {
        return await this.send({
            type: "presence",
            event: "untrack"
        }, e);
    }
    on(e, t, n) {
        return this._on(e, t, n);
    }
    async send(e, t = {}) {
        var n, s;
        if (!this._canPush() && e.type === "broadcast") {
            let { event: r, payload: o } = e, c = {
                method: "POST",
                headers: {
                    apikey: (n = this.socket.accessToken) !== null && n !== void 0 ? n : "",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messages: [
                        {
                            topic: this.subTopic,
                            event: r,
                            payload: o
                        }
                    ]
                })
            };
            try {
                return (await this._fetchWithTimeout(this.broadcastEndpointURL, c, (s = t.timeout) !== null && s !== void 0 ? s : this.timeout)).ok ? "ok" : "error";
            } catch (h) {
                return h.name === "AbortError" ? "timed out" : "error";
            }
        } else return new Promise((r)=>{
            var o, c, h;
            let a = this._push(e.type, e, t.timeout || this.timeout);
            e.type === "broadcast" && !(!((h = (c = (o = this.params) === null || o === void 0 ? void 0 : o.config) === null || c === void 0 ? void 0 : c.broadcast) === null || h === void 0) && h.ack) && r("ok"), a.receive("ok", ()=>r("ok")), a.receive("timeout", ()=>r("timed out"));
        });
    }
    updateJoinPayload(e) {
        this.joinPush.updatePayload(e);
    }
    unsubscribe(e = this.timeout) {
        this.state = g2.leaving;
        let t = ()=>{
            this.socket.log("channel", `leave ${this.topic}`), this._trigger(R1.close, "leave", this._joinRef());
        };
        return this.rejoinTimer.reset(), this.joinPush.destroy(), new Promise((n)=>{
            let s = new y4(this, R1.leave, {}, e);
            s.receive("ok", ()=>{
                t(), n("ok");
            }).receive("timeout", ()=>{
                t(), n("timed out");
            }).receive("error", ()=>{
                n("error");
            }), s.send(), this._canPush() || s.trigger("ok", {});
        });
    }
    _broadcastEndpointURL() {
        let e = this.socket.endPoint;
        return e = e.replace(/^ws/i, "http"), e = e.replace(/(\/socket\/websocket|\/socket|\/websocket)\/?$/i, ""), e.replace(/\/+$/, "") + "/api/broadcast";
    }
    async _fetchWithTimeout(e, t, n) {
        let s = new AbortController, r = setTimeout(()=>s.abort(), n), o = await this.socket.fetch(e, Object.assign(Object.assign({}, t), {
            signal: s.signal
        }));
        return clearTimeout(r), o;
    }
    _push(e, t, n = this.timeout) {
        if (!this.joinedOnce) throw `tried to push '${e}' to '${this.topic}' before joining. Use channel.subscribe() before pushing events`;
        let s = new y4(this, e, t, n);
        return this._canPush() ? s.send() : (s.startTimeout(), this.pushBuffer.push(s)), s;
    }
    _onMessage(e, t, n) {
        return t;
    }
    _isMember(e) {
        return this.topic === e;
    }
    _joinRef() {
        return this.joinPush.ref;
    }
    _trigger(e, t, n) {
        var s, r;
        let o = e.toLocaleLowerCase(), { close: c, error: h, leave: a, join: m } = R1;
        if (n && [
            c,
            h,
            a,
            m
        ].indexOf(o) >= 0 && n !== this._joinRef()) return;
        let _ = this._onMessage(o, t, n);
        if (t && !_) throw "channel onMessage callbacks must return the payload, modified or unmodified";
        [
            "insert",
            "update",
            "delete"
        ].includes(o) ? (s = this.bindings.postgres_changes) === null || s === void 0 || s.filter((d)=>{
            var f, v, u;
            return ((f = d.filter) === null || f === void 0 ? void 0 : f.event) === "*" || ((u = (v = d.filter) === null || v === void 0 ? void 0 : v.event) === null || u === void 0 ? void 0 : u.toLocaleLowerCase()) === o;
        }).map((d)=>d.callback(_, n)) : (r = this.bindings[o]) === null || r === void 0 || r.filter((d)=>{
            var f, v, u, E, C, O;
            if ([
                "broadcast",
                "presence",
                "postgres_changes"
            ].includes(o)) if ("id" in d) {
                let b = d.id, D = (f = d.filter) === null || f === void 0 ? void 0 : f.event;
                return b && ((v = t.ids) === null || v === void 0 ? void 0 : v.includes(b)) && (D === "*" || D?.toLocaleLowerCase() === ((u = t.data) === null || u === void 0 ? void 0 : u.type.toLocaleLowerCase()));
            } else {
                let b = (C = (E = d?.filter) === null || E === void 0 ? void 0 : E.event) === null || C === void 0 ? void 0 : C.toLocaleLowerCase();
                return b === "*" || b === ((O = t?.event) === null || O === void 0 ? void 0 : O.toLocaleLowerCase());
            }
            else return d.type.toLocaleLowerCase() === o;
        }).map((d)=>{
            if (typeof _ == "object" && "ids" in _) {
                let f = _.data, { schema: v, table: u, commit_timestamp: E, type: C, errors: O } = f;
                _ = Object.assign(Object.assign({}, {
                    schema: v,
                    table: u,
                    commit_timestamp: E,
                    eventType: C,
                    new: {},
                    old: {},
                    errors: O
                }), this._getPayloadRecords(f));
            }
            d.callback(_, n);
        });
    }
    _isClosed() {
        return this.state === g2.closed;
    }
    _isJoined() {
        return this.state === g2.joined;
    }
    _isJoining() {
        return this.state === g2.joining;
    }
    _isLeaving() {
        return this.state === g2.leaving;
    }
    _replyEventName(e) {
        return `chan_reply_${e}`;
    }
    _on(e, t, n) {
        let s = e.toLocaleLowerCase(), r = {
            type: s,
            filter: t,
            callback: n
        };
        return this.bindings[s] ? this.bindings[s].push(r) : this.bindings[s] = [
            r
        ], this;
    }
    _off(e, t) {
        let n = e.toLocaleLowerCase();
        return this.bindings[n] = this.bindings[n].filter((s)=>{
            var r;
            return !(((r = s.type) === null || r === void 0 ? void 0 : r.toLocaleLowerCase()) === n && i.isEqual(s.filter, t));
        }), this;
    }
    static isEqual(e, t) {
        if (Object.keys(e).length !== Object.keys(t).length) return !1;
        for(let n in e)if (e[n] !== t[n]) return !1;
        return !0;
    }
    _rejoinUntilConnected() {
        this.rejoinTimer.scheduleTimeout(), this.socket.isConnected() && this._rejoin();
    }
    _onClose(e) {
        this._on(R1.close, {}, e);
    }
    _onError(e) {
        this._on(R1.error, {}, (t)=>e(t));
    }
    _canPush() {
        return this.socket.isConnected() && this._isJoined();
    }
    _rejoin(e = this.timeout) {
        this._isLeaving() || (this.socket._leaveOpenTopic(this.topic), this.state = g2.joining, this.joinPush.resend(e));
    }
    _getPayloadRecords(e) {
        let t = {
            new: {},
            old: {}
        };
        return (e.type === "INSERT" || e.type === "UPDATE") && (t.new = B2(e.columns, e.record)), (e.type === "UPDATE" || e.type === "DELETE") && (t.old = B2(e.columns, e.old_record)), t;
    }
};
var te = ()=>{}, A1 = class {
    constructor(e, t){
        var n;
        this.accessToken = null, this.channels = [], this.endPoint = "", this.headers = H1, this.params = {}, this.timeout = P1, this.transport = B1, this.heartbeatIntervalMs = 3e4, this.heartbeatTimer = void 0, this.pendingHeartbeatRef = null, this.ref = 0, this.logger = te, this.conn = null, this.sendBuffer = [], this.serializer = new x3, this.stateChangeCallbacks = {
            open: [],
            close: [],
            error: [],
            message: []
        }, this._resolveFetch = (r)=>{
            let o;
            return r ? o = r : typeof fetch > "u" ? o = (...c)=>import("/v135/@supabase/node-fetch@2.6.14/denonext/node-fetch.mjs").then(({ default: h })=>h(...c)) : o = fetch, (...c)=>o(...c);
        }, this.endPoint = `${e}/${S2.websocket}`, t?.params && (this.params = t.params), t?.headers && (this.headers = Object.assign(Object.assign({}, this.headers), t.headers)), t?.timeout && (this.timeout = t.timeout), t?.logger && (this.logger = t.logger), t?.transport && (this.transport = t.transport), t?.heartbeatIntervalMs && (this.heartbeatIntervalMs = t.heartbeatIntervalMs);
        let s = (n = t?.params) === null || n === void 0 ? void 0 : n.apikey;
        s && (this.accessToken = s), this.reconnectAfterMs = t?.reconnectAfterMs ? t.reconnectAfterMs : (r)=>[
                1e3,
                2e3,
                5e3,
                1e4
            ][r - 1] || 1e4, this.encode = t?.encode ? t.encode : (r, o)=>o(JSON.stringify(r)), this.decode = t?.decode ? t.decode : this.serializer.decode.bind(this.serializer), this.reconnectTimer = new T2(async ()=>{
            this.disconnect(), this.connect();
        }, this.reconnectAfterMs), this.fetch = this._resolveFetch(t?.fetch);
    }
    connect() {
        this.conn || (this.conn = new this.transport(this._endPointURL(), [], null, this.headers), this.conn && (this.conn.binaryType = "arraybuffer", this.conn.onopen = ()=>this._onConnOpen(), this.conn.onerror = (e)=>this._onConnError(e), this.conn.onmessage = (e)=>this._onConnMessage(e), this.conn.onclose = (e)=>this._onConnClose(e)));
    }
    disconnect(e, t) {
        this.conn && (this.conn.onclose = function() {}, e ? this.conn.close(e, t ?? "") : this.conn.close(), this.conn = null, this.heartbeatTimer && clearInterval(this.heartbeatTimer), this.reconnectTimer.reset());
    }
    getChannels() {
        return this.channels;
    }
    async removeChannel(e) {
        let t = await e.unsubscribe();
        return this.channels.length === 0 && this.disconnect(), t;
    }
    async removeAllChannels() {
        let e = await Promise.all(this.channels.map((t)=>t.unsubscribe()));
        return this.disconnect(), e;
    }
    log(e, t, n) {
        this.logger(e, t, n);
    }
    connectionState() {
        switch(this.conn && this.conn.readyState){
            case L2.connecting:
                return j2.Connecting;
            case L2.open:
                return j2.Open;
            case L2.closing:
                return j2.Closing;
            default:
                return j2.Closed;
        }
    }
    isConnected() {
        return this.connectionState() === j2.Open;
    }
    channel(e, t = {
        config: {}
    }) {
        let n = new w3(`realtime:${e}`, t, this);
        return this.channels.push(n), n;
    }
    push(e) {
        let { topic: t, event: n, payload: s, ref: r } = e, o = ()=>{
            this.encode(e, (c)=>{
                var h;
                (h = this.conn) === null || h === void 0 || h.send(c);
            });
        };
        this.log("push", `${t} ${n} (${r})`, s), this.isConnected() ? o() : this.sendBuffer.push(o);
    }
    setAuth(e) {
        this.accessToken = e, this.channels.forEach((t)=>{
            e && t.updateJoinPayload({
                access_token: e
            }), t.joinedOnce && t._isJoined() && t._push(R1.access_token, {
                access_token: e
            });
        });
    }
    _makeRef() {
        let e = this.ref + 1;
        return e === this.ref ? this.ref = 0 : this.ref = e, this.ref.toString();
    }
    _leaveOpenTopic(e) {
        let t = this.channels.find((n)=>n.topic === e && (n._isJoined() || n._isJoining()));
        t && (this.log("transport", `leaving duplicate topic "${e}"`), t.unsubscribe());
    }
    _remove(e) {
        this.channels = this.channels.filter((t)=>t._joinRef() !== e._joinRef());
    }
    _endPointURL() {
        return this._appendParams(this.endPoint, Object.assign({}, this.params, {
            vsn: z2
        }));
    }
    _onConnMessage(e) {
        this.decode(e.data, (t)=>{
            let { topic: n, event: s, payload: r, ref: o } = t;
            (o && o === this.pendingHeartbeatRef || s === r?.type) && (this.pendingHeartbeatRef = null), this.log("receive", `${r.status || ""} ${n} ${s} ${o && "(" + o + ")" || ""}`, r), this.channels.filter((c)=>c._isMember(n)).forEach((c)=>c._trigger(s, r, o)), this.stateChangeCallbacks.message.forEach((c)=>c(t));
        });
    }
    _onConnOpen() {
        this.log("transport", `connected to ${this._endPointURL()}`), this._flushSendBuffer(), this.reconnectTimer.reset(), this.heartbeatTimer && clearInterval(this.heartbeatTimer), this.heartbeatTimer = setInterval(()=>this._sendHeartbeat(), this.heartbeatIntervalMs), this.stateChangeCallbacks.open.forEach((e)=>e());
    }
    _onConnClose(e) {
        this.log("transport", "close", e), this._triggerChanError(), this.heartbeatTimer && clearInterval(this.heartbeatTimer), this.reconnectTimer.scheduleTimeout(), this.stateChangeCallbacks.close.forEach((t)=>t(e));
    }
    _onConnError(e) {
        this.log("transport", e.message), this._triggerChanError(), this.stateChangeCallbacks.error.forEach((t)=>t(e));
    }
    _triggerChanError() {
        this.channels.forEach((e)=>e._trigger(R1.error));
    }
    _appendParams(e, t) {
        if (Object.keys(t).length === 0) return e;
        let n = e.match(/\?/) ? "&" : "?", s = new URLSearchParams(t);
        return `${e}${n}${s}`;
    }
    _flushSendBuffer() {
        this.isConnected() && this.sendBuffer.length > 0 && (this.sendBuffer.forEach((e)=>e()), this.sendBuffer = []);
    }
    _sendHeartbeat() {
        var e;
        if (this.isConnected()) {
            if (this.pendingHeartbeatRef) {
                this.pendingHeartbeatRef = null, this.log("transport", "heartbeat timeout. Attempting to re-establish connection"), (e = this.conn) === null || e === void 0 || e.close(F3, "hearbeat timeout");
                return;
            }
            this.pendingHeartbeatRef = this._makeRef(), this.push({
                topic: "phoenix",
                event: "heartbeat",
                payload: {},
                ref: this.pendingHeartbeatRef
            }), this.setAuth(this.accessToken);
        }
    }
};
var __global$ = globalThis || (typeof window !== "undefined" ? window : self);
var w4 = Object.create;
var u2 = Object.defineProperty;
var R2 = Object.getOwnPropertyDescriptor;
var g3 = Object.getOwnPropertyNames;
var h3 = Object.getPrototypeOf, m4 = Object.prototype.hasOwnProperty;
var x4 = (t, e)=>()=>(e || t((e = {
            exports: {}
        }).exports, e), e.exports), q2 = (t, e)=>{
    for(var o in e)u2(t, o, {
        get: e[o],
        enumerable: !0
    });
}, l3 = (t, e, o, i)=>{
    if (e && typeof e == "object" || typeof e == "function") for (let d of g3(e))!m4.call(t, d) && d !== o && u2(t, d, {
        get: ()=>e[d],
        enumerable: !(i = R2(e, d)) || i.enumerable
    });
    return t;
}, f2 = (t, e, o)=>(l3(t, e, "default"), o && l3(o, e, "default")), c2 = (t, e, o)=>(o = t != null ? w4(h3(t)) : {}, l3(e || !t || !t.__esModule ? u2(o, "default", {
        value: t,
        enumerable: !0
    }) : o, t));
var a1 = x4((s, p)=>{
    "use strict";
    var y = function() {
        if (typeof self < "u") return self;
        if (typeof window < "u") return window;
        if (typeof __global$ < "u") return __global$;
        throw new Error("unable to locate global object");
    }, n = y();
    p.exports = s = n.fetch;
    n.fetch && (s.default = n.fetch.bind(n));
    s.Headers = n.Headers;
    s.Request = n.Request;
    s.Response = n.Response;
});
var r1 = {};
q2(r1, {
    FetchError: ()=>F4,
    Headers: ()=>j3,
    Request: ()=>v2,
    Response: ()=>E2,
    __esModule: ()=>H2,
    default: ()=>M3
});
var _2 = c2(a1());
f2(r1, c2(a1()));
var { __esModule: H2, Headers: j3, Request: v2, Response: E2, FetchError: F4 } = _2, { default: b2, ...G2 } = _2, M3 = b2 !== void 0 ? b2 : G2;
var u3 = class {
    constructor(e){
        this.shouldThrowOnError = !1, this.method = e.method, this.url = e.url, this.headers = e.headers, this.schema = e.schema, this.body = e.body, this.shouldThrowOnError = e.shouldThrowOnError, this.signal = e.signal, this.isMaybeSingle = e.isMaybeSingle, e.fetch ? this.fetch = e.fetch : typeof fetch > "u" ? this.fetch = M3 : this.fetch = fetch;
    }
    throwOnError() {
        return this.shouldThrowOnError = !0, this;
    }
    then(e, s) {
        this.schema === void 0 || ([
            "GET",
            "HEAD"
        ].includes(this.method) ? this.headers["Accept-Profile"] = this.schema : this.headers["Content-Profile"] = this.schema), this.method !== "GET" && this.method !== "HEAD" && (this.headers["Content-Type"] = "application/json");
        let i = this.fetch, r = i(this.url.toString(), {
            method: this.method,
            headers: this.headers,
            body: JSON.stringify(this.body),
            signal: this.signal
        }).then(async (t)=>{
            var h, a, l;
            let n = null, o = null, A = null, m = t.status, P = t.statusText;
            if (t.ok) {
                if (this.method !== "HEAD") {
                    let y = await t.text();
                    y === "" || (this.headers.Accept === "text/csv" || this.headers.Accept && this.headers.Accept.includes("application/vnd.pgrst.plan+text") ? o = y : o = JSON.parse(y));
                }
                let $ = (h = this.headers.Prefer) === null || h === void 0 ? void 0 : h.match(/count=(exact|planned|estimated)/), g = (a = t.headers.get("content-range")) === null || a === void 0 ? void 0 : a.split("/");
                $ && g && g.length > 1 && (A = parseInt(g[1])), this.isMaybeSingle && this.method === "GET" && Array.isArray(o) && (o.length > 1 ? (n = {
                    code: "PGRST116",
                    details: `Results contain ${o.length} rows, application/vnd.pgrst.object+json requires 1 row`,
                    hint: null,
                    message: "JSON object requested, multiple (or no) rows returned"
                }, o = null, A = null, m = 406, P = "Not Acceptable") : o.length === 1 ? o = o[0] : o = null);
            } else {
                let $ = await t.text();
                try {
                    n = JSON.parse($), Array.isArray(n) && t.status === 404 && (o = [], n = null, m = 200, P = "OK");
                } catch  {
                    t.status === 404 && $ === "" ? (m = 204, P = "No Content") : n = {
                        message: $
                    };
                }
                if (n && this.isMaybeSingle && !((l = n?.details) === null || l === void 0) && l.includes("0 rows") && (n = null, m = 200, P = "OK"), n && this.shouldThrowOnError) throw n;
            }
            return {
                error: n,
                data: o,
                count: A,
                status: m,
                statusText: P
            };
        });
        return this.shouldThrowOnError || (r = r.catch((t)=>{
            var h, a, l;
            return {
                error: {
                    message: `${(h = t?.name) !== null && h !== void 0 ? h : "FetchError"}: ${t?.message}`,
                    details: `${(a = t?.stack) !== null && a !== void 0 ? a : ""}`,
                    hint: "",
                    code: `${(l = t?.code) !== null && l !== void 0 ? l : ""}`
                },
                data: null,
                count: null,
                status: 0,
                statusText: ""
            };
        })), r.then(e, s);
    }
};
var d1 = class extends u3 {
    select(e) {
        let s = !1, i = (e ?? "*").split("").map((r)=>/\s/.test(r) && !s ? "" : (r === '"' && (s = !s), r)).join("");
        return this.url.searchParams.set("select", i), this.headers.Prefer && (this.headers.Prefer += ","), this.headers.Prefer += "return=representation", this;
    }
    order(e, { ascending: s = !0, nullsFirst: i, foreignTable: r, referencedTable: t = r } = {}) {
        let h = t ? `${t}.order` : "order", a = this.url.searchParams.get(h);
        return this.url.searchParams.set(h, `${a ? `${a},` : ""}${e}.${s ? "asc" : "desc"}${i === void 0 ? "" : i ? ".nullsfirst" : ".nullslast"}`), this;
    }
    limit(e, { foreignTable: s, referencedTable: i = s } = {}) {
        let r = typeof i > "u" ? "limit" : `${i}.limit`;
        return this.url.searchParams.set(r, `${e}`), this;
    }
    range(e, s, { foreignTable: i, referencedTable: r = i } = {}) {
        let t = typeof r > "u" ? "offset" : `${r}.offset`, h = typeof r > "u" ? "limit" : `${r}.limit`;
        return this.url.searchParams.set(t, `${e}`), this.url.searchParams.set(h, `${s - e + 1}`), this;
    }
    abortSignal(e) {
        return this.signal = e, this;
    }
    single() {
        return this.headers.Accept = "application/vnd.pgrst.object+json", this;
    }
    maybeSingle() {
        return this.method === "GET" ? this.headers.Accept = "application/json" : this.headers.Accept = "application/vnd.pgrst.object+json", this.isMaybeSingle = !0, this;
    }
    csv() {
        return this.headers.Accept = "text/csv", this;
    }
    geojson() {
        return this.headers.Accept = "application/geo+json", this;
    }
    explain({ analyze: e = !1, verbose: s = !1, settings: i = !1, buffers: r = !1, wal: t = !1, format: h = "text" } = {}) {
        var a;
        let l = [
            e ? "analyze" : null,
            s ? "verbose" : null,
            i ? "settings" : null,
            r ? "buffers" : null,
            t ? "wal" : null
        ].filter(Boolean).join("|"), n = (a = this.headers.Accept) !== null && a !== void 0 ? a : "application/json";
        return this.headers.Accept = `application/vnd.pgrst.plan+${h}; for="${n}"; options=${l};`, h === "json" ? this : this;
    }
    rollback() {
        var e;
        return ((e = this.headers.Prefer) !== null && e !== void 0 ? e : "").trim().length > 0 ? this.headers.Prefer += ",tx=rollback" : this.headers.Prefer = "tx=rollback", this;
    }
    returns() {
        return this;
    }
};
var c3 = class extends d1 {
    eq(e, s) {
        return this.url.searchParams.append(e, `eq.${s}`), this;
    }
    neq(e, s) {
        return this.url.searchParams.append(e, `neq.${s}`), this;
    }
    gt(e, s) {
        return this.url.searchParams.append(e, `gt.${s}`), this;
    }
    gte(e, s) {
        return this.url.searchParams.append(e, `gte.${s}`), this;
    }
    lt(e, s) {
        return this.url.searchParams.append(e, `lt.${s}`), this;
    }
    lte(e, s) {
        return this.url.searchParams.append(e, `lte.${s}`), this;
    }
    like(e, s) {
        return this.url.searchParams.append(e, `like.${s}`), this;
    }
    likeAllOf(e, s) {
        return this.url.searchParams.append(e, `like(all).{${s.join(",")}}`), this;
    }
    likeAnyOf(e, s) {
        return this.url.searchParams.append(e, `like(any).{${s.join(",")}}`), this;
    }
    ilike(e, s) {
        return this.url.searchParams.append(e, `ilike.${s}`), this;
    }
    ilikeAllOf(e, s) {
        return this.url.searchParams.append(e, `ilike(all).{${s.join(",")}}`), this;
    }
    ilikeAnyOf(e, s) {
        return this.url.searchParams.append(e, `ilike(any).{${s.join(",")}}`), this;
    }
    is(e, s) {
        return this.url.searchParams.append(e, `is.${s}`), this;
    }
    in(e, s) {
        let i = s.map((r)=>typeof r == "string" && new RegExp("[,()]").test(r) ? `"${r}"` : `${r}`).join(",");
        return this.url.searchParams.append(e, `in.(${i})`), this;
    }
    contains(e, s) {
        return typeof s == "string" ? this.url.searchParams.append(e, `cs.${s}`) : Array.isArray(s) ? this.url.searchParams.append(e, `cs.{${s.join(",")}}`) : this.url.searchParams.append(e, `cs.${JSON.stringify(s)}`), this;
    }
    containedBy(e, s) {
        return typeof s == "string" ? this.url.searchParams.append(e, `cd.${s}`) : Array.isArray(s) ? this.url.searchParams.append(e, `cd.{${s.join(",")}}`) : this.url.searchParams.append(e, `cd.${JSON.stringify(s)}`), this;
    }
    rangeGt(e, s) {
        return this.url.searchParams.append(e, `sr.${s}`), this;
    }
    rangeGte(e, s) {
        return this.url.searchParams.append(e, `nxl.${s}`), this;
    }
    rangeLt(e, s) {
        return this.url.searchParams.append(e, `sl.${s}`), this;
    }
    rangeLte(e, s) {
        return this.url.searchParams.append(e, `nxr.${s}`), this;
    }
    rangeAdjacent(e, s) {
        return this.url.searchParams.append(e, `adj.${s}`), this;
    }
    overlaps(e, s) {
        return typeof s == "string" ? this.url.searchParams.append(e, `ov.${s}`) : this.url.searchParams.append(e, `ov.{${s.join(",")}}`), this;
    }
    textSearch(e, s, { config: i, type: r } = {}) {
        let t = "";
        r === "plain" ? t = "pl" : r === "phrase" ? t = "ph" : r === "websearch" && (t = "w");
        let h = i === void 0 ? "" : `(${i})`;
        return this.url.searchParams.append(e, `${t}fts${h}.${s}`), this;
    }
    match(e) {
        return Object.entries(e).forEach(([s, i])=>{
            this.url.searchParams.append(s, `eq.${i}`);
        }), this;
    }
    not(e, s, i) {
        return this.url.searchParams.append(e, `not.${s}.${i}`), this;
    }
    or(e, { foreignTable: s, referencedTable: i = s } = {}) {
        let r = i ? `${i}.or` : "or";
        return this.url.searchParams.append(r, `(${e})`), this;
    }
    filter(e, s, i) {
        return this.url.searchParams.append(e, `${s}.${i}`), this;
    }
};
var p3 = class {
    constructor(e, { headers: s = {}, schema: i, fetch: r }){
        this.url = e, this.headers = s, this.schema = i, this.fetch = r;
    }
    select(e, { head: s = !1, count: i } = {}) {
        let r = s ? "HEAD" : "GET", t = !1, h = (e ?? "*").split("").map((a)=>/\s/.test(a) && !t ? "" : (a === '"' && (t = !t), a)).join("");
        return this.url.searchParams.set("select", h), i && (this.headers.Prefer = `count=${i}`), new c3({
            method: r,
            url: this.url,
            headers: this.headers,
            schema: this.schema,
            fetch: this.fetch,
            allowEmpty: !1
        });
    }
    insert(e, { count: s, defaultToNull: i = !0 } = {}) {
        let r = "POST", t = [];
        if (this.headers.Prefer && t.push(this.headers.Prefer), s && t.push(`count=${s}`), i || t.push("missing=default"), this.headers.Prefer = t.join(","), Array.isArray(e)) {
            let h = e.reduce((a, l)=>a.concat(Object.keys(l)), []);
            if (h.length > 0) {
                let a = [
                    ...new Set(h)
                ].map((l)=>`"${l}"`);
                this.url.searchParams.set("columns", a.join(","));
            }
        }
        return new c3({
            method: r,
            url: this.url,
            headers: this.headers,
            schema: this.schema,
            body: e,
            fetch: this.fetch,
            allowEmpty: !1
        });
    }
    upsert(e, { onConflict: s, ignoreDuplicates: i = !1, count: r, defaultToNull: t = !0 } = {}) {
        let h = "POST", a = [
            `resolution=${i ? "ignore" : "merge"}-duplicates`
        ];
        if (s !== void 0 && this.url.searchParams.set("on_conflict", s), this.headers.Prefer && a.push(this.headers.Prefer), r && a.push(`count=${r}`), t || a.push("missing=default"), this.headers.Prefer = a.join(","), Array.isArray(e)) {
            let l = e.reduce((n, o)=>n.concat(Object.keys(o)), []);
            if (l.length > 0) {
                let n = [
                    ...new Set(l)
                ].map((o)=>`"${o}"`);
                this.url.searchParams.set("columns", n.join(","));
            }
        }
        return new c3({
            method: h,
            url: this.url,
            headers: this.headers,
            schema: this.schema,
            body: e,
            fetch: this.fetch,
            allowEmpty: !1
        });
    }
    update(e, { count: s } = {}) {
        let i = "PATCH", r = [];
        return this.headers.Prefer && r.push(this.headers.Prefer), s && r.push(`count=${s}`), this.headers.Prefer = r.join(","), new c3({
            method: i,
            url: this.url,
            headers: this.headers,
            schema: this.schema,
            body: e,
            fetch: this.fetch,
            allowEmpty: !1
        });
    }
    delete({ count: e } = {}) {
        let s = "DELETE", i = [];
        return e && i.push(`count=${e}`), this.headers.Prefer && i.unshift(this.headers.Prefer), this.headers.Prefer = i.join(","), new c3({
            method: s,
            url: this.url,
            headers: this.headers,
            schema: this.schema,
            fetch: this.fetch,
            allowEmpty: !1
        });
    }
};
var w5 = "1.9.0";
var x5 = {
    "X-Client-Info": `postgrest-js/${w5}`
};
var j4 = class f {
    constructor(e, { headers: s = {}, schema: i, fetch: r } = {}){
        this.url = e, this.headers = Object.assign(Object.assign({}, x5), s), this.schemaName = i, this.fetch = r;
    }
    from(e) {
        let s = new URL(`${this.url}/${e}`);
        return new p3(s, {
            headers: Object.assign({}, this.headers),
            schema: this.schemaName,
            fetch: this.fetch
        });
    }
    schema(e) {
        return new f(this.url, {
            headers: this.headers,
            schema: e,
            fetch: this.fetch
        });
    }
    rpc(e, s = {}, { head: i = !1, count: r } = {}) {
        let t, h = new URL(`${this.url}/rpc/${e}`), a;
        i ? (t = "HEAD", Object.entries(s).forEach(([n, o])=>{
            h.searchParams.append(n, `${o}`);
        })) : (t = "POST", a = s);
        let l = Object.assign({}, this.headers);
        return r && (l.Prefer = `count=${r}`), new c3({
            method: t,
            url: h,
            headers: l,
            schema: this.schemaName,
            body: a,
            fetch: this.fetch,
            allowEmpty: !1
        });
    }
};
var m5 = class extends Error {
    constructor(e){
        super(e), this.__isStorageError = !0, this.name = "StorageError";
    }
};
function l4(i) {
    return typeof i == "object" && i !== null && "__isStorageError" in i;
}
var $2 = class extends m5 {
    constructor(e, t){
        super(e), this.name = "StorageApiError", this.status = t;
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status
        };
    }
}, w6 = class extends m5 {
    constructor(e, t){
        super(e), this.name = "StorageUnknownError", this.originalError = t;
    }
};
var P2 = function(i, e, t, r) {
    function o(n) {
        return n instanceof t ? n : new t(function(a) {
            a(n);
        });
    }
    return new (t || (t = Promise))(function(n, a) {
        function d(s) {
            try {
                u(r.next(s));
            } catch (h) {
                a(h);
            }
        }
        function c(s) {
            try {
                u(r.throw(s));
            } catch (h) {
                a(h);
            }
        }
        function u(s) {
            s.done ? n(s.value) : o(s.value).then(d, c);
        }
        u((r = r.apply(i, e || [])).next());
    });
}, x6 = (i)=>{
    let e;
    return i ? e = i : typeof fetch > "u" ? e = (...t)=>import("/v135/@supabase/node-fetch@2.6.14/denonext/node-fetch.mjs").then(({ default: r })=>r(...t)) : e = fetch, (...t)=>e(...t);
}, E3 = ()=>P2(void 0, void 0, void 0, function*() {
        return typeof Response > "u" ? (yield import("/v135/@supabase/node-fetch@2.6.14/denonext/node-fetch.mjs")).Response : Response;
    });
var v3 = function(i, e, t, r) {
    function o(n) {
        return n instanceof t ? n : new t(function(a) {
            a(n);
        });
    }
    return new (t || (t = Promise))(function(n, a) {
        function d(s) {
            try {
                u(r.next(s));
            } catch (h) {
                a(h);
            }
        }
        function c(s) {
            try {
                u(r.throw(s));
            } catch (h) {
                a(h);
            }
        }
        function u(s) {
            s.done ? n(s.value) : o(s.value).then(d, c);
        }
        u((r = r.apply(i, e || [])).next());
    });
}, O2 = (i)=>i.msg || i.message || i.error_description || i.error || JSON.stringify(i), I3 = (i, e)=>v3(void 0, void 0, void 0, function*() {
        let t = yield E3();
        i instanceof t ? i.json().then((r)=>{
            e(new $2(O2(r), i.status || 500));
        }).catch((r)=>{
            e(new w6(O2(r), r));
        }) : e(new w6(O2(i), i));
    }), C2 = (i, e, t, r)=>{
    let o = {
        method: i,
        headers: e?.headers || {}
    };
    return i === "GET" ? o : (o.headers = Object.assign({
        "Content-Type": "application/json"
    }, e?.headers), o.body = JSON.stringify(r), Object.assign(Object.assign({}, o), t));
};
function j5(i, e, t, r, o, n) {
    return v3(this, void 0, void 0, function*() {
        return new Promise((a, d)=>{
            i(t, C2(e, r, o, n)).then((c)=>{
                if (!c.ok) throw c;
                return r?.noResolveJson ? c : c.json();
            }).then((c)=>a(c)).catch((c)=>I3(c, d));
        });
    });
}
function g4(i, e, t, r) {
    return v3(this, void 0, void 0, function*() {
        return j5(i, "GET", e, t, r);
    });
}
function p4(i, e, t, r, o) {
    return v3(this, void 0, void 0, function*() {
        return j5(i, "POST", e, r, o, t);
    });
}
function T3(i, e, t, r, o) {
    return v3(this, void 0, void 0, function*() {
        return j5(i, "PUT", e, r, o, t);
    });
}
function S3(i, e, t, r, o) {
    return v3(this, void 0, void 0, function*() {
        return j5(i, "DELETE", e, r, o, t);
    });
}
var f3 = function(i, e, t, r) {
    function o(n) {
        return n instanceof t ? n : new t(function(a) {
            a(n);
        });
    }
    return new (t || (t = Promise))(function(n, a) {
        function d(s) {
            try {
                u(r.next(s));
            } catch (h) {
                a(h);
            }
        }
        function c(s) {
            try {
                u(r.throw(s));
            } catch (h) {
                a(h);
            }
        }
        function u(s) {
            s.done ? n(s.value) : o(s.value).then(d, c);
        }
        u((r = r.apply(i, e || [])).next());
    });
}, D2 = {
    limit: 100,
    offset: 0,
    sortBy: {
        column: "name",
        order: "asc"
    }
}, k3 = {
    cacheControl: "3600",
    contentType: "text/plain;charset=UTF-8",
    upsert: !1
}, b3 = class {
    constructor(e, t = {}, r, o){
        this.url = e, this.headers = t, this.bucketId = r, this.fetch = x6(o);
    }
    uploadOrUpdate(e, t, r, o) {
        return f3(this, void 0, void 0, function*() {
            try {
                let n, a = Object.assign(Object.assign({}, k3), o), d = Object.assign(Object.assign({}, this.headers), e === "POST" && {
                    "x-upsert": String(a.upsert)
                });
                typeof Blob < "u" && r instanceof Blob ? (n = new FormData, n.append("cacheControl", a.cacheControl), n.append("", r)) : typeof FormData < "u" && r instanceof FormData ? (n = r, n.append("cacheControl", a.cacheControl)) : (n = r, d["cache-control"] = `max-age=${a.cacheControl}`, d["content-type"] = a.contentType);
                let c = this._removeEmptyFolders(t), u = this._getFinalPath(c), s = yield this.fetch(`${this.url}/object/${u}`, Object.assign({
                    method: e,
                    body: n,
                    headers: d
                }, a?.duplex ? {
                    duplex: a.duplex
                } : {}));
                return s.ok ? {
                    data: {
                        path: c
                    },
                    error: null
                } : {
                    data: null,
                    error: yield s.json()
                };
            } catch (n) {
                if (l4(n)) return {
                    data: null,
                    error: n
                };
                throw n;
            }
        });
    }
    upload(e, t, r) {
        return f3(this, void 0, void 0, function*() {
            return this.uploadOrUpdate("POST", e, t, r);
        });
    }
    uploadToSignedUrl(e, t, r, o) {
        return f3(this, void 0, void 0, function*() {
            let n = this._removeEmptyFolders(e), a = this._getFinalPath(n), d = new URL(this.url + `/object/upload/sign/${a}`);
            d.searchParams.set("token", t);
            try {
                let c, u = Object.assign({
                    upsert: k3.upsert
                }, o), s = Object.assign(Object.assign({}, this.headers), {
                    "x-upsert": String(u.upsert)
                });
                typeof Blob < "u" && r instanceof Blob ? (c = new FormData, c.append("cacheControl", u.cacheControl), c.append("", r)) : typeof FormData < "u" && r instanceof FormData ? (c = r, c.append("cacheControl", u.cacheControl)) : (c = r, s["cache-control"] = `max-age=${u.cacheControl}`, s["content-type"] = u.contentType);
                let h = yield this.fetch(d.toString(), {
                    method: "PUT",
                    body: c,
                    headers: s
                });
                return h.ok ? {
                    data: {
                        path: n
                    },
                    error: null
                } : {
                    data: null,
                    error: yield h.json()
                };
            } catch (c) {
                if (l4(c)) return {
                    data: null,
                    error: c
                };
                throw c;
            }
        });
    }
    createSignedUploadUrl(e) {
        return f3(this, void 0, void 0, function*() {
            try {
                let t = this._getFinalPath(e), r = yield p4(this.fetch, `${this.url}/object/upload/sign/${t}`, {}, {
                    headers: this.headers
                }), o = new URL(this.url + r.url), n = o.searchParams.get("token");
                if (!n) throw new m5("No token returned by API");
                return {
                    data: {
                        signedUrl: o.toString(),
                        path: e,
                        token: n
                    },
                    error: null
                };
            } catch (t) {
                if (l4(t)) return {
                    data: null,
                    error: t
                };
                throw t;
            }
        });
    }
    update(e, t, r) {
        return f3(this, void 0, void 0, function*() {
            return this.uploadOrUpdate("PUT", e, t, r);
        });
    }
    move(e, t) {
        return f3(this, void 0, void 0, function*() {
            try {
                return {
                    data: yield p4(this.fetch, `${this.url}/object/move`, {
                        bucketId: this.bucketId,
                        sourceKey: e,
                        destinationKey: t
                    }, {
                        headers: this.headers
                    }),
                    error: null
                };
            } catch (r) {
                if (l4(r)) return {
                    data: null,
                    error: r
                };
                throw r;
            }
        });
    }
    copy(e, t) {
        return f3(this, void 0, void 0, function*() {
            try {
                return {
                    data: {
                        path: (yield p4(this.fetch, `${this.url}/object/copy`, {
                            bucketId: this.bucketId,
                            sourceKey: e,
                            destinationKey: t
                        }, {
                            headers: this.headers
                        })).Key
                    },
                    error: null
                };
            } catch (r) {
                if (l4(r)) return {
                    data: null,
                    error: r
                };
                throw r;
            }
        });
    }
    createSignedUrl(e, t, r) {
        return f3(this, void 0, void 0, function*() {
            try {
                let o = this._getFinalPath(e), n = yield p4(this.fetch, `${this.url}/object/sign/${o}`, Object.assign({
                    expiresIn: t
                }, r?.transform ? {
                    transform: r.transform
                } : {}), {
                    headers: this.headers
                }), a = r?.download ? `&download=${r.download === !0 ? "" : r.download}` : "";
                return n = {
                    signedUrl: encodeURI(`${this.url}${n.signedURL}${a}`)
                }, {
                    data: n,
                    error: null
                };
            } catch (o) {
                if (l4(o)) return {
                    data: null,
                    error: o
                };
                throw o;
            }
        });
    }
    createSignedUrls(e, t, r) {
        return f3(this, void 0, void 0, function*() {
            try {
                let o = yield p4(this.fetch, `${this.url}/object/sign/${this.bucketId}`, {
                    expiresIn: t,
                    paths: e
                }, {
                    headers: this.headers
                }), n = r?.download ? `&download=${r.download === !0 ? "" : r.download}` : "";
                return {
                    data: o.map((a)=>Object.assign(Object.assign({}, a), {
                            signedUrl: a.signedURL ? encodeURI(`${this.url}${a.signedURL}${n}`) : null
                        })),
                    error: null
                };
            } catch (o) {
                if (l4(o)) return {
                    data: null,
                    error: o
                };
                throw o;
            }
        });
    }
    download(e, t) {
        return f3(this, void 0, void 0, function*() {
            let o = typeof t?.transform < "u" ? "render/image/authenticated" : "object", n = this.transformOptsToQueryString(t?.transform || {}), a = n ? `?${n}` : "";
            try {
                let d = this._getFinalPath(e);
                return {
                    data: yield (yield g4(this.fetch, `${this.url}/${o}/${d}${a}`, {
                        headers: this.headers,
                        noResolveJson: !0
                    })).blob(),
                    error: null
                };
            } catch (d) {
                if (l4(d)) return {
                    data: null,
                    error: d
                };
                throw d;
            }
        });
    }
    getPublicUrl(e, t) {
        let r = this._getFinalPath(e), o = [], n = t?.download ? `download=${t.download === !0 ? "" : t.download}` : "";
        n !== "" && o.push(n);
        let d = typeof t?.transform < "u" ? "render/image" : "object", c = this.transformOptsToQueryString(t?.transform || {});
        c !== "" && o.push(c);
        let u = o.join("&");
        return u !== "" && (u = `?${u}`), {
            data: {
                publicUrl: encodeURI(`${this.url}/${d}/public/${r}${u}`)
            }
        };
    }
    remove(e) {
        return f3(this, void 0, void 0, function*() {
            try {
                return {
                    data: yield S3(this.fetch, `${this.url}/object/${this.bucketId}`, {
                        prefixes: e
                    }, {
                        headers: this.headers
                    }),
                    error: null
                };
            } catch (t) {
                if (l4(t)) return {
                    data: null,
                    error: t
                };
                throw t;
            }
        });
    }
    list(e, t, r) {
        return f3(this, void 0, void 0, function*() {
            try {
                let o = Object.assign(Object.assign(Object.assign({}, D2), t), {
                    prefix: e || ""
                });
                return {
                    data: yield p4(this.fetch, `${this.url}/object/list/${this.bucketId}`, o, {
                        headers: this.headers
                    }, r),
                    error: null
                };
            } catch (o) {
                if (l4(o)) return {
                    data: null,
                    error: o
                };
                throw o;
            }
        });
    }
    _getFinalPath(e) {
        return `${this.bucketId}/${e}`;
    }
    _removeEmptyFolders(e) {
        return e.replace(/^\/|\/$/g, "").replace(/\/+/g, "/");
    }
    transformOptsToQueryString(e) {
        let t = [];
        return e.width && t.push(`width=${e.width}`), e.height && t.push(`height=${e.height}`), e.resize && t.push(`resize=${e.resize}`), e.format && t.push(`format=${e.format}`), e.quality && t.push(`quality=${e.quality}`), t.join("&");
    }
};
var F5 = "2.5.4";
var R3 = {
    "X-Client-Info": `storage-js/${F5}`
};
var y5 = function(i, e, t, r) {
    function o(n) {
        return n instanceof t ? n : new t(function(a) {
            a(n);
        });
    }
    return new (t || (t = Promise))(function(n, a) {
        function d(s) {
            try {
                u(r.next(s));
            } catch (h) {
                a(h);
            }
        }
        function c(s) {
            try {
                u(r.throw(s));
            } catch (h) {
                a(h);
            }
        }
        function u(s) {
            s.done ? n(s.value) : o(s.value).then(d, c);
        }
        u((r = r.apply(i, e || [])).next());
    });
}, _3 = class {
    constructor(e, t = {}, r){
        this.url = e, this.headers = Object.assign(Object.assign({}, R3), t), this.fetch = x6(r);
    }
    listBuckets() {
        return y5(this, void 0, void 0, function*() {
            try {
                return {
                    data: yield g4(this.fetch, `${this.url}/bucket`, {
                        headers: this.headers
                    }),
                    error: null
                };
            } catch (e) {
                if (l4(e)) return {
                    data: null,
                    error: e
                };
                throw e;
            }
        });
    }
    getBucket(e) {
        return y5(this, void 0, void 0, function*() {
            try {
                return {
                    data: yield g4(this.fetch, `${this.url}/bucket/${e}`, {
                        headers: this.headers
                    }),
                    error: null
                };
            } catch (t) {
                if (l4(t)) return {
                    data: null,
                    error: t
                };
                throw t;
            }
        });
    }
    createBucket(e, t = {
        public: !1
    }) {
        return y5(this, void 0, void 0, function*() {
            try {
                return {
                    data: yield p4(this.fetch, `${this.url}/bucket`, {
                        id: e,
                        name: e,
                        public: t.public,
                        file_size_limit: t.fileSizeLimit,
                        allowed_mime_types: t.allowedMimeTypes
                    }, {
                        headers: this.headers
                    }),
                    error: null
                };
            } catch (r) {
                if (l4(r)) return {
                    data: null,
                    error: r
                };
                throw r;
            }
        });
    }
    updateBucket(e, t) {
        return y5(this, void 0, void 0, function*() {
            try {
                return {
                    data: yield T3(this.fetch, `${this.url}/bucket/${e}`, {
                        id: e,
                        name: e,
                        public: t.public,
                        file_size_limit: t.fileSizeLimit,
                        allowed_mime_types: t.allowedMimeTypes
                    }, {
                        headers: this.headers
                    }),
                    error: null
                };
            } catch (r) {
                if (l4(r)) return {
                    data: null,
                    error: r
                };
                throw r;
            }
        });
    }
    emptyBucket(e) {
        return y5(this, void 0, void 0, function*() {
            try {
                return {
                    data: yield p4(this.fetch, `${this.url}/bucket/${e}/empty`, {}, {
                        headers: this.headers
                    }),
                    error: null
                };
            } catch (t) {
                if (l4(t)) return {
                    data: null,
                    error: t
                };
                throw t;
            }
        });
    }
    deleteBucket(e) {
        return y5(this, void 0, void 0, function*() {
            try {
                return {
                    data: yield S3(this.fetch, `${this.url}/bucket/${e}`, {}, {
                        headers: this.headers
                    }),
                    error: null
                };
            } catch (t) {
                if (l4(t)) return {
                    data: null,
                    error: t
                };
                throw t;
            }
        });
    }
};
var U2 = class extends _3 {
    constructor(e, t = {}, r){
        super(e, t, r);
    }
    from(e) {
        return new b3(this.url, this.headers, e, this.fetch);
    }
};
var __global$1 = globalThis || (typeof window !== "undefined" ? window : self);
var f4 = Object.defineProperty;
var d2 = (s, o)=>{
    for(var r in o)f4(s, r, {
        get: o[r],
        enumerable: !0
    });
};
var t = {};
d2(t, {
    Headers: ()=>c4,
    Request: ()=>p5,
    Response: ()=>i1,
    default: ()=>a2,
    fetch: ()=>u4
});
var l5 = function() {
    if (typeof self < "u") return self;
    if (typeof window < "u") return window;
    if (typeof __global$1 < "u") return __global$1;
    throw new Error("unable to locate global object");
}, e = l5(), u4 = e.fetch, a2 = e.fetch.bind(e), c4 = e.Headers, p5 = e.Request, i1 = e.Response;
var { __esModule: _4, Headers: w7, Request: R4, Response: g5, FetchError: h4 } = t, { default: n, ...b4 } = t, m6 = n !== void 0 ? n : b4;
var x7 = "2.39.0";
var m7 = "";
typeof Deno < "u" ? m7 = "deno" : typeof document < "u" ? m7 = "web" : typeof navigator < "u" && navigator.product === "ReactNative" ? m7 = "react-native" : m7 = "node";
var _5 = {
    "X-Client-Info": `supabase-js-${m7}/${x7}`
};
var E4 = function(a, e, t, n) {
    function l(s) {
        return s instanceof t ? s : new t(function(i) {
            i(s);
        });
    }
    return new (t || (t = Promise))(function(s, i) {
        function h(o) {
            try {
                r(n.next(o));
            } catch (u) {
                i(u);
            }
        }
        function c(o) {
            try {
                r(n.throw(o));
            } catch (u) {
                i(u);
            }
        }
        function r(o) {
            o.done ? s(o.value) : l(o.value).then(h, c);
        }
        r((n = n.apply(a, e || [])).next());
    });
}, w8 = (a)=>{
    let e;
    return a ? e = a : typeof fetch > "u" ? e = m6 : e = fetch, (...t)=>e(...t);
}, U3 = ()=>typeof Headers > "u" ? w7 : Headers, v4 = (a, e, t)=>{
    let n = w8(t), l = U3();
    return (s, i)=>E4(void 0, void 0, void 0, function*() {
            var h;
            let c = (h = yield e()) !== null && h !== void 0 ? h : a, r = new l(i?.headers);
            return r.has("apikey") || r.set("apikey", a), r.has("Authorization") || r.set("Authorization", `Bearer ${c}`), n(s, Object.assign(Object.assign({}, i), {
                headers: r
            }));
        });
};
function b5(a) {
    return a.replace(/\/$/, "");
}
function O3(a, e) {
    let { db: t, auth: n, realtime: l, global: s } = a, { db: i, auth: h, realtime: c, global: r } = e;
    return {
        db: Object.assign(Object.assign({}, i), t),
        auth: Object.assign(Object.assign({}, h), n),
        realtime: Object.assign(Object.assign({}, c), l),
        global: Object.assign(Object.assign({}, r), s)
    };
}
var g6 = class extends M {
    constructor(e){
        super(e);
    }
};
var F6 = function(a, e, t, n) {
    function l(s) {
        return s instanceof t ? s : new t(function(i) {
            i(s);
        });
    }
    return new (t || (t = Promise))(function(s, i) {
        function h(o) {
            try {
                r(n.next(o));
            } catch (u) {
                i(u);
            }
        }
        function c(o) {
            try {
                r(n.throw(o));
            } catch (u) {
                i(u);
            }
        }
        function r(o) {
            o.done ? s(o.value) : l(o.value).then(h, c);
        }
        r((n = n.apply(a, e || [])).next());
    });
}, N3 = {
    headers: _5
}, R5 = {
    schema: "public"
}, H3 = {
    autoRefreshToken: !0,
    persistSession: !0,
    detectSessionInUrl: !0,
    flowType: "implicit"
}, k4 = {}, f5 = class {
    constructor(e, t, n){
        var l, s, i, h, c, r, o, u;
        if (this.supabaseUrl = e, this.supabaseKey = t, !e) throw new Error("supabaseUrl is required.");
        if (!t) throw new Error("supabaseKey is required.");
        let p = b5(e);
        this.realtimeUrl = `${p}/realtime/v1`.replace(/^http/i, "ws"), this.authUrl = `${p}/auth/v1`, this.storageUrl = `${p}/storage/v1`, this.functionsUrl = `${p}/functions/v1`;
        let T = `sb-${new URL(this.authUrl).hostname.split(".")[0]}-auth-token`, A = {
            db: R5,
            realtime: k4,
            auth: Object.assign(Object.assign({}, H3), {
                storageKey: T
            }),
            global: N3
        }, d = O3(n ?? {}, A);
        this.storageKey = (s = (l = d.auth) === null || l === void 0 ? void 0 : l.storageKey) !== null && s !== void 0 ? s : "", this.headers = (h = (i = d.global) === null || i === void 0 ? void 0 : i.headers) !== null && h !== void 0 ? h : {}, this.auth = this._initSupabaseAuthClient((c = d.auth) !== null && c !== void 0 ? c : {}, this.headers, (r = d.global) === null || r === void 0 ? void 0 : r.fetch), this.fetch = v4(t, this._getAccessToken.bind(this), (o = d.global) === null || o === void 0 ? void 0 : o.fetch), this.realtime = this._initRealtimeClient(Object.assign({
            headers: this.headers
        }, d.realtime)), this.rest = new j4(`${p}/rest/v1`, {
            headers: this.headers,
            schema: (u = d.db) === null || u === void 0 ? void 0 : u.schema,
            fetch: this.fetch
        }), this._listenForAuthEvents();
    }
    get functions() {
        return new m1(this.functionsUrl, {
            headers: this.headers,
            customFetch: this.fetch
        });
    }
    get storage() {
        return new U2(this.storageUrl, this.headers, this.fetch);
    }
    from(e) {
        return this.rest.from(e);
    }
    schema(e) {
        return this.rest.schema(e);
    }
    rpc(e, t = {}, n) {
        return this.rest.rpc(e, t, n);
    }
    channel(e, t = {
        config: {}
    }) {
        return this.realtime.channel(e, t);
    }
    getChannels() {
        return this.realtime.getChannels();
    }
    removeChannel(e) {
        return this.realtime.removeChannel(e);
    }
    removeAllChannels() {
        return this.realtime.removeAllChannels();
    }
    _getAccessToken() {
        var e, t;
        return F6(this, void 0, void 0, function*() {
            let { data: n } = yield this.auth.getSession();
            return (t = (e = n.session) === null || e === void 0 ? void 0 : e.access_token) !== null && t !== void 0 ? t : null;
        });
    }
    _initSupabaseAuthClient({ autoRefreshToken: e, persistSession: t, detectSessionInUrl: n, storage: l, storageKey: s, flowType: i, debug: h }, c, r) {
        let o = {
            Authorization: `Bearer ${this.supabaseKey}`,
            apikey: `${this.supabaseKey}`
        };
        return new g6({
            url: this.authUrl,
            headers: Object.assign(Object.assign({}, o), c),
            storageKey: s,
            autoRefreshToken: e,
            persistSession: t,
            detectSessionInUrl: n,
            storage: l,
            flowType: i,
            debug: h,
            fetch: r
        });
    }
    _initRealtimeClient(e) {
        return new A1(this.realtimeUrl, Object.assign(Object.assign({}, e), {
            params: Object.assign({
                apikey: this.supabaseKey
            }, e?.params)
        }));
    }
    _listenForAuthEvents() {
        return this.auth.onAuthStateChange((t, n)=>{
            this._handleTokenChanged(t, "CLIENT", n?.access_token);
        });
    }
    _handleTokenChanged(e, t, n) {
        (e === "TOKEN_REFRESHED" || e === "SIGNED_IN") && this.changedAccessToken !== n ? (this.realtime.setAuth(n ?? null), this.changedAccessToken = n) : e === "SIGNED_OUT" && (this.realtime.setAuth(this.supabaseKey), t == "STORAGE" && this.auth.signOut(), this.changedAccessToken = void 0);
    }
};
var ie1 = (a, e, t)=>new f5(a, e, t);
const env = await load();
const checkEmail = async (body)=>{
    console.log(body);
    const client = ie1(env["SUPABASE_PROJECT_URL"], env["SUPABASE_KEY"], {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
    const adminClient = client.auth.admin;
    const { data: { users }, error } = await adminClient.listUsers();
    if (error) {
        console.error(error);
        return {
            content: {
                error: "Internal server error"
            },
            status: 500
        };
    }
    const email = JSON.parse(body)["email"];
    const user = users.find((user)=>user.email === email);
    if (!user) {
        return {
            content: {
                exists: false
            },
            status: 200
        };
    } else {
        return {
            content: {
                exists: true
            },
            status: 200
        };
    }
};
const PORT = (env["PORT"] ? parseInt(env["PORT"]) : null) || 8080;
Deno.serve({
    port: PORT
}, async (request)=>{
    const url = new URL(request.url);
    switch(url.pathname){
        case "/":
            {
                return new Response("Hello world!", {
                    status: 200
                });
            }
        case "/check_email":
            {
                switch(request.method){
                    case "POST":
                        {
                            const { content, status } = await checkEmail(await request.text());
                            return new Response(JSON.stringify(content), {
                                status
                            });
                        }
                    default:
                        {
                            return new Response("Method not allowed", {
                                status: 405
                            });
                        }
                }
            }
        default:
            {
                return new Response("Resource not found", {
                    status: 404
                });
            }
    }
});

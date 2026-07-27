"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../lib/db/src/schema/bot.ts
var import_pg_core, botConfigTable, authorizedUsersTable, userCreditsTable, ddAccountsTable, ordersTable, touchesTable, stripeSessionsTable;
var init_bot = __esm({
  "../../lib/db/src/schema/bot.ts"() {
    "use strict";
    import_pg_core = require("drizzle-orm/pg-core");
    botConfigTable = (0, import_pg_core.pgTable)("bot_config", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      ownerDiscordId: (0, import_pg_core.text)("owner_discord_id").notNull(),
      createdAt: (0, import_pg_core.timestamp)("created_at").notNull().defaultNow()
    });
    authorizedUsersTable = (0, import_pg_core.pgTable)("authorized_users", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      discordId: (0, import_pg_core.text)("discord_id").notNull().unique(),
      discordUsername: (0, import_pg_core.text)("discord_username").notNull().default(""),
      addedBy: (0, import_pg_core.text)("added_by").notNull(),
      addedAt: (0, import_pg_core.timestamp)("added_at").notNull().defaultNow()
    });
    userCreditsTable = (0, import_pg_core.pgTable)("user_credits", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      discordId: (0, import_pg_core.text)("discord_id").notNull().unique(),
      balance: (0, import_pg_core.integer)("balance").notNull().default(0),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").notNull().defaultNow()
    });
    ddAccountsTable = (0, import_pg_core.pgTable)("dd_accounts", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      name: (0, import_pg_core.text)("name").notNull(),
      // friendly label e.g. "Account 1"
      email: (0, import_pg_core.text)("email").notNull().unique(),
      encryptedPassword: (0, import_pg_core.text)("encrypted_password").notNull(),
      sessionJson: (0, import_pg_core.jsonb)("session_json"),
      // persisted cookies + state
      isActive: (0, import_pg_core.boolean)("is_active").notNull().default(true),
      addedBy: (0, import_pg_core.text)("added_by").notNull(),
      createdAt: (0, import_pg_core.timestamp)("created_at").notNull().defaultNow()
    });
    ordersTable = (0, import_pg_core.pgTable)("orders", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      discordId: (0, import_pg_core.text)("discord_id").notNull(),
      orderUuid: (0, import_pg_core.text)("order_uuid").notNull(),
      ddAccountId: (0, import_pg_core.integer)("dd_account_id").notNull(),
      groupOrderUrl: (0, import_pg_core.text)("group_order_url"),
      storeName: (0, import_pg_core.text)("store_name"),
      totalCents: (0, import_pg_core.integer)("total_cents").notNull().default(0),
      creditsUsed: (0, import_pg_core.integer)("credits_used").notNull().default(10),
      status: (0, import_pg_core.text)("status").notNull().default("placed"),
      // placed | paid | failed
      trackingUrl: (0, import_pg_core.text)("tracking_url"),
      createdAt: (0, import_pg_core.timestamp)("created_at").notNull().defaultNow()
    });
    touchesTable = (0, import_pg_core.pgTable)("touches", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      discordId: (0, import_pg_core.text)("discord_id").notNull(),
      discordUsername: (0, import_pg_core.text)("discord_username").notNull(),
      photoUrl: (0, import_pg_core.text)("photo_url").notNull(),
      messageId: (0, import_pg_core.text)("message_id").notNull(),
      channelId: (0, import_pg_core.text)("channel_id").notNull(),
      guildId: (0, import_pg_core.text)("guild_id").notNull(),
      note: (0, import_pg_core.text)("note"),
      createdAt: (0, import_pg_core.timestamp)("created_at").notNull().defaultNow()
    });
    stripeSessionsTable = (0, import_pg_core.pgTable)("stripe_sessions", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      discordId: (0, import_pg_core.text)("discord_id").notNull(),
      stripeSessionId: (0, import_pg_core.text)("stripe_session_id").notNull().unique(),
      creditsAmount: (0, import_pg_core.integer)("credits_amount").notNull().default(10),
      amountCents: (0, import_pg_core.integer)("amount_cents").notNull().default(500),
      status: (0, import_pg_core.text)("status").notNull().default("pending"),
      // pending | completed | expired
      createdAt: (0, import_pg_core.timestamp)("created_at").notNull().defaultNow()
    });
  }
});

// ../../lib/db/src/schema/index.ts
var schema_exports = {};
__export(schema_exports, {
  authorizedUsersTable: () => authorizedUsersTable,
  botConfigTable: () => botConfigTable,
  ddAccountsTable: () => ddAccountsTable,
  ordersTable: () => ordersTable,
  stripeSessionsTable: () => stripeSessionsTable,
  touchesTable: () => touchesTable,
  userCreditsTable: () => userCreditsTable
});
var init_schema = __esm({
  "../../lib/db/src/schema/index.ts"() {
    "use strict";
    init_bot();
  }
});

// ../../lib/db/src/index.ts
var import_node_postgres, import_pg, Pool, pool, db;
var init_src = __esm({
  "../../lib/db/src/index.ts"() {
    "use strict";
    import_node_postgres = require("drizzle-orm/node-postgres");
    import_pg = __toESM(require("pg"), 1);
    init_schema();
    init_schema();
    ({ Pool } = import_pg.default);
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = (0, import_node_postgres.drizzle)(pool, { schema: schema_exports });
  }
});

// src/utils/encrypt.ts
function getKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET env var is required");
  return (0, import_node_crypto.createHash)("sha256").update(secret).digest();
}
function encrypt(plaintext) {
  const key = getKey();
  const iv = (0, import_node_crypto.randomBytes)(12);
  const cipher = (0, import_node_crypto.createCipheriv)(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}
function decrypt(ciphertext) {
  const key = getKey();
  const parts = ciphertext.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted format");
  const [ivHex, tagHex, encHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const encrypted = Buffer.from(encHex, "hex");
  const decipher = (0, import_node_crypto.createDecipheriv)(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
var import_node_crypto, ALGORITHM;
var init_encrypt = __esm({
  "src/utils/encrypt.ts"() {
    "use strict";
    import_node_crypto = require("node:crypto");
    ALGORITHM = "aes-256-gcm";
  }
});

// src/doordash/client/cookies.ts
var CookieJar;
var init_cookies = __esm({
  "src/doordash/client/cookies.ts"() {
    "use strict";
    CookieJar = class {
      store = /* @__PURE__ */ new Map();
      get(name) {
        for (const cookies of this.store.values()) {
          const cookie = cookies.get(name);
          if (cookie && !this.isExpired(cookie)) {
            return cookie.value;
          }
        }
        return "";
      }
      storeCookies(url, headers) {
        const rawSetCookie = headers["set-cookie"] ?? headers["Set-Cookie"];
        if (!rawSetCookie) return;
        const cookieStrings = this.normalizeSetCookieHeader(rawSetCookie);
        const domain = this.extractDomain(url);
        for (const raw of cookieStrings) {
          const cookie = this.parse(raw, domain);
          if (!cookie) continue;
          const cookieDomain = cookie.domain || domain;
          if (!this.store.has(cookieDomain)) {
            this.store.set(cookieDomain, /* @__PURE__ */ new Map());
          }
          this.store.get(cookieDomain).set(cookie.name, cookie);
        }
      }
      getForUrl(url) {
        const domain = this.extractDomain(url);
        const parts = [];
        for (const [cookieDomain, cookies] of this.store) {
          if (domain.endsWith(cookieDomain) || cookieDomain.endsWith(domain)) {
            for (const cookie of cookies.values()) {
              if (!this.isExpired(cookie)) {
                parts.push(`${cookie.name}=${cookie.value}`);
              }
            }
          }
        }
        return parts.join("; ");
      }
      clear() {
        this.store.clear();
      }
      toJSON() {
        const result = {};
        for (const [domain, cookies] of this.store) {
          result[domain] = [...cookies.values()];
        }
        return result;
      }
      fromJSON(data11) {
        this.store.clear();
        for (const [domain, cookies] of Object.entries(data11)) {
          const map = /* @__PURE__ */ new Map();
          for (const cookie of cookies) {
            map.set(cookie.name, cookie);
          }
          this.store.set(domain, map);
        }
      }
      dump() {
        const result = {};
        for (const [domain, cookies] of this.store) {
          result[domain] = [...cookies.keys()];
        }
        return result;
      }
      isExpired(cookie) {
        if (!cookie.expires) return false;
        return new Date(cookie.expires) < /* @__PURE__ */ new Date();
      }
      extractDomain(url) {
        try {
          const u = new URL(url);
          return u.hostname;
        } catch {
          return url;
        }
      }
      parse(raw, defaultDomain) {
        const parts = raw.split(";").map((p) => p.trim());
        const [nameVal, ...attributes] = parts;
        if (!nameVal) return null;
        const eqIdx = nameVal.indexOf("=");
        if (eqIdx === -1) return null;
        const name = nameVal.slice(0, eqIdx).trim();
        const value = nameVal.slice(eqIdx + 1).trim();
        let domain = defaultDomain;
        let path = "/";
        let expires;
        let httpOnly = false;
        let secure = false;
        let sameSite;
        for (const attr of attributes) {
          const lower = attr.toLowerCase();
          if (lower.startsWith("domain=")) {
            domain = attr.slice(7).replace(/^\./, "");
          } else if (lower.startsWith("path=")) {
            path = attr.slice(5);
          } else if (lower.startsWith("expires=")) {
            const d = new Date(attr.slice(8));
            if (!isNaN(d.getTime())) expires = d;
          } else if (lower.startsWith("max-age=")) {
            const secs = parseInt(attr.slice(8));
            if (!isNaN(secs)) {
              expires = new Date(Date.now() + secs * 1e3);
            }
          } else if (lower === "httponly") {
            httpOnly = true;
          } else if (lower === "secure") {
            secure = true;
          } else if (lower.startsWith("samesite=")) {
            sameSite = attr.slice(9);
          }
        }
        return { name, value, domain, path, expires, httpOnly, secure, sameSite };
      }
      normalizeSetCookieHeader(raw) {
        if (Array.isArray(raw)) {
          return raw.flatMap((s) => {
            if (typeof s !== "string") return [];
            return this.splitSetCookieString(s);
          });
        }
        if (typeof raw === "string") {
          return this.splitSetCookieString(raw);
        }
        return [];
      }
      splitSetCookieString(s) {
        return s.split(/,(?=\s*[a-zA-Z_][a-zA-Z0-9_-]*=)/);
      }
    };
  }
});

// src/doordash/client/session.ts
var DoorDashSession;
var init_session = __esm({
  "src/doordash/client/session.ts"() {
    "use strict";
    init_cookies();
    DoorDashSession = class {
      cookieJar;
      state = {};
      constructor(savedData) {
        this.cookieJar = new CookieJar();
        if (savedData) {
          if (savedData.cookies) this.cookieJar.fromJSON(savedData.cookies);
          if (savedData.state) this.state = savedData.state;
        }
      }
      /** Export session to JSON for DB storage. */
      export() {
        return {
          cookies: this.cookieJar.toJSON(),
          state: this.state
        };
      }
      /** Check if we have valid auth cookies. */
      isAuthenticated() {
        return !!this.cookieJar.get("ddweb_token");
      }
      getConsumerId() {
        return this.cookieJar.get("ajs_user_id") || this.cookieJar.get("consumerId") || "";
      }
      getCsrfToken() {
        return this.cookieJar.get("csrf_token") || "";
      }
      getState(key) {
        return this.state[key];
      }
      setState(key, value) {
        this.state[key] = value;
      }
      clear() {
        this.cookieJar.clear();
        this.state = {};
      }
      debugCookies() {
        return this.cookieJar.dump();
      }
    };
  }
});

// src/doordash/client/http.ts
var import_cycletls, CHROME_JA3, USER_AGENT, PROXY_URL, HttpClient;
var init_http = __esm({
  "src/doordash/client/http.ts"() {
    "use strict";
    import_cycletls = __toESM(require("cycletls"), 1);
    CHROME_JA3 = "771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43-27-17513-21,29-23-24,0";
    USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
    PROXY_URL = process.env.PROXY_URL ?? "";
    HttpClient = class {
      tls = null;
      jar;
      logger;
      constructor(jar, logger) {
        this.jar = jar;
        this.logger = logger;
      }
      async init() {
        if (!this.tls) {
          this.tls = await (0, import_cycletls.default)();
        }
      }
      async close() {
        if (this.tls) {
          await this.tls.exit().catch(() => {
          });
          this.tls = null;
        }
      }
      async get(url, opts = {}) {
        return this.request(url, { ...opts, method: "GET" });
      }
      async post(url, body, opts = {}) {
        return this.request(url, { ...opts, method: "POST", body });
      }
      async request(url, opts) {
        if (!this.tls) await this.init();
        const jar = opts.cookieJar ?? this.jar;
        const cookieHeader = jar.getForUrl(url);
        const headers = {
          "User-Agent": USER_AGENT,
          Accept: "application/json, text/html, */*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          ...opts.headers ?? {}
        };
        if (cookieHeader) {
          headers["Cookie"] = cookieHeader;
        }
        const method = (opts.method ?? "GET").toLowerCase();
        const requestOpts = {
          ja3: CHROME_JA3,
          userAgent: USER_AGENT,
          headers,
          disableRedirect: opts.disableRedirect ?? false
        };
        if (PROXY_URL) {
          requestOpts.proxy = PROXY_URL;
        }
        let bodyStr;
        if (opts.body !== void 0) {
          if (typeof opts.body === "string") {
            bodyStr = opts.body;
            if (!headers["Content-Type"]) {
              headers["Content-Type"] = "application/x-www-form-urlencoded";
            }
          } else {
            bodyStr = JSON.stringify(opts.body);
            if (!headers["Content-Type"]) {
              headers["Content-Type"] = "application/json";
            }
          }
        }
        if (bodyStr) requestOpts.body = bodyStr;
        const start = Date.now();
        const resp = await this.tls(url, requestOpts, method);
        const duration = Date.now() - start;
        jar.storeCookies(url, resp.headers ?? {});
        let body = resp.body ?? resp.data ?? "";
        if (Buffer.isBuffer(body)) body = body.toString("utf-8");
        if (this.logger) {
          this.logger.log({
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            duration_ms: duration,
            request: { method: method.toUpperCase(), url, headers, body: bodyStr },
            response: {
              status: resp.status,
              headers: resp.headers,
              body: typeof body === "string" ? body.slice(0, 2e3) : body
            }
          });
        }
        const response = {
          status: resp.status,
          body,
          headers: resp.headers ?? {},
          json() {
            if (typeof body === "object") return body;
            try {
              return JSON.parse(body);
            } catch {
              return null;
            }
          },
          text() {
            return typeof body === "string" ? body : JSON.stringify(body);
          }
        };
        return response;
      }
    };
  }
});

// src/doordash/logging/traffic.ts
var TrafficLogger;
var init_traffic = __esm({
  "src/doordash/logging/traffic.ts"() {
    "use strict";
    TrafficLogger = class {
      log(_entry) {
      }
      getSessionDir() {
        return "/dev/null";
      }
    };
  }
});

// src/doordash/api/graphql.ts
function extractErrorMessage(data11) {
  if (!data11 || typeof data11 !== "object") return null;
  const obj = data11;
  if (Array.isArray(obj.errors) && obj.errors.length > 0) {
    return obj.errors.map((e) => e.message).join("; ").slice(0, 400);
  }
  return null;
}
var import_node_fs, import_node_path, QUERIES_DIR, GraphQLError, AuthError, GraphQLClient;
var init_graphql = __esm({
  "src/doordash/api/graphql.ts"() {
    "use strict";
    import_node_fs = require("node:fs");
    import_node_path = require("node:path");
    QUERIES_DIR = (0, import_node_path.join)(process.cwd(), "queries");
    GraphQLError = class extends Error {
      constructor(operation, message, statusCode) {
        super(`GraphQL ${operation}: ${message}`);
        this.operation = operation;
        this.statusCode = statusCode;
        this.name = "GraphQLError";
      }
      operation;
      statusCode;
    };
    AuthError = class extends Error {
      constructor() {
        super("Not logged into DoorDash. Use /addaccount first.");
        this.name = "AuthError";
      }
    };
    GraphQLClient = class {
      constructor(http, session) {
        this.http = http;
        this.session = session;
      }
      http;
      session;
      async query(operation, variables, queryText) {
        if (!this.session.isAuthenticated()) {
          throw new AuthError();
        }
        const csrf = this.session.getCsrfToken();
        const resp = await this.http.post(
          `https://www.doordash.com/graphql/${operation}?operation=${operation}`,
          {
            operationName: operation,
            variables,
            query: queryText
          },
          {
            headers: {
              Origin: "https://www.doordash.com",
              Referer: "https://www.doordash.com/",
              "x-csrftoken": csrf,
              "x-channel-id": "marketplace",
              "x-experience-id": "doordash",
              "apollographql-client-name": "@doordash/app-consumer-production-ssr-client",
              "apollographql-client-version": "3.0"
            },
            cookieJar: this.session.cookieJar
          }
        );
        if (resp.status === 401 || resp.status === 403) {
          throw new AuthError();
        }
        const data11 = resp.json();
        if (resp.status !== 200) {
          const msg = extractErrorMessage(data11) ?? `HTTP ${resp.status}`;
          throw new GraphQLError(operation, msg, resp.status);
        }
        if (data11?.errors && Array.isArray(data11.errors) && data11.errors.length > 0) {
          const msg = data11.errors.map((e) => e.message).join("; ").slice(0, 400);
          throw new GraphQLError(operation, msg);
        }
        return data11.data;
      }
      loadQuery(filename) {
        const filepath = (0, import_node_path.join)(QUERIES_DIR, filename);
        return (0, import_node_fs.readFileSync)(filepath, "utf-8");
      }
    };
  }
});

// src/doordash/api/checkout.ts
var CheckoutAPI;
var init_checkout = __esm({
  "src/doordash/api/checkout.ts"() {
    "use strict";
    CheckoutAPI = class {
      constructor(gql, session) {
        this.gql = gql;
        this.session = session;
      }
      gql;
      session;
      async getFeeTally(cartId) {
        const q = this.gql.loadQuery("totalFeeTally.graphql");
        const consumerId = this.session.getConsumerId();
        const data11 = await this.gql.query(
          "totalFeeTally",
          { cartId, consumerId },
          q
        );
        const tally = data11?.totalFeeTally;
        const lineItems = [];
        for (const group of tally?.lineItemGroups ?? []) {
          for (const item of group.lineItems ?? []) {
            lineItems.push({
              label: item.label ?? "Fee",
              amount: item.finalMoney?.displayString ?? ""
            });
          }
        }
        const total = tally?.totalBeforeTaxes?.displayString ?? tally?.styledSummary?.displayString ?? "";
        const totalCents = tally?.totalBeforeTaxes?.unitAmount ?? 0;
        return { lineItems, total, totalCents, cartId };
      }
      async createOrder(params) {
        const q = this.gql.loadQuery("createOrderFromCart.graphql");
        const tipCents = params.tipCents ?? 0;
        const isCardPayment = !!params.paymentCardId;
        const data11 = await this.gql.query(
          "createOrderFromCart",
          {
            cartId: params.cartId,
            total: params.totalCents + tipCents,
            sosDeliveryFee: 0,
            storeId: params.storeId,
            isPickupOrder: false,
            verifiedAgeRequirement: false,
            deliveryTime: "ASAP",
            deliveryOptionType: "NOT_SET",
            tipAmounts: [{ tipRecipient: "DASHER", amount: tipCents }],
            paymentMethod: params.paymentCardId ? parseInt(params.paymentCardId) : null,
            isCardPayment,
            membershipId: "",
            programId: "",
            attributionData: "{}",
            fulfillsOwnDeliveries: false,
            menuOptions: null,
            teamId: null,
            budgetId: null,
            giftOptions: null,
            recipientShippingDetails: null,
            workOrderOptions: null
          },
          q
        );
        const order = data11?.createOrderFromCart;
        if (!order?.orderUuid) {
          throw new Error("Order could not be placed.");
        }
        const paymentResult = await this.pollPayment(order.orderUuid);
        return {
          orderUuid: order.orderUuid,
          totalCents: params.totalCents + tipCents,
          tipCents,
          ...paymentResult
        };
      }
      async pollPayment(orderId) {
        const q = this.gql.loadQuery("pollOrderPaymentStatus.graphql");
        for (let i = 0; i < 5; i++) {
          await new Promise((r) => setTimeout(r, 2e3));
          const data11 = await this.gql.query(
            "pollOrderPaymentStatus",
            { orderId },
            q
          );
          const ps = data11?.pollOrderPaymentStatus;
          if (ps?.paymentStatus === 1) {
            return { paymentStatus: "paid" };
          }
          if (ps?.paymentStatus === 2) {
            return {
              paymentStatus: "failed",
              errorMessage: ps.errorMessage ?? ps.errorType ?? "Payment failed"
            };
          }
        }
        return { paymentStatus: "pending" };
      }
    };
  }
});

// src/doordash/api/group.ts
var GroupAPI;
var init_group = __esm({
  "src/doordash/api/group.ts"() {
    "use strict";
    GroupAPI = class {
      constructor(gql) {
        this.gql = gql;
      }
      gql;
      async getGroupCart(cartId) {
        const data11 = await this.gql.query(
          "groupCart",
          { id: cartId, shouldApplyAutocheckoutConfig: true },
          `query groupCart($id: ID!, $shouldApplyAutocheckoutConfig: Boolean) {
        orderCart(id: $id, shouldApplyAutocheckoutConfig: $shouldApplyAutocheckoutConfig) {
          id groupCart groupCartType shortenedUrl subtotal
          store { id name __typename }
          orders {
            id
            consumer {
              firstName lastName id
              localizedNames { informalName formalName formalNameAbbreviated __typename }
              __typename
            }
            orderItems {
              id quantity
              item { name __typename }
              singlePrice priceOfTotalQuantity
              __typename
            }
            isSubCartFinalized
            __typename
          }
          __typename
        }
      }`
        );
        const gc = data11?.orderCart;
        if (!gc) throw new Error("Could not load group order cart.");
        return {
          id: gc.id,
          shareUrl: gc.shortenedUrl ?? "",
          subtotal: gc.subtotal ?? 0,
          storeId: gc.store?.id ?? void 0,
          members: (gc.orders ?? []).map((order) => {
            const c = order.consumer;
            const name = c?.localizedNames?.formalNameAbbreviated || `${c?.firstName ?? "?"} ${c?.lastName ?? ""}`.trim();
            return {
              name,
              isFinalized: !!order.isSubCartFinalized,
              items: (order.orderItems ?? []).map((item) => ({
                id: item.id ?? "",
                name: item.item?.name ?? "?",
                quantity: item.quantity ?? 1,
                price: item.singlePrice ?? 0
              }))
            };
          })
        };
      }
    };
  }
});

// src/doordash/api/account.ts
var DD_STRIPE_PK, AccountAPI;
var init_account = __esm({
  "src/doordash/api/account.ts"() {
    "use strict";
    DD_STRIPE_PK = "pk_live_eSZElGh6iX4TJrYqWR7YJtrL";
    AccountAPI = class {
      constructor(gql, http) {
        this.gql = gql;
        this.http = http;
      }
      gql;
      http;
      async getPaymentMethods() {
        const data11 = await this.gql.query(
          "getPaymentMethodList",
          {},
          `query getPaymentMethodList {
        getPaymentMethodList {
          id last4 expMonth expYear isDefault type
          card { brand last4 expMonth expYear }
        }
      }`
        );
        return (data11?.getPaymentMethodList ?? []).map((c) => ({
          id: String(c.id),
          brand: c.card?.brand ?? c.type ?? "?",
          last4: c.card?.last4 ?? c.last4 ?? "????",
          expMonth: c.card?.expMonth ?? c.expMonth ?? 0,
          expYear: c.card?.expYear ?? c.expYear ?? 0,
          isDefault: !!c.isDefault,
          type: c.type ?? ""
        }));
      }
      async addCard(params) {
        const last4 = params.cardNumber.slice(-4);
        const existing = await this.getPaymentMethods();
        const dupe = existing.find(
          (c) => c.last4 === last4 && c.expMonth === parseInt(params.expMonth) && c.expYear === parseInt(params.expYear)
        );
        if (dupe) return { id: dupe.id, brand: dupe.brand, last4 };
        const stripeBody = new URLSearchParams({
          "card[number]": params.cardNumber,
          "card[exp_month]": params.expMonth,
          "card[exp_year]": params.expYear,
          "card[cvc]": params.cvc
        });
        const stripeResp = await this.http.post(
          "https://api.stripe.com/v1/tokens",
          stripeBody.toString(),
          {
            headers: {
              Authorization: `Bearer ${DD_STRIPE_PK}`,
              "Content-Type": "application/x-www-form-urlencoded"
            }
          }
        );
        const token = stripeResp.json();
        if (token.error) {
          throw new Error(`Card tokenization failed: ${token.error.message}`);
        }
        await this.gql.query(
          "addPaymentCard",
          { stripeToken: token.id },
          `mutation addPaymentCard($stripeToken: String!) {
        addPaymentCard(stripeToken: $stripeToken) {
          id last4 isDefault card { brand last4 }
        }
      }`
        );
        return {
          id: token.id,
          brand: token.card?.brand ?? "Card",
          last4
        };
      }
      async getAddresses() {
        const data11 = await this.gql.query(
          "getAvailableAddresses",
          {},
          `query getAvailableAddresses {
        getAvailableAddresses {
          id street city state zipCode lat lng __typename
        }
      }`
        );
        return data11?.getAvailableAddresses ?? [];
      }
      async setDefaultAddress(addressId) {
        await this.gql.query(
          "updateConsumerDefaultAddress",
          { defaultAddressId: addressId },
          `mutation updateConsumerDefaultAddress($defaultAddressId: ID!) {
        updateConsumerDefaultAddress(defaultAddressId: $defaultAddressId) { __typename }
      }`
        );
      }
    };
  }
});

// src/doordash/auth/login.ts
var GENERATE_PASSCODE_MUTATION, VERIFY_PASSCODE_MUTATION, LoginFlow;
var init_login = __esm({
  "src/doordash/auth/login.ts"() {
    "use strict";
    GENERATE_PASSCODE_MUTATION = `
mutation generatePasscodeBFFRisk(
  $action: String!, $channel: String!, $experience: String!,
  $language: String!, $mfaDetail: MfaDetailInput!, $shouldForceNewCode: Boolean!
) {
  generatePasscodeBFF(
    action: $action, channel: $channel, experience: $experience,
    language: $language, mfaDetail: $mfaDetail, shouldForceNewCode: $shouldForceNewCode
  ) {
    ... on GeneratePasscodeSuccess { message }
    ... on GeneratePasscodeError { message }
  }
}`;
    VERIFY_PASSCODE_MUTATION = `
mutation verifyPasscodeBFFRisk(
  $action: String!, $code: String!, $mfaDetail: MfaDetailInput!
) {
  verifyPasscodeBFF(action: $action, code: $code, mfaDetail: $mfaDetail) {
    ... on VerifyPasscodeSuccess { redirectUri }
    ... on VerifyPasscodeError { message }
  }
}`;
    LoginFlow = class {
      constructor(http, session) {
        this.http = http;
        this.session = session;
      }
      http;
      session;
      pendingMfaToken = null;
      async login(email, password) {
        if (this.session.isAuthenticated()) {
          return { status: "success", message: "Already logged in." };
        }
        const r1 = await this.http.get(
          "https://identity.doordash.com/auth?" + new URLSearchParams({
            client_id: "1666519390426295040",
            layout: "consumer_web",
            prompt: "none",
            redirect_uri: "https://www.doordash.com/",
            response_type: "code",
            scope: "*",
            state: "none"
          }).toString(),
          { headers: { Accept: "text/html" } }
        );
        const xsrf = this.session.cookieJar.get("XSRF-TOKEN");
        if (!xsrf) {
          return {
            status: "error",
            message: `Identity page returned ${r1.status} but no XSRF token.`
          };
        }
        const r2 = await this.http.post(
          "https://identity.doordash.com/auth",
          {
            clientId: "1666519390426295040",
            deviceId: null,
            layout: "consumer_web",
            password,
            redirectUri: "https://www.doordash.com/",
            responseType: "code",
            scope: "*",
            state: "none",
            username: email
          },
          {
            headers: {
              Origin: "https://identity.doordash.com",
              "X-XSRF-TOKEN": xsrf
            }
          }
        );
        const authData = r2.json();
        if (typeof authData?.message === "string" && authData.message.includes("RISK-403")) {
          return {
            status: "error",
            message: "Account blocked by DoorDash risk detection."
          };
        }
        if (authData?.verification) {
          const verification = authData.verification;
          const token = verification?.mfaDetail?.token ?? verification?.token ?? "";
          this.pendingMfaToken = token;
          if (token) {
            await this.sendMfaCode(token);
          }
          return {
            status: "mfa_required",
            message: "MFA verification required. Check your email/phone.",
            mfaToken: token
          };
        }
        const authCode = authData?.redirectUri?.match(/[?&]code=([^&]+)/)?.[1] ?? authData?.code;
        if (!authCode) {
          return { status: "error", message: "Login failed \u2014 no auth code." };
        }
        return this.exchangeCode(authCode);
      }
      async verifyMfa(code, mfaToken) {
        const token = mfaToken ?? this.pendingMfaToken ?? "";
        if (!token) {
          return { status: "error", message: "No MFA token. Please login again." };
        }
        const resp = await this.http.post(
          "https://identity.doordash.com/graphql",
          {
            operationName: "verifyPasscodeBFFRisk",
            variables: {
              action: "consumer_login",
              code,
              mfaDetail: { token }
            },
            query: VERIFY_PASSCODE_MUTATION
          },
          { headers: { Origin: "https://identity.doordash.com" } }
        );
        const data11 = resp.json();
        const result = data11?.data?.verifyPasscodeBFF;
        if (!result?.redirectUri) {
          return {
            status: "error",
            message: result?.message ?? "MFA verification failed."
          };
        }
        const authCode = result.redirectUri.match(/[?&]code=([^&]+)/)?.[1];
        if (!authCode) {
          return { status: "error", message: "No auth code after MFA." };
        }
        return this.exchangeCode(authCode);
      }
      async sendMfaCode(token) {
        await this.http.post(
          "https://identity.doordash.com/graphql",
          {
            operationName: "generatePasscodeBFFRisk",
            variables: {
              action: "consumer_login",
              channel: "email",
              experience: "doordash",
              language: "en-US",
              mfaDetail: { token },
              shouldForceNewCode: false
            },
            query: GENERATE_PASSCODE_MUTATION
          },
          { headers: { Origin: "https://identity.doordash.com" } }
        );
      }
      async exchangeCode(authCode) {
        const r = await this.http.get(
          "https://www.doordash.com/oidc/callback/?" + new URLSearchParams({ code: authCode, state: "none" }).toString(),
          {
            headers: { Accept: "text/html" },
            disableRedirect: false
          }
        );
        const ddToken = this.session.cookieJar.get("ddweb_token");
        if (!ddToken) {
          return {
            status: "error",
            message: `OIDC callback returned ${r.status} \u2014 no session cookie.`
          };
        }
        return { status: "success", message: "Logged in successfully." };
      }
    };
  }
});

// src/doordash/manager.ts
var manager_exports = {};
__export(manager_exports, {
  ensureAuthenticated: () => ensureAuthenticated,
  evictClient: () => evictClient,
  getClient: () => getClient,
  getPrimaryClient: () => getPrimaryClient,
  listAccounts: () => listAccounts,
  saveSession: () => saveSession
});
async function buildClient(accountId, email, encryptedPassword, sessionJson) {
  const logger = new TrafficLogger();
  let sessionData = void 0;
  try {
    sessionData = typeof sessionJson === "string" ? JSON.parse(sessionJson) : sessionJson ?? void 0;
  } catch {
  }
  const session = new DoorDashSession(sessionData);
  const http = new HttpClient(session.cookieJar, logger);
  await http.init();
  const gql = new GraphQLClient(http, session);
  const checkout = new CheckoutAPI(gql, session);
  const group = new GroupAPI(gql);
  const account = new AccountAPI(gql, http);
  const login = new LoginFlow(http, session);
  return { accountId, email, session, http, gql, checkout, group, account, login };
}
async function getClient(accountId) {
  if (clientCache.has(accountId)) {
    return clientCache.get(accountId);
  }
  const rows = await db.select().from(ddAccountsTable).where((0, import_drizzle_orm3.eq)(ddAccountsTable.id, accountId)).limit(1);
  const row = rows[0];
  if (!row) throw new Error(`DoorDash account #${accountId} not found.`);
  const password = decrypt(row.encryptedPassword);
  const client2 = await buildClient(accountId, row.email, password, row.sessionJson);
  clientCache.set(accountId, client2);
  return client2;
}
async function getPrimaryClient() {
  const rows = await db.select().from(ddAccountsTable).where((0, import_drizzle_orm3.eq)(ddAccountsTable.isActive, true)).limit(1);
  if (!rows.length) {
    throw new Error("No DoorDash accounts configured. Use /addaccount first.");
  }
  return getClient(rows[0].id);
}
async function listAccounts() {
  const rows = await db.select({
    id: ddAccountsTable.id,
    name: ddAccountsTable.name,
    email: ddAccountsTable.email
  }).from(ddAccountsTable).where((0, import_drizzle_orm3.eq)(ddAccountsTable.isActive, true));
  return rows;
}
async function saveSession(client2) {
  const sessionData = client2.session.export();
  await db.update(ddAccountsTable).set({ sessionJson: sessionData }).where((0, import_drizzle_orm3.eq)(ddAccountsTable.id, client2.accountId));
}
async function ensureAuthenticated(client2) {
  if (client2.session.isAuthenticated()) {
    return { ok: true, message: "Already authenticated." };
  }
  const rows = await db.select({ encryptedPassword: ddAccountsTable.encryptedPassword }).from(ddAccountsTable).where((0, import_drizzle_orm3.eq)(ddAccountsTable.id, client2.accountId)).limit(1);
  if (!rows.length) return { ok: false, message: "Account not found." };
  const password = decrypt(rows[0].encryptedPassword);
  const result = await client2.login.login(client2.email, password);
  if (result.status === "success") {
    await saveSession(client2);
    return { ok: true, message: "Logged in successfully." };
  }
  if (result.status === "mfa_required") {
    return {
      ok: false,
      message: result.message,
      mfaToken: result.mfaToken
    };
  }
  return { ok: false, message: result.message };
}
function evictClient(accountId) {
  const client2 = clientCache.get(accountId);
  if (client2) {
    client2.http.close().catch(() => {
    });
    clientCache.delete(accountId);
  }
}
var import_drizzle_orm3, clientCache;
var init_manager = __esm({
  "src/doordash/manager.ts"() {
    "use strict";
    init_src();
    init_schema();
    import_drizzle_orm3 = require("drizzle-orm");
    init_session();
    init_http();
    init_traffic();
    init_graphql();
    init_checkout();
    init_group();
    init_account();
    init_login();
    init_encrypt();
    clientCache = /* @__PURE__ */ new Map();
  }
});

// src/index.ts
var import_discord11 = require("discord.js");

// src/db/index.ts
init_src();
init_schema();
var import_drizzle_orm = require("drizzle-orm");
init_encrypt();
async function initOwner(ownerDiscordId) {
  const existing = await db.select().from(botConfigTable).limit(1);
  if (existing.length > 0) return;
  await db.insert(botConfigTable).values({ ownerDiscordId });
  await ensureCredits(ownerDiscordId);
}
async function transferOwnership(newOwnerDiscordId) {
  const existing = await db.select().from(botConfigTable).limit(1);
  if (existing.length > 0) {
    await db.update(botConfigTable).set({ ownerDiscordId: newOwnerDiscordId });
  } else {
    await db.insert(botConfigTable).values({ ownerDiscordId: newOwnerDiscordId });
  }
}
async function addAuthorizedUser(discordId, discordUsername, addedBy) {
  const existing = await db.select().from(authorizedUsersTable).where((0, import_drizzle_orm.eq)(authorizedUsersTable.discordId, discordId)).limit(1);
  if (existing.length > 0) return false;
  await db.insert(authorizedUsersTable).values({ discordId, discordUsername, addedBy });
  return true;
}
async function removeAuthorizedUser(discordId) {
  const result = await db.delete(authorizedUsersTable).where((0, import_drizzle_orm.eq)(authorizedUsersTable.discordId, discordId));
  return (result.rowCount ?? 0) > 0;
}
async function listAuthorizedUsers() {
  return db.select({
    discordId: authorizedUsersTable.discordId,
    discordUsername: authorizedUsersTable.discordUsername,
    addedAt: authorizedUsersTable.addedAt
  }).from(authorizedUsersTable);
}
async function ensureCredits(discordId) {
  await db.insert(userCreditsTable).values({ discordId, balance: 0 }).onConflictDoNothing();
}
async function getCredits(discordId) {
  await ensureCredits(discordId);
  const rows = await db.select({ balance: userCreditsTable.balance }).from(userCreditsTable).where((0, import_drizzle_orm.eq)(userCreditsTable.discordId, discordId)).limit(1);
  return rows[0]?.balance ?? 0;
}
async function deductCredits(discordId, amount) {
  const current = await getCredits(discordId);
  if (current < amount) return false;
  await db.update(userCreditsTable).set({
    balance: import_drizzle_orm.sql`${userCreditsTable.balance} - ${amount}`,
    updatedAt: /* @__PURE__ */ new Date()
  }).where((0, import_drizzle_orm.eq)(userCreditsTable.discordId, discordId));
  return true;
}
async function addDdAccount(name, email, password, addedBy) {
  const existing = await db.select({ id: ddAccountsTable.id }).from(ddAccountsTable).where((0, import_drizzle_orm.eq)(ddAccountsTable.email, email)).limit(1);
  if (existing.length > 0) {
    throw new Error(`An account with email ${email} is already registered.`);
  }
  const encryptedPassword = encrypt(password);
  const rows = await db.insert(ddAccountsTable).values({ name, email, encryptedPassword, addedBy }).returning({ id: ddAccountsTable.id });
  return rows[0].id;
}
async function saveOrder(params) {
  await db.insert(ordersTable).values(params);
}
async function saveTouch(params) {
  await db.insert(touchesTable).values(params);
}
async function createStripeSession(discordId, stripeSessionId, creditsAmount, amountCents) {
  await db.insert(stripeSessionsTable).values({
    discordId,
    stripeSessionId,
    creditsAmount,
    amountCents
  });
}

// src/commands/touch.ts
var touch_exports = {};
__export(touch_exports, {
  data: () => data,
  execute: () => execute
});
var import_discord = require("discord.js");
var data = new import_discord.SlashCommandBuilder().setName("touch").setDescription("Vouch that this service is real (photo required)").addAttachmentOption(
  (opt) => opt.setName("photo").setDescription("Photo proof (selfie, screenshot, etc.)").setRequired(true)
).addStringOption(
  (opt) => opt.setName("note").setDescription("Optional message with your vouch").setRequired(false)
);
async function execute(interaction) {
  await interaction.deferReply();
  const attachment = interaction.options.getAttachment("photo", true);
  const note = interaction.options.getString("note") ?? void 0;
  const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!attachment.contentType || !imageTypes.some((t) => attachment.contentType.startsWith(t.split("/")[0]))) {
    await interaction.editReply(
      "\u274C Please attach a valid image file (JPEG, PNG, GIF, or WebP)."
    );
    return;
  }
  if (!interaction.guildId) {
    await interaction.editReply("\u274C This command must be used in a server.");
    return;
  }
  await saveTouch({
    discordId: interaction.user.id,
    discordUsername: interaction.user.username,
    photoUrl: attachment.url,
    messageId: interaction.id,
    channelId: interaction.channelId,
    guildId: interaction.guildId,
    note
  });
  const embed = new import_discord.EmbedBuilder().setColor(5763719).setTitle("\u2705 Touch Submitted").setDescription(
    `**${interaction.user.displayName}** vouches this service is real!`
  ).setImage(attachment.url).setTimestamp();
  if (note) {
    embed.addFields({ name: "Note", value: note });
  }
  embed.setFooter({ text: `Vouched by ${interaction.user.tag}` });
  await interaction.editReply({ embeds: [embed] });
}

// src/commands/credits.ts
var credits_exports = {};
__export(credits_exports, {
  data: () => data2,
  execute: () => execute2
});
var import_discord2 = require("discord.js");

// src/utils/guards.ts
init_src();
init_schema();
var import_drizzle_orm2 = require("drizzle-orm");
async function getOwner() {
  const rows = await db.select().from(botConfigTable).limit(1);
  return rows[0]?.ownerDiscordId ?? null;
}
async function isOwner(discordId) {
  const owner = await getOwner();
  return owner === discordId;
}
async function isAuthorized(discordId) {
  if (await isOwner(discordId)) return true;
  const rows = await db.select().from(authorizedUsersTable).where((0, import_drizzle_orm2.eq)(authorizedUsersTable.discordId, discordId)).limit(1);
  return rows.length > 0;
}
async function requireOwner(interaction) {
  const ok = await isOwner(interaction.user.id);
  if (!ok) {
    await interaction.reply({
      content: "\u274C This command is restricted to the bot owner.",
      ephemeral: true
    });
  }
  return ok;
}
async function requireAuthorized(interaction) {
  const ok = await isAuthorized(interaction.user.id);
  if (!ok) {
    await interaction.reply({
      content: "\u274C You are not authorized to use this command.",
      ephemeral: true
    });
  }
  return ok;
}

// src/commands/credits.ts
var data2 = new import_discord2.SlashCommandBuilder().setName("credits").setDescription("Check your credit balance");
async function execute2(interaction) {
  if (!await requireAuthorized(interaction)) return;
  await interaction.deferReply({ ephemeral: true });
  const balance = await getCredits(interaction.user.id);
  const embed = new import_discord2.EmbedBuilder().setColor(16705372).setTitle("\u{1F4B0} Credit Balance").setDescription(`You have **${balance} credits**.`).addFields({
    name: "How credits work",
    value: "\u2022 10 credits = $5.00\n\u2022 Each order costs 10 credits\n\u2022 Max cart total: $50 (incl. taxes & delivery)\n\u2022 Use `/buycredits` to top up"
  }).setTimestamp();
  await interaction.editReply({ embeds: [embed] });
}

// src/commands/buycredits.ts
var buycredits_exports = {};
__export(buycredits_exports, {
  data: () => data3,
  execute: () => execute3
});
var import_discord3 = require("discord.js");
var import_stripe = __toESM(require("stripe"), 1);
var stripe = new import_stripe.default(process.env.STRIPE_SECRET_KEY);
var PACKAGES = [
  { label: "10 credits \u2014 $5", credits: 10, cents: 500 },
  { label: "20 credits \u2014 $10", credits: 20, cents: 1e3 },
  { label: "50 credits \u2014 $25", credits: 50, cents: 2500 }
];
var data3 = new import_discord3.SlashCommandBuilder().setName("buycredits").setDescription("Purchase credits to place orders ($5 = 10 credits)").addStringOption(
  (opt) => opt.setName("package").setDescription("Credit package to buy").setRequired(true).addChoices(
    { name: "10 credits \u2014 $5", value: "10" },
    { name: "20 credits \u2014 $10", value: "20" },
    { name: "50 credits \u2014 $25", value: "50" }
  )
);
async function execute3(interaction) {
  if (!await requireAuthorized(interaction)) return;
  await interaction.deferReply({ ephemeral: true });
  const packageCredits = parseInt(interaction.options.getString("package", true));
  const pkg = PACKAGES.find((p) => p.credits === packageCredits);
  if (!pkg) {
    await interaction.editReply("\u274C Invalid package selection.");
    return;
  }
  try {
    const domain = process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "https://example.com";
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: pkg.cents,
            product_data: {
              name: `${pkg.credits} Bot Credits`,
              description: `${pkg.credits} credits to place DoorDash orders via the Discord bot`
            }
          },
          quantity: 1
        }
      ],
      metadata: {
        discord_id: interaction.user.id,
        discord_username: interaction.user.username,
        credits: String(pkg.credits)
      },
      success_url: `${domain}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/api/stripe/cancel`
    });
    await createStripeSession(
      interaction.user.id,
      session.id,
      pkg.credits,
      pkg.cents
    );
    const embed = new import_discord3.EmbedBuilder().setColor(5793266).setTitle("\u{1F4B3} Complete Your Purchase").setDescription(
      `Click the link below to purchase **${pkg.credits} credits** for **$${(pkg.cents / 100).toFixed(2)}**.

The link expires in 30 minutes.`
    ).addFields({
      name: "Checkout Link",
      value: `[Click here to pay \u2192](${session.url})`
    }).setFooter({
      text: "Credits are added automatically after payment"
    }).setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error("Stripe error:", err);
    await interaction.editReply(
      "\u274C Failed to create checkout session. Please try again."
    );
  }
}

// src/commands/order.ts
var order_exports = {};
__export(order_exports, {
  data: () => data4,
  execute: () => execute4
});
var import_discord4 = require("discord.js");
init_manager();
var CREDITS_PER_ORDER = 10;
var MAX_TOTAL_CENTS = 5e3;
function extractCartId(url) {
  const match = url.match(
    /doordash\.com\/(?:group-order|shared-cart|checkout)\/([a-zA-Z0-9_-]+)/
  );
  return match?.[1] ?? null;
}
var data4 = new import_discord4.SlashCommandBuilder().setName("order").setDescription("Place an order from a DoorDash group order link").addStringOption(
  (opt) => opt.setName("link").setDescription("DoorDash group order share link").setRequired(true)
).addIntegerOption(
  (opt) => opt.setName("account").setDescription("DoorDash account ID to use (default: primary)").setRequired(false)
);
async function execute4(interaction) {
  if (!await requireAuthorized(interaction)) return;
  await interaction.deferReply({ ephemeral: true });
  const balance = await getCredits(interaction.user.id);
  if (balance < CREDITS_PER_ORDER) {
    const embed = new import_discord4.EmbedBuilder().setColor(15548997).setTitle("\u274C Insufficient Credits").setDescription(
      `You need **${CREDITS_PER_ORDER} credits** to place an order.
You have **${balance} credits**.

Use \`/buycredits\` to top up.`
    );
    await interaction.editReply({ embeds: [embed] });
    return;
  }
  const link = interaction.options.getString("link", true);
  const cartId = extractCartId(link);
  if (!cartId) {
    await interaction.editReply(
      "\u274C Could not parse a DoorDash group order link. Please share the exact link from DoorDash."
    );
    return;
  }
  const accountIdOpt = interaction.options.getInteger("account");
  let ddClient;
  try {
    if (accountIdOpt) {
      const { getClient: getClient2 } = await Promise.resolve().then(() => (init_manager(), manager_exports));
      ddClient = await getClient2(accountIdOpt);
    } else {
      ddClient = await getPrimaryClient();
    }
  } catch (err) {
    await interaction.editReply(`\u274C ${err.message}`);
    return;
  }
  const authResult = await ensureAuthenticated(ddClient);
  if (!authResult.ok) {
    await interaction.editReply(
      `\u274C DoorDash login failed: ${authResult.message}`
    );
    return;
  }
  let groupCart;
  try {
    groupCart = await ddClient.group.getGroupCart(cartId);
  } catch (err) {
    await interaction.editReply(
      `\u274C Failed to load group order: ${err.message}`
    );
    return;
  }
  let feeTally;
  try {
    feeTally = await ddClient.checkout.getFeeTally(cartId);
  } catch (err) {
    await interaction.editReply(
      `\u274C Failed to fetch order total: ${err.message}`
    );
    return;
  }
  if (feeTally.totalCents > MAX_TOTAL_CENTS) {
    const embed = new import_discord4.EmbedBuilder().setColor(15548997).setTitle("\u274C Cart Total Too High").setDescription(
      `Cart total is **${feeTally.total}** which exceeds the **$50.00** maximum (incl. taxes & delivery).

Please reduce your cart and try again.`
    );
    await interaction.editReply({ embeds: [embed] });
    return;
  }
  const memberList = groupCart.members.map(
    (m) => `**${m.name}** ${m.isFinalized ? "\u2705" : "\u{1F552}"}
${m.items.map((i) => `  \u2022 ${i.name} \xD7${i.quantity}`).join("\n")}`
  ).join("\n\n");
  const feeLines = feeTally.lineItems.map((li) => `${li.label}: ${li.amount}`).join("\n");
  const previewEmbed = new import_discord4.EmbedBuilder().setColor(5793266).setTitle("\u{1F355} Order Preview").setDescription(`**Cart ID:** \`${cartId}\``).addFields(
    {
      name: "Members & Items",
      value: memberList || "No items yet",
      inline: false
    },
    { name: "Fee Breakdown", value: feeLines || "N/A", inline: false },
    {
      name: "Total",
      value: `**${feeTally.total}**`,
      inline: true
    },
    {
      name: "Credits",
      value: `${CREDITS_PER_ORDER} (balance after: ${balance - CREDITS_PER_ORDER})`,
      inline: true
    }
  ).setFooter({
    text: "Confirm to place order. This will charge the DoorDash account."
  }).setTimestamp();
  const row = new import_discord4.ActionRowBuilder().addComponents(
    new import_discord4.ButtonBuilder().setCustomId("confirm_order").setLabel("\u2705 Confirm Order").setStyle(import_discord4.ButtonStyle.Success),
    new import_discord4.ButtonBuilder().setCustomId("cancel_order").setLabel("\u274C Cancel").setStyle(import_discord4.ButtonStyle.Danger)
  );
  const reply = await interaction.editReply({
    embeds: [previewEmbed],
    components: [row]
  });
  let buttonInteraction;
  try {
    buttonInteraction = await reply.awaitMessageComponent({
      componentType: import_discord4.ComponentType.Button,
      filter: (i) => i.user.id === interaction.user.id,
      time: 6e4
    });
  } catch {
    await interaction.editReply({
      content: "\u23F1\uFE0F Order confirmation timed out.",
      embeds: [],
      components: []
    });
    return;
  }
  if (buttonInteraction.customId === "cancel_order") {
    await buttonInteraction.update({
      content: "\u274C Order cancelled.",
      embeds: [],
      components: []
    });
    return;
  }
  await buttonInteraction.update({
    content: "\u23F3 Placing order...",
    embeds: [],
    components: []
  });
  let orderResult;
  try {
    orderResult = await ddClient.checkout.createOrder({
      cartId,
      storeId: groupCart.storeId ?? "",
      totalCents: feeTally.totalCents
    });
    await saveSession(ddClient);
  } catch (err) {
    await interaction.editReply(`\u274C Order failed: ${err.message}`);
    return;
  }
  if (orderResult.paymentStatus === "failed") {
    await interaction.editReply(
      `\u274C Payment failed: ${orderResult.errorMessage ?? "Unknown error"}`
    );
    return;
  }
  const deducted = await deductCredits(interaction.user.id, CREDITS_PER_ORDER);
  if (!deducted) {
    console.warn(`Credit deduction failed for ${interaction.user.id}`);
  }
  const trackingUrl = `https://www.doordash.com/orders/${orderResult.orderUuid}/status/`;
  await saveOrder({
    discordId: interaction.user.id,
    orderUuid: orderResult.orderUuid,
    ddAccountId: ddClient.accountId,
    groupOrderUrl: link,
    storeName: void 0,
    totalCents: orderResult.totalCents,
    creditsUsed: CREDITS_PER_ORDER,
    status: orderResult.paymentStatus,
    trackingUrl
  });
  const guild = interaction.guild;
  if (guild) {
    try {
      const channelName = `order-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, "")}-${orderResult.orderUuid.slice(0, 8)}`;
      const orderChannel = await guild.channels.create({
        name: channelName,
        type: import_discord4.ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: guild.roles.everyone,
            deny: [import_discord4.PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              import_discord4.PermissionFlagsBits.ViewChannel,
              import_discord4.PermissionFlagsBits.SendMessages,
              import_discord4.PermissionFlagsBits.ReadMessageHistory
            ]
          },
          {
            id: guild.members.me.id,
            allow: [
              import_discord4.PermissionFlagsBits.ViewChannel,
              import_discord4.PermissionFlagsBits.SendMessages,
              import_discord4.PermissionFlagsBits.ManageChannels
            ]
          }
        ],
        topic: `Order ${orderResult.orderUuid} \u2014 placed by ${interaction.user.tag}`
      });
      const channelEmbed = new import_discord4.EmbedBuilder().setColor(5763719).setTitle("\u{1F389} Order Placed!").setDescription(
        `Hey ${interaction.user}! Your order has been placed successfully.`
      ).addFields(
        { name: "Order ID", value: `\`${orderResult.orderUuid}\``, inline: true },
        {
          name: "Status",
          value: orderResult.paymentStatus === "paid" ? "\u2705 Paid" : "\u23F3 Processing",
          inline: true
        },
        {
          name: "Total",
          value: `$${(orderResult.totalCents / 100).toFixed(2)}`,
          inline: true
        },
        {
          name: "\u{1F517} Track Your Order",
          value: `[Click here to track \u2192](${trackingUrl})`
        }
      ).setFooter({
        text: "This channel will be closed automatically when your order arrives."
      }).setTimestamp();
      await orderChannel.send({
        content: `${interaction.user}`,
        embeds: [channelEmbed]
      });
      scheduleChannelClose(
        orderResult.orderUuid,
        orderChannel.id,
        guild.id,
        interaction.client
      );
      await interaction.editReply(
        `\u2705 **Order placed!** Check ${orderChannel} for your tracking link.
\u{1F517} [Track Order](${trackingUrl})`
      );
    } catch (err) {
      console.error("Failed to create order channel:", err);
      await interaction.editReply(
        `\u2705 **Order placed!**
\u{1F517} [Track Order](${trackingUrl})
*(Could not create private channel)*`
      );
    }
  } else {
    await interaction.editReply(
      `\u2705 **Order placed!**
\u{1F517} [Track Order](${trackingUrl})`
    );
  }
}
function scheduleChannelClose(orderUuid, channelId, guildId, client2) {
  let attempts = 0;
  const MAX_ATTEMPTS = 60;
  const POLL_INTERVAL = 2 * 60 * 1e3;
  const poll = async () => {
    attempts++;
    try {
      const guild = await client2.guilds.fetch(guildId);
      const channel = await guild.channels.fetch(channelId);
      if (!channel) return;
      const ddClient = await getPrimaryClient();
      const authOk = await ensureAuthenticated(ddClient);
      if (!authOk.ok) {
        if (attempts >= MAX_ATTEMPTS) await channel.delete("Order timeout");
        else setTimeout(poll, POLL_INTERVAL);
        return;
      }
      const statusData = await ddClient.gql.query(
        "pollOrderPaymentStatus",
        { orderId: orderUuid },
        ddClient.gql.loadQuery("pollOrderPaymentStatus.graphql")
      );
      const ps = statusData?.pollOrderPaymentStatus;
      if (attempts >= 45) {
        await channel.send(
          "\u2705 **Order should have arrived!** Closing this channel in 60 seconds."
        );
        setTimeout(async () => {
          try {
            await channel.delete("Order complete");
          } catch {
          }
        }, 6e4);
        return;
      }
      if (attempts < MAX_ATTEMPTS) {
        setTimeout(poll, POLL_INTERVAL);
      } else {
        await channel.delete("Order timeout");
      }
    } catch (err) {
      console.error("Channel poll error:", err);
      if (attempts < MAX_ATTEMPTS) setTimeout(poll, POLL_INTERVAL);
    }
  };
  setTimeout(poll, 15 * 60 * 1e3);
}

// src/commands/adduser.ts
var adduser_exports = {};
__export(adduser_exports, {
  data: () => data5,
  execute: () => execute5
});
var import_discord5 = require("discord.js");
var data5 = new import_discord5.SlashCommandBuilder().setName("adduser").setDescription("Grant a user access to bot commands (owner only)").addUserOption(
  (opt) => opt.setName("user").setDescription("User to authorize").setRequired(true)
);
async function execute5(interaction) {
  if (!await requireOwner(interaction)) return;
  const target = interaction.options.getUser("user", true);
  if (target.bot) {
    await interaction.reply({ content: "\u274C Cannot add bots.", ephemeral: true });
    return;
  }
  const added = await addAuthorizedUser(
    target.id,
    target.username,
    interaction.user.id
  );
  const embed = new import_discord5.EmbedBuilder().setColor(added ? 5763719 : 16705372).setTitle(added ? "\u2705 User Added" : "\u26A0\uFE0F Already Authorized").setDescription(
    added ? `**${target.tag}** has been granted access to bot commands.` : `**${target.tag}** is already authorized.`
  ).setTimestamp();
  await interaction.reply({ embeds: [embed], ephemeral: true });
}

// src/commands/removeuser.ts
var removeuser_exports = {};
__export(removeuser_exports, {
  data: () => data6,
  execute: () => execute6
});
var import_discord6 = require("discord.js");
var data6 = new import_discord6.SlashCommandBuilder().setName("removeuser").setDescription("Revoke a user's access to bot commands (owner only)").addUserOption(
  (opt) => opt.setName("user").setDescription("User to remove").setRequired(true)
);
async function execute6(interaction) {
  if (!await requireOwner(interaction)) return;
  const target = interaction.options.getUser("user", true);
  const removed = await removeAuthorizedUser(target.id);
  const embed = new import_discord6.EmbedBuilder().setColor(removed ? 15548997 : 16705372).setTitle(removed ? "\u2705 User Removed" : "\u26A0\uFE0F User Not Found").setDescription(
    removed ? `**${target.tag}** can no longer use bot commands.` : `**${target.tag}** was not in the authorized list.`
  ).setTimestamp();
  await interaction.reply({ embeds: [embed], ephemeral: true });
}

// src/commands/listusers.ts
var listusers_exports = {};
__export(listusers_exports, {
  data: () => data7,
  execute: () => execute7
});
var import_discord7 = require("discord.js");
var data7 = new import_discord7.SlashCommandBuilder().setName("listusers").setDescription("List all users authorized to use bot commands (owner only)");
async function execute7(interaction) {
  if (!await requireOwner(interaction)) return;
  await interaction.deferReply({ ephemeral: true });
  const users = await listAuthorizedUsers();
  const embed = new import_discord7.EmbedBuilder().setColor(5793266).setTitle("\u{1F465} Authorized Users").setTimestamp();
  if (users.length === 0) {
    embed.setDescription("No authorized users yet. Use `/adduser` to add one.");
  } else {
    embed.setDescription(
      users.map(
        (u, i) => `${i + 1}. **${u.discordUsername}** (<@${u.discordId}>)
   Added: ${u.addedAt.toLocaleDateString()}`
      ).join("\n")
    );
    embed.setFooter({ text: `${users.length} authorized user(s)` });
  }
  await interaction.editReply({ embeds: [embed] });
}

// src/commands/transfer.ts
var transfer_exports = {};
__export(transfer_exports, {
  data: () => data8,
  execute: () => execute8
});
var import_discord8 = require("discord.js");
var data8 = new import_discord8.SlashCommandBuilder().setName("transfer").setDescription("Transfer bot ownership to another user (owner only)").addUserOption(
  (opt) => opt.setName("user").setDescription("User to become the new owner").setRequired(true)
);
async function execute8(interaction) {
  if (!await requireOwner(interaction)) return;
  const target = interaction.options.getUser("user", true);
  if (target.id === interaction.user.id) {
    await interaction.reply({
      content: "\u274C You are already the owner.",
      ephemeral: true
    });
    return;
  }
  if (target.bot) {
    await interaction.reply({
      content: "\u274C Cannot transfer ownership to a bot.",
      ephemeral: true
    });
    return;
  }
  const embed = new import_discord8.EmbedBuilder().setColor(16705372).setTitle("\u26A0\uFE0F Confirm Ownership Transfer").setDescription(
    `Are you sure you want to transfer bot ownership to **${target.tag}**?

**This cannot be undone.** You will lose owner access immediately.`
  );
  const row = new import_discord8.ActionRowBuilder().addComponents(
    new import_discord8.ButtonBuilder().setCustomId("confirm_transfer").setLabel("\u2705 Yes, Transfer").setStyle(import_discord8.ButtonStyle.Danger),
    new import_discord8.ButtonBuilder().setCustomId("cancel_transfer").setLabel("\u274C Cancel").setStyle(import_discord8.ButtonStyle.Secondary)
  );
  const reply = await interaction.reply({
    embeds: [embed],
    components: [row],
    ephemeral: true
  });
  let btn;
  try {
    btn = await reply.awaitMessageComponent({
      componentType: import_discord8.ComponentType.Button,
      filter: (i) => i.user.id === interaction.user.id,
      time: 3e4
    });
  } catch {
    await interaction.editReply({
      content: "\u23F1\uFE0F Transfer cancelled (timed out).",
      embeds: [],
      components: []
    });
    return;
  }
  if (btn.customId === "cancel_transfer") {
    await btn.update({
      content: "\u274C Transfer cancelled.",
      embeds: [],
      components: []
    });
    return;
  }
  await transferOwnership(target.id);
  await btn.update({
    embeds: [
      new import_discord8.EmbedBuilder().setColor(5763719).setTitle("\u2705 Ownership Transferred").setDescription(
        `Bot ownership has been transferred to **${target.tag}**.
You no longer have owner privileges.`
      ).setTimestamp()
    ],
    components: []
  });
}

// src/commands/addaccount.ts
var addaccount_exports = {};
__export(addaccount_exports, {
  data: () => data9,
  execute: () => execute9
});
var import_discord9 = require("discord.js");
init_manager();
var data9 = new import_discord9.SlashCommandBuilder().setName("addaccount").setDescription("Add a DoorDash account to the bot (authorized only)").addStringOption(
  (opt) => opt.setName("email").setDescription("DoorDash account email").setRequired(true)
).addStringOption(
  (opt) => opt.setName("password").setDescription("DoorDash account password").setRequired(true)
).addStringOption(
  (opt) => opt.setName("name").setDescription("Friendly label for this account (e.g. 'Account 1')").setRequired(false)
);
async function execute9(interaction) {
  if (!await requireAuthorized(interaction)) return;
  await interaction.deferReply({ ephemeral: true });
  const email = interaction.options.getString("email", true);
  const password = interaction.options.getString("password", true);
  const name = interaction.options.getString("name") ?? email.split("@")[0];
  try {
    const accountId = await addDdAccount(
      name,
      email,
      password,
      interaction.user.id
    );
    const client2 = await getClient(accountId);
    const authResult = await ensureAuthenticated(client2);
    let statusField;
    if (authResult.ok) {
      await saveSession(client2);
      statusField = "\u2705 Logged in successfully";
    } else if (authResult.message.includes("MFA")) {
      statusField = `\u26A0\uFE0F MFA required \u2014 check your email/phone for a verification code`;
    } else {
      statusField = `\u26A0\uFE0F Login issue: ${authResult.message}`;
    }
    const embed = new import_discord9.EmbedBuilder().setColor(5763719).setTitle("\u2705 Account Added").addFields(
      { name: "Account", value: name, inline: true },
      { name: "Email", value: email, inline: true },
      { name: "ID", value: `#${accountId}`, inline: true },
      { name: "Status", value: statusField }
    ).setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    await interaction.editReply(`\u274C Failed to add account: ${err.message}`);
  }
}

// src/commands/addcard.ts
var addcard_exports = {};
__export(addcard_exports, {
  data: () => data10,
  execute: () => execute10
});
var import_discord10 = require("discord.js");
init_manager();
var data10 = new import_discord10.SlashCommandBuilder().setName("addcard").setDescription("Add a payment card to a DoorDash account (authorized only)").addStringOption(
  (opt) => opt.setName("number").setDescription("Card number (16 digits)").setRequired(true)
).addStringOption(
  (opt) => opt.setName("exp_month").setDescription("Expiry month (MM)").setRequired(true)
).addStringOption(
  (opt) => opt.setName("exp_year").setDescription("Expiry year (YYYY)").setRequired(true)
).addStringOption(
  (opt) => opt.setName("cvc").setDescription("CVC / CVV").setRequired(true)
).addIntegerOption(
  (opt) => opt.setName("account_id").setDescription("DoorDash account ID (default: primary)").setRequired(false)
);
async function execute10(interaction) {
  if (!await requireAuthorized(interaction)) return;
  await interaction.deferReply({ ephemeral: true });
  const cardNumber = interaction.options.getString("number", true).replace(/\s/g, "");
  const expMonth = interaction.options.getString("exp_month", true);
  const expYear = interaction.options.getString("exp_year", true);
  const cvc = interaction.options.getString("cvc", true);
  const accountIdOpt = interaction.options.getInteger("account_id");
  if (!/^\d{13,19}$/.test(cardNumber)) {
    await interaction.editReply("\u274C Invalid card number format.");
    return;
  }
  try {
    let ddClient;
    if (accountIdOpt) {
      ddClient = await getClient(accountIdOpt);
    } else {
      const { getPrimaryClient: getPrimaryClient2 } = await Promise.resolve().then(() => (init_manager(), manager_exports));
      ddClient = await getPrimaryClient2();
    }
    const authResult = await ensureAuthenticated(ddClient);
    if (!authResult.ok) {
      await interaction.editReply(
        `\u274C DoorDash login failed: ${authResult.message}`
      );
      return;
    }
    const result = await ddClient.account.addCard({
      cardNumber,
      expMonth,
      expYear,
      cvc
    });
    await saveSession(ddClient);
    const embed = new import_discord10.EmbedBuilder().setColor(5763719).setTitle("\u2705 Card Added").addFields(
      {
        name: "Card",
        value: `${result.brand} ending in **${result.last4}**`,
        inline: true
      },
      { name: "Account", value: ddClient.email, inline: true }
    ).setFooter({ text: "Card stored securely in DoorDash" }).setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    await interaction.editReply(`\u274C Failed to add card: ${err.message}`);
  }
}

// src/index.ts
var commands = [
  touch_exports,
  credits_exports,
  buycredits_exports,
  order_exports,
  adduser_exports,
  removeuser_exports,
  listusers_exports,
  transfer_exports,
  addaccount_exports,
  addcard_exports
];
var BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
var STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
if (!BOT_TOKEN) throw new Error("DISCORD_BOT_TOKEN is required");
if (!STRIPE_KEY) throw new Error("STRIPE_SECRET_KEY is required");
if (!process.env.SESSION_SECRET) throw new Error("SESSION_SECRET is required");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
var client = new import_discord11.Client({
  intents: [
    import_discord11.GatewayIntentBits.Guilds,
    import_discord11.GatewayIntentBits.GuildMembers,
    import_discord11.GatewayIntentBits.GuildMessages
  ]
});
var commandCollection = new import_discord11.Collection();
for (const cmd of commands) {
  commandCollection.set(cmd.data.name, cmd);
}
async function registerCommands() {
  const rest = new import_discord11.REST({ version: "10" }).setToken(BOT_TOKEN);
  const body = commands.map((c) => c.data.toJSON());
  try {
    console.log(`[bot] Registering ${body.length} slash commands...`);
    await rest.put(import_discord11.Routes.applicationCommands(client.user.id), { body });
    console.log("[bot] Slash commands registered.");
  } catch (err) {
    console.error("[bot] Failed to register commands:", err);
  }
}
client.once("ready", async (c) => {
  console.log(`[bot] Logged in as ${c.user.tag}`);
  await registerCommands();
  const ownerId = process.env.OWNER_DISCORD_ID;
  if (ownerId) {
    await initOwner(ownerId).catch(() => {
    });
    console.log(`[bot] Owner set to ${ownerId}`);
  }
});
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = commandCollection.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`[bot] Error in /${interaction.commandName}:`, err);
    const msg = { content: "\u274C An error occurred. Please try again.", ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(msg).catch(() => {
      });
    } else {
      await interaction.reply(msg).catch(() => {
      });
    }
  }
});
client.login(BOT_TOKEN);

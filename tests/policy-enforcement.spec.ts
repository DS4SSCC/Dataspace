/**
 * @author A.P.A. Slaa (a.slaa@student.fontys.nl)
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";

type DecisionResponse =
    | { decision: "allow" | "deny"; reason?: string; details?: unknown }
    | { allow: boolean; reason?: string; details?: unknown }
    | { result: boolean; reason?: string; details?: unknown };

type PolicyUpdateResponse = { ok: true } | { success: true } | unknown;

const BASE_URL = process.env.DATASPACE_BASE_URL ?? "http://localhost:5173";

/**
 * Endpoint that evaluates a request context against the currently loaded policy set.
 * Expected: returns JSON with either {decision:"allow"|"deny"} OR {allow:true|false} OR {result:true|false}
 */
const DECIDE_ENDPOINT = process.env.DATASPACE_DECIDE_ENDPOINT ?? "/api/v1/decision";

/**
 * Endpoint that updates policy at runtime (ODRL updated -> translated -> reloaded in OPA).
 * Expected: accepts JSON body (policy payload) and returns 200-ish.
 */
const POLICY_UPDATE_ENDPOINT =
    process.env.DATASPACE_POLICY_UPDATE_ENDPOINT ?? "/api/v1/policy";

/**
 * Optional endpoint to force reload after policy update (if your app needs it).
 */
const POLICY_RELOAD_ENDPOINT =
    process.env.DATASPACE_POLICY_RELOAD_ENDPOINT ?? "";

/**
 * If your API requires auth, set DATASPACE_AUTH_HEADER="Authorization: Bearer xxx"
 * (or any other single header "Key: Value")
 */
const AUTH_HEADER_RAW = process.env.DATASPACE_AUTH_HEADER ?? "";
const EXTRA_HEADERS: Record<string, string> = (() => {
    if (!AUTH_HEADER_RAW.trim()) return {};
    const idx = AUTH_HEADER_RAW.indexOf(":");
    if (idx === -1) return {};
    return { [AUTH_HEADER_RAW.slice(0, idx).trim()]: AUTH_HEADER_RAW.slice(idx + 1).trim() };
})();

function url(path: string) {
    return new URL(path, BASE_URL).toString();
}

function parseDecision(payload: DecisionResponse): "allow" | "deny" {
    if (!payload || typeof payload !== "object") return "deny";

    // Shape 1: { decision: "allow" | "deny" }
    if ("decision" in payload && (payload as any).decision) {
        return (payload as any).decision === "allow" ? "allow" : "deny";
    }

    // Shape 2: { allow: boolean }
    if ("allow" in payload && typeof (payload as any).allow === "boolean") {
        return (payload as any).allow ? "allow" : "deny";
    }

    // Shape 3: { result: boolean }
    if ("result" in payload && typeof (payload as any).result === "boolean") {
        return (payload as any).result ? "allow" : "deny";
    }

    return "deny";
}

async function decide(context: Record<string, any>) {
    const res = await fetch(url(DECIDE_ENDPOINT), {
        method: "POST",
        headers: {
            "content-type": "application/json",
            ...EXTRA_HEADERS,
        },
        body: JSON.stringify(context),
    });

    const text = await res.text();
    let json: any;
    try {
        json = text ? JSON.parse(text) : {};
    } catch {
        json = { raw: text };
    }

    return {
        status: res.status,
        raw: json,
        decision: parseDecision(json),
    };
}

async function updatePolicy(policyPayload: Record<string, any>) {
    const res = await fetch(url(POLICY_UPDATE_ENDPOINT), {
        method: "POST",
        headers: {
            "content-type": "application/json",
            ...EXTRA_HEADERS,
        },
        body: JSON.stringify(policyPayload),
    });

    const text = await res.text();
    let json: any;
    try {
        json = text ? JSON.parse(text) : {};
    } catch {
        json = { raw: text };
    }

    // Optional reload hook (only if you configured it)
    if (POLICY_RELOAD_ENDPOINT) {
        await fetch(url(POLICY_RELOAD_ENDPOINT), {
            method: "POST",
            headers: { ...EXTRA_HEADERS },
        });
    }

    return { status: res.status, raw: json as PolicyUpdateResponse };
}

/**
 * Test fixtures
 *
 * IMPORTANT:
 * Adapt the request context keys below to what your middleware expects.
 * The same structure is used across T1..T5 so the tests remain consistent.
 */
const ctxAllowed = {
    actor: "alice",
    action: "read",
    asset: "dataset:demo",
};

const ctxDeniedAction = {
    actor: "alice",
    action: "delete",
    asset: "dataset:demo",
};

const ctxConstraintViolation = {
    actor: "alice",
    action: "read",
    asset: "dataset:demo",
    // Example constraint you can wire to your ODRL->Rego mapping:
    // e.g. purpose must be "research", but request uses "commercial"
    purpose: "commercial",
};

/**
 * Policy payloads for runtime updates (T4/T5)
 *
 * MUST adapt these to whatever your policy-update endpoint expects.
 * Common patterns:
 * - { policy: <odrl-json> }
 * - { id: "...", policy: <odrl-json> }
 * - { path: "...", content: "...odrl..." }
 */
const policyLoosen = {
    // Example: after update, alice+read becomes allowed (or constraint removed)
    mode: "replace",
    id: "demo-policy",
    policy: {
        "@context": "http://www.w3.org/ns/odrl.jsonld",
        "@type": "Set",
        "uid": "demo-policy",
        "permission": [
            {
                "target": "dataset:demo",
                "assignee": "alice",
                "action": "read",
            },
        ],
    },
};

const policyTighten = {
    // Example: after update, the SAME request is denied (tightened constraint)
    mode: "replace",
    id: "demo-policy",
    policy: {
        "@context": "http://www.w3.org/ns/odrl.jsonld",
        "@type": "Set",
        "uid": "demo-policy",
        "permission": [
            {
                "target": "dataset:demo",
                "assignee": "alice",
                "action": "read",
                "constraint": [
                    {
                        "leftOperand": "purpose",
                        "operator": "eq",
                        "rightOperand": "research",
                    },
                ],
            },
        ],
    },
};

describe("Policy enforcement scenarios (T1–T5)", () => {
    beforeAll(async () => {
        // Quick sanity check so failures are actionable
        const ping = await fetch(url("/"), { method: "GET" }).catch(() => null);
        if (!ping) {
            throw new Error(
                `Dataspace not reachable at ${BASE_URL}. Start it (npm run dev) or set DATASPACE_BASE_URL.`
            );
        }
    });

    afterAll(async () => {
        // no-op; keep for future teardown if needed
    });

    it("T1 — Permission granted: actor and action allowed => Allow", async () => {
        const r = await decide(ctxAllowed);
        expect(r.status).toBeGreaterThanOrEqual(200);
        expect(r.status).toBeLessThan(500);
        expect(r.decision).toBe("allow");
    });

    it("T2 — Permission denied: action not permitted => Deny", async () => {
        const r = await decide(ctxDeniedAction);
        expect(r.status).toBeGreaterThanOrEqual(200);
        expect(r.status).toBeLessThan(500);
        expect(r.decision).toBe("deny");
    });

    it("T3 — Constraint violation: constraint not satisfied => Deny", async () => {
        const r = await decide(ctxConstraintViolation);
        expect(r.status).toBeGreaterThanOrEqual(200);
        expect(r.status).toBeLessThan(500);
        expect(r.decision).toBe("deny");
    });

    it("T4 — Policy updated at runtime: same request after update => Allow", async () => {
        const u = await updatePolicy(policyLoosen);
        expect(u.status).toBeGreaterThanOrEqual(200);
        expect(u.status).toBeLessThan(500);

        const r = await decide(ctxAllowed);
        expect(r.decision).toBe("allow");
    });

    it("T5 — Policy tightened at runtime: same request after update => Deny", async () => {
        const u = await updatePolicy(policyTighten);
        expect(u.status).toBeGreaterThanOrEqual(200);
        expect(u.status).toBeLessThan(500);

        // same request as T1/T4, but should now be denied
        const r = await decide(ctxAllowed);
        expect(r.decision).toBe("deny");
    });
});

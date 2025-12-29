import {cfg} from "./config";
import {sign} from "@sourceregistry/node-jwt";
import {KeyStore} from "$lib/server/configurations/keystore.configuration";

export type RequestContext = {
    subject?: string;
    role?: string;
    purpose?: string;
    action?: string;
    dataset?: string;
};

export async function getViaGateway(ctx: RequestContext) {
    const url = new URL(cfg.DATA_PATH, cfg.GATEWAY_BASE_URL)
    url.pathname += `/${ctx.dataset}`

    const headers: Record<string, string> = {
        "Authentication": `Bearer ${sign(ctx, KeyStore.private)}`
    };

    const started = performance.now();
    const res = await fetch(url, {method: "GET", headers});
    const ended = performance.now();

    const bodyText = await res.text().catch(() => "");
    return {
        url,
        status: res.status,
        headers: res.headers,
        bodyText,
        latencyMs: ended - started,
        context: ctx,
    };
}

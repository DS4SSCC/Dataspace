import { getViaGateway } from "./client";
import { writeEvidence } from "./evidence";

async function run(label: string, ctx: Parameters<typeof getViaGateway>[0], n = 200) {
    const latencies: number[] = [];
    const statuses: number[] = [];

    for (let i = 0; i < n; i++) {
        const r = await getViaGateway(ctx);
        latencies.push(r.latencyMs);
        statuses.push(r.status);
    }

    const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;

    writeEvidence(`A_overhead_${label}.json`, { n, avgMs: avg, latencies, statuses });

    console.log(`${label}: avg=${avg.toFixed(2)}ms (n=${n})`);
}

async function main() {
    // “With enforcement” == normal call with context headers causing PDP evaluation
    await run("with_enforcement", {
        subject: "alice",
        role: "municipality",
        purpose: "traffic-management",
        action: "read",
        dataset: "dataset-a",
    });

    // “Without enforcement” depends on your prototype:
    // - either a special mode/route, or a config toggle, or an endpoint behind a no-OPA gateway.
    // If you have a dedicated baseline gateway URL, set it in env and switch cfg.GATEWAY_BASE_URL temporarily.
    console.log(
        "For 'without_enforcement', point GATEWAY_BASE_URL to a baseline deployment (OPA disabled) and rerun.",
    );
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});

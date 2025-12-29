import { describe, it, expect } from "vitest";
import { getViaGateway } from "./client";
import { writeEvidence } from "./evidence";

describe("Determinism Validation Scenario", () => {
    it("returns identical decisions for identical inputs across repeated executions", async () => {
        const req = {
            subject: "mallory",
            role: "unknown",
            purpose: "scraping",
            action: "read",
            dataset: "dataset-a",
        };

        const results = [];
        for (let i = 0; i < 20; i++) results.push(await getViaGateway(req));

        writeEvidence("determinism.json", {
            statuses: results.map((r) => r.status),
            latenciesMs: results.map((r) => r.latencyMs),
        });

        const first = results[0].status;
        for (const r of results) expect(r.status).toBe(first);
    });
});

import { describe, it, expect } from "vitest";
import { cfg } from "./config";
import { getViaGateway } from "./client";
import { writeEvidence } from "./evidence";

describe("Runtime Policy Update Scenario", () => {
    it("reflects updated policy state without restart (no stale/cached decisions)", async () => {
        // Choose a request that you EXPECT to flip after the update
        const req = {
            subject: "bob",
            role: "partner",
            purpose: "research",
            action: "read",
            dataset: "dataset-a",
        };

        const before = await getViaGateway(req);
        writeEvidence("policyUpdate_before.json", before);

        // Apply update during runtime (no service restart)
        if (cfg.POLICY_UPDATE_URL) {
            await fetch(cfg.POLICY_UPDATE_URL, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    note: "Trigger policy update for Appendix C scenario",
                    dataset: req.dataset,
                }),
            });
        } else {
            // If no endpoint exists, do the update manually and rerun the test
            // (or split this into two scripts: before.ts and after.ts)
            throw new Error("POLICY_UPDATE_URL not set. Either add it or run policy update manually.");
        }

        const after = await getViaGateway(req);
        writeEvidence("policyUpdate_after.json", after);

        // expects behavior reflects updated policy state immediately
        // If your update flips deny->permit:
        expect(after.status).toBe(cfg.EXPECT_ALLOW_STATUS);

        // If your update flips permit->deny, change to:
        // expect(after.status).toBe(cfg.EXPECT_DENY_STATUS);
    });
});

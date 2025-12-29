import { describe, it, expect } from "vitest";
import { cfg } from "./config";
import { getViaGateway } from "./client";
import { writeEvidence } from "./evidence";

describe("Authorized Access Scenario", () => {
    it("permits and forwards a compliant request (Permit => forwarded)", async () => {
        const r = await getViaGateway({
            subject: "alice",
            role: "municipality",
            purpose: "traffic-management",
            action: "read",
            dataset: "dataset-a",
        });

        writeEvidence("C_authorized.json", r);

        // Expected outcome: Permit + request forwarded
        expect(r.status).toBe(cfg.EXPECT_ALLOW_STATUS);
        expect(r.bodyText.length).toBeGreaterThan(0);
    });
});

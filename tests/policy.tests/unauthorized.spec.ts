import { describe, it, expect } from "vitest";
import { cfg } from "./config";
import { getViaGateway } from "./client";
import { writeEvidence } from "./evidence";

describe("Unauthorized Access Scenario", () => {
    it("denies a violating request (Deny => rejected at middleware)", async () => {
        const r = await getViaGateway({
            subject: "mallory",
            role: "unknown",
            purpose: "scraping",
            action: "read",
            dataset: "dataset-a",
        });

        writeEvidence("C_unauthorized.json", r);

        // Expected outcome in Deny + backend not accessed
        expect(r.status).toBe(cfg.EXPECT_DENY_STATUS);
    });
});

import {env} from "@sourceregistry/node-env";
import "dotenv/config";

export const cfg = {
    // PEP / Gateway base URL (middleware)
    GATEWAY_BASE_URL: env.string("GATEWAY_BASE_URL", "http://localhost:5173/api/v1"),

    // Gateway path to the data resource (the thing you call through the PEP)
    DATA_PATH: env.string("DATA_PATH", '/dataset'),

    // Expected decisions
    EXPECT_ALLOW_STATUS: env.number("EXPECT_ALLOW_STATUS", 200),
    EXPECT_DENY_STATUS: env.number("EXPECT_DENY_STATUS", 403),

    // Evidence output
    EVIDENCE_DIR: env.string("EVIDENCE_DIR", "evidence"),

    /**
     * Runtime policy update mechanism.
     * In Appendix C you validate policy updates without restart.
     * If your prototype has no endpoint, leave empty and run the update step manually.
     */
    POLICY_UPDATE_URL: env.string("POLICY_UPDATE_URL")
};

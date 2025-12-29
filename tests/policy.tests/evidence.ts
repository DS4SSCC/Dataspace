import fs from "node:fs";
import path from "node:path";
import { cfg } from "./config";

export function writeEvidence(fileName: string, payload: unknown) {
    const dir = path.resolve(process.cwd(), cfg.EVIDENCE_DIR);
    fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(
        path.join(dir, fileName),
        JSON.stringify({ timestamp: new Date().toISOString(), payload }, null, 2),
    );
}

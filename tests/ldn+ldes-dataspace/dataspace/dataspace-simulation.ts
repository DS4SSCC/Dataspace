import express from "express";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";
import { EventEmitter } from "events";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const eventBus = new EventEmitter();

function log(message: string) {
    console.log(message);
    eventBus.emit("log", message);
}

// Provider factory
function createProvider(name: string, port: number) {
    const app = express();
    app.use(bodyParser.json());

    // ✅ CORS fix
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
        res.header("Access-Control-Allow-Headers", "Content-Type");
        if (req.method === "OPTIONS") return res.sendStatus(200);
        next();
    });

    let events: any[] = [];

    app.get("/ldes/events", (req, res) => {
        res.json(events);
    });

    app.post("/produce", async (req, res) => {
        const id = uuidv4();
        const event = { id, name, timestamp: new Date().toISOString() };
        events.push(event);
        log(`[${name}] Produced event ${id}`);

        const notifyUrl = req.body.notify;
        if (notifyUrl) {
            log(`[${name}] Sending LDN notification to ${notifyUrl}`);
            try {
                await fetch(notifyUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ provider: name, ldes: `http://localhost:${port}/ldes/events` }),
                });
                log(`[${name}] Notification sent.`);
            } catch (err) {
                log(`[${name}] Failed to send notification: ${err}`);
            }
        }

        res.json({ ok: true, id });
    });

    app.listen(port, () => log(`${name} running on http://localhost:${port}`));
}

// Registry
const registry = express();
registry.use(bodyParser.json());
const catalog: any[] = [];

registry.post("/inbox", async (req, res) => {
    const { provider, ldes } = req.body;
    log(`[Registry] Received LDN notification from ${provider}, fetching from ${ldes}`);

    try {
        const resp = await fetch(ldes);
        const data = await resp.json();
        catalog.push(...data);
        log(`[Registry] Ingested ${data.length} events from ${provider}`);
    } catch (err) {
        log(`[Registry] Failed to fetch data: ${err}`);
    }
    res.json({ ok: true });
});

registry.get("/catalog", (req, res) => {
    res.json(catalog);
});

// 🔸 Server-Sent Events endpoint
registry.get("/events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const listener = (msg: string) => res.write(`data: ${msg}\n\n`);
    eventBus.on("log", listener);
    req.on("close", () => eventBus.off("log", listener));
});

// 🔸 Serve static frontend
registry.use(express.static(path.join(__dirname, "public")));

registry.listen(4000, () => log("Registry running on http://localhost:4000"));

// Start providers
createProvider("Provider A", 3001);
createProvider("Provider B", 3002);

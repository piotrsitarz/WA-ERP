import Fastify from "fastify";

import { config } from "./config.js";
import { createDedupe } from "./utils/dedupe.js";
import { parseCommand } from "./utils/parseCommand.js";
import { createWhatsappClient } from "./services/whatsappClient.js";
import { createWhatsappWebhookHandler } from "./handlers/whatsappWebhook.js";
import { dispatchCommand } from "./commands/index.js";
import type { WhatsappWebhookBody } from "./models/whatsapp.js";

const app = Fastify({ logger: true });

const dedupe = createDedupe();
const whatsappClient = createWhatsappClient({ logger: app.log });

const processWhatsappWebhook = createWhatsappWebhookHandler({
    logger: app.log,
    whatsappClient,
    dedupe,
    parseCommand,
    dispatchCommand,
});

// ==============================
// 1) Webhook verify (Meta GET)
// ==============================
app.get<{
    Querystring: {
        "hub.mode"?: string;
        "hub.verify_token"?: string;
        "hub.challenge"?: string;
    };
}>("/webhooks/whatsapp", async (req, reply) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    app.log.info({ mode }, "META webhook verify called");

    if (mode === "subscribe" && token === config.VERIFY_TOKEN) {
        return reply.code(200).send(challenge);
    }

    return reply.code(403).send("Forbidden");
});

// ==============================
// 2) Webhook events (Meta POST)
// ==============================
app.post("/webhooks/whatsapp", async (req, reply) => {
    // ACK immediately -- Meta expects fast 200
    reply.code(200).send("OK");

    // process asynchronously (PoC approach; later this becomes a queue/job)
    queueMicrotask(() => {
        void processWhatsappWebhook(req.body as WhatsappWebhookBody).catch((err) => {
            app.log.error({ err }, "processWhatsappWebhook failed");
        });
    });
});

// ==============================
// Healthcheck
// ==============================
app.get("/health", async () => ({ ok: true }));

app.listen({ port: config.PORT, host: "0.0.0.0" });

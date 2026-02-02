import type { FastifyBaseLogger } from "fastify";
import type { CommandContext, ParsedCommand } from "../models/command.js";
import type { WhatsappWebhookBody } from "../models/whatsapp.js";
import type { WhatsappClient } from "../services/whatsappClient.js";
import { Dedupe } from "../models/depupe.js";

export type WhatsappWebhookHandlerDeps = {
    logger: FastifyBaseLogger;
    whatsappClient: WhatsappClient;
    dedupe: Dedupe;
    parseCommand: (input: string | null | undefined) => ParsedCommand | null;
    dispatchCommand: (cmd: ParsedCommand | null, ctx: CommandContext) => Promise<{ handled: boolean }>;
};

export const createWhatsappWebhookHandler = ({
    logger,
    whatsappClient,
    dedupe,
    parseCommand,
    dispatchCommand,
}: WhatsappWebhookHandlerDeps) => {
    const processWhatsappWebhook = async (body: WhatsappWebhookBody): Promise<void> => {
        const entries = Array.isArray(body?.entry) ? body.entry : [];

        if (entries.length === 0) {
            logger.info({ bodyType: typeof body }, "Webhook: no entry (ignored)");
            return;
        }

        for (const entry of entries) {
            const wabaId = entry?.id;
            const changes = Array.isArray(entry?.changes) ? entry.changes : [];

            for (const change of changes) {
                const field = change?.field;
                const value = change?.value;

                if (!value) continue;

                const phoneNumberId = value?.metadata?.phone_number_id;
                const displayPhone = value?.metadata?.display_phone_number;
                const statuses = value?.statuses;

                if (Array.isArray(statuses) && statuses.length > 0) {
                    const s0 = statuses[0];

                    logger.info(
                        {
                            wabaId,
                            field,
                            phoneNumberId,
                            displayPhone,
                            status: s0?.status,
                            messageId: s0?.id,
                            recipientId: s0?.recipient_id,
                            timestamp: s0?.timestamp,
                        },
                        "Webhook STATUS event (ignored)"
                    );

                    continue;
                }
                const messages = value?.messages;

                if (!Array.isArray(messages) || messages.length === 0) {
                    logger.info(
                        { wabaId, field, phoneNumberId, displayPhone },
                        "Webhook event without messages/statuses (ignored)"
                    );

                    continue;
                }

                for (const msg of messages) {
                    const messageId = msg?.id;
                    const from = msg?.from;
                    const msgType = msg?.type;
                    const text = msg?.text?.body?.trim();

                    logger.info(
                        {
                            wabaId,
                            field,
                            phoneNumberId,
                            displayPhone,
                            from,
                            msgType,
                            messageId,
                            hasText: Boolean(text),
                        },
                        "Webhook MESSAGE event"
                    );

                    if (!phoneNumberId || !from || !messageId) {
                        logger.warn({ phoneNumberId, from, messageId }, "Missing required fields (ignored)");
                        continue;
                    }

                    if (await dedupe.isDuplicate(messageId)) {
                        logger.info({ messageId, from }, "Duplicate message (deduped)");
                        continue;
                    }

                    if (!text) continue;

                    const cmd = parseCommand(text);
                    const result = await dispatchCommand(cmd, {
                        phoneNumberId,
                        from,
                        whatsappClient,
                        logger,
                    });

                    if (!result.handled) {
                        await whatsappClient.sendText({
                            phoneNumberId,
                            to: from,
                            text: "Nie znam komendy. Użyj /partner, /last-order, /last-order-status, /offer",
                        });
                    }
                }
            }
        }
    };

    return processWhatsappWebhook;
};

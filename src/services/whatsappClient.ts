import type { FastifyBaseLogger } from "fastify";
import { config } from "../config.js";
import type { WhatsappSendTextParams } from "../models/whatsapp.js";

export type WhatsappClient = {
    sendText: (params: WhatsappSendTextParams) => Promise<void>;
};

export const createWhatsappClient = ({ logger }: { logger: FastifyBaseLogger }): WhatsappClient => ({
    sendText: async (params) => {
        const { phoneNumberId, to, text } = params;

        const url = `https://graph.facebook.com/${config.WHATSAPP_GRAPH_VERSION}/${phoneNumberId}/messages`;

        const res = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${config.WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to,
                type: "text",
                text: { body: text, preview_url: false },
            }),
        });

        const data: any = await res.json().catch(() => ({}));

        if (!res.ok) {
            const waCode = data?.error?.code;

            // Sandbox restriction -- recipient not in allowed list
            if (waCode === 131030) {
                logger.warn(
                    {
                        status: res.status,
                        waCode,
                        message: data?.error?.message,
                        details: data?.error?.error_data?.details,
                        to,
                        phoneNumberId,
                    },
                    "Sandbox: recipient not in allowed list. Add the number in WhatsApp > API Setup > To (Allowed recipients)."
                );
                return;
            }

            logger.error({ status: res.status, data, to, phoneNumberId }, "sendText failed");
            return;
        }

        logger.info({ to, phoneNumberId, data }, "sendText OK");
    },
});

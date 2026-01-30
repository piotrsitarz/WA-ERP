import { findPartnerByWaFrom } from "../services/odoo/partnerByPhone.js";
import type { CommandContext } from "../models/command.js";

export const handlePartner = async ({ phoneNumberId, from, whatsappClient, logger }: CommandContext): Promise<void> => {
    try {
        const p = await findPartnerByWaFrom(from);

        if (!p) {
            await whatsappClient.sendText({
                phoneNumberId,
                to: from,
                text: `Nie znalazłem partnera w Odoo dla numeru: ${from}`,
            });
            return;
        }

        if ("conflict" in p) {
            await whatsappClient.sendText({
                phoneNumberId,
                to: from,
                text:
                    `Uwaga: kilku partnerów dla numeru ${p.e164}:\n` +
                    p.candidates.map((x) => `- ${x.name} (id=${x.id})`).join("\n"),
            });
            return;
        }

        await whatsappClient.sendText({
            phoneNumberId,
            to: from,
            text: `Partner OK ✅\n${p.name}\npartner_id=${p.id}\nphone_sanitized=${p.phone_sanitized}`,
        });
    } catch (err) {
        logger.error({ err }, "findPartnerByWaFrom failed");

        await whatsappClient.sendText({
            phoneNumberId,
            to: from,
            text: "ERP error: nie udało się znaleźć partnera (PoC).",
        });
    }
};

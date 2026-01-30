import { findPartnerByWaFrom } from "../services/odoo/partnerByPhone.js";
import { getLastOrderByPartnerId } from "../services/odoo/lastOrder.js";
import { getOrderLines, formatOrderLinesMessage } from "../services/odoo/orderLines.js";
import type { CommandContext } from "../models/command.js";

export const handleLastOrder = async ({ phoneNumberId, from, whatsappClient, logger }: CommandContext): Promise<void> => {
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
                    `Kilku partnerów dla numeru ${p.e164}:\n` +
                    p.candidates.map((x) => `- ${x.name} (id=${x.id})`).join("\n"),
            });
            return;
        }

        const order = await getLastOrderByPartnerId(p.id);

        if (!order) {
            await whatsappClient.sendText({
                phoneNumberId,
                to: from,
                text: `Partner ${p.name} (id=${p.id}) nie ma żadnych zamówień.`,
            });
            return;
        }

        const lines = await getOrderLines(order.id);
        const message = formatOrderLinesMessage(order, lines);

        await whatsappClient.sendText({
            phoneNumberId,
            to: from,
            text: message,
        });
    } catch (err) {
        logger.error({ err }, "lastorder flow failed");

        await whatsappClient.sendText({
            phoneNumberId,
            to: from,
            text: "ERP error: nie udało się pobrać ostatniego zamówienia.",
        });
    }
};

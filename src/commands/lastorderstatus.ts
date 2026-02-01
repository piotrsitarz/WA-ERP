import { findPartnerByWaFrom } from "../services/odoo/partnerByPhone.js";
import {
    formatOrderStatusMessage,
    getLastOrderForStatusByPartnerId,
    getLatestPickingByOrigin,
} from "../services/odoo/orderStatus.js";
import type { CommandContext } from "../models/command.js";

export const handleLastOrderStatus = async ({
    phoneNumberId,
    from,
    whatsappClient,
    logger,
}: CommandContext): Promise<void> => {
    try {
        const p = await findPartnerByWaFrom(from);

        if (!p) {
            await whatsappClient.sendText({
                phoneNumberId,
                to: from,
                text: `Customer not found for phone: ${from}`,
            });
            return;
        }

        if ("conflict" in p) {
            await whatsappClient.sendText({
                phoneNumberId,
                to: from,
                text:
                    `Multiple customers for ${p.e164}:\n` +
                    p.candidates.map((x) => `- ${x.name} (id=${x.id})`).join("\n"),
            });
            return;
        }

        const order = await getLastOrderForStatusByPartnerId(p.id);

        if (!order) {
            await whatsappClient.sendText({
                phoneNumberId,
                to: from,
                text: `No orders found for ${p.name}.`,
            });
            return;
        }

        const orderName = order.name || "";
        const picking = orderName ? await getLatestPickingByOrigin(orderName) : null;
        const message = formatOrderStatusMessage({ order, picking });

        await whatsappClient.sendText({
            phoneNumberId,
            to: from,
            text: message,
        });
    } catch (err) {
        logger.error({ err }, "Order status flow failed");

        await whatsappClient.sendText({
            phoneNumberId,
            to: from,
            text: "ERP error: failed to fetch order status.",
        });
    }
};

import { findPartnerByWaFrom } from "../services/odoo/partnerByPhone.js";
import { getLastOrderByPartnerId } from "../services/odoo/lastOrder.js";
import { getOrderLines } from "../services/odoo/orderLines.js";
import { getProductsAvailability } from "../services/odoo/availability.js";
import { getOrderPortalUrl } from "../services/odoo/portalLink.js";
import { formatOfferMessage } from "../services/odoo/formatOfferMessage.js";
import { buildPublicOdooUrl } from "../services/odoo/buildPublicUrl.js";
import { config } from "../config.js";
import type { CommandContext } from "../models/command.js";

export const handleOffer = async ({ phoneNumberId, from, whatsappClient, logger }: CommandContext): Promise<void> => {
    try {
        const p = await findPartnerByWaFrom(from);

        if (!p) {
            await whatsappClient.sendText({
                phoneNumberId,
                to: from,
                text: `Nie znalazłem klienta w Odoo dla numeru: ${from}`,
            });
            return;
        }

        if ("conflict" in p) {
            await whatsappClient.sendText({
                phoneNumberId,
                to: from,
                text:
                    `Kilku klientów dla numeru ${p.e164}:\n` +
                    p.candidates.map((x) => `- ${x.name} (id=${x.id})`).join("\n"),
            });
            return;
        }

        const order = await getLastOrderByPartnerId(p.id);

        if (!order) {
            await whatsappClient.sendText({
                phoneNumberId,
                to: from,
                text: `Klient ${p.name} (id=${p.id}) nie ma żadnych zamówień`,
            });
            return;
        }

        const lines = await getOrderLines(order.id);
        const productIds = lines.map((l) => l.product_id?.[0]).filter(Boolean);
        const availability = await getProductsAvailability(productIds);
        const relativeUrl = await getOrderPortalUrl(order.id);
        const portalUrl = buildPublicOdooUrl(config.ODOO_BASE_URL, relativeUrl);

        const message = formatOfferMessage({
            partner: p,
            order,
            lines,
            availability,
            portalUrl,
        });

        await whatsappClient.sendText({
            phoneNumberId,
            to: from,
            text: message,
        });
    } catch (err) {
        logger.error({ err }, "Getting last offer failed.");

        await whatsappClient.sendText({
            phoneNumberId,
            to: from,
            text: "ERP error: nie udało się pobrać produktów i linku (PoC).",
        });
    }
};

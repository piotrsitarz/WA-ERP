import type { AvailabilityMap, Partner, SaleOrder, SaleOrderLine } from "../../models/odoo.js";

type FormatOfferMessageParams = {
    partner?: Partner;
    order: SaleOrder | null;
    lines: SaleOrderLine[];
    availability: AvailabilityMap;
    portalUrl: string | null;
};

export const formatOfferMessage = ({
    order,
    lines,
    availability,
    portalUrl,
}: FormatOfferMessageParams): string => {
    if (!order) return "Nie znaleziono ostatniego zamówienia.";

    if (!lines?.length) {
        return `Ostatnie zamówienie ${order.name} nie ma pozycji.`;
    }

    const rows = lines.slice(0, 20).map((l) => {
        const pid = l.product_id?.[0];
        const name = l.product_id?.[1] ?? "Produkt";
        const qty = l.product_uom_qty;

        const stock = pid ? availability.get(pid) : null;
        const stockText = stock ? ` | dostępne: ${stock.qty_available}` : "";

        return `- ${name}: ${qty}${stockText}`;
    });

    const more = lines.length > 20 ? `\n(+ ${lines.length - 20} więcej)` : "";

    return (
        `Produkty z ostatniego zamówienia ${order.name}:\n` +
        rows.join("\n") +
        more +
        `\n\nZłóż zamówienie (link):\n${portalUrl}`
    );
};

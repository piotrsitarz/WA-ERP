import { executeKw } from "./odooClient.js";
import type { SaleOrder, SaleOrderLine } from "../../models/odoo.js";

export const getOrderLines = async (orderId: number): Promise<SaleOrderLine[]> => {
    const lines = await executeKw<SaleOrderLine[]>(
        "sale.order.line",
        "search_read",
        [[[
            "order_id",
            "=",
            orderId,
        ]]],
        {
            fields: ["id", "order_id", "product_id", "product_uom_qty"],
            order: "id asc",
        }
    );

    return Array.isArray(lines) ? lines : [];
};

export const formatOrderLinesMessage = (order: SaleOrder | null, lines: SaleOrderLine[]): string => {
    if (!order) return "Nie znaleziono zamówienia.";

    if (!lines.length) {
        return `Ostatnie zamóienie ${order.name} nie ma pozycji.`;
    }

    const list = lines
        .slice(0, 20)
        .map((l) => `- ${l.product_id?.[1] ?? "Produkt"}: ${l.product_uom_qty}`)
        .join("\n");

    const more = lines.length > 20 ? `\n(+ ${lines.length - 20} więcej)` : "";

    return (
        `Ostatnie zamówienie: ${order.name}\n` +
        `Status: ${order.state}\n` +
        `Data: ${order.date_order}\n\n` +
        `Produkty:\n${list}${more}`
    );
};

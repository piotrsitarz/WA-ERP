import { executeKw } from "./odooClient.js";
import type { SaleOrder, StockPicking } from "../../models/odoo.js";

type OrderStatusMessageArgs = {
    order: SaleOrder | null;
    picking: StockPicking | null;
};

export const getLastOrderForStatusByPartnerId = async (partnerId: number): Promise<SaleOrder | null> => {
    const orders = await executeKw<SaleOrder[]>(
        "sale.order",
        "search_read",
        [[
            ["partner_id", "=", partnerId],
            ["state", "in", ["sale", "done"]],
        ]],
        {
            fields: ["id", "name", "state", "date_order", "partner_id"],
            limit: 1,
            order: "date_order desc",
        }
    );

    return orders?.[0] ?? null;
};

export const getLatestPickingByOrigin = async (orderName: string): Promise<StockPicking | null> => {
    const pickings = await executeKw<StockPicking[]>(
        "stock.picking",
        "search_read",
        [[["origin", "=", orderName]]],
        {
            fields: ["id", "name", "state", "scheduled_date", "date_done", "origin"],
            limit: 1,
            order: "scheduled_date desc",
        }
    );

    return pickings?.[0] ?? null;
};

export const formatOrderStatusMessage = ({ order, picking }: OrderStatusMessageArgs): string => {
    if (!order) return "No orders found for this customer.";

    const orderName = order.name || "Unknown";
    const orderDate = order.date_order || "Unknown";
    const orderLine = `Zamówienie: ${orderName}\nData: ${orderDate}`;

    if (!picking) {
        const orderStatus = order.state || "Unknown (no order state)";

        return `${orderLine}\nStatus: ${orderStatus}\nInfo: no picking found`;
    }

    const status = picking.state || "Unknown (no picking state)";

    return `${orderLine}\nStatus: ${status}`;
};

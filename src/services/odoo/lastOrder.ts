import { executeKw } from "./odooClient.js";
import type { SaleOrder } from "../../models/odoo.js";

export const getLastOrderByPartnerId = async (partnerId: number): Promise<SaleOrder | null> => {
    const lastOrder = await executeKw<SaleOrder[]>(
        "sale.order",
        "search_read",
        [[[
            "partner_id",
            "=",
            partnerId,
        ]]],
        {
            fields: ["id", "name", "state", "date_order"],
            limit: 1,
            order: "date_order desc",
        }
    );

    return lastOrder?.[0] ?? null;
};

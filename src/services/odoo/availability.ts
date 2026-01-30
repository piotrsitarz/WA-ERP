import { executeKw } from "./odooClient.js";
import type { AvailabilityMap, ProductAvailability } from "../../models/odoo.js";

export const getProductsAvailability = async (
    productIds: Array<number | null | undefined>
): Promise<AvailabilityMap> => {
    const normalizedIds = (productIds || []).filter((id): id is number => typeof id === "number");
    const uniqueIds = Array.from(new Set(normalizedIds));

    if (uniqueIds.length === 0) return new Map();

    const products = await executeKw<Array<{ id: number; qty_available?: number }>>(
        "product.product",
        "search_read",
        [[[
            "id",
            "in",
            uniqueIds,
        ]]],
        {
            fields: ["id", "qty_available"],
            limit: uniqueIds.length,
        }
    );

    const map: AvailabilityMap = new Map();

    for (const p of products) {
        const qty = Number(p.qty_available ?? 0);
        const entry: ProductAvailability = { qty_available: qty };
        map.set(p.id, entry);
    }

    return map;
};

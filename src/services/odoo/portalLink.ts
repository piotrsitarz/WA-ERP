import { executeKw } from "./odooClient.js";

export const getOrderPortalUrl = async (orderId: number): Promise<string | null> => {
    const res = await executeKw<string | string[]>("sale.order", "get_portal_url", [[orderId]]);

    if (Array.isArray(res)) return res[0] ?? null;

    return res ?? null;
};

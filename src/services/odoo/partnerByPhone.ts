import { executeKw } from "./odooClient.js";
import type { Partner, PartnerLookupResult } from "../../models/odoo.js";

export const normalizeWaFromToE164 = (from: string | number | null | undefined): string | null => {
    const digits = String(from || "").replace(/\D/g, "");

    if (!digits) return null;

    if (String(from).trim().startsWith("+")) return `+${digits}`;

    return `+${digits}`;
};

export const findPartnerByWaFrom = async (from: string | number | null | undefined): Promise<PartnerLookupResult> => {
    const e164 = normalizeWaFromToE164(from);

    if (!e164) return null;

    const partners = await executeKw<Partner[]>(
        "res.partner",
        "search_read",
        [[[
            "phone_sanitized",
            "=",
            e164,
        ]]],
        {
            fields: ["id", "name", "phone", "mobile", "phone_sanitized"],
            limit: 2,
        }
    );

    if (partners.length === 1) return partners[0];

    if (partners.length === 0) {
        const fallback = await executeKw<Partner[]>(
            "res.partner",
            "search_read",
            [[
                "|",
                ["mobile", "=", e164],
                ["phone", "=", e164],
            ]],
            {
                fields: ["id", "name", "phone", "mobile", "phone_sanitized"],
                limit: 2,
            }
        );

        if (fallback.length === 1) return fallback[0];
        if (fallback.length > 1) return { conflict: true, e164, candidates: fallback };
        return null;
    }

    return { conflict: true, e164, candidates: partners };
};

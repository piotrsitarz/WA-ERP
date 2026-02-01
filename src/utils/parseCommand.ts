import type { ParsedCommand } from "../models/command.js";

export const parseCommand = (input: string | null | undefined): ParsedCommand | null => {
    const trimmed = (input || "").trim();

    if (/^\/partner$/i.test(trimmed)) {
        return { name: "partner" };
    }

    if (/^\/offer$/i.test(trimmed)) {
        return { name: "offer" };
    }

    if (/^\/last-order$/i.test(trimmed)) {
        return { name: "lastOrder" };
    }

    if (/^\/last-order-status$/i.test(trimmed)) {
        return { name: "lastOrderStatus" };
    }

    const match = trimmed.match(/^\/([a-zA-Z]+)(?:_(\d+))?$/);

    if (!match) return null;

    const name = match[1].toLowerCase();
    const id = match[2] ? Number(match[2]) : undefined;

    return { name, id };
};

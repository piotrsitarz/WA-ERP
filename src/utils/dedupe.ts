import { Dedupe, DedupeOptions } from "../models/depupe.js";

const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 min
const DEFAULT_CLEANUP_MS = 60 * 1000;

export const createDedupe = ({ ttlMs = DEFAULT_TTL_MS, cleanupMs = DEFAULT_CLEANUP_MS }: DedupeOptions = {}): Dedupe => {
    const seenMessageIds = new Map<string, number>();

    const isDuplicate = (messageId: string): boolean => {
        const now = Date.now();
        const expiresAt = seenMessageIds.get(messageId);

        if (expiresAt && expiresAt > now) return true;

        seenMessageIds.set(messageId, now + ttlMs);
        return false;
    };

    const timer = setInterval(() => {
        const now = Date.now();

        for (const [id, expiresAt] of seenMessageIds.entries()) {
            if (expiresAt <= now) seenMessageIds.delete(id);
        }
    }, cleanupMs);

    if (typeof timer.unref === "function") timer.unref();

    return { isDuplicate };
};

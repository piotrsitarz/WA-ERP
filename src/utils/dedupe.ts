import { Redis } from "ioredis";
import { config } from "../config.js";
import { Dedupe, DedupeOptions } from "../models/depupe.js";

const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 min
const DEFAULT_CLEANUP_MS = 60 * 1000;

export const createDedupe = ({
    ttlMs = DEFAULT_TTL_MS,
    cleanupMs = DEFAULT_CLEANUP_MS,
    logger,
}: DedupeOptions = {}): Dedupe => {
    const seenMessageIds = new Map<string, number>();

    const isDuplicateInMemory = (messageId: string): boolean => {
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

    const redisUrl = config.REDIS_URL;
    const redis = redisUrl ? new Redis(redisUrl) : null;

    const isDuplicate = async (messageId: string): Promise<boolean> => {
        if (!redis) return isDuplicateInMemory(messageId);

        try {
            const key = `wa:dedupe:${messageId}`;
            const res = await redis.set(key, "1", {
                // @ts-ignore
                NX: true,
                EX: Math.ceil(ttlMs / 1000),
            });
            return res !== "OK";
        } catch (err) {
            logger?.warn({ err }, "Redis dedupe failed; falling back to in-memory");
            return isDuplicateInMemory(messageId);
        }
    };

    return { isDuplicate };
};

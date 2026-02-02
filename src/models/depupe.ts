export type Dedupe = {
    isDuplicate: (messageId: string) => Promise<boolean>;
};

export type DedupeOptions = {
    ttlMs?: number;
    cleanupMs?: number;
    logger?: { warn: (obj: unknown, msg: string) => void };
};

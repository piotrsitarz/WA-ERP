export type Dedupe = {
    isDuplicate: (messageId: string) => boolean;
};

export type DedupeOptions = {
    ttlMs?: number;
    cleanupMs?: number;
};
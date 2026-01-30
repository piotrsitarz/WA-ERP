import type { FastifyBaseLogger } from "fastify";
import type { WhatsappClient } from "../services/whatsappClient.js";

export type ParsedCommand = {
    name: string;
    id?: number;
};

export type CommandContext = {
    phoneNumberId: string;
    from: string;
    whatsappClient: WhatsappClient;
    logger: FastifyBaseLogger;
};

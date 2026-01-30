import { handlePartner } from "./partner.js";
import { handleLastOrder } from "./lastorder.js";
import { handleOffer } from "./offer.js";
import type { CommandContext, ParsedCommand } from "../models/command.js";

const handlers: Record<string, (ctx: CommandContext) => Promise<void>> = {
    partner: handlePartner,
    lastorder: handleLastOrder,
    offer: handleOffer,
};

export const dispatchCommand = async (
    cmd: ParsedCommand | null,
    context: CommandContext
): Promise<{ handled: boolean }> => {
    if (!cmd?.name) return { handled: false };

    const handler = handlers[cmd.name];

    if (!handler) return { handled: false };

    await handler(context);

    return { handled: true };
};

export type WhatsappWebhookBody = {
    entry?: WhatsappWebhookEntry[];
};

export type WhatsappWebhookEntry = {
    id?: string;
    changes?: WhatsappWebhookChange[];
};

export type WhatsappWebhookChange = {
    field?: string;
    value?: WhatsappWebhookValue;
};

export type WhatsappWebhookValue = {
    metadata?: WhatsappWebhookMetadata;
    statuses?: WhatsappWebhookStatus[];
    messages?: WhatsappWebhookMessage[];
};

export type WhatsappWebhookMetadata = {
    phone_number_id?: string;
    display_phone_number?: string;
};

export type WhatsappWebhookStatus = {
    status?: string;
    id?: string;
    recipient_id?: string;
    timestamp?: string;
};

export type WhatsappWebhookMessage = {
    id?: string;
    from?: string;
    type?: string;
    text?: {
        body?: string;
    };
};

export type WhatsappSendTextParams = {
    phoneNumberId: string;
    to: string;
    text: string;
};
